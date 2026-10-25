"""
==============================================================================
Assignment No. 03 - Cloud Data Engineering Lab
Real-Time Streaming Data Generator (Apache Kafka Producer)
==============================================================================
Description:
    Generates high-throughput, realistic streaming event datasets (IoT fleet
    telemetry, financial transactions, e-commerce clickstreams) and publishes
    them to Apache Kafka topics on a cloud instance (AWS EC2 / Cloud VM).
==============================================================================
"""

import os
import sys
import time
import json
import random
import argparse
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
project_root = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=project_root / ".env")

# Try imports
try:
    from kafka import KafkaProducer
    from kafka.errors import NoBrokersAvailable, KafkaError
    KAFKA_INSTALLED = True
except ImportError:
    KAFKA_INSTALLED = False

# Colorama for enhanced CLI aesthetics
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


# ==============================================================================
# Streaming Event Generators
# ==============================================================================

# IoT Fleet Simulation State (to simulate continuous realistic movement)
FLEET_VEHICLES = [
    {"vehicle_id": f"TRUCK-{i:03d}", "lat": 18.5204 + random.uniform(-0.1, 0.1), "lon": 73.8567 + random.uniform(-0.1, 0.1), "fuel": random.uniform(60, 95), "temp": random.uniform(85, 92)}
    for i in range(1, 16)
]

MERCHANTS = ["Amazon", "Uber", "Starbucks", "Walmart", "Apple", "Netflix", "Shell Oil", "Target", "Zara", "McDonalds"]
CATEGORIES = ["Electronics", "Travel", "Groceries", "Entertainment", "Dining", "Fuel", "Apparel", "Utilities"]
CITIES = ["Pune", "Mumbai", "Bangalore", "Delhi", "Hyderabad", "Chennai", "Stockholm", "London", "New York"]


def generate_iot_event(anomaly_pct: int = 5) -> dict:
    """Generates an IoT smart fleet telemetry event with realistic physical metrics."""
    veh = random.choice(FLEET_VEHICLES)
    
    # Random walk simulation
    veh["lat"] += random.uniform(-0.002, 0.002)
    veh["lon"] += random.uniform(-0.002, 0.002)
    veh["fuel"] = max(5.0, veh["fuel"] - random.uniform(0.01, 0.05))
    
    # Anomaly injection (Engine overheating or speed surge)
    is_anomaly = random.randint(1, 100) <= anomaly_pct
    if is_anomaly:
        speed = round(random.uniform(115.0, 145.0), 2)
        engine_temp = round(random.uniform(105.0, 125.0), 2) # Overheating
        status = "CRITICAL_ANOMALY"
    else:
        speed = round(random.uniform(35.0, 85.0), 2)
        engine_temp = round(random.uniform(86.0, 94.0), 2)
        status = "NORMAL"

    return {
        "event_id": f"IOT-{int(time.time()*1000)}-{random.randint(1000, 9999)}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "vehicle_id": veh["vehicle_id"],
        "telemetry": {
            "speed_kmh": speed,
            "engine_temp_c": engine_temp,
            "rpm": int(speed * 32 + random.randint(-100, 100)),
            "fuel_level_pct": round(veh["fuel"], 2),
            "tire_pressure_psi": round(random.uniform(31.5, 34.0), 1),
            "location": {
                "latitude": round(veh["lat"], 6),
                "longitude": round(veh["lon"], 6),
            }
        },
        "status": status,
        "device_type": "OBD-II-Cloud-Gateway"
    }


def generate_finance_event(anomaly_pct: int = 5) -> dict:
    """Generates a real-time banking/financial transaction event."""
    is_fraud = random.randint(1, 100) <= anomaly_pct
    amount = round(random.uniform(5000.0, 25000.0), 2) if is_fraud else round(random.uniform(10.0, 1200.0), 2)
    
    return {
        "transaction_id": f"TXN-{int(time.time()*1000)}-{random.randint(100, 999)}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "account_id": f"ACC-{random.randint(100000, 999999)}",
        "merchant": random.choice(MERCHANTS),
        "category": random.choice(CATEGORIES),
        "amount": amount,
        "currency": "USD",
        "location": random.choice(CITIES),
        "payment_channel": random.choice(["UPI", "Credit_Card", "Debit_Card", "Apple_Pay", "POS"]),
        "fraud_flag": is_fraud,
    }


def generate_clickstream_event(anomaly_pct: int = 5) -> dict:
    """Generates an e-commerce user interaction clickstream event."""
    return {
        "event_id": f"CLK-{int(time.time()*1000)}-{random.randint(100, 999)}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "session_id": f"SESS-{random.randint(10000, 99999)}",
        "user_id": f"USR-{random.randint(1000, 5000)}",
        "action": random.choice(["page_view", "add_to_cart", "search", "checkout_click", "remove_from_cart"]),
        "page_url": f"https://cloudshop.io/category/{random.choice(CATEGORIES).lower()}",
        "device": random.choice(["Mobile-iOS", "Mobile-Android", "Desktop-Chrome", "Desktop-Mac"]),
        "ip_address": f"192.168.{random.randint(1, 254)}.{random.randint(1, 254)}",
        "response_time_ms": random.randint(45, 320),
    }


# ==============================================================================
# Kafka Producer Setup & Streaming Loop
# ==============================================================================

def create_kafka_producer(bootstrap_servers: str, client_id: str):
    """Initializes and returns a KafkaProducer instance with JSON serialization."""
    if not KAFKA_INSTALLED:
        return None

    try:
        print(f"[*] Connecting to Kafka broker at {BOLD}{bootstrap_servers}{RESET}...")
        producer = KafkaProducer(
            bootstrap_servers=[s.strip() for s in bootstrap_servers.split(",")],
            client_id=client_id,
            api_version=(2, 8, 0),
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks=1,
            retries=5,
            request_timeout_ms=30000,
        )
        print(f"{GREEN}[+] Successfully connected to Apache Kafka Cluster!{RESET}")
        return producer
    except NoBrokersAvailable:
        print(f"{YELLOW}[!] Notice: Kafka Broker not reachable at {bootstrap_servers}.{RESET}")
        return None
    except Exception as e:
        print(f"{YELLOW}[!] Kafka connection notice: {e}{RESET}")
        return None


def run_producer_stream(
    topic: str,
    domain: str = "iot",
    rate_per_sec: float = 5.0,
    total_events: int = 0,
    anomaly_pct: int = 5,
    bootstrap_servers: str = "localhost:9092",
):
    """
    Main producer event loop. Streams continuous events to the specified Kafka topic.
    """
    client_id = os.getenv("KAFKA_CLIENT_ID", "cloud-streaming-producer-01")
    
    print("=" * 80)
    print(f"  {BOLD}CLOUD DATA ENGINEERING - ASSIGNMENT 03 STREAMING DATA GENERATOR{RESET}")
    print(f"  {CYAN}Domain: {domain.upper()} | Topic: {topic} | Target Rate: {rate_per_sec} events/sec{RESET}")
    print("=" * 80)

    # 1. Initialize Producer
    producer = create_kafka_producer(bootstrap_servers, client_id)
    is_live_broker = producer is not None

    if is_live_broker:
        print(f"{GREEN}[*] Mode: LIVE CLOUD BROKER ({bootstrap_servers}){RESET}")
    else:
        print(f"{CYAN}[*] Mode: LOCAL DEMO STREAM SIMULATOR (Self-Contained Streaming Engine){RESET}")
        print(f"{YELLOW}[i] Tip: Start Docker container or cloud EC2 broker to publish over network.{RESET}")

    print("-" * 80)
    print(f"{'#':<6} | {'TIMESTAMP':<24} | {'EVENT KEY / ID':<20} | {'STATUS / VALUE':<22}")
    print("-" * 80)

    event_count = 0
    start_time = time.time()
    sleep_interval = 1.0 / max(rate_per_sec, 0.1)

    try:
        while True:
            # Generate Event based on domain
            if domain == "iot":
                event = generate_iot_event(anomaly_pct)
                key = event["vehicle_id"]
                speed = event["telemetry"]["speed_kmh"]
                temp = event["telemetry"]["engine_temp_c"]
                summary = f"{speed} km/h | {temp}C ({event['status']})"
            elif domain == "finance":
                event = generate_finance_event(anomaly_pct)
                key = event["account_id"]
                summary = f"${event['amount']} {event['currency']} | {event['merchant']}"
            else:
                event = generate_clickstream_event(anomaly_pct)
                key = event["user_id"]
                summary = f"{event['action']} -> {event['device']}"

            event_count += 1
            timestamp_str = event["timestamp"]

            # Publish to Kafka if connected
            if is_live_broker:
                try:
                    future = producer.send(topic, key=key, value=event)
                    # Block briefly to ensure delivery record
                    record_metadata = future.get(timeout=10)
                    partition_info = f"P:{record_metadata.partition} O:{record_metadata.offset}"
                except Exception as e:
                    partition_info = f"{RED}ERR: {e}{RESET}"
            else:
                partition_info = f"P:0 O:{event_count}"

            # Format console output with colors
            if "CRITICAL" in summary or "True" in summary:
                color_tag = RED + BOLD
            else:
                color_tag = GREEN

            print(
                f"{event_count:<6} | {timestamp_str:<24} | {key:<20} | {color_tag}{summary:<22}{RESET} [{partition_info}]"
            )

            # Check termination condition if total_events is set
            if total_events > 0 and event_count >= total_events:
                break

            time.sleep(sleep_interval)

    except KeyboardInterrupt:
        print(f"\n{YELLOW}[*] Streaming paused by user.{RESET}")
    finally:
        elapsed = time.time() - start_time
        avg_rate = event_count / max(elapsed, 0.001)
        if producer:
            producer.flush()
            producer.close()
            
        print("=" * 80)
        print(f"{BOLD}[+] STREAMING COMPLETED SUCCESSFULLY{RESET}")
        print(f"    - Total Events Published : {BOLD}{event_count}{RESET}")
        print(f"    - Elapsed Time           : {elapsed:.2f} seconds")
        print(f"    - Average Throughput     : {BOLD}{avg_rate:.2f} events/sec{RESET}")
        print(f"    - Destination Topic      : {CYAN}{topic}{RESET}")
        print("=" * 80)


# ==============================================================================
# CLI Entrypoint
# ==============================================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Real-Time Streaming Data Generator (Apache Kafka Producer)")
    parser.add_argument("--domain", choices=["iot", "finance", "clickstream"], default="iot", help="Event domain type")
    parser.add_argument("--topic", type=str, default=None, help="Destination Kafka topic")
    parser.add_argument("--rate", type=float, default=None, help="Events per second (e.g. 5, 10, 50)")
    parser.add_argument("--total", type=int, default=None, help="Total events to send (0 = infinite)")
    parser.add_argument("--broker", type=str, default=None, help="Kafka bootstrap broker server (host:port)")
    parser.add_argument("--anomaly", type=int, default=None, help="Anomaly rate percentage (0-100)")

    args = parser.parse_args()

    # Determine values with environment fallback
    chosen_domain = args.domain or "iot"
    if args.topic:
        chosen_topic = args.topic
    else:
        topic_map = {
            "iot": os.getenv("KAFKA_TOPIC_IOT", "iot-fleet-telemetry"),
            "finance": os.getenv("KAFKA_TOPIC_FINANCE", "financial-transactions"),
            "clickstream": os.getenv("KAFKA_TOPIC_CLICKSTREAM", "ecommerce-clicks"),
        }
        chosen_topic = topic_map.get(chosen_domain, "iot-fleet-telemetry")

    chosen_rate = args.rate if args.rate is not None else float(os.getenv("STREAM_EVENT_RATE_PER_SEC", 5))
    chosen_total = args.total if args.total is not None else int(os.getenv("STREAM_TOTAL_EVENTS", 0))
    chosen_broker = args.broker or os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    chosen_anomaly = args.anomaly if args.anomaly is not None else int(os.getenv("STREAM_ANOMALY_PERCENTAGE", 5))

    run_producer_stream(
        topic=chosen_topic,
        domain=chosen_domain,
        rate_per_sec=chosen_rate,
        total_events=chosen_total,
        anomaly_pct=chosen_anomaly,
        bootstrap_servers=chosen_broker,
    )
