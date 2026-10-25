"""
==============================================================================
Assignment No. 03 - Cloud Data Engineering Lab
Real-Time Streaming Consumer & Stream Analytics Monitor
==============================================================================
Description:
    Subscribes to Apache Kafka streaming topics on a cloud instance, consumes
    JSON event streams in real-time, displays payload metrics, and calculates
    rolling throughput, latency, and operational anomalies.
==============================================================================
"""

import os
import sys
import time
import json
import argparse
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

project_root = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=project_root / ".env")

try:
    from kafka import KafkaConsumer
    from kafka.errors import NoBrokersAvailable
    KAFKA_INSTALLED = True
except ImportError:
    KAFKA_INSTALLED = False

try:
    import colorama
    from colorama import Fore, Style
    colorama.init(autoreset=True)
    GREEN = Fore.GREEN
    CYAN = Fore.CYAN
    YELLOW = Fore.YELLOW
    RED = Fore.RED
    MAGENTA = Fore.MAGENTA
    BOLD = Style.BRIGHT
    RESET = Style.RESET_ALL
except ImportError:
    GREEN = CYAN = YELLOW = RED = MAGENTA = BOLD = RESET = ""


def run_consumer_stream(
    topic: str,
    bootstrap_servers: str = "localhost:9092",
    group_id: str = "cloud-stream-analytics-group",
    max_messages: int = 0,
    auto_offset_reset: str = "latest",
):
    """
    Subscribes to Kafka topic and prints live stream records and analytics.
    """
    print("=" * 80)
    print(f"  {BOLD}CLOUD DATA ENGINEERING - REAL-TIME KAFKA STREAM CONSUMER{RESET}")
    print(f"  {CYAN}Subscribed Topic: {topic} | Broker: {bootstrap_servers} | Group: {group_id}{RESET}")
    print("=" * 80)

    if not KAFKA_INSTALLED:
        print(f"{RED}[ERROR] kafka-python is not installed. Please run: pip install -r requirements.txt{RESET}")
        sys.exit(1)

    try:
        consumer = KafkaConsumer(
            topic,
            bootstrap_servers=[s.strip() for s in bootstrap_servers.split(",")],
            group_id=group_id,
            api_version=(3, 7, 0),
            auto_offset_reset=auto_offset_reset,
            enable_auto_commit=True,
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
            key_deserializer=lambda k: k.decode("utf-8") if k else None,
            consumer_timeout_ms=15000,
        )
        print(f"{GREEN}[+] Connected to Kafka Broker. Waiting for incoming stream records...{RESET}")
        print(f"{YELLOW}[i] Tip: Press Ctrl+C at any time to stop consuming.{RESET}\n")

    except NoBrokersAvailable:
        print(f"{RED}[ERROR] Could not connect to Kafka Broker at {bootstrap_servers}.{RESET}")
        print("Ensure Kafka is running (e.g. `docker-compose up -d` or on your AWS EC2 instance).")
        sys.exit(1)
    except Exception as e:
        print(f"{RED}[ERROR] Kafka Consumer initialization error: {e}{RESET}")
        sys.exit(1)

    print("-" * 80)
    print(f"{'#':<6} | {'PARTITION:OFFSET':<18} | {'KEY':<16} | {'PAYLOAD SUMMARY':<32}")
    print("-" * 80)

    msg_count = 0
    anomaly_count = 0
    start_time = time.time()

    try:
        for msg in consumer:
            msg_count += 1
            record_key = str(msg.key) if msg.key else "N/A"
            payload = msg.value

            # Extract summary depending on event structure
            if "telemetry" in payload:
                speed = payload["telemetry"].get("speed_kmh", 0)
                temp = payload["telemetry"].get("engine_temp_c", 0)
                status = payload.get("status", "NORMAL")
                is_anomaly = status == "CRITICAL_ANOMALY"
                summary_text = f"Speed: {speed} km/h | Temp: {temp}C"
            elif "amount" in payload:
                amt = payload.get("amount", 0)
                curr = payload.get("currency", "USD")
                merch = payload.get("merchant", "")
                is_anomaly = payload.get("fraud_flag", False)
                summary_text = f"Amount: ${amt} {curr} ({merch})"
            elif "action" in payload:
                action = payload.get("action", "")
                device = payload.get("device", "")
                is_anomaly = False
                summary_text = f"Action: {action} on {device}"
            else:
                is_anomaly = False
                summary_text = str(payload)[:30]

            if is_anomaly:
                anomaly_count += 1
                color = RED + BOLD
                flag = " [!] ANOMALY DETECTED"
            else:
                color = GREEN
                flag = ""

            offset_str = f"P:{msg.partition} | O:{msg.offset}"
            print(f"{msg_count:<6} | {offset_str:<18} | {record_key:<16} | {color}{summary_text}{flag}{RESET}")

            if max_messages > 0 and msg_count >= max_messages:
                print(f"\n{CYAN}[*] Reached target message limit ({max_messages}). Stopping consumer.{RESET}")
                break

    except KeyboardInterrupt:
        print(f"\n{YELLOW}[*] Consumer gracefully stopped by user.{RESET}")
    finally:
        consumer.close()
        elapsed = time.time() - start_time
        throughput = msg_count / max(elapsed, 0.001)

        print("\n" + "=" * 80)
        print(f"{BOLD}[+] STREAM CONSUMPTION SUMMARY{RESET}")
        print(f"    - Messages Consumed      : {BOLD}{msg_count}{RESET}")
        print(f"    - Anomalies Flagged      : {RED if anomaly_count > 0 else GREEN}{anomaly_count}{RESET}")
        print(f"    - Ingestion Throughput   : {BOLD}{throughput:.2f} msg/sec{RESET}")
        print(f"    - Duration               : {elapsed:.2f} seconds")
        print("=" * 80)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Real-Time Kafka Consumer & Stream Analytics Monitor")
    parser.add_argument("--topic", type=str, default=None, help="Kafka topic name")
    parser.add_argument("--broker", type=str, default=None, help="Kafka bootstrap broker (host:port)")
    parser.add_argument("--group", type=str, default=None, help="Consumer Group ID")
    parser.add_argument("--max-messages", type=int, default=0, help="Maximum messages to consume before stopping")
    parser.add_argument("--from-beginning", action="store_true", help="Consume from earliest offset")

    args = parser.parse_args()

    topic = args.topic or os.getenv("KAFKA_TOPIC_IOT", "iot-fleet-telemetry")
    broker = args.broker or os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    group = args.group or os.getenv("KAFKA_CONSUMER_GROUP", "cloud-stream-analytics-group")
    offset_mode = "earliest" if args.from_beginning else "latest"

    run_consumer_stream(
        topic=topic,
        bootstrap_servers=broker,
        group_id=group,
        max_messages=args.max_messages,
        auto_offset_reset=offset_mode,
    )
