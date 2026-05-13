import os
from dotenv import load_dotenv

load_dotenv()

# ─── Pairs ────────────────────────────────────────────────────────────────────
PAIRS = ["BTC-USD", "ETH-USD", "SOL-USD"]

# ─── Timeframes (Coinbase granularity strings) ────────────────────────────────
# Moved up one level: 6H trend + 1H entries
# 15M entries generated too many false signals (~65 trades / 60 days)
TF_HIGH = "SIX_HOUR"   # Trend direction filter
TF_LOW  = "ONE_HOUR"   # Entry timing

# ─── Indicator parameters ─────────────────────────────────────────────────────
EMA_FAST       = 9
EMA_SLOW       = 21
RSI_PERIOD     = 14
RSI_BULL_MIN   = 52   # Slightly tighter: RSI must show real momentum for longs
RSI_BEAR_MAX   = 48   # Slightly tighter: RSI must show real weakness for shorts
RSI_OVERBOUGHT = 70
RSI_OVERSOLD   = 30
ATR_PERIOD     = 14
ATR_STOP_MULT  = 1.5  # stop-loss  = entry ± 1.5 × ATR
ATR_TP_MULT    = 3.0  # take-profit = entry ± 3.0 × ATR (2:1 R/R, break-even at 25% win rate)
BB_PERIOD      = 20
BB_STD         = 2.0

# ─── Risk management (non-negotiable) ─────────────────────────────────────────
MAX_RISK_PER_TRADE    = 0.02
MAX_POSITIONS         = 3
DAILY_DRAWDOWN_LIMIT  = 0.03
WEEKLY_DRAWDOWN_LIMIT = 0.07

# ─── Paper trading ────────────────────────────────────────────────────────────
PAPER_STARTING_BALANCE = float(os.getenv("PAPER_BALANCE", "3000"))

# ─── Coinbase API ─────────────────────────────────────────────────────────────
CB_API_KEY    = os.getenv("CB_API_KEY", "")
CB_API_SECRET = os.getenv("CB_API_SECRET", "").replace("\\n", "\n")

# ─── Loop ─────────────────────────────────────────────────────────────────────
POLL_INTERVAL = 60
