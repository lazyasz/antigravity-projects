FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/
COPY .env.example ./.env

ENV PYTHONUNBUFFERED=1

CMD ["python", "src/producer.py", "--topic", "iot-fleet-telemetry", "--rate", "5"]
