"""
Risk management: position sizing + non-negotiable circuit breakers.

Rules (hardcoded — not config overrideable):
  • Max 2 % of equity at risk per trade
  • Daily loss  > 3 % → halt until next UTC day
  • Weekly loss > 7 % → halt until next UTC Monday
"""

import datetime
import config as cfg


class RiskManager:
    def __init__(self, starting_equity: float):
        self._equity         = starting_equity
        self._day_start      = starting_equity
        self._week_start     = starting_equity
        self._last_reset_day = self._today()
        self._last_reset_wk  = self._week()
        self._halted         = False
        self._halt_reason    = ""

    # ── Public API ────────────────────────────────────────────────────────────

    def position_size(self, entry: float, stop: float) -> float:
        """
        Return the quantity (in base currency) to buy/sell so that a
        full stop-out loses exactly MAX_RISK_PER_TRADE of current equity.
        Returns 0.0 if the calculation produces a nonsensical result.
        """
        risk_usd = self._equity * cfg.MAX_RISK_PER_TRADE
        risk_per_unit = abs(entry - stop)
        if risk_per_unit <= 0:
            return 0.0
        qty = risk_usd / risk_per_unit
        # Never risk more than 25 % of equity on a single position (sanity cap)
        max_qty = (self._equity * 0.25) / entry
        return min(qty, max_qty)

    def update_equity(self, new_equity: float):
        self._refresh_resets()
        self._equity = new_equity
        self._check_circuit_breakers()

    def record_closed_trade(self, pnl: float):
        """Call after each trade closes with realised P&L (positive or negative)."""
        self.update_equity(self._equity + pnl)

    def is_halted(self) -> bool:
        self._refresh_resets()
        return self._halted

    def halt_reason(self) -> str:
        return self._halt_reason

    def equity(self) -> float:
        return self._equity

    def status(self) -> dict:
        self._refresh_resets()
        daily_dd  = (self._day_start  - self._equity) / self._day_start
        weekly_dd = (self._week_start - self._equity) / self._week_start
        return {
            "equity":           round(self._equity, 2),
            "daily_drawdown":   round(daily_dd  * 100, 2),
            "weekly_drawdown":  round(weekly_dd * 100, 2),
            "halted":           self._halted,
            "halt_reason":      self._halt_reason,
        }

    # ── Internals ─────────────────────────────────────────────────────────────

    def _today(self) -> datetime.date:
        return datetime.datetime.utcnow().date()

    def _week(self) -> int:
        return datetime.datetime.utcnow().isocalendar()[1]

    def _refresh_resets(self):
        today = self._today()
        week  = self._week()

        if today != self._last_reset_day:
            self._day_start      = self._equity
            self._last_reset_day = today
            # Clear a daily halt at midnight
            if self._halted and "daily" in self._halt_reason:
                self._halted      = False
                self._halt_reason = ""

        if week != self._last_reset_wk:
            self._week_start    = self._equity
            self._last_reset_wk = week
            if self._halted and "weekly" in self._halt_reason:
                self._halted      = False
                self._halt_reason = ""

    def _check_circuit_breakers(self):
        if self._halted:
            return
        daily_dd  = (self._day_start  - self._equity) / max(self._day_start,  1)
        weekly_dd = (self._week_start - self._equity) / max(self._week_start, 1)

        if daily_dd >= cfg.DAILY_DRAWDOWN_LIMIT:
            self._halted      = True
            self._halt_reason = (
                f"daily drawdown {daily_dd*100:.1f}% exceeded "
                f"{cfg.DAILY_DRAWDOWN_LIMIT*100:.0f}% limit — "
                "trading halted until UTC midnight"
            )
        elif weekly_dd >= cfg.WEEKLY_DRAWDOWN_LIMIT:
            self._halted      = True
            self._halt_reason = (
                f"weekly drawdown {weekly_dd*100:.1f}% exceeded "
                f"{cfg.WEEKLY_DRAWDOWN_LIMIT*100:.0f}% limit — "
                "trading halted until Monday UTC 00:00"
            )
