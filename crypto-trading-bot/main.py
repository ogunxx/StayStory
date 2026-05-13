"""
Entry point.

Modes:
    python main.py paper           — live paper trading loop
    python main.py backtest        — backtest all pairs (default 60 days)
    python main.py backtest --pair BTC-USD --days 30
    python main.py live            — REAL money (requires explicit --confirm flag)
"""

import argparse
import time
import sys
import datetime
from colorama import Fore, Style, init as colorama_init

import config as cfg
import strategy as strat
from data_fetcher import DataFetcher
from paper_trader import PaperTrader
from risk_manager import RiskManager
import backtester as bt

colorama_init(autoreset=True)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _header():
    print(f"\n{Style.BRIGHT}{'─'*56}")
    print(f"  Crypto Trading Bot  |  {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'─'*56}{Style.RESET_ALL}")


def _log(msg: str, color=Fore.WHITE):
    ts = datetime.datetime.utcnow().strftime("%H:%M:%S")
    print(f"{Fore.CYAN}[{ts}]{Style.RESET_ALL} {color}{msg}{Style.RESET_ALL}")


def _log_signal(pair, signal, trend):
    arrow = "▲ LONG" if signal.direction == "long" else "▼ SHORT"
    color = Fore.GREEN if signal.direction == "long" else Fore.RED
    _log(f"{pair}  {color}{arrow}{Style.RESET_ALL}  "
         f"entry={signal.entry_price:.4f}  "
         f"SL={signal.stop_loss:.4f}  "
         f"TP={signal.take_profit:.4f}  "
         f"[{signal.reason}]  1H={trend}")


def _log_trade_close(trade):
    color = Fore.GREEN if trade.pnl > 0 else Fore.RED
    sign  = "+" if trade.pnl >= 0 else ""
    _log(
        f"CLOSED {trade.pair} {trade.side.upper()} "
        f"@ {trade.exit_price:.4f}  "
        f"{color}{sign}${trade.pnl:.2f} ({sign}{trade.pnl_pct:.2f}%){Style.RESET_ALL}  "
        f"reason={trade.exit_reason}"
    )


# ─── Paper trading loop ───────────────────────────────────────────────────────

def run_paper():
    _header()
    _log(f"Mode: {Style.BRIGHT}PAPER TRADING", Fore.YELLOW)
    _log(f"Pairs: {', '.join(cfg.PAIRS)}")
    _log(f"Starting balance: ${cfg.PAPER_STARTING_BALANCE:,.2f}")

    fetcher = DataFetcher()
    paper   = PaperTrader(cfg.PAPER_STARTING_BALANCE)
    risk    = RiskManager(cfg.PAPER_STARTING_BALANCE)

    last_candle_time: dict = {}  # pair → last processed 15m timestamp

    while True:
        try:
            prices = {}

            for pair in cfg.PAIRS:
                try:
                    df_15m = fetcher.fetch_candles(pair, cfg.TF_LOW,  limit=150)
                    df_1h  = fetcher.fetch_candles(pair, cfg.TF_HIGH, limit=100)
                except Exception as e:
                    _log(f"Fetch error {pair}: {e}", Fore.YELLOW)
                    continue

                if df_15m.empty or df_1h.empty:
                    continue

                current_price = float(df_15m["close"].iloc[-1])
                prices[pair]  = current_price

                # Only act when a new 15m candle has closed
                latest_ts = df_15m.index[-2]  # last CLOSED candle
                if last_candle_time.get(pair) == latest_ts:
                    continue
                last_candle_time[pair] = latest_ts

                if risk.is_halted():
                    _log(f"⛔ HALTED: {risk.halt_reason()}", Fore.RED)
                    continue

                trend  = strat.get_trend(df_1h)
                signal = strat.get_signal(df_15m, trend)

                if signal.direction != "none" and not paper.has_position(pair):
                    qty = risk.position_size(signal.entry_price, signal.stop_loss)
                    if qty > 0:
                        pos_id = paper.open_position(
                            pair=pair, side=signal.direction,
                            entry_price=signal.entry_price, quantity=qty,
                            stop_loss=signal.stop_loss, take_profit=signal.take_profit,
                            reason=signal.reason,
                        )
                        if pos_id:
                            _log_signal(pair, signal, trend)

            # Update positions and check SL/TP
            if prices:
                closed = paper.update_positions(prices)
                for t in closed:
                    _log_trade_close(t)
                    risk.record_closed_trade(t.pnl)

            # Print status every loop iteration
            status = paper.status(prices)
            risk_s = risk.status()
            _log(
                f"Portfolio ${status['portfolio_value']:,.2f}  "
                f"Trades={status['total_trades']}  "
                f"WinRate={status['win_rate']}%  "
                f"PnL=${status['total_pnl']:+,.2f}  "
                f"DailyDD={risk_s['daily_drawdown']}%"
            )

        except KeyboardInterrupt:
            _log("\nStopping paper trading.", Fore.YELLOW)
            _print_session_summary(paper, prices if prices else {})
            break
        except Exception as e:
            _log(f"Loop error: {e}", Fore.RED)

        time.sleep(cfg.POLL_INTERVAL)


# ─── Backtest ─────────────────────────────────────────────────────────────────

def run_backtest(pairs: list, days: int):
    _header()
    _log(f"Mode: {Style.BRIGHT}BACKTEST", Fore.CYAN)
    _log(f"Pairs: {', '.join(pairs)}  |  Lookback: {days} days")

    fetcher = DataFetcher()

    for pair in pairs:
        _log(f"Fetching {days}d of 15M candles for {pair} …")
        df_15m = fetcher.fetch_historical(pair, cfg.TF_LOW,  days=days)
        _log(f"Fetching {days}d of 1H  candles for {pair} …")
        df_1h  = fetcher.fetch_historical(pair, cfg.TF_HIGH, days=days)

        if df_15m.empty:
            _log(f"No data for {pair}, skipping.", Fore.YELLOW)
            continue

        result = bt.run_backtest(df_15m, df_1h, pair)
        bt.print_report(result)


# ─── Session summary ──────────────────────────────────────────────────────────

def _print_session_summary(paper: PaperTrader, prices: dict):
    trades = paper.trade_history()
    total  = paper.portfolio_value(prices)
    print(f"\n{'─'*56}")
    print(f"  SESSION SUMMARY")
    print(f"{'─'*56}")
    print(f"  Final portfolio value : ${total:,.2f}")
    print(f"  Total trades          : {len(trades)}")
    if trades:
        wins = [t for t in trades if t.pnl > 0]
        pnl  = sum(t.pnl for t in trades)
        print(f"  Win rate              : {len(wins)/len(trades)*100:.1f}%")
        print(f"  Net P&L               : ${pnl:+,.2f}")
    print(f"{'─'*56}\n")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Crypto Trading Bot")
    sub = parser.add_subparsers(dest="mode")

    sub.add_parser("paper", help="Start paper trading loop")

    bt_parser = sub.add_parser("backtest", help="Run backtest on historical data")
    bt_parser.add_argument("--pair",  nargs="+", default=cfg.PAIRS,
                           help="Pairs to backtest (default: all)")
    bt_parser.add_argument("--days",  type=int, default=60,
                           help="Days of history to use (default: 60)")

    live_parser = sub.add_parser("live", help="Start LIVE trading (real money)")
    live_parser.add_argument("--confirm", action="store_true",
                             help="Must pass this flag to enable live trading")

    args = parser.parse_args()

    if args.mode == "paper":
        run_paper()

    elif args.mode == "backtest":
        run_backtest(args.pair, args.days)

    elif args.mode == "live":
        if not args.confirm:
            print(f"\n{Fore.RED}⛔ Live trading is disabled by default.")
            print("   Complete paper trading first, review the results,")
            print("   then re-run with:  python main.py live --confirm\n")
            sys.exit(1)
        _log("LIVE TRADING — real money mode", Fore.RED)
        _log("Not yet implemented. Paper-test and backtest first.", Fore.YELLOW)
        # live_trader.run()   ← will be wired up after paper validation

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
