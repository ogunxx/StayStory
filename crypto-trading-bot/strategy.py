"""
Multi-timeframe signal engine.

Flow:
  1. 1H candles → determine trend bias (bullish / bearish / neutral)
  2. 15M candles → detect entry signal aligned with 1H bias
  3. Return a Signal object with entry, stop-loss, take-profit prices
"""

from dataclasses import dataclass
from typing import Literal, Optional
import pandas as pd
import indicators as ind
import config as cfg


Trend = Literal["bullish", "bearish", "neutral"]
Direction = Literal["long", "short", "none"]


@dataclass
class Signal:
    direction:   Direction
    entry_price: float
    stop_loss:   float
    take_profit: float
    reason:      str


FLAT = Signal("none", 0.0, 0.0, 0.0, "no signal")


def get_trend(df_1h: pd.DataFrame) -> Trend:
    """
    Determine the hourly trend bias from the last closed 1H candle.
    Bullish : EMA_FAST > EMA_SLOW and RSI > 50
    Bearish : EMA_FAST < EMA_SLOW and RSI < 50
    Neutral : mixed / indeterminate
    """
    df = ind.add_indicators(df_1h, cfg)
    last = df.iloc[-2]  # -1 is the still-forming candle; use -2 (last closed)

    ema_bull = last["ema_fast"] > last["ema_slow"]
    ema_bear = last["ema_fast"] < last["ema_slow"]
    rsi_bull = last["rsi"] > cfg.RSI_BULL_MIN
    rsi_bear = last["rsi"] < cfg.RSI_BEAR_MAX

    if ema_bull and rsi_bull:
        return "bullish"
    if ema_bear and rsi_bear:
        return "bearish"
    return "neutral"


def _golden_cross(df: pd.DataFrame) -> bool:
    """True if the most-recently CLOSED candle produced a fresh golden cross."""
    prev = df.iloc[-3]
    last = df.iloc[-2]
    return prev["ema_fast"] <= prev["ema_slow"] and last["ema_fast"] > last["ema_slow"]


def _death_cross(df: pd.DataFrame) -> bool:
    """True if the most-recently CLOSED candle produced a fresh death cross."""
    prev = df.iloc[-3]
    last = df.iloc[-2]
    return prev["ema_fast"] >= prev["ema_slow"] and last["ema_fast"] < last["ema_slow"]


def get_signal(df_15m: pd.DataFrame, trend: Trend) -> Signal:
    """
    Generate an entry signal on the 15 M timeframe, filtered by 1H trend.

    Long entry conditions (all must be true):
      • 1H trend = bullish
      • Fresh golden cross on 15M (EMA9 just crossed above EMA20)
      • RSI between RSI_BULL_MIN and RSI_OVERBOUGHT (momentum but not exhausted)
      • Close price above VWAP

    Short entry conditions (mirror image):
      • 1H trend = bearish
      • Fresh death cross on 15M
      • RSI between RSI_OVERSOLD and RSI_BEAR_MAX
      • Close price below VWAP

    Stop and target are ATR-based from the last closed candle.
    """
    if trend == "neutral":
        return FLAT

    df = ind.add_indicators(df_15m, cfg)
    if len(df) < max(cfg.EMA_SLOW, cfg.RSI_PERIOD, cfg.ATR_PERIOD) + 5:
        return FLAT

    last  = df.iloc[-2]
    price = last["close"]
    atr   = last["atr"]

    if trend == "bullish" and _golden_cross(df):
        rsi_ok   = cfg.RSI_BULL_MIN < last["rsi"] < cfg.RSI_OVERBOUGHT
        vwap_ok  = price > last["vwap"]
        if rsi_ok and vwap_ok:
            stop = price - cfg.ATR_STOP_MULT * atr
            tp   = price + cfg.ATR_TP_MULT   * atr
            return Signal("long", price, stop, tp,
                          f"golden-cross | RSI={last['rsi']:.1f} | price>VWAP")

    if trend == "bearish" and _death_cross(df):
        rsi_ok   = cfg.RSI_OVERSOLD < last["rsi"] < cfg.RSI_BEAR_MAX
        vwap_ok  = price < last["vwap"]
        if rsi_ok and vwap_ok:
            stop = price + cfg.ATR_STOP_MULT * atr
            tp   = price - cfg.ATR_TP_MULT   * atr
            return Signal("short", price, stop, tp,
                          f"death-cross | RSI={last['rsi']:.1f} | price<VWAP")

    return FLAT
