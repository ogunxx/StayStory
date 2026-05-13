"""
Fetches OHLCV candle data from Coinbase Advanced Trade API.
Returns clean pandas DataFrames with a UTC DatetimeIndex.
"""

import time
import datetime
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


def _build_client() -> RESTClient:
    if not cfg.CB_API_KEY or not cfg.CB_API_SECRET:
        raise EnvironmentError(
            "CB_API_KEY and CB_API_SECRET must be set in your .env file."
        )
    return RESTClient(api_key=cfg.CB_API_KEY, api_secret=cfg.CB_API_SECRET)


def _candles_to_df(candles) -> pd.DataFrame:
    rows = []
    for c in candles:
        rows.append({
            "timestamp": int(c.start),
            "open":   float(c.open),
            "high":   float(c.high),
            "low":    float(c.low),
            "close":  float(c.close),
            "volume": float(c.volume),
        })
    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="s", utc=True)
    df = df.set_index("timestamp").sort_index()
    return df


class DataFetcher:
    def __init__(self):
        self._client = _build_client()

    def fetch_candles(self, product_id: str, granularity: str, limit: int = 300) -> pd.DataFrame:
        """
        Fetch the most recent `limit` closed candles (max 300 per Coinbase request).
        """
        now      = int(time.time())
        interval = _SECONDS[granularity]
        start    = now - interval * (limit + 1)  # +1 so the live candle is always trimmed

        resp = self._client.get_candles(
            product_id=product_id,
            start=str(start),
            end=str(now),
            granularity=granularity,
            limit=limit + 1,
        )
        df = _candles_to_df(resp.candles)
        return df.iloc[:-1]  # drop the still-forming candle

    def fetch_historical(self, product_id: str, granularity: str, days: int) -> pd.DataFrame:
        """
        Fetch `days` worth of historical candles, paginating as needed.
        Coinbase caps each request at 300 candles.
        """
        interval     = _SECONDS[granularity]
        candles_needed = int(days * 86400 / interval)
        chunk_size   = 300
        now          = int(time.time())
        end          = now
        frames       = []

        while candles_needed > 0:
            n     = min(chunk_size, candles_needed)
            start = end - interval * n
            resp  = self._client.get_candles(
                product_id=product_id,
                start=str(start),
                end=str(end),
                granularity=granularity,
                limit=n,
            )
            chunk = _candles_to_df(resp.candles)
            if chunk.empty:
                break
            frames.append(chunk)
            end          = start - 1
            candles_needed -= n
            time.sleep(0.2)  # stay well under rate limits

        if not frames:
            return pd.DataFrame(columns=["open", "high", "low", "close", "volume"])
        return pd.concat(frames).sort_index().drop_duplicates()
