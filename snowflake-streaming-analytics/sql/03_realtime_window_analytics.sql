-- ==============================================================================
-- Assignment No. 04 - Cloud Data Engineering Lab
-- Snowflake Worksheet 03: Real-Time Stream Analytics (Counting & Windowing)
-- ==============================================================================

USE WAREHOUSE STREAMING_WH;
USE DATABASE STREAMING_ANALYTICS_DB;
USE SCHEMA PUBLIC;

-- ==============================================================================
-- 1. REAL-TIME COUNTING & STREAM METRICS
-- ==============================================================================

-- [QUERY 1A] Overall Ingestion Count & Fleet Summary
SELECT
    COUNT(*) AS TOTAL_STREAM_EVENTS,
    COUNT(DISTINCT VEHICLE_ID) AS ACTIVE_VEHICLES_COUNT,
    ROUND(AVG(SPEED_KMH), 2) AS FLEET_AVG_SPEED_KMH,
    ROUND(AVG(ENGINE_TEMP_C), 2) AS FLEET_AVG_TEMP_C,
    COUNT_IF(IS_ANOMALY = TRUE) AS TOTAL_ANOMALIES_DETECTED,
    ROUND((COUNT_IF(IS_ANOMALY = TRUE) * 100.0 / COUNT(*)), 2) AS ANOMALY_RATE_PERCENT
FROM V_STREAM_FLATTENED;

-- [QUERY 1B] Real-Time Event Counting Per Vehicle
SELECT
    VEHICLE_ID,
    COUNT(*) AS MESSAGE_COUNT,
    ROUND(AVG(SPEED_KMH), 2) AS AVG_SPEED,
    ROUND(AVG(ENGINE_TEMP_C), 2) AS AVG_TEMP,
    COUNT_IF(IS_ANOMALY = TRUE) AS ANOMALY_EVENTS,
    MAX(EVENT_TIMESTAMP) AS LAST_SEEN_TIMESTAMP
FROM V_STREAM_FLATTENED
GROUP BY VEHICLE_ID
ORDER BY MESSAGE_COUNT DESC, VEHICLE_ID ASC;


-- ==============================================================================
-- 2. TUMBLING WINDOW ANALYTICS (Fixed 1-Minute & 5-Minute Time Windows)
-- ==============================================================================

-- [QUERY 2A] 1-Minute Tumbling Windows across Fleet
SELECT
    TIME_SLICE(EVENT_TIMESTAMP, 1, 'MINUTE') AS WINDOW_START,
    TIMEADD('MINUTE', 1, TIME_SLICE(EVENT_TIMESTAMP, 1, 'MINUTE')) AS WINDOW_END,
    COUNT(*) AS EVENTS_PER_WINDOW,
    ROUND(AVG(SPEED_KMH), 2) AS WINDOW_AVG_SPEED,
    ROUND(MAX(SPEED_KMH), 2) AS WINDOW_MAX_SPEED,
    ROUND(AVG(ENGINE_TEMP_C), 2) AS WINDOW_AVG_TEMP,
    ROUND(MAX(ENGINE_TEMP_C), 2) AS WINDOW_PEAK_TEMP,
    COUNT_IF(IS_ANOMALY = TRUE) AS WINDOW_ANOMALY_COUNT
FROM V_STREAM_FLATTENED
GROUP BY 1, 2
ORDER BY WINDOW_START DESC;

-- [QUERY 2B] 5-Minute Tumbling Window by Vehicle Segment
SELECT
    TIME_SLICE(EVENT_TIMESTAMP, 5, 'MINUTE') AS WINDOW_START,
    VEHICLE_ID,
    COUNT(*) AS EVENT_COUNT,
    ROUND(AVG(SPEED_KMH), 2) AS AVG_SPEED,
    ROUND(AVG(ENGINE_TEMP_C), 2) AS AVG_ENGINE_TEMP,
    ROUND(AVG(FUEL_LEVEL_PCT), 2) AS AVG_FUEL_REMAINING
FROM V_STREAM_FLATTENED
GROUP BY 1, 2
ORDER BY WINDOW_START DESC, VEHICLE_ID;


-- ==============================================================================
-- 3. SLIDING / HOPPING WINDOW ANALYTICS (Moving Averages & Window Partitioning)
-- ==============================================================================

-- [QUERY 3A] Sliding Moving Average (Rolling 5-Event Window per Vehicle)
SELECT
    EVENT_ID,
    EVENT_TIMESTAMP,
    VEHICLE_ID,
    SPEED_KMH,
    -- 5-Event Moving Average for Speed
    ROUND(AVG(SPEED_KMH) OVER (
        PARTITION BY VEHICLE_ID 
        ORDER BY EVENT_TIMESTAMP 
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ), 2) AS SPEED_MOVING_AVG_5,
    ENGINE_TEMP_C,
    -- 5-Event Moving Average for Engine Temperature
    ROUND(AVG(ENGINE_TEMP_C) OVER (
        PARTITION BY VEHICLE_ID 
        ORDER BY EVENT_TIMESTAMP 
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ), 2) AS TEMP_MOVING_AVG_5,
    STATUS
FROM V_STREAM_FLATTENED
ORDER BY VEHICLE_ID, EVENT_TIMESTAMP DESC;

-- [QUERY 3B] Time-Bounded Sliding Window (Rolling 2-Minute Time Interval)
SELECT
    EVENT_TIMESTAMP,
    VEHICLE_ID,
    SPEED_KMH,
    ROUND(AVG(SPEED_KMH) OVER (
        PARTITION BY VEHICLE_ID 
        ORDER BY EVENT_TIMESTAMP 
        RANGE BETWEEN INTERVAL '2 MINUTE' PRECEDING AND CURRENT ROW
    ), 2) AS ROLLING_2MIN_AVG_SPEED,
    IS_ANOMALY
FROM V_STREAM_FLATTENED
ORDER BY EVENT_TIMESTAMP DESC;


-- ==============================================================================
-- 4. REAL-TIME PATTERN & ANOMALY DETECTION
-- ==============================================================================

-- [QUERY 4] Critical Anomaly Alert Stream (Overheating / Extreme Surges)
SELECT
    EVENT_TIMESTAMP,
    VEHICLE_ID,
    SPEED_KMH,
    ENGINE_TEMP_C,
    RPM,
    LATITUDE,
    LONGITUDE,
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
