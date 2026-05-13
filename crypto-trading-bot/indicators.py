"""
Pure indicator functions.  All inputs/outputs are pandas Series or DataFrames.
No side effects, no I/O — safe to call from strategy, backtester, or tests.
"""

import pandas as pd
import numpy as np


def ema(series: pd.Series, period: int) -> pd.Series:
    return series.ewm(span=period, adjust=False).mean()


def rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain  = delta.clip(lower=0)
    loss  = (-delta).clip(lower=0)
    avg_gain = gain.ewm(com=period - 1, adjust=False).mean()
    avg_loss = loss.ewm(com=period - 1, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def atr(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
    prev_close = close.shift(1)
    tr = pd.concat([
        high - low,
        (high - prev_close).abs(),
        (low  - prev_close).abs(),
    ], axis=1).max(axis=1)
    return tr.ewm(com=period - 1, adjust=False).mean()


def vwap(high: pd.Series, low: pd.Series, close: pd.Series, volume: pd.Series,
         timestamps: pd.DatetimeIndex) -> pd.Series:
    """Daily-reset VWAP anchored at UTC midnight."""
    typical = (high + low + close) / 3
    df = pd.DataFrame({
        "typical": typical,
        "volume":  volume,
        "date":    timestamps.date,
    })
    df["tp_vol"] = df["typical"] * df["volume"]
    df["cum_tp_vol"] = df.groupby("date")["tp_vol"].cumsum()
    df["cum_vol"]    = df.groupby("date")["volume"].cumsum()
    return (df["cum_tp_vol"] / df["cum_vol"]).values


def bollinger_bands(close: pd.Series, period: int = 20, std_dev: float = 2.0):
    """Returns (upper, middle, lower) as a tuple of Series."""
    mid   = close.rolling(period).mean()
    sigma = close.rolling(period).std(ddof=0)
    return mid + std_dev * sigma, mid, mid - std_dev * sigma


def add_indicators(df: pd.DataFrame, cfg) -> pd.DataFrame:
    """
    Adds all required columns to an OHLCV DataFrame in-place and returns it.
    df must have columns: open, high, low, close, volume
    df.index must be a DatetimeIndex (UTC).
    """
    df = df.copy()
    df["ema_fast"] = ema(df["close"], cfg.EMA_FAST)
    df["ema_slow"] = ema(df["close"], cfg.EMA_SLOW)
    df["rsi"]      = rsi(df["close"], cfg.RSI_PERIOD)
    df["atr"]      = atr(df["high"], df["low"], df["close"], cfg.ATR_PERIOD)
    df["vwap"]     = vwap(df["high"], df["low"], df["close"], df["volume"], df.index)
    df["bb_upper"], df["bb_mid"], df["bb_lower"] = bollinger_bands(
        df["close"], cfg.BB_PERIOD, cfg.BB_STD
    )
    return df
