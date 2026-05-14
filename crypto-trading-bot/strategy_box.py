"""
Box Trading Strategy — Break & Retest

Logic:
  1. Previous day high/low define the box boundaries
  2. 15M candle closes beyond a boundary + volume spike = breakout confirmed
  3. On 5M timeframe, wait for price to return near the broken level
  4. Retest validity: wick may touch the level, but body must close back on
     the breakout side (the "flip confirmation" — full body re-cross = failed)
  5. Entry trigger: bullish/bearish engulfing (preferred), hammer, or
     shooting star on 5M (engulfing ranked highest by professional research)
  6. Stop loss: just beyond the retest structure low/high + 0.15% buffer
  7. Take profit: 3× the stop distance (3:1 R/R)

Breakout state resets at UTC midnight each day.
"""

from dataclasses import dataclass
from typing import Optional, Tuple
import pandas as pd


RETEST_TOLERANCE    = 0.006   # price must be within 0.6 % of the broken level
WICK_BODY_RATIO     = 2.0     # wick must be 2× body size for hammer patterns
SL_BUFFER_PCT       = 0.0015  # 0.15 % buffer beyond structure low/high for SL
TP_RATIO            = 3.0     # take-profit = 3 × stop distance
VOL_BREAKOUT_FACTOR = 1.5     # breakout candle volume must exceed 1.5× 20-bar avg
VOL_LOOKBACK        = 20      # bars to compute the volume moving average


@dataclass
class BoxSignal:
    direction:   str    # "long" or "short"
    entry_price: float
    stop_loss:   float
    take_profit: float
    level:       float  # the broken level (prev day high or low)
    pattern:     str    # "hammer" | "inverted_hammer" | "bullish_engulfing" | "bearish_engulfing" | "shooting_star"


def get_prev_day_levels(df_daily: pd.DataFrame) -> Tuple[float, float]:
    """Returns (prev_day_high, prev_day_low). Needs at least 2 daily candles."""
    if len(df_daily) < 2:
        return 0.0, 0.0
    prev = df_daily.iloc[-2]
    return float(prev["high"]), float(prev["low"])


def _volume_confirms_breakout(df: pd.DataFrame, candle_idx: int) -> bool:
    """
    True when the candle at candle_idx has volume >= VOL_BREAKOUT_FACTOR
    times the rolling mean of the prior VOL_LOOKBACK candles.
    Low-volume breakouts are the #1 fakeout symptom.
    """
    if candle_idx < VOL_LOOKBACK:
        return True  # not enough history — give benefit of the doubt
    vol_now = df["volume"].iloc[candle_idx]
    vol_avg = df["volume"].iloc[candle_idx - VOL_LOOKBACK: candle_idx].mean()
    if vol_avg == 0:
        return True
    return vol_now >= VOL_BREAKOUT_FACTOR * vol_avg


def detect_breakout(
    df_15m: pd.DataFrame,
    prev_high: float,
    prev_low: float,
) -> Optional[Tuple[str, float]]:
    """
    Returns ('bullish', level) on a fresh break above prev_high,
    ('bearish', level) on a fresh break below prev_low, else None.

    Requirements (professional-grade):
    - Previous candle closed INSIDE the box.
    - Last closed candle body crosses the boundary (wick-only = fakeout).
    - Volume on the breakout candle is >= 1.5× the 20-bar average.
    """
    if len(df_15m) < VOL_LOOKBACK + 2 or prev_high == 0:
        return None

    idx_last = len(df_15m) - 2   # last fully closed candle
    last = df_15m.iloc[idx_last]
    prev = df_15m.iloc[idx_last - 1]

    if prev["close"] <= prev_high < last["close"]:
        if _volume_confirms_breakout(df_15m, idx_last):
            return ("bullish", prev_high)

    if prev["close"] >= prev_low > last["close"]:
        if _volume_confirms_breakout(df_15m, idx_last):
            return ("bearish", prev_low)

    return None


# ── Candlestick pattern helpers ────────────────────────────────────────────────

def _body(c) -> float:
    return abs(c["close"] - c["open"])

def _range(c) -> float:
    return c["high"] - c["low"]

def _upper_wick(c) -> float:
    return c["high"] - max(c["open"], c["close"])

def _lower_wick(c) -> float:
    return min(c["open"], c["close"]) - c["low"]

def _near_level(price: float, level: float) -> bool:
    return abs(price - level) / level <= RETEST_TOLERANCE


def _is_hammer(c) -> bool:
    """Long lower wick, small body near the top — bullish reversal."""
    b, lw, uw = _body(c), _lower_wick(c), _upper_wick(c)
    if b == 0 or _range(c) == 0:
        return False
    return lw >= WICK_BODY_RATIO * b and uw <= b


def _is_shooting_star(c) -> bool:
    """Long upper wick, small body near the bottom — bearish reversal."""
    b, uw, lw = _body(c), _upper_wick(c), _lower_wick(c)
    if b == 0 or _range(c) == 0:
        return False
    return uw >= WICK_BODY_RATIO * b and lw <= b


def _is_bullish_engulfing(prev, curr) -> bool:
    prev_bear = prev["close"] < prev["open"]
    curr_bull = curr["close"] > curr["open"]
    if not (prev_bear and curr_bull):
        return False
    return curr["open"] <= prev["close"] and curr["close"] >= prev["open"]


def _is_bearish_engulfing(prev, curr) -> bool:
    prev_bull = prev["close"] > prev["open"]
    curr_bear = curr["close"] < curr["open"]
    if not (prev_bull and curr_bear):
        return False
    return curr["open"] >= prev["close"] and curr["close"] <= prev["open"]


def _retest_body_on_breakout_side(candle, direction: str, level: float) -> bool:
    """
    Flip-confirmation check: the candle body must close back on the breakout
    side of the level.  A full body close BACK THROUGH the level means the
    breakout failed — do not enter.

    Bullish (price broke above level): body close must be >= level.
    Bearish (price broke below level): body close must be <= level.
    """
    close = candle["close"]
    if direction == "bullish":
        return close >= level
    else:
        return close <= level


# ── Main signal detector ───────────────────────────────────────────────────────

def detect_retest_signal(
    df_5m: pd.DataFrame,
    direction: str,
    level: float,
) -> Optional[BoxSignal]:
    """
    After a breakout, scan the 5M chart for a retest entry.

    Proximity check: the signal candle's low/high or midpoint must be
    within RETEST_TOLERANCE (0.6 %) of the broken level.

    Flip-confirmation: the candle body must close back on the breakout side.
    A full body close through the level = failed retest, skip.

    Long setup (bullish breakout — broken high now acts as support):
      Pattern priority: bullish_engulfing > hammer > inverted_hammer

    Short setup (bearish breakout — broken low now acts as resistance):
      Pattern priority: bearish_engulfing > shooting_star > inverted_hammer
    """
    if len(df_5m) < 3:
        return None

    curr = df_5m.iloc[-2]   # last closed 5M candle — the signal candle
    prev = df_5m.iloc[-3]

    # Check proximity to level (body midpoint, or either wick tip)
    mid = (curr["open"] + curr["close"]) / 2
    near = (
        _near_level(mid, level)
        or _near_level(curr["low"],  level)
        or _near_level(curr["high"], level)
    )
    if not near:
        return None

    # Flip check: body must close on the breakout side
    if not _retest_body_on_breakout_side(curr, direction, level):
        return None

    entry = curr["close"]

    if direction == "bullish":
        pattern = None
        if _is_bullish_engulfing(prev, curr):
            pattern = "bullish_engulfing"
        elif _is_hammer(curr):
            pattern = "hammer"
        elif _is_shooting_star(curr):
            pattern = "inverted_hammer"

        if pattern:
            sl  = min(level, curr["low"]) * (1 - SL_BUFFER_PCT)
            rr  = entry - sl
            if rr <= 0:
                return None
            tp  = entry + TP_RATIO * rr
            return BoxSignal("long", entry, sl, tp, level, pattern)

    elif direction == "bearish":
        pattern = None
        if _is_bearish_engulfing(prev, curr):
            pattern = "bearish_engulfing"
        elif _is_shooting_star(curr):
            pattern = "shooting_star"
        elif _is_hammer(curr):
            pattern = "inverted_hammer"

        if pattern:
            sl  = max(level, curr["high"]) * (1 + SL_BUFFER_PCT)
            rr  = sl - entry
            if rr <= 0:
                return None
            tp  = entry - TP_RATIO * rr
            return BoxSignal("short", entry, sl, tp, level, pattern)

    return None
