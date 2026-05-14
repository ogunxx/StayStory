"""
Web dashboard for Crypto EA — served on PORT (Railway assigns the public URL).
Runs in a background thread alongside the trading loop.
"""

import json
import os
from pathlib import Path
from dataclasses import asdict
from flask import Flask, jsonify

app = Flask(__name__)

# ── API endpoints ──────────────────────────────────────────────────────────────

@app.route("/api/status")
def api_status():
    try:
        return jsonify(json.loads(Path("status.json").read_text()))
    except Exception:
        return jsonify({})


@app.route("/api/trades")
def api_trades():
    try:
        lines = Path("trades/paper_trades.jsonl").read_text().strip().splitlines()
        return jsonify([json.loads(l) for l in lines if l])
    except Exception:
        return jsonify([])


# ── Dashboard HTML ─────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return _HTML


_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Crypto EA Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d1117; color: #e6edf3; font-family: 'Segoe UI', system-ui, sans-serif; padding: 24px; }
  h1 { font-size: 1.4rem; font-weight: 600; color: #58a6ff; margin-bottom: 4px; }
  .subtitle { font-size: 0.8rem; color: #8b949e; margin-bottom: 24px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .card { background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 16px; }
  .card-label { font-size: 0.72rem; color: #8b949e; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
  .card-value { font-size: 1.5rem; font-weight: 700; }
  .green { color: #3fb950; }
  .red { color: #f85149; }
  .yellow { color: #d29922; }
  .blue { color: #58a6ff; }
  .white { color: #e6edf3; }
  .panel { background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 20px; margin-bottom: 24px; }
  .panel-title { font-size: 0.85rem; font-weight: 600; color: #8b949e; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th { text-align: left; color: #8b949e; font-weight: 500; padding: 6px 12px; border-bottom: 1px solid #21262d; }
  td { padding: 8px 12px; border-bottom: 1px solid #21262d; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
  .badge-long { background: #1a3a2a; color: #3fb950; }
  .badge-short { background: #3a1a1a; color: #f85149; }
  .badge-halted { background: #3a2a1a; color: #d29922; }
  .halted-bar { background: #3a2a1a; border: 1px solid #d29922; border-radius: 8px; padding: 10px 16px; margin-bottom: 24px; color: #d29922; font-weight: 600; display: none; }
  .chart-wrap { height: 200px; }
  .refresh-info { font-size: 0.75rem; color: #8b949e; text-align: right; margin-bottom: 16px; }
  .no-data { color: #8b949e; font-size: 0.85rem; text-align: center; padding: 24px; }
</style>
</head>
<body>

<h1>⚡ Crypto EA Dashboard</h1>
<div class="subtitle" id="ts">Loading…</div>

<div class="halted-bar" id="halted-bar">⛔ TRADING HALTED — Daily drawdown limit reached</div>

<div class="cards">
  <div class="card">
    <div class="card-label">Portfolio</div>
    <div class="card-value white" id="portfolio">—</div>
  </div>
  <div class="card">
    <div class="card-label">Net P&L</div>
    <div class="card-value" id="pnl">—</div>
  </div>
  <div class="card">
    <div class="card-label">Win Rate</div>
    <div class="card-value blue" id="winrate">—</div>
  </div>
  <div class="card">
    <div class="card-label">Open Positions</div>
    <div class="card-value white" id="open">—</div>
  </div>
  <div class="card">
    <div class="card-label">Total Trades</div>
    <div class="card-value white" id="trades">—</div>
  </div>
  <div class="card">
    <div class="card-label">Daily Drawdown</div>
    <div class="card-value" id="dd">—</div>
  </div>
</div>

<div class="panel">
  <div class="panel-title">Equity Curve</div>
  <div class="chart-wrap"><canvas id="chart"></canvas></div>
</div>

<div class="panel">
  <div class="panel-title">Open Positions</div>
  <div id="open-positions-wrap">
    <div class="no-data">No open positions</div>
  </div>
</div>

<div class="panel">
  <div class="panel-title">Trade History</div>
  <div id="trade-history-wrap">
    <div class="no-data">No closed trades yet</div>
  </div>
</div>

<div class="refresh-info">Auto-refreshes every 60 seconds</div>

<script>
let equityChart = null;

function fmt(n) { return '$' + Number(n).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}); }
function pct(n)  { return Number(n).toFixed(1) + '%'; }
function sign(n) { return n >= 0 ? '+' : ''; }

async function loadStatus() {
  const s = await fetch('/api/status').then(r => r.json()).catch(() => ({}));
  if (!s.timestamp) return;

  document.getElementById('ts').textContent = 'Last update: ' + s.timestamp;
  document.getElementById('portfolio').textContent = fmt(s.portfolio_value || 0);

  const pnl = s.total_pnl || 0;
  const pnlEl = document.getElementById('pnl');
  pnlEl.textContent = sign(pnl) + fmt(pnl);
  pnlEl.className = 'card-value ' + (pnl >= 0 ? 'green' : 'red');

  document.getElementById('winrate').textContent = pct(s.win_rate || 0);
  document.getElementById('open').textContent = s.open_positions || 0;
  document.getElementById('trades').textContent = s.total_trades || 0;

  const dd = s.daily_drawdown || 0;
  const ddEl = document.getElementById('dd');
  ddEl.textContent = '-' + pct(dd);
  ddEl.className = 'card-value ' + (dd > 2 ? 'red' : dd > 1 ? 'yellow' : 'green');

  document.getElementById('halted-bar').style.display = s.halted ? 'block' : 'none';

  // Open positions
  const posWrap = document.getElementById('open-positions-wrap');
  const positions = s.open_positions_detail || [];
  if (positions.length === 0) {
    posWrap.innerHTML = '<div class="no-data">No open positions</div>';
  } else {
    const prices = s.prices || {};
    let html = '<table><thead><tr><th>Pair</th><th>Side</th><th>Entry</th><th>Current</th><th>Unrealised P&L</th><th>Stop Loss</th><th>Take Profit</th><th>Strategy</th></tr></thead><tbody>';
    positions.forEach(p => {
      const cur = prices[p.pair] || p.entry_price;
      const upnl = p.side === 'long' ? (cur - p.entry_price) * p.quantity : (p.entry_price - cur) * p.quantity;
      const strat = p.reason.includes('[BOX]') ? 'BOX' : 'TREND';
      html += `<tr>
        <td><strong>${p.pair}</strong></td>
        <td><span class="badge badge-${p.side}">${p.side.toUpperCase()}</span></td>
        <td>${Number(p.entry_price).toFixed(4)}</td>
        <td>${Number(cur).toFixed(4)}</td>
        <td class="${upnl >= 0 ? 'green' : 'red'}">${sign(upnl)}${fmt(upnl)}</td>
        <td class="red">${Number(p.stop_loss).toFixed(4)}</td>
        <td class="green">${Number(p.take_profit).toFixed(4)}</td>
        <td>${strat}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    posWrap.innerHTML = html;
  }
}

async function loadTrades() {
  const trades = await fetch('/api/trades').then(r => r.json()).catch(() => []);

  // Equity curve
  let equity = 3000;
  const labels = [], data = [];
  trades.forEach(t => {
    equity += t.pnl;
    labels.push(t.exit_time ? t.exit_time.slice(5, 16) : '');
    data.push(+equity.toFixed(2));
  });

  if (equityChart) {
    equityChart.data.labels = labels;
    equityChart.data.datasets[0].data = data;
    equityChart.update();
  } else {
    const ctx = document.getElementById('chart').getContext('2d');
    equityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Portfolio Value',
          data,
          borderColor: '#58a6ff',
          backgroundColor: 'rgba(88,166,255,0.08)',
          borderWidth: 2,
          pointRadius: 3,
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#8b949e', maxTicksLimit: 8 }, grid: { color: '#21262d' } },
          y: { ticks: { color: '#8b949e', callback: v => '$' + v.toLocaleString() }, grid: { color: '#21262d' } }
        }
      }
    });
  }

  // Trade history table
  const wrap = document.getElementById('trade-history-wrap');
  if (trades.length === 0) {
    wrap.innerHTML = '<div class="no-data">No closed trades yet</div>';
    return;
  }
  let html = '<table><thead><tr><th>Exit Time</th><th>Pair</th><th>Side</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Result</th></tr></thead><tbody>';
  [...trades].reverse().slice(0, 50).forEach(t => {
    const win = t.pnl > 0;
    html += `<tr>
      <td style="color:#8b949e">${(t.exit_time||'').slice(0,16)}</td>
      <td><strong>${t.pair}</strong></td>
      <td><span class="badge badge-${t.side}">${t.side.toUpperCase()}</span></td>
      <td>${Number(t.entry_price).toFixed(4)}</td>
      <td>${Number(t.exit_price).toFixed(4)}</td>
      <td class="${win ? 'green' : 'red'}">${sign(t.pnl)}${fmt(t.pnl)} (${sign(t.pnl_pct)}${Number(t.pnl_pct).toFixed(2)}%)</td>
      <td class="${win ? 'green' : 'red'}">${t.exit_reason}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

async function refresh() {
  await Promise.all([loadStatus(), loadTrades()]);
}

refresh();
setInterval(refresh, 60000);
</script>
</body>
</html>"""


def start_dashboard():
    port = int(os.getenv("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
