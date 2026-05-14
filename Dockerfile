FROM python:3.11-slim

WORKDIR /app

COPY crypto-trading-bot/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY crypto-trading-bot/ .

CMD ["python3", "main.py", "paper"]
