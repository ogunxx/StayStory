"""
Fetches OHLCV candle data from Coinbase Advanced Trade API.
- Historical / backtest data: public endpoint (no auth, no 401s)
- Live account data: authenticated endpoint
"""

import time
import requests
import pandas as pd
from coinbase.rest import RESTClient
import config as cfg


_SECONDS = {
    "ONE_MINUTE":     60,
    "FIVE_MINUTE":    300,
    "FIFTEEN_MINUTE": 900,
    "THIRTY_MINUTE":  1800,
    "ONE_HOUR":       3600,
    "TWO_HOUR":       7200,
    "SIX_HOUR":       21600,
    "ONE_DAY":        86400,
}

_PUBLIC_BASE = "https://api.coinbase.com/api/v3/brokerage/market/products"


def _build_client() -> RESTClient:
    if not cfg.CB_API_KEY or not cfg.CB_API_SECRET:
        raise EnvironmentError(
            "CB_API_KEY and CB_API_SECRET must be set in your .env file."
        )
    return RESTClient(api_key=cfg.CB_API_KEY, api_secret=cfg.CB_API_SECRET)


def _candles_to_df(candles: list) -> pd.DataFrame:
    rows = []
    for c in candles:
        rows.append({
            "timestamp": int(c["start"]) if isinstance(c, dict) else int(c.start),
            "open":   float(c["open"])   if isinstance(c, dict) else float(c.open),
            "high":   float(c["high"])   if isinstance(c, dict) else float(c.high),
            "low":    float(c["low"])    if isinstance(c, dict) else float(c.low),
            "close":  float(c["close"])  if isinstance(c, dict) else float(c.close),
            "volume": float(c["volume"]) if isinstance(c, dict) else float(c.volume),
        })
    df = pd.DataFrame(rows)
    if df.empty:
        return df
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="s", utc=True)
    return df.set_index("timestamp").sort_index()


def _fetch_public_candles(product_id: str, granularity: str,
                          start: int, end: int, limit: int) -> pd.DataFrame:
    """
    Fetch candles from the unauthenticated public endpoint.
    Retries up to 4 times with exponential backoff.
    """
    url = f"{_PUBLIC_BASE}/{product_id}/candles"
    params = {
        "start":       str(start),
        "end":         str(end),
        "granularity": granularity,
        "limit":       limit,
    }
    delay = 2
    for attempt in range(4):
        try:
            resp = requests.get(url, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            candles = data.get("candles", [])
            return _candles_to_df(candles)
        except Exception:
            if attempt == 3:
                raise
            time.sleep(delay)
            delay *= 2
    return pd.DataFrame()


class DataFetcher:
    def __init__(self):
        self._client = _build_client()

    def fetch_candles(self, product_id: str, granularity: str, limit: int = 300) -> pd.DataFrame:
        """Live candles for the paper-trading loop — uses public endpoint."""
        now      = int(time.time())
        interval = _SECONDS[granularity]
        start    = now - interval * (limit + 1)
        df = _fetch_public_candles(product_id, granularity, start, now, limit + 1)
        return df.iloc[:-1] if len(df) > 1 else df

    def fetch_historical(self, product_id: str, granularity: str, days: int) -> pd.DataFrame:
        """
        Fetch `days` worth of candles for backtesting.
        Paginates through the public endpoint — no authentication required.
        """
        interval       = _SECONDS[granularity]
        candles_needed = int(days * 86400 / interval)
        chunk_size     = 300
        now            = int(time.time())
        end            = now
        frames         = []

        while candles_needed > 0:
            n     = min(chunk_size, candles_needed)
            start = end - interval * n
            chunk = _fetch_public_candles(product_id, granularity, start, end, n)
            if chunk.empty:
                break
            frames.append(chunk)
            end           = start - 1
            candles_needed -= n
            time.sleep(0.3)

        if not frames:
            return pd.DataFrame(columns=["open", "high", "low", "close", "volume"])
        return pd.concat(frames).sort_index().drop_duplicates()
