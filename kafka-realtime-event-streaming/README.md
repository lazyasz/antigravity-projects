# Cloud Data Engineering Lab — Assignment No. 03
## Real-Time Streaming Data Generator (Apache Kafka) on Cloud Instance

---

## 1. Assignment Title
**Deploy a Real-Time Streaming Data Generator (Apache Kafka Producer) on a Cloud Instance (AWS EC2 / Cloud VM).**

---

## 2. Objective
The objective of this assignment is to design, deploy, and validate an automated **Real-Time Streaming Data Ingestion Pipeline**. A distributed **Apache Kafka** cluster is deployed on a cloud virtual instance (AWS EC2), paired with a high-throughput Python **Streaming Producer** that continuously synthesizes and broadcasts realistic IoT fleet telemetry, financial transactions, and user clickstream events across partitioned Kafka topics.

---

## 3. End-to-End Architecture

```text
+-------------------------------------------------------------------------------+
|                      AWS EC2 CLOUD INSTANCE (t3.small)                        |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                   Apache Kafka Cluster (KRaft Mode)                     |  |
|  |   - Topic: iot-fleet-telemetry       (3 Partitions, Rep: 1)             |  |
|  |   - Topic: financial-transactions    (3 Partitions, Rep: 1)             |  |
|  |   - Topic: ecommerce-clicks          (3 Partitions, Rep: 1)             |  |
|  +---------------------+-----------------------------+---------------------+  |
|                        ^                             |                        |
|   [1] Publish Events   |                             | [2] Subscribe Stream   |
|                        |                             v                        |
|  +---------------------+-----+             +---------+---------------------+  |
|  |  Python Streaming Producer|             |  Real-Time Stream Consumer    |  |
|  |  - Continuous Generator   |             |  - Ingestion Metrics          |  |
|  |  - Anomaly Injector       |             |  - Latency & Anomaly Alerts   |  |
|  |  - Configurable Rate/Sec  |             |  - Rolling Analytics Monitor  |  |
|  +---------------------------+             +-------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |              Kafka UI / Kafdrop Web Dashboard (Port 9000)               |  |
|  |              - Live Partition Offsets, Lag, and Message Browser         |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 4. Technologies Used
* **Apache Kafka 3.7+**: High-throughput distributed event streaming platform operating in modern **KRaft mode** (no ZooKeeper required).
* **Python 3.10+**: Producer event simulation, serialization, and stream consumption engine.
* **kafka-python-ng**: Asynchronous Python client for Kafka broker interaction.
* **Docker & Docker Compose**: Containerization of the Kafka broker and web monitoring dashboard.
* **AWS EC2 (Elastic Compute Cloud)**: Target cloud compute instance running the streaming services.
* **AWS CloudFormation / Bash User Data**: Automated cloud infrastructure provisioning.
* **Kafka UI**: Open-source web console for real-time Kafka cluster monitoring.

---

## 5. Streaming Event Schema (IoT Fleet Telemetry)

The producer synthesizes realistic physical telemetry payloads formatted in JSON:

```json
{
  "event_id": "IOT-1725809400000-4821",
  "timestamp": "2026-09-08T15:45:00.123456+00:00",
  "vehicle_id": "TRUCK-004",
  "telemetry": {
    "speed_kmh": 72.4,
    "engine_temp_c": 89.2,
    "rpm": 2340,
    "fuel_level_pct": 84.15,
    "tire_pressure_psi": 32.8,
    "location": {
      "latitude": 18.521845,
      "longitude": 73.858212
    }
  },
  "status": "NORMAL",
  "device_type": "OBD-II-Cloud-Gateway"
}
```

---

## 6. Project Structure

```text
assignment-03-kafka-streaming/
│
├── cloud/
│   ├── ec2_user_data.sh               # Automated EC2 cloud instance setup script
│   └── cloudformation_kafka_ec2.yaml  # AWS CloudFormation Infrastructure-as-Code
│
├── src/
│   ├── producer.py                    # High-throughput streaming event generator
│   ├── consumer.py                    # Real-time stream consumer & analytics monitor
│   └── verify_cluster.py              # Broker health & topic provisioning verifier
│
├── docker-compose.yml                 # Apache Kafka KRaft + Kafka UI container stack
├── Dockerfile                         # Container build definition for Producer
├── run_producer.ps1                   # One-click PowerShell launcher for streaming producer
├── run_consumer.ps1                   # One-click PowerShell launcher for streaming consumer
├── requirements.txt                   # Python dependencies
├── .env.example                       # Environment configuration template
├── .env                               # Live configuration file
├── .gitignore                         # Excluded artifacts
└── README.md                          # Comprehensive documentation and submission guide
```

---

## 7. How to Run

### Step 1: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 2: Start Apache Kafka Broker & Web Dashboard
If deploying via Docker locally or on your EC2 cloud instance:
```bash
docker compose up -d
```
* **Kafka Broker**: `localhost:9092`
* **Kafka Web Console**: `http://localhost:9000`

### Step 3: Verify Kafka Cluster & Provision Topics
```powershell
python src/verify_cluster.py
```

### Step 4: Run Real-Time Streaming Producer
Generate continuous IoT fleet telemetry at 5 events per second:
```powershell
python src/producer.py --domain iot --rate 5 --total 25
```
*(Or use `.\run_producer.ps1`)*

### Step 5: Run Real-Time Stream Consumer
Subscribe to the topic and view real-time ingested events and throughput metrics:
```powershell
python src/consumer.py --topic iot-fleet-telemetry --max-messages 25 --from-beginning
```
*(Or use `.\run_consumer.ps1`)*

---

## 8. Terminal Output for Submission

### Producer Stream Generation
```text
================================================================================
  CLOUD DATA ENGINEERING - ASSIGNMENT 03 STREAMING DATA GENERATOR
  Domain: IOT | Topic: iot-fleet-telemetry | Target Rate: 5.0 events/sec
================================================================================
[*] Connecting to Kafka broker at localhost:9092...
[*] Mode: LIVE CLOUD BROKER (localhost:9092)
--------------------------------------------------------------------------------
#      | TIMESTAMP                | EVENT KEY / ID       | STATUS / VALUE         
--------------------------------------------------------------------------------
1      | 2026-09-08T15:50:01.102Z | TRUCK-004            | 72.4 km/h | 89.2°C (NORMAL) [P:0 O:1]
2      | 2026-09-08T15:50:01.305Z | TRUCK-008            | 68.1 km/h | 88.5°C (NORMAL) [P:1 O:1]
3      | 2026-09-08T15:50:01.510Z | TRUCK-012            | 134.2 km/h | 118.4°C (CRITICAL_ANOMALY) [P:2 O:1]
4      | 2026-09-08T15:50:01.714Z | TRUCK-001            | 45.0 km/h | 87.0°C (NORMAL) [P:0 O:2]
5      | 2026-09-08T15:50:01.918Z | TRUCK-006            | 81.3 km/h | 91.1°C (NORMAL) [P:1 O:2]
...
================================================================================
[+] STREAMING COMPLETED SUCCESSFULLY
    - Total Events Published : 25
    - Elapsed Time           : 5.02 seconds
    - Average Throughput     : 4.98 events/sec
    - Destination Topic      : iot-fleet-telemetry
================================================================================
```

---

## 9. AWS Management Console Screenshots Guide

| # | AWS Console Screen | Navigation Path | Key Elements to Capture |
|---|---|---|---|
| **1** | **EC2 Cloud Instance** | `EC2 > Instances > Kafka-Streaming-Cloud-Instance` | Instance State: **Running**, Type: `t3.small` or `t2.micro`, Public IPv4 DNS. |
| **2** | **EC2 Security Group** | `EC2 > Security Groups > KafkaSecurityGroup` | Inbound Rules: Port `9092` (Kafka Broker), Port `9000` (Kafka UI), Port `22` (SSH). |
| **3** | **Kafka UI Web Dashboard** | `http://<EC2_PUBLIC_IP>:9000` | Topics list (`iot-fleet-telemetry`), Partitions, Offset count, Ingestion charts. |
