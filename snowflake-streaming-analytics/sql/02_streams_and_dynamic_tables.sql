-- ==============================================================================
-- Assignment No. 04 - Cloud Data Engineering Lab
-- Snowflake Worksheet 02: Snowflake Streams & Dynamic Tables (Continuous Pipelines)
-- ==============================================================================

USE WAREHOUSE STREAMING_WH;
USE DATABASE STREAMING_ANALYTICS_DB;
USE SCHEMA PUBLIC;

-- 1. Create Change Data Capture (CDC) Stream on Raw Landing Table
CREATE OR REPLACE STREAM STR_RAW_STREAM_EVENTS 
    ON TABLE RAW_STREAM_EVENTS
    APPEND_ONLY = TRUE
    COMMENT = 'Append-only stream tracking real-time streaming ingestion';

-- 2. Create Continuous Ingestion Task (Triggered by Stream Changes)
CREATE OR REPLACE TASK TSK_PROCESS_STREAM_EVENTS
    WAREHOUSE = STREAMING_WH
    SCHEDULE = '1 MINUTE'
    WHEN SYSTEM$STREAM_HAS_DATA('STR_RAW_STREAM_EVENTS')
AS
MERGE INTO FCT_VEHICLE_TELEMETRY target
USING (
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
        END AS IS_ANOMALY
    FROM STR_RAW_STREAM_EVENTS
) src
ON target.EVENT_ID = src.EVENT_ID
WHEN NOT MATCHED THEN INSERT (
    EVENT_ID, EVENT_TIMESTAMP, VEHICLE_ID, SPEED_KMH, ENGINE_TEMP_C, 
    RPM, FUEL_LEVEL_PCT, LATITUDE, LONGITUDE, STATUS, IS_ANOMALY
) VALUES (
    src.EVENT_ID, src.EVENT_TIMESTAMP, src.VEHICLE_ID, src.SPEED_KMH, src.ENGINE_TEMP_C, 
    src.RPM, src.FUEL_LEVEL_PCT, src.LATITUDE, src.LONGITUDE, src.STATUS, src.IS_ANOMALY
);

-- Enable Task
ALTER TASK TSK_PROCESS_STREAM_EVENTS RESUME;

-- 3. Create Real-Time Snowflake Dynamic Table (Declarative Lag-based 1-Min Window)
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
