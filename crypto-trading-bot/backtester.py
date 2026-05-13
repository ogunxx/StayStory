"""
Backtester.
Runs the multi-timeframe strategy over historical OHLCV data and
reports key performance metrics.

Usage:
    python main.py backtest --pair BTC-USD --days 60
"""

import math
from dataclasses import dataclass, field
from typing import List, Dict
import pandas as pd
import numpy as np
import indicators as ind
import strategy as strat
import config as cfg


@dataclass
class BacktestTrade:
    pair:        str
    side:        str
    entry_idx:   int
    exit_idx:    int
    entry_price: float
    exit_price:  float
    quantity:    float
    pnl:         float
    pnl_pct:     float
    exit_reason: str


@dataclass
class BacktestResult:
    pair:            str
    trades:          List[BacktestTrade] = field(default_factory=list)
    total_return:    float = 0.0
    win_rate:        float = 0.0
    profit_factor:   float = 0.0
    max_drawdown:    float = 0.0
    sharpe_ratio:    float = 0.0
    total_trades:    int   = 0
    winning_trades:  int   = 0
    losing_trades:   int   = 0


def run_backtest(
    df_15m: pd.DataFrame,
    df_1h:  pd.DataFrame,
    pair:   str,
    starting_capital: float = cfg.PAPER_STARTING_BALANCE,
) -> BacktestResult:
    """
    Simulate the strategy on historical data.
    Both DataFrames must share the same UTC DatetimeIndex.
    """
    df_15m = ind.add_indicators(df_15m, cfg)
    df_1h  = ind.add_indicators(df_1h,  cfg)

    equity   = starting_capital
    position = None          # currently open trade dict
    trades: List[BacktestTrade] = []
    equity_curve: List[float]   = [equity]

    warmup = max(cfg.EMA_SLOW, cfg.RSI_PERIOD, cfg.ATR_PERIOD) + 5

    for i in range(warmup + 2, len(df_15m)):
        row      = df_15m.iloc[i]
        ts       = df_15m.index[i]
        price    = row["close"]

        # ── Check if open position hits SL or TP ─────────────────────────
        if position:
            exit_price  = None
            exit_reason = None
            if position["side"] == "long":
                if price <= position["stop_loss"]:
                    exit_price, exit_reason = position["stop_loss"], "stop_loss"
                elif price >= position["take_profit"]:
                    exit_price, exit_reason = position["take_profit"], "take_profit"
            else:
                if price >= position["stop_loss"]:
                    exit_price, exit_reason = position["stop_loss"], "stop_loss"
                elif price <= position["take_profit"]:
                    exit_price, exit_reason = position["take_profit"], "take_profit"

            if exit_reason:
                side = position["side"]
                ep   = position["entry_price"]
                qty  = position["quantity"]
                pnl  = (exit_price - ep) * qty if side == "long" else (ep - exit_price) * qty
                pnl_pct = pnl / (ep * qty) * 100
                equity  += pnl
                trades.append(BacktestTrade(
                    pair=pair, side=side,
                    entry_idx=position["entry_idx"], exit_idx=i,
                    entry_price=ep, exit_price=exit_price,
                    quantity=qty, pnl=round(pnl, 4),
                    pnl_pct=round(pnl_pct, 2), exit_reason=exit_reason,
                ))
                equity_curve.append(equity)
                position = None

        # ── Only look for new entry when flat ─────────────────────────────
        if position:
            continue

        # Get 1H trend at this point in time
        df_1h_slice = df_1h[df_1h.index <= ts]
        if len(df_1h_slice) < warmup + 2:
            continue
        trend = strat.get_trend(df_1h_slice)

        # Get 15M signal
        df_15m_slice = df_15m.iloc[: i + 1]
        signal = strat.get_signal(df_15m_slice, trend)

        if signal.direction == "none":
            continue

        # Position sizing
        risk_usd = equity * cfg.MAX_RISK_PER_TRADE
        risk_per_unit = abs(signal.entry_price - signal.stop_loss)
        if risk_per_unit <= 0:
            continue
        quantity = min(risk_usd / risk_per_unit, (equity * 0.25) / signal.entry_price)
        if quantity <= 0:
            continue

        position = {
            "side":        signal.direction,
            "entry_price": signal.entry_price,
            "stop_loss":   signal.stop_loss,
            "take_profit": signal.take_profit,
            "quantity":    quantity,
            "entry_idx":   i,
        }

    # ── Compute metrics ───────────────────────────────────────────────────────
    return _compute_metrics(pair, trades, equity_curve, starting_capital)


def _compute_metrics(
    pair: str,
    trades: List[BacktestTrade],
    equity_curve: List[float],
    start_capital: float,
) -> BacktestResult:
    result = BacktestResult(pair=pair, trades=trades, total_trades=len(trades))

    if not trades:
        return result

    wins   = [t for t in trades if t.pnl > 0]
    losses = [t for t in trades if t.pnl <= 0]
    result.winning_trades = len(wins)
    result.losing_trades  = len(losses)
    result.win_rate       = round(len(wins) / len(trades) * 100, 1)

    gross_profit = sum(t.pnl for t in wins)
    gross_loss   = abs(sum(t.pnl for t in losses))
    result.profit_factor = round(gross_profit / gross_loss, 2) if gross_loss else float("inf")

    final_equity = equity_curve[-1]
    result.total_return = round((final_equity - start_capital) / start_capital * 100, 2)

    # Max drawdown
    arr   = np.array(equity_curve)
    peaks = np.maximum.accumulate(arr)
    dds   = (peaks - arr) / peaks
    result.max_drawdown = round(float(dds.max()) * 100, 2)

    # Annualised Sharpe (using per-trade returns, risk-free = 0)
    returns = np.array([t.pnl_pct for t in trades])
    if returns.std() > 0:
        result.sharpe_ratio = round(
            float(returns.mean() / returns.std() * math.sqrt(len(returns))), 2
        )

    return result


def print_report(result: BacktestResult):
    from colorama import Fore, Style, init
    init(autoreset=True)

    sep = "─" * 48
    print(f"\n{sep}")
    print(f"  Backtest: {result.pair}")
    print(sep)
    print(f"  Total trades   : {result.total_trades}")
    print(f"  Win rate        : {result.win_rate} %  "
          f"({result.winning_trades}W / {result.losing_trades}L)")
    print(f"  Profit factor   : {result.profit_factor}")
    print(f"  Total return    : "
          + (Fore.GREEN if result.total_return >= 0 else Fore.RED)
          + f"{result.total_return} %")
    print(f"  Max drawdown    : {Style.BRIGHT}{Fore.RED}{result.max_drawdown} %")
    print(f"  Sharpe ratio    : {result.sharpe_ratio}")
    print(sep + "\n")
