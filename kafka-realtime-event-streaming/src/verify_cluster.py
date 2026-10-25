"""
==============================================================================
Assignment No. 03 - Cloud Data Engineering Lab
Apache Kafka Cluster & Topic Verification Script
==============================================================================
Description:
    Connects to the Apache Kafka broker on the cloud instance, verifies
    cluster health, lists existing topics, and ensures standard streaming
    topics are provisioned with proper partitions and replication factors.
==============================================================================
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

project_root = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=project_root / ".env")

try:
    from kafka.admin import KafkaAdminClient, NewTopic
    from kafka.errors import NoBrokersAvailable, TopicAlreadyExistsError
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
    BOLD = Style.BRIGHT
    RESET = Style.RESET_ALL
except ImportError:
    GREEN = CYAN = YELLOW = RED = BOLD = RESET = ""


def verify_cluster(bootstrap_servers: str = "localhost:9092"):
    print("=" * 80)
    print(f"  {BOLD}APACHE KAFKA CLOUD CLUSTER HEALTH & TOPIC VERIFICATION{RESET}")
    print(f"  {CYAN}Target Bootstrap Broker: {bootstrap_servers}{RESET}")
    print("=" * 80)

    if not KAFKA_INSTALLED:
        print(f"{RED}[ERROR] kafka-python is not installed. Run: pip install -r requirements.txt{RESET}")
        sys.exit(1)

    try:
        admin_client = KafkaAdminClient(
            bootstrap_servers=[s.strip() for s in bootstrap_servers.split(",")],
            client_id="cloud-kafka-verifier-admin",
            api_version=(2, 8, 0),
            request_timeout_ms=10000,
        )
        print(f"{GREEN}[+] Successfully connected to Apache Kafka Admin Client!{RESET}\n")

        # 1. List existing topics
        print("--- [CHECK 1] Existing Kafka Topics ---")
        existing_topics = admin_client.list_topics()
        for t in sorted(existing_topics):
            print(f"  * {CYAN}{t}{RESET}")
        print()

        # 2. Ensure default lab topics exist
        required_topics = [
            os.getenv("KAFKA_TOPIC_IOT", "iot-fleet-telemetry"),
            os.getenv("KAFKA_TOPIC_FINANCE", "financial-transactions"),
            os.getenv("KAFKA_TOPIC_CLICKSTREAM", "ecommerce-clicks"),
        ]

        topics_to_create = []
        for rt in required_topics:
            if rt not in existing_topics:
                topics_to_create.append(NewTopic(name=rt, num_partitions=3, replication_factor=1))

        if topics_to_create:
            print("--- [CHECK 2] Provisioning Missing Topics ---")
            try:
                admin_client.create_topics(new_topics=topics_to_create, validate_only=False)
                for nt in topics_to_create:
                    print(f"{GREEN}[+] Created Topic '{nt.name}' (Partitions: {nt.num_partitions}, Replication: {nt.replication_factor}){RESET}")
            except TopicAlreadyExistsError:
                pass
            print()

        # 3. Cluster Metadata
        print("--- [CHECK 3] Cluster Metadata & Nodes ---")
        metadata = admin_client.describe_cluster()
        print(f"  - Cluster ID : {metadata.get('cluster_id', 'N/A')}")
        print(f"  - Controller : Node ID {metadata.get('controller', {}).get('node_id', 'N/A')}")
        print(f"  - Total Nodes: {len(metadata.get('nodes', []))}")
        for node in metadata.get('nodes', []):
            print(f"    - Broker ID {node['node_id']} at {node['host']}:{node['port']}")

        admin_client.close()
        print("\n" + "=" * 80)
        print(f"{GREEN}[+] Kafka Cluster Verification Completed Successfully!{RESET}")
        print("=" * 80)

    except NoBrokersAvailable:
        print(f"{RED}[ERROR] Could not connect to Kafka Broker at {bootstrap_servers}.{RESET}")
        print(f"{YELLOW}Ensure the Kafka broker is running on your EC2 cloud instance or Docker:{RESET}")
        print(f"  - Local/Docker : docker-compose up -d")
        print(f"  - Cloud EC2    : systemctl status kafka (or check EC2 Security Group Port 9092)")
        sys.exit(1)
    except Exception as e:
        print(f"{RED}[ERROR] Verification failed: {e}{RESET}")
        sys.exit(1)


if __name__ == "__main__":
    bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    verify_cluster(bootstrap_servers)
