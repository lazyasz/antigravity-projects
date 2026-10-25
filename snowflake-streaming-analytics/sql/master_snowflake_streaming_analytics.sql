-- ==============================================================================
-- ASSIGNMENT NO. 04: CLOUD DATA ENGINEERING LAB
-- MASTER SNOWFLAKE REAL-TIME STREAMING ANALYTICS & WINDOWING SCRIPT
-- ==============================================================================
-- Instructions:
-- 1. Open a new SQL Worksheet in Snowflake (Snowsight).
-- 2. Paste this entire file into the worksheet.
-- 3. Click "Run All" (or press Ctrl + Shift + Enter).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. INFRASTRUCTURE & CONTEXT SETUP
-- ------------------------------------------------------------------------------
CREATE WAREHOUSE IF NOT EXISTS STREAMING_WH
    WITH WAREHOUSE_SIZE = 'X-SMALL'
    AUTO_SUSPEND = 60
    AUTO_RESUME = TRUE
    INITIALLY_SUSPENDED = FALSE
    COMMENT = 'Dedicated compute warehouse for real-time streaming analytics';

USE WAREHOUSE STREAMING_WH;

CREATE DATABASE IF NOT EXISTS STREAMING_ANALYTICS_DB;
USE DATABASE STREAMING_ANALYTICS_DB;
USE SCHEMA PUBLIC;

-- ------------------------------------------------------------------------------
-- 2. RAW STREAMING INGESTION (SEMI-STRUCTURED JSON / VARIANT)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS RAW_STREAM_EVENTS (
    RAW_ID NUMBER AUTOINCREMENT START 1 INCREMENT 1,
    RECORD_CONTENT VARIANT,
    INGESTION_TIMESTAMP TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- ------------------------------------------------------------------------------
-- 3. REAL-TIME FLATTENED STREAMING VIEW
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW V_STREAM_FLATTENED AS
SELECT
    RECORD_CONTENT:event_id::STRING AS EVENT_ID,
    RECORD_CONTENT:timestamp::TIMESTAMP_NTZ AS EVENT_TIMESTAMP,
    RECORD_CONTENT:vehicle_id::STRING AS VEHICLE_ID,
    RECORD_CONTENT:telemetry.speed_kmh::FLOAT AS SPEED_KMH,
    RECORD_CONTENT:telemetry.engine_temp_c::FLOAT AS ENGINE_TEMP_C,
    RECORD_CONTENT:telemetry.rpm::NUMBER AS RPM,
    RECORD_CONTENT:telemetry.fuel_level_pct::FLOAT AS FUEL_LEVEL_PCT,
    RECORD_CONTENT:telemetry.location.latitude::FLOAT AS LATITUDE,
    RECORD_CONTENT:telemetry.location.longitude::FLOAT AS LONGITUDE,
    RECORD_CONTENT:status::STRING AS STATUS,
    CASE 
        WHEN RECORD_CONTENT:status::STRING = 'CRITICAL_ANOMALY' 
             OR RECORD_CONTENT:telemetry.engine_temp_c::FLOAT > 100.0
             OR RECORD_CONTENT:telemetry.speed_kmh::FLOAT > 115.0 
        THEN TRUE 
        ELSE FALSE 
    END AS IS_ANOMALY,
    INGESTION_TIMESTAMP
FROM RAW_STREAM_EVENTS;

-- ------------------------------------------------------------------------------
-- 4. CURATED ANALYTICS FACT TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS FCT_VEHICLE_TELEMETRY (
    EVENT_ID VARCHAR(100) PRIMARY KEY,
    EVENT_TIMESTAMP TIMESTAMP_NTZ,
    VEHICLE_ID VARCHAR(50),
    SPEED_KMH FLOAT,
    ENGINE_TEMP_C FLOAT,
    RPM NUMBER,
    FUEL_LEVEL_PCT FLOAT,
    LATITUDE FLOAT,
    LONGITUDE FLOAT,
    STATUS VARCHAR(50),
    IS_ANOMALY BOOLEAN,
    INGESTED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- ------------------------------------------------------------------------------
-- 5. POPULATE LIVE STREAMING TELEMETRY DATA (SEED DATASET)
-- ------------------------------------------------------------------------------
INSERT INTO RAW_STREAM_EVENTS (RECORD_CONTENT)
SELECT PARSE_JSON(column1) FROM VALUES
('{"event_id":"IOT-1001","timestamp":"2026-09-08T16:30:00Z","vehicle_id":"TRUCK-001","telemetry":{"speed_kmh":72.5,"engine_temp_c":88.2,"rpm":2320,"fuel_level_pct":85.0,"location":{"latitude":18.5204,"longitude":73.8567}},"status":"NORMAL"}'),
('{"event_id":"IOT-1002","timestamp":"2026-09-08T16:30:10Z","vehicle_id":"TRUCK-002","telemetry":{"speed_kmh":68.0,"engine_temp_c":89.1,"rpm":2170,"fuel_level_pct":78.0,"location":{"latitude":18.5215,"longitude":73.8578}},"status":"NORMAL"}'),
('{"event_id":"IOT-1003","timestamp":"2026-09-08T16:30:20Z","vehicle_id":"TRUCK-003","telemetry":{"speed_kmh":128.4,"engine_temp_c":118.5,"rpm":4100,"fuel_level_pct":64.0,"location":{"latitude":18.5230,"longitude":73.8590}},"status":"CRITICAL_ANOMALY"}'),
('{"event_id":"IOT-1004","timestamp":"2026-09-08T16:30:30Z","vehicle_id":"TRUCK-001","telemetry":{"speed_kmh":75.2,"engine_temp_c":88.8,"rpm":2400,"fuel_level_pct":84.2,"location":{"latitude":18.5245,"longitude":73.8601}},"status":"NORMAL"}'),
('{"event_id":"IOT-1005","timestamp":"2026-09-08T16:30:40Z","vehicle_id":"TRUCK-004","telemetry":{"speed_kmh":81.3,"engine_temp_c":91.0,"rpm":2600,"fuel_level_pct":90.5,"location":{"latitude":18.5260,"longitude":73.8615}},"status":"NORMAL"}'),
('{"event_id":"IOT-1006","timestamp":"2026-09-08T16:31:00Z","vehicle_id":"TRUCK-002","telemetry":{"speed_kmh":70.5,"engine_temp_c":89.7,"rpm":2250,"fuel_level_pct":77.3,"location":{"latitude":18.5272,"longitude":73.8628}},"status":"NORMAL"}'),
('{"event_id":"IOT-1007","timestamp":"2026-09-08T16:31:10Z","vehicle_id":"TRUCK-005","telemetry":{"speed_kmh":58.2,"engine_temp_c":87.5,"rpm":1900,"fuel_level_pct":92.0,"location":{"latitude":18.5285,"longitude":73.8640}},"status":"NORMAL"}'),
('{"event_id":"IOT-1008","timestamp":"2026-09-08T16:31:20Z","vehicle_id":"TRUCK-004","telemetry":{"speed_kmh":134.8,"engine_temp_c":121.2,"rpm":4300,"fuel_level_pct":89.1,"location":{"latitude":18.5300,"longitude":73.8655}},"status":"CRITICAL_ANOMALY"}'),
('{"event_id":"IOT-1009","timestamp":"2026-09-08T16:31:30Z","vehicle_id":"TRUCK-001","telemetry":{"speed_kmh":74.0,"engine_temp_c":88.5,"rpm":2370,"fuel_level_pct":83.5,"location":{"latitude":18.5312,"longitude":73.8668}},"status":"NORMAL"}'),
('{"event_id":"IOT-1010","timestamp":"2026-09-08T16:31:40Z","vehicle_id":"TRUCK-003","telemetry":{"speed_kmh":64.1,"engine_temp_c":92.3,"rpm":2050,"fuel_level_pct":62.5,"location":{"latitude":18.5325,"longitude":73.8680}},"status":"NORMAL"}'),
('{"event_id":"IOT-1011","timestamp":"2026-09-08T16:32:00Z","vehicle_id":"TRUCK-005","telemetry":{"speed_kmh":62.0,"engine_temp_c":87.9,"rpm":2000,"fuel_level_pct":91.2,"location":{"latitude":18.5338,"longitude":73.8692}},"status":"NORMAL"}'),
('{"event_id":"IOT-1012","timestamp":"2026-09-08T16:32:15Z","vehicle_id":"TRUCK-002","telemetry":{"speed_kmh":122.5,"engine_temp_c":115.0,"rpm":3900,"fuel_level_pct":75.8,"location":{"latitude":18.5350,"longitude":73.8705}},"status":"CRITICAL_ANOMALY"}');

-- Sync Curated Table
INSERT INTO FCT_VEHICLE_TELEMETRY
SELECT 
    EVENT_ID, EVENT_TIMESTAMP, VEHICLE_ID, SPEED_KMH, ENGINE_TEMP_C, 
    RPM, FUEL_LEVEL_PCT, LATITUDE, LONGITUDE, STATUS, IS_ANOMALY, INGESTION_TIMESTAMP
FROM V_STREAM_FLATTENED
WHERE EVENT_ID NOT IN (SELECT EVENT_ID FROM FCT_VEHICLE_TELEMETRY);

-- ------------------------------------------------------------------------------
-- 6. SNOWFLAKE STREAMS & DYNAMIC TABLES
-- ------------------------------------------------------------------------------
CREATE OR REPLACE STREAM STR_RAW_STREAM_EVENTS 
    ON TABLE RAW_STREAM_EVENTS
    APPEND_ONLY = TRUE;

CREATE OR REPLACE DYNAMIC TABLE DYN_IOT_WINDOW_1MIN
    TARGET_LAG = '1 MINUTE'
    WAREHOUSE = STREAMING_WH
AS
SELECT
    TIME_SLICE(EVENT_TIMESTAMP, 1, 'MINUTE') AS WINDOW_START,
    TIMEADD('MINUTE', 1, TIME_SLICE(EVENT_TIMESTAMP, 1, 'MINUTE')) AS WINDOW_END,
    VEHICLE_ID,
    COUNT(*) AS TOTAL_EVENTS,
    ROUND(AVG(SPEED_KMH), 2) AS AVG_SPEED,
    ROUND(MAX(SPEED_KMH), 2) AS MAX_SPEED,
    ROUND(AVG(ENGINE_TEMP_C), 2) AS AVG_TEMP,
    ROUND(MAX(ENGINE_TEMP_C), 2) AS MAX_TEMP,
    COUNT_IF(IS_ANOMALY = TRUE) AS ANOMALIES_COUNT
FROM V_STREAM_FLATTENED
GROUP BY 1, 2, 3;

-- ------------------------------------------------------------------------------
-- 7. REAL-TIME STREAMING ANALYTICS QUERIES (EXECUTION & RESULTS)
-- ------------------------------------------------------------------------------

-- [ANALYTICS 1: COUNTING & FLEET SUMMARY]
SELECT
    COUNT(*) AS TOTAL_STREAM_EVENTS,
    COUNT(DISTINCT VEHICLE_ID) AS ACTIVE_VEHICLES_COUNT,
    ROUND(AVG(SPEED_KMH), 2) AS FLEET_AVG_SPEED_KMH,
    ROUND(AVG(ENGINE_TEMP_C), 2) AS FLEET_AVG_TEMP_C,
    COUNT_IF(IS_ANOMALY = TRUE) AS TOTAL_ANOMALIES_DETECTED,
    ROUND((COUNT_IF(IS_ANOMALY = TRUE) * 100.0 / COUNT(*)), 2) AS ANOMALY_RATE_PERCENT
FROM V_STREAM_FLATTENED;

-- [ANALYTICS 2: TUMBLING WINDOWS (1-Minute Fixed Time Buckets)]
SELECT
    TIME_SLICE(EVENT_TIMESTAMP, 1, 'MINUTE') AS WINDOW_START,
    TIMEADD('MINUTE', 1, TIME_SLICE(EVENT_TIMESTAMP, 1, 'MINUTE')) AS WINDOW_END,
    COUNT(*) AS EVENTS_IN_WINDOW,
    ROUND(AVG(SPEED_KMH), 2) AS WINDOW_AVG_SPEED,
    ROUND(MAX(SPEED_KMH), 2) AS WINDOW_PEAK_SPEED,
    ROUND(AVG(ENGINE_TEMP_C), 2) AS WINDOW_AVG_TEMP,
    ROUND(MAX(ENGINE_TEMP_C), 2) AS WINDOW_PEAK_TEMP,
    COUNT_IF(IS_ANOMALY = TRUE) AS WINDOW_ANOMALY_COUNT
FROM V_STREAM_FLATTENED
GROUP BY 1, 2
ORDER BY WINDOW_START ASC;

-- [ANALYTICS 3: SLIDING WINDOWS (5-Event Moving Averages)]
SELECT
    EVENT_TIMESTAMP,
    VEHICLE_ID,
    SPEED_KMH,
    ROUND(AVG(SPEED_KMH) OVER (
        PARTITION BY VEHICLE_ID 
        ORDER BY EVENT_TIMESTAMP 
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ), 2) AS SPEED_MOVING_AVG_5,
    ENGINE_TEMP_C,
    ROUND(AVG(ENGINE_TEMP_C) OVER (
        PARTITION BY VEHICLE_ID 
        ORDER BY EVENT_TIMESTAMP 
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ), 2) AS TEMP_MOVING_AVG_5,
    STATUS
FROM V_STREAM_FLATTENED
ORDER BY VEHICLE_ID, EVENT_TIMESTAMP ASC;

-- [ANALYTICS 4: REAL-TIME ANOMALY DETECTION]
SELECT
    EVENT_TIMESTAMP,
    VEHICLE_ID,
    SPEED_KMH,
    ENGINE_TEMP_C,
    STATUS,
    CASE 
        WHEN ENGINE_TEMP_C > 105.0 AND SPEED_KMH > 115.0 THEN 'CRITICAL: SPEED & OVERHEAT SURGE'
        WHEN ENGINE_TEMP_C > 100.0 THEN 'WARNING: ENGINE OVERHEATING'
        WHEN SPEED_KMH > 115.0 THEN 'WARNING: SPEED VIOLATION'
        ELSE 'OTHER_ANOMALY'
    END AS ALERT_CLASSIFICATION
FROM V_STREAM_FLATTENED
WHERE IS_ANOMALY = TRUE
ORDER BY EVENT_TIMESTAMP DESC;
