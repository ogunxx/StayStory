"""
Entry point.

Modes:
    python main.py paper           — live paper trading (both strategies)
    python main.py backtest        — backtest trend strategy on historical data
    python main.py backtest --pair BTC-USD --days 30
    python main.py live            — REAL money (requires explicit --confirm flag)

Two strategies run simultaneously in paper mode:
  [TREND] — 6H trend filter + 1H EMA crossover + RSI + VWAP
  [BOX]   — Previous day high/low breakout + 15M confirm + 5M retest candle
"""

import argparse
import time
import sys
import datetime
from colorama import Fore, Style, init as colorama_init

import config as cfg
import strategy as strat
import strategy_box as box_strat
from data_fetcher import DataFetcher
from paper_trader import PaperTrader
from risk_manager import RiskManager
import backtester as bt

colorama_init(autoreset=True)


# ─── Logging helpers ──────────────────────────────────────────────────────────

def _now_utc() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def _header():
    print(f"\n{Style.BRIGHT}{'─'*60}")
    print(f"  Crypto EA  |  {_now_utc().strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'─'*60}{Style.RESET_ALL}")


def _log(msg: str, color=Fore.WHITE):
    ts = _now_utc().strftime("%H:%M:%S")
    print(f"{Fore.CYAN}[{ts}]{Style.RESET_ALL} {color}{msg}{Style.RESET_ALL}")


def _log_trend_signal(pair, signal, trend):
    arrow = "▲ LONG" if signal.direction == "long" else "▼ SHORT"
    color = Fore.GREEN if signal.direction == "long" else Fore.RED
    _log(
        f"[TREND] {pair}  {color}{arrow}{Style.RESET_ALL}  "
        f"entry={signal.entry_price:.4f}  SL={signal.stop_loss:.4f}  "
        f"TP={signal.take_profit:.4f}  6H={trend}  [{signal.reason}]"
    )


def _log_box_breakout(pair, direction, level, prev_high, prev_low):
    arrow = "▲" if direction == "bullish" else "▼"
    color = Fore.YELLOW
    _log(
        f"[BOX]   {pair}  {color}{arrow} BREAKOUT{Style.RESET_ALL}  "
        f"direction={direction}  level={level:.4f}  "
        f"(prev_high={prev_high:.4f} / prev_low={prev_low:.4f})"
    )


def _log_box_signal(pair, sig):
    arrow = "▲ LONG" if sig.direction == "long" else "▼ SHORT"
    color = Fore.GREEN if sig.direction == "long" else Fore.RED
    _log(
        f"[BOX]   {pair}  {color}{arrow}{Style.RESET_ALL}  "
        f"entry={sig.entry_price:.4f}  SL={sig.stop_loss:.4f}  "
        f"TP={sig.take_profit:.4f}  pattern={sig.pattern}  level={sig.level:.4f}"
    )


def _log_trade_close(trade):
    color = Fore.GREEN if trade.pnl > 0 else Fore.RED
    sign  = "+" if trade.pnl >= 0 else ""
    _log(
        f"CLOSED  {trade.pair} {trade.side.upper()} "
        f"@ {trade.exit_price:.4f}  "
        f"{color}{sign}${trade.pnl:.2f} ({sign}{trade.pnl_pct:.2f}%){Style.RESET_ALL}  "
        f"exit={trade.exit_reason}"
    )


# ─── Paper trading loop ───────────────────────────────────────────────────────

def run_paper():
    _header()
    _log(f"Mode: {Style.BRIGHT}PAPER TRADING  (2 strategies active)", Fore.YELLOW)
    _log(f"Pairs:   {', '.join(cfg.PAIRS)}")
    _log(f"Balance: ${cfg.PAPER_STARTING_BALANCE:,.2f}")
    _log(f"Strategy 1 [TREND] — {cfg.TF_HIGH} trend + {cfg.TF_LOW} entries")
    _log(f"Strategy 2 [BOX]   — prev-day H/L breakout + 15M confirm + 5M retest")

    fetcher = DataFetcher()
    paper   = PaperTrader(cfg.PAPER_STARTING_BALANCE)
    risk    = RiskManager(cfg.PAPER_STARTING_BALANCE)

    # Trend strategy state
    last_entry_candle: dict = {pair: None for pair in cfg.PAIRS}

    # Box strategy state
    box_state:        dict = {pair: None for pair in cfg.PAIRS}
    prev_day_levels:  dict = {pair: (0.0, 0.0) for pair in cfg.PAIRS}
    last_daily_date        = None
    last_15m_candle:  dict = {pair: None for pair in cfg.PAIRS}
    last_5m_candle:   dict = {pair: None for pair in cfg.PAIRS}

    while True:
        try:
            prices    = {}
            today_utc = _now_utc().date()

            # ── Refresh previous-day levels once per UTC day ──────────────────
            if last_daily_date != today_utc:
                for pair in cfg.PAIRS:
                    try:
                        df_daily = fetcher.fetch_candles(pair, "ONE_DAY", limit=3)
                        if not df_daily.empty:
                            prev_day_levels[pair] = box_strat.get_prev_day_levels(df_daily)
                            box_state[pair]       = None  # new day → reset breakout
                            h, l = prev_day_levels[pair]
                            _log(f"[BOX]   {pair}  prev-day high={h:.4f}  low={l:.4f}", Fore.YELLOW)
                    except Exception as e:
                        _log(f"Daily level fetch error {pair}: {e}", Fore.YELLOW)
                last_daily_date = today_utc

            # ── Per-pair signal loop ──────────────────────────────────────────
            for pair in cfg.PAIRS:
                try:
                    df_entry = fetcher.fetch_candles(pair, cfg.TF_LOW,  limit=100)
                    df_trend = fetcher.fetch_candles(pair, cfg.TF_HIGH, limit=60)
                except Exception as e:
                    _log(f"Fetch error {pair}: {e}", Fore.YELLOW)
                    continue

                if df_entry.empty:
                    continue

                current_price = float(df_entry["close"].iloc[-1])
                prices[pair]  = current_price

                if risk.is_halted():
                    continue

                # ── Strategy 1: TREND ─────────────────────────────────────────
                latest_entry_ts = df_entry.index[-2]
                if last_entry_candle[pair] != latest_entry_ts:
                    last_entry_candle[pair] = latest_entry_ts

                    if not paper.has_position(pair):
                        trend  = strat.get_trend(df_trend)
                        signal = strat.get_signal(df_entry, trend)

                        if signal.direction != "none":
                            qty = risk.position_size(signal.entry_price, signal.stop_loss)
                            if qty > 0:
                                pos_id = paper.open_position(
                                    pair=pair, side=signal.direction,
                                    entry_price=signal.entry_price, quantity=qty,
                                    stop_loss=signal.stop_loss, take_profit=signal.take_profit,
                                    reason=f"[TREND] {signal.reason}",
                                )
                                if pos_id:
                                    _log_trend_signal(pair, signal, trend)

                # ── Strategy 2: BOX ───────────────────────────────────────────
                prev_high, prev_low = prev_day_levels.get(pair, (0.0, 0.0))
                if prev_high == 0:
                    continue

                try:
                    df_15m = fetcher.fetch_candles(pair, "FIFTEEN_MINUTE", limit=50)

                    # Detect fresh breakout (only when no breakout is active)
                    if box_state[pair] is None and not df_15m.empty:
                        ts_15m = df_15m.index[-2]
                        if last_15m_candle[pair] != ts_15m:
                            last_15m_candle[pair] = ts_15m
                            breakout = box_strat.detect_breakout(df_15m, prev_high, prev_low)
                            if breakout:
                                direction, level = breakout
                                box_state[pair]  = {"direction": direction, "level": level}
                                _log_box_breakout(pair, direction, level, prev_high, prev_low)

                    # If breakout active, look for 5M retest entry
                    if box_state[pair] and not paper.has_position(pair):
                        df_5m = fetcher.fetch_candles(pair, "FIVE_MINUTE", limit=30)
                        if not df_5m.empty:
                            ts_5m = df_5m.index[-2]
                            if last_5m_candle[pair] != ts_5m:
                                last_5m_candle[pair] = ts_5m
                                sig = box_strat.detect_retest_signal(
                                    df_5m,
                                    box_state[pair]["direction"],
                                    box_state[pair]["level"],
                                )
                                if sig:
                                    qty = risk.position_size(sig.entry_price, sig.stop_loss)
                                    if qty > 0:
                                        pos_id = paper.open_position(
                                            pair=pair, side=sig.direction,
                                            entry_price=sig.entry_price, quantity=qty,
                                            stop_loss=sig.stop_loss, take_profit=sig.take_profit,
                                            reason=f"[BOX] {sig.pattern} @ {sig.level:.4f}",
                                        )
                                        if pos_id:
                                            _log_box_signal(pair, sig)
                                            box_state[pair] = None  # reset after entry

                except Exception as e:
                    _log(f"[BOX] error {pair}: {e}", Fore.YELLOW)

            # ── Update positions (SL/TP check) ────────────────────────────────
            if prices:
                closed = paper.update_positions(prices)
                for t in closed:
                    _log_trade_close(t)
                    risk.record_closed_trade(t.pnl)

            # ── Status line ───────────────────────────────────────────────────
            status = paper.status(prices)
            risk_s = risk.status()
            halted = f"  {Fore.RED}⛔ HALTED{Style.RESET_ALL}" if risk_s["halted"] else ""
            _log(
                f"Portfolio ${status['portfolio_value']:,.2f}  "
                f"Open={status['open_positions']}  "
                f"Trades={status['total_trades']}  "
                f"WinRate={status['win_rate']}%  "
                f"PnL=${status['total_pnl']:+,.2f}  "
                f"DailyDD={risk_s['daily_drawdown']}%"
                + halted
            )

        except KeyboardInterrupt:
            _log("\nStopping paper trading.", Fore.YELLOW)
            _print_session_summary(paper, prices if prices else {})
            break
        except Exception as e:
            _log(f"Loop error: {e}", Fore.RED)

        time.sleep(cfg.POLL_INTERVAL)


# ─── Backtest (trend strategy) ────────────────────────────────────────────────

def run_backtest(pairs: list, days: int):
    _header()
    _log(f"Mode: {Style.BRIGHT}BACKTEST  [TREND strategy]", Fore.CYAN)
    _log(f"Pairs: {', '.join(pairs)}  |  Lookback: {days} days")

    fetcher = DataFetcher()

    for pair in pairs:
        _log(f"Fetching {days}d of {cfg.TF_LOW} candles for {pair} …")
        df_entry = fetcher.fetch_historical(pair, cfg.TF_LOW,  days=days)
        _log(f"Fetching {days}d of {cfg.TF_HIGH} candles for {pair} …")
        df_trend = fetcher.fetch_historical(pair, cfg.TF_HIGH, days=days)

        if df_entry.empty:
            _log(f"No data for {pair}, skipping.", Fore.YELLOW)
            continue

        result = bt.run_backtest(df_entry, df_trend, pair)
        bt.print_report(result)


# ─── Session summary ──────────────────────────────────────────────────────────

def _print_session_summary(paper: PaperTrader, prices: dict):
    trades = paper.trade_history()
    total  = paper.portfolio_value(prices)
    print(f"\n{'─'*60}")
    print(f"  SESSION SUMMARY")
    print(f"{'─'*60}")
    print(f"  Final portfolio value : ${total:,.2f}")
    print(f"  Total trades          : {len(trades)}")
    if trades:
        wins = [t for t in trades if t.pnl > 0]
        pnl  = sum(t.pnl for t in trades)
        trend_t = [t for t in trades if "[TREND]" in t.exit_reason or "[TREND]" in getattr(t, "reason", "")]
        box_t   = [t for t in trades if "[BOX]"   in t.exit_reason or "[BOX]"   in getattr(t, "reason", "")]
        print(f"  Win rate              : {len(wins)/len(trades)*100:.1f}%")
        print(f"  Net P&L               : ${pnl:+,.2f}")
    print(f"{'─'*60}\n")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Crypto EA — dual-strategy trading bot")
    sub    = parser.add_subparsers(dest="mode")

    sub.add_parser("paper", help="Start paper trading loop (both strategies)")

    bt_parser = sub.add_parser("backtest", help="Backtest the TREND strategy on historical data")
    bt_parser.add_argument("--pair", nargs="+", default=cfg.PAIRS)
    bt_parser.add_argument("--days", type=int,  default=60)

    live_parser = sub.add_parser("live", help="Start LIVE trading (real money)")
    live_parser.add_argument("--confirm", action="store_true")

    args = parser.parse_args()

    if args.mode == "paper":
        run_paper()

    elif args.mode == "backtest":
        run_backtest(args.pair, args.days)

    elif args.mode == "live":
        if not args.confirm:
            print(f"\n{Fore.RED}⛔ Live trading is disabled by default.")
            print("   Paper-trade and backtest first.")
            print("   Then run:  python main.py live --confirm\n")
            sys.exit(1)
        _log("LIVE TRADING — real money mode", Fore.RED)
        _log("Not yet implemented. Complete paper validation first.", Fore.YELLOW)

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
