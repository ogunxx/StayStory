import os
from dotenv import load_dotenv

load_dotenv()

# ─── Pairs ────────────────────────────────────────────────────────────────────
PAIRS = ["BTC-USD", "ETH-USD", "SOL-USD"]

# ─── Timeframes (Coinbase granularity strings) ────────────────────────────────
TF_HIGH = "ONE_HOUR"        # Trend direction filter
TF_LOW  = "FIFTEEN_MINUTE"  # Entry / exit timing

# ─── Indicator parameters ─────────────────────────────────────────────────────
EMA_FAST       = 9
EMA_SLOW       = 20
RSI_PERIOD     = 14
RSI_BULL_MIN   = 50   # RSI must be above this to qualify a long entry
RSI_BEAR_MAX   = 50   # RSI must be below this to qualify a short entry
RSI_OVERBOUGHT = 70   # Don't enter long when RSI is already overbought
RSI_OVERSOLD   = 30   # Don't enter short when RSI is already oversold
ATR_PERIOD     = 14
ATR_STOP_MULT  = 1.5  # stop-loss  = entry ± 1.5 × ATR
ATR_TP_MULT    = 2.5  # take-profit = entry ± 2.5 × ATR  (1.67 : 1 R/R)
BB_PERIOD      = 20
BB_STD         = 2.0

# ─── Risk management (non-negotiable) ─────────────────────────────────────────
MAX_RISK_PER_TRADE    = 0.02   # Risk at most 2 % of equity on any single trade
MAX_POSITIONS         = 3      # One open position per pair at most
DAILY_DRAWDOWN_LIMIT  = 0.03   # Halt all trading if daily loss exceeds 3 %
WEEKLY_DRAWDOWN_LIMIT = 0.07   # Halt all trading if weekly loss exceeds 7 %

# ─── Paper trading ────────────────────────────────────────────────────────────
PAPER_STARTING_BALANCE = float(os.getenv("PAPER_BALANCE", "3000"))

# ─── Coinbase API ─────────────────────────────────────────────────────────────
CB_API_KEY    = os.getenv("CB_API_KEY", "")
CB_API_SECRET = os.getenv("CB_API_SECRET", "").replace("\\n", "\n")

# ─── Loop ─────────────────────────────────────────────────────────────────────
POLL_INTERVAL = 60  # seconds between main-loop iterations
