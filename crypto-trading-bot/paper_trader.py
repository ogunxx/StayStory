"""
Paper trading engine.
Simulates order fills, tracks open positions, and logs every trade.
No real money, no API calls for order placement.
"""

import uuid
import datetime
import json
import os
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional
import config as cfg


@dataclass
class Position:
    id:          str
    pair:        str
    side:        str          # "long" or "short"
    entry_price: float
    quantity:    float
    stop_loss:   float
    take_profit: float
    entry_time:  str
    reason:      str


@dataclass
class ClosedTrade:
    id:          str
    pair:        str
    side:        str
    entry_price: float
    exit_price:  float
    quantity:    float
    pnl:         float
    pnl_pct:     float
    entry_time:  str
    exit_time:   str
    exit_reason: str          # "take_profit" | "stop_loss" | "signal_exit"


class PaperTrader:
    def __init__(self, starting_balance: float = cfg.PAPER_STARTING_BALANCE):
        self._cash: float                     = starting_balance
        self._positions: Dict[str, Position]  = {}   # position_id → Position
        self._pair_positions: Dict[str, str]  = {}   # pair → position_id
        self._trades: List[ClosedTrade]       = []
        os.makedirs("trades", exist_ok=True)

    # ── Open / close ──────────────────────────────────────────────────────────

    def open_position(
        self,
        pair: str,
        side: str,
        entry_price: float,
        quantity: float,
        stop_loss: float,
        take_profit: float,
        reason: str = "",
    ) -> Optional[str]:
        if pair in self._pair_positions:
            return None  # already in this pair
        if len(self._positions) >= cfg.MAX_POSITIONS:
            return None  # at max concurrent positions
        cost = entry_price * quantity
        if side == "long" and cost > self._cash:
            quantity = self._cash / entry_price * 0.99  # use 99 % of available cash
            cost     = entry_price * quantity
        if quantity <= 0:
            return None

        pos_id = str(uuid.uuid4())[:8]
        pos = Position(
            id=pos_id, pair=pair, side=side,
            entry_price=entry_price, quantity=quantity,
            stop_loss=stop_loss, take_profit=take_profit,
            entry_time=_now(), reason=reason,
        )
        self._positions[pos_id]    = pos
        self._pair_positions[pair] = pos_id
        self._cash -= cost
        return pos_id

    def update_positions(self, prices: Dict[str, float]) -> List[ClosedTrade]:
        """
        Check each open position against current prices.
        Close positions where SL or TP is hit.
        Returns a list of trades closed this tick.
        """
        closed = []
        for pos_id in list(self._positions):
            pos   = self._positions[pos_id]
            price = prices.get(pos.pair)
            if price is None:
                continue

            exit_price  = None
            exit_reason = None

            if pos.side == "long":
                if price <= pos.stop_loss:
                    exit_price, exit_reason = pos.stop_loss, "stop_loss"
                elif price >= pos.take_profit:
                    exit_price, exit_reason = pos.take_profit, "take_profit"
            else:  # short
                if price >= pos.stop_loss:
                    exit_price, exit_reason = pos.stop_loss, "stop_loss"
                elif price <= pos.take_profit:
                    exit_price, exit_reason = pos.take_profit, "take_profit"

            if exit_reason:
                trade = self._close(pos, exit_price, exit_reason)
                closed.append(trade)
        return closed

    def close_position(self, pair: str, price: float, reason: str = "signal_exit") -> Optional[ClosedTrade]:
        pos_id = self._pair_positions.get(pair)
        if not pos_id:
            return None
        return self._close(self._positions[pos_id], price, reason)

    # ── Queries ───────────────────────────────────────────────────────────────

    def has_position(self, pair: str) -> bool:
        return pair in self._pair_positions

    def portfolio_value(self, prices: Dict[str, float]) -> float:
        value = self._cash
        for pos in self._positions.values():
            price = prices.get(pos.pair, pos.entry_price)
            if pos.side == "long":
                value += price * pos.quantity
            else:
                value += pos.entry_price * pos.quantity  # short margin returned on close
        return value

    def cash(self) -> float:
        return self._cash

    def open_positions(self) -> List[Position]:
        return list(self._positions.values())

    def trade_history(self) -> List[ClosedTrade]:
        return list(self._trades)

    def status(self, prices: Dict[str, float]) -> dict:
        total = self.portfolio_value(prices)
        wins  = [t for t in self._trades if t.pnl > 0]
        return {
            "portfolio_value":   round(total, 2),
            "cash":              round(self._cash, 2),
            "open_positions":    len(self._positions),
            "total_trades":      len(self._trades),
            "win_rate":          round(len(wins) / len(self._trades) * 100, 1) if self._trades else 0,
            "total_pnl":         round(sum(t.pnl for t in self._trades), 2),
        }

    # ── Internals ─────────────────────────────────────────────────────────────

    def _close(self, pos: Position, exit_price: float, exit_reason: str) -> ClosedTrade:
        if pos.side == "long":
            pnl = (exit_price - pos.entry_price) * pos.quantity
        else:
            pnl = (pos.entry_price - exit_price) * pos.quantity

        pnl_pct = pnl / (pos.entry_price * pos.quantity) * 100

        trade = ClosedTrade(
            id=pos.id, pair=pos.pair, side=pos.side,
            entry_price=pos.entry_price, exit_price=exit_price,
            quantity=pos.quantity, pnl=round(pnl, 4), pnl_pct=round(pnl_pct, 2),
            entry_time=pos.entry_time, exit_time=_now(),
            exit_reason=exit_reason,
        )
        # Return value to cash
        self._cash += pos.entry_price * pos.quantity + pnl

        del self._positions[pos.id]
        del self._pair_positions[pos.pair]
        self._trades.append(trade)
        self._save_trade(trade)
        return trade

    def _save_trade(self, trade: ClosedTrade):
        path = "trades/paper_trades.jsonl"
        with open(path, "a") as f:
            f.write(json.dumps(asdict(trade)) + "\n")


def _now() -> str:
    return datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
