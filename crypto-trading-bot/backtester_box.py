"""
Box Strategy Backtester — Break & Retest on Previous Day H/L

Requires three data streams fetched by the caller:
  df_daily  — 1D OHLCV  (to derive previous-day high / low)
  df_15m    — 15-minute OHLCV  (breakout detection + volume filter)
  df_5m     —  5-minute OHLCV  (retest entry + SL/TP tracking)

The 5-minute series is the master clock.  At each 5M candle:
  - UTC day roll  → refresh previous-day levels, reset box state
  - New 15M close → run detect_breakout (once per 15M bar, not every 5M tick)
  - Breakout live → run detect_retest_signal on 5M slice
  - Position open → check SL / TP against 5M close price

Usage:
    python main.py backtest --strategy box --pair BTC-USD --days 120
"""

import math
from dataclasses import dataclass, field
from typing import List, Dict, Optional
import pandas as pd
import numpy as np

import config as cfg
from strategy_box import (
    detect_breakout,
    detect_retest_signal,
    VOL_LOOKBACK,
)


# ─── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class BoxBacktestTrade:
    pair:         str
    side:         str
    entry_ts:     pd.Timestamp
    exit_ts:      pd.Timestamp
    entry_price:  float
    exit_price:   float
    quantity:     float
    pnl:          float
    pnl_pct:      float
    exit_reason:  str
    pattern:      str
    level:        float


@dataclass
class BoxBacktestResult:
    pair:           str
    trades:         List[BoxBacktestTrade] = field(default_factory=list)
    total_return:   float = 0.0
    win_rate:       float = 0.0
    profit_factor:  float = 0.0
    max_drawdown:   float = 0.0
    sharpe_ratio:   float = 0.0
    total_trades:   int   = 0
    winning_trades: int   = 0
    losing_trades:  int   = 0


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _check_sl_tp(position: dict, price: float):
    """Returns (exit_price, reason) or (None, None)."""
    if position["side"] == "long":
        if price <= position["stop_loss"]:
            return position["stop_loss"], "stop_loss"
        if price >= position["take_profit"]:
            return position["take_profit"], "take_profit"
    else:
        if price >= position["stop_loss"]:
            return position["stop_loss"], "stop_loss"
        if price <= position["take_profit"]:
            return position["take_profit"], "take_profit"
    return None, None


# ─── Main simulation ──────────────────────────────────────────────────────────

def run_box_backtest(
    df_daily: pd.DataFrame,
    df_15m:   pd.DataFrame,
    df_5m:    pd.DataFrame,
    pair:     str,
    starting_capital: float = cfg.PAPER_STARTING_BALANCE,
) -> BoxBacktestResult:
    """Simulate the Box strategy over historical data."""

    # Build {trading_date → (prev_day_high, prev_day_low)}
    daily_map: Dict = {}
    for k in range(1, len(df_daily)):
        trading_date = df_daily.index[k].date()
        prev = df_daily.iloc[k - 1]
        daily_map[trading_date] = (float(prev["high"]), float(prev["low"]))

    equity        = starting_capital
    position      = None
    box_state     = None          # None or {"direction": str, "level": float}
    current_date  = None
    prev_high     = 0.0
    prev_low      = 0.0

    trades:       List[BoxBacktestTrade] = []
    equity_curve: List[float]            = [equity]

    # Need VOL_LOOKBACK + 2 closed 15M bars before any breakout is valid
    min_15m_bars = VOL_LOOKBACK + 3

    # Two-pointer: j_15m advances in step with the 5M clock
    j_15m            = 0
    last_15m_checked = -1   # 15M index last passed to detect_breakout

    for j_5m in range(3, len(df_5m)):
        ts_5m = df_5m.index[j_5m]
        date  = ts_5m.date()

        # ── Advance 15M pointer to the last bar closed at or before ts_5m ──
        while j_15m + 1 < len(df_15m) and df_15m.index[j_15m + 1] <= ts_5m:
            j_15m += 1

        # ── Day roll: refresh levels, reset breakout state ──────────────────
        if date != current_date:
            current_date = date
            prev_high, prev_low = daily_map.get(date, (0.0, 0.0))
            box_state = None

        if prev_high == 0 or j_15m < min_15m_bars:
            continue

        price = float(df_5m.iloc[j_5m]["close"])

        # ── SL / TP check ────────────────────────────────────────────────────
        if position:
            ep, reason = _check_sl_tp(position, price)
            if reason:
                side    = position["side"]
                qty     = position["quantity"]
                cost    = position["entry_price"]
                pnl     = (ep - cost) * qty if side == "long" else (cost - ep) * qty
                pnl_pct = pnl / (cost * qty) * 100
                equity += pnl
                trades.append(BoxBacktestTrade(
                    pair=pair, side=side,
                    entry_ts=position["entry_ts"], exit_ts=ts_5m,
                    entry_price=cost, exit_price=ep, quantity=qty,
                    pnl=round(pnl, 4), pnl_pct=round(pnl_pct, 2),
                    exit_reason=reason,
                    pattern=position["pattern"], level=position["level"],
                ))
                equity_curve.append(equity)
                position = None

        # ── Breakout detection (once per new 15M close) ──────────────────────
        if box_state is None and not position and j_15m != last_15m_checked:
            last_15m_checked = j_15m
            breakout = detect_breakout(df_15m.iloc[:j_15m + 1], prev_high, prev_low)
            if breakout:
                direction, level = breakout
                box_state = {"direction": direction, "level": level}

        # ── Retest entry on 5M ───────────────────────────────────────────────
        if box_state and not position:
            sig = detect_retest_signal(
                df_5m.iloc[:j_5m + 1],
                box_state["direction"],
                box_state["level"],
            )
            if sig:
                risk_usd      = equity * cfg.MAX_RISK_PER_TRADE
                risk_per_unit = abs(sig.entry_price - sig.stop_loss)
                if risk_per_unit > 0:
                    qty = min(
                        risk_usd / risk_per_unit,
                        (equity * 0.25) / sig.entry_price,
                    )
                    if qty > 0:
                        position = {
                            "side":        sig.direction,
                            "entry_price": sig.entry_price,
                            "stop_loss":   sig.stop_loss,
                            "take_profit": sig.take_profit,
                            "quantity":    qty,
                            "entry_ts":    ts_5m,
                            "pattern":     sig.pattern,
                            "level":       sig.level,
                        }
                        box_state = None  # reset; one trade per breakout

    return _compute_metrics(pair, trades, equity_curve, starting_capital)


# ─── Metrics ──────────────────────────────────────────────────────────────────

def _compute_metrics(
    pair:         str,
    trades:       List[BoxBacktestTrade],
    equity_curve: List[float],
    start_cap:    float,
) -> BoxBacktestResult:
    result = BoxBacktestResult(pair=pair, trades=trades, total_trades=len(trades))
    if not trades:
        return result

    wins   = [t for t in trades if t.pnl > 0]
    losses = [t for t in trades if t.pnl <= 0]
    result.winning_trades = len(wins)
    result.losing_trades  = len(losses)
    result.win_rate       = round(len(wins) / len(trades) * 100, 1)

    gp = sum(t.pnl for t in wins)
    gl = abs(sum(t.pnl for t in losses))
    result.profit_factor  = round(gp / gl, 2) if gl else float("inf")

    result.total_return = round((equity_curve[-1] - start_cap) / start_cap * 100, 2)

    arr   = np.array(equity_curve)
    peaks = np.maximum.accumulate(arr)
    dds   = (peaks - arr) / peaks
    result.max_drawdown = round(float(dds.max()) * 100, 2)

    rets = np.array([t.pnl_pct for t in trades])
    if rets.std() > 0:
        result.sharpe_ratio = round(
            float(rets.mean() / rets.std() * math.sqrt(len(rets))), 2
        )

    return result


# ─── Report ───────────────────────────────────────────────────────────────────

def print_box_report(result: BoxBacktestResult):
    from collections import Counter
    from colorama import Fore, Style, init
    init(autoreset=True)

    sep = "─" * 52
    print(f"\n{sep}")
    print(f"  Box Backtest: {result.pair}")
    print(sep)
    print(f"  Total trades    : {result.total_trades}")

    if result.total_trades == 0:
        print(f"  (no trades — data gap or parameters too strict)")
        print(sep + "\n")
        return

    print(f"  Win rate        : {result.win_rate} %  "
          f"({result.winning_trades}W / {result.losing_trades}L)")
    print(f"  Profit factor   : {result.profit_factor}")

    ret_color = Fore.GREEN if result.total_return >= 0 else Fore.RED
    print(f"  Total return    : {ret_color}{result.total_return} %{Style.RESET_ALL}")
    print(f"  Max drawdown    : {Style.BRIGHT}{Fore.RED}{result.max_drawdown} %{Style.RESET_ALL}")
    print(f"  Sharpe ratio    : {result.sharpe_ratio}")

    # Long / short split
    longs  = [t for t in result.trades if t.side == "long"]
    shorts = [t for t in result.trades if t.side == "short"]
    if longs:
        lw = len([t for t in longs if t.pnl > 0])
        print(f"  Long trades     : {len(longs)}  "
              f"({lw}W / {len(longs) - lw}L)")
    if shorts:
        sw = len([t for t in shorts if t.pnl > 0])
        print(f"  Short trades    : {len(shorts)}  "
              f"({sw}W / {len(shorts) - sw}L)")

    # Pattern breakdown
    patterns = Counter(t.pattern for t in result.trades)
    pat_wins = {}
    for p in patterns:
        pt = [t for t in result.trades if t.pattern == p]
        pw = len([t for t in pt if t.pnl > 0])
        pat_wins[p] = f"{pw}/{len(pt)}"
    print(f"  Patterns (W/T)  : "
          + "  ".join(f"{p}={pat_wins[p]}" for p in patterns))

    print(sep + "\n")
