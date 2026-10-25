# Cloud Data Engineering Lab — Assignment No. 04
## Real-Time Streaming Analytics & Visualization in Snowflake Data Cloud

---

## 1. Assignment Title
**Implement Real-Time Analytics (Counting, Windowing, Moving Averages) on Streaming Data and Visualize the Results in Snowflake Data Cloud.**

---

## 2. Objective
The objective of this assignment is to design and deploy a continuous, cloud-native **Real-Time Streaming Analytics Pipeline** within **Snowflake Data Cloud**. The pipeline ingests semi-structured streaming JSON payloads into a `VARIANT` landing table, processes change streams via **Snowflake Streams & Dynamic Tables**, applies mathematical time-window operations (**Tumbling Windows** & **Sliding Moving Averages**), detects operational anomalies, and renders live executive visualizations via **Snowsight Dashboards** and **Streamlit in Snowflake**.

---

## 3. End-to-End Architecture

```text
+---------------------------------------------------------------------------------------+
|                             SNOWFLAKE DATA CLOUD                                      |
|                                                                                       |
|  +---------------------------------------------------------------------------------+  |
|  |           Raw Landing Table: RAW_STREAM_EVENTS (RECORD_CONTENT VARIANT)         |  |
|  +-----------------------+---------------------------------+-----------------------+  |
|                          |                                 |                          |
|         [CDC Stream]     |                                 | [Lag: 1 Min]             |
|                          v                                 v                          |
|  +-----------------------+---------+     +-----------------+-----------------------+  |
|  |  Snowflake Stream:              |     |  Snowflake Dynamic Table:               |  |
|  |  STR_RAW_STREAM_EVENTS          |     |  DYN_IOT_WINDOW_1MIN (Tumbling Window)  |  |
|  +-----------------------+---------+     +-----------------+-----------------------+  |
|                          |                                 |                          |
|         [Automated Task] |                                 |                          |
|                          v                                 |                          |
|  +-----------------------+---------+                       |                          |
|  |  Curated Analytics Table:       |                       |                          |
|  |  FCT_VEHICLE_TELEMETRY          |                       |                          |
|  +-----------------------+---------+                       |                          |
|                          |                                 |                          |
|                          +----------------+----------------+                          |
|                                           |                                           |
|                                           v                                           |
|  +---------------------------------------------------------------------------------+  |
|  |                  Real-Time Analytics & Windowing Engine                         |  |
|  |   - Metric Counting: Real-Time Event Volumes & Active Fleet Size                |  |
|  |   - Tumbling Windows: 1-Min & 5-Min Time Buckets via TIME_SLICE()               |  |
|  |   - Sliding Windows: 5-Event Moving Averages via AVG() OVER(ROWS BETWEEN)       |  |
|  |   - Pattern Detection: Engine Overheat (>100C) & Speed Surge (>115 km/h) Alerts|  |
|  +----------------------------------------+----------------------------------------+  |
|                                           |                                           |
|                                           v                                           |
|  +---------------------------------------------------------------------------------+  |
|  |                     Visual Dashboards & Reporting Layer                         |  |
|  |   - Snowsight Dashboard: 6 Real-Time Analytical KPI & Chart Tiles               |  |
|  |   - Streamlit in Snowflake (SiS): Live Interactive Web Dashboard App            |  |
|  +---------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------+
```

---

## 4. Key Real-Time Analytics Techniques

### A. Counting & Throughput Metrics
Computes total streaming message volumes, unique vehicle tracking, and fleet-wide anomaly distribution in real-time:
```sql
SELECT 
    COUNT(*) AS TOTAL_STREAM_EVENTS,
    COUNT(DISTINCT VEHICLE_ID) AS ACTIVE_VEHICLES,
    ROUND(AVG(SPEED_KMH), 2) AS FLEET_AVG_SPEED,
    COUNT_IF(IS_ANOMALY = TRUE) AS ANOMALIES_DETECTED
FROM V_STREAM_FLATTENED;
```

### B. Tumbling Window Analytics (Fixed Time Slices)
Aggregates non-overlapping fixed 1-minute time windows using Snowflake's native `TIME_SLICE`:
```sql
SELECT
    TIME_SLICE(EVENT_TIMESTAMP, 1, 'MINUTE') AS WINDOW_START,
    TIMEADD('MINUTE', 1, TIME_SLICE(EVENT_TIMESTAMP, 1, 'MINUTE')) AS WINDOW_END,
    COUNT(*) AS EVENTS_IN_WINDOW,
    ROUND(AVG(SPEED_KMH), 2) AS WINDOW_AVG_SPEED,
    ROUND(MAX(SPEED_KMH), 2) AS WINDOW_PEAK_SPEED
FROM V_STREAM_FLATTENED
GROUP BY 1, 2
ORDER BY WINDOW_START DESC;
```

### C. Sliding Window Analytics (Moving Averages)
Calculates rolling 5-event moving averages to smooth out telemetry noise and identify continuous velocity trends:
```sql
SELECT
    EVENT_TIMESTAMP,
    VEHICLE_ID,
    SPEED_KMH,
    ROUND(AVG(SPEED_KMH) OVER (
        PARTITION BY VEHICLE_ID 
        ORDER BY EVENT_TIMESTAMP 
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ), 2) AS SPEED_MOVING_AVG_5
FROM V_STREAM_FLATTENED;
```

---

## 5. Project File Structure

```text
assignment-04-snowflake-streaming-analytics/
│
├── sql/
│   ├── 01_setup_database.sql          # Warehouse, Database, Schema, VARIANT raw table
│   ├── 02_streams_and_dynamic_tables.sql # Snowflake Streams, Tasks & Dynamic Tables
│   ├── 03_realtime_window_analytics.sql  # Tumbling, Sliding, Counting & Anomaly queries
│   └── 04_snowsight_dashboard_tiles.sql  # 6 pre-configured queries for Snowsight UI tiles
│
├── src/
│   ├── stream_to_snowflake.py         # Real-time event streamer & Snowflake loader
│   ├── verify_analytics.py            # Terminal report verifier for counting & windowing
│   └── dashboard_app.py               # Streamlit in Snowflake interactive visualizer
│
├── run_pipeline.ps1                   # One-click pipeline runner
├── run_dashboard.ps1                  # One-click Streamlit dashboard launcher
├── requirements.txt                   # Python dependencies
├── .env.example                       # Snowflake connection parameters template
├── .env                               # Live environment file
├── .gitignore                         # Git ignore configuration
└── README.md                          # Comprehensive documentation and screenshot guide
```

---

## 6. How to Execute in Snowflake

### Step 1: Execute SQL Worksheets in Snowflake Console
1. Log into your **Snowflake Web UI** (Snowsight).
2. Open **Worksheets** and run:
   - [`sql/01_setup_database.sql`](sql/01_setup_database.sql): Creates `STREAMING_WH`, `STREAMING_ANALYTICS_DB`, and `RAW_STREAM_EVENTS`.
   - [`sql/02_streams_and_dynamic_tables.sql`](sql/02_streams_and_dynamic_tables.sql): Creates continuous Streams & Dynamic Tables.
   - [`sql/03_realtime_window_analytics.sql`](sql/03_realtime_window_analytics.sql): Runs all windowing and counting aggregations.

### Step 2: Ingest Real-Time Events (Python)
```powershell
python src/stream_to_snowflake.py --events 50 --batch-size 10
```

### Step 3: Run Analytics Terminal Verifier
```powershell
python src/verify_analytics.py
```

### Step 4: Launch Interactive Streamlit Visualization
```powershell
streamlit run src/dashboard_app.py
```
*(Or use `.\run_dashboard.ps1`)*

---

## 7. Snowsight Visual Dashboard Setup Guide

In the Snowflake Snowsight Console:
1. Navigate to **Dashboards** $\to$ Click **+ Dashboard** (Title: `IoT Fleet Real-Time Streaming Analytics`).
2. Set the Warehouse to **`STREAMING_WH`** and Database to **`STREAMING_ANALYTICS_DB`**.
3. Create the 6 visual tiles from [`sql/04_snowsight_dashboard_tiles.sql`](sql/04_snowsight_dashboard_tiles.sql):
   - **Tile 1**: *Scorecard* — Total Ingestion Volume & Active Fleet Count.
   - **Tile 2**: *Line Chart* — 1-Minute Tumbling Window Avg Speed vs Peak Speed.
   - **Tile 3**: *Bar Chart* — Message Ingestion Volume by Vehicle.
   - **Tile 4**: *Line Chart* — Engine Temperature Time-Series Window.
   - **Tile 5**: *Scatter Plot* — Speed vs Engine Temperature Anomaly Clustering.
   - **Tile 6**: *Table* — Critical Anomaly Alert Stream.
