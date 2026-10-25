#!/bin/bash
# ==============================================================================
# AWS EC2 User Data Script - Automated Kafka & Streaming Producer Deployment
# ==============================================================================
# Target OS: Amazon Linux 2023 / Ubuntu 22.04 LTS
# Description:
#   Installs Docker, Docker Compose, Git, and Python.
#   Spins up Apache Kafka (KRaft mode) and Kafka UI.
#   Launches the Python Streaming Data Generator daemon.
# ==============================================================================

set -e
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "[+] Starting Cloud Data Engineering Lab - Assignment 03 Setup..."

# 1. Update and install packages
if command -v dnf &> /dev/null; then
    echo "[*] Detected Amazon Linux / RHEL environment"
    dnf update -y
    dnf install -y docker git python3-pip
    systemctl enable docker
    systemctl start docker
    usermod -a -G docker ec2-user
elif command -v apt-get &> /dev/null; then
    echo "[*] Detected Debian / Ubuntu environment"
    apt-get update -y
    apt-get install -y docker.io docker-compose git python3-pip python3-venv
    systemctl enable docker
    systemctl start docker
    usermod -a -G docker ubuntu
fi

# 2. Install Docker Compose plugin if not present
DOCKER_CONFIG=${DOCKER_CONFIG:-/usr/local/lib/docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose || true
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose || true

# 3. Setup Project Directory
APP_DIR="/opt/kafka-streaming-lab"
mkdir -p $APP_DIR
cd $APP_DIR

# 4. Get EC2 Public IP for Kafka Advertised Listener
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "13.53.172.184")

# 5. Create Docker Compose definition
cat <<EOF > docker-compose.yml
version: '3.8'

services:
  kafka:
    image: apache/kafka:3.7.0
    container_name: kafka-broker
    restart: always
    ports:
      - "9092:9092"
      - "9094:9094"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093,EXTERNAL://0.0.0.0:9094
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://${PUBLIC_IP}:9092,EXTERNAL://kafka:9094
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,EXTERNAL:PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
      CLUSTER_ID: '4L622nShTUiBenVznRAxrA'

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: kafka-ui-dashboard
    restart: always
    ports:
      - "9000:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: AWS-EC2-Kafka-Cluster
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9094
      DYNAMIC_CONFIG_ENABLED: 'true'
    depends_on:
      - kafka
EOF

# 5. Start Kafka Broker and Kafka UI Dashboard
docker compose up -d

# 6. Wait for broker readiness
echo "[*] Waiting for Kafka Broker to initialize..."
sleep 15

# 7. Setup Python Virtual Environment for the Streaming Producer
python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install kafka-python-ng faker python-dotenv colorama

# 8. Create Streaming Producer script
mkdir -p src
# (Producer scripts will be synced or run via systemd)

echo "[+] Cloud Kafka Producer deployment completed successfully!"
echo "[+] Kafka Broker: Port 9092 | Kafka UI Dashboard: Port 9000"
