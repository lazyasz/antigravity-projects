-- ==============================================================================
-- Assignment No. 04 - Cloud Data Engineering Lab
-- Snowflake Worksheet 01: Environment Setup, Warehouses & Target Tables
-- ==============================================================================

-- 1. Create Virtual Warehouse for Real-Time Streaming Analytics
CREATE WAREHOUSE IF NOT EXISTS STREAMING_WH
    WITH WAREHOUSE_SIZE = 'X-SMALL'
    AUTO_SUSPEND = 60
    AUTO_RESUME = TRUE
    INITIALLY_SUSPENDED = FALSE
    COMMENT = 'Dedicated compute warehouse for real-time streaming analytics';

USE WAREHOUSE STREAMING_WH;

-- 2. Create Analytics Database & Schema
CREATE DATABASE IF NOT EXISTS STREAMING_ANALYTICS_DB;
USE DATABASE STREAMING_ANALYTICS_DB;
USE SCHEMA PUBLIC;

-- 3. Create Raw Landing Table for Streaming Ingestion (Semi-Structured JSON)
CREATE TABLE IF NOT EXISTS RAW_STREAM_EVENTS (
    RAW_ID NUMBER AUTOINCREMENT START 1 INCREMENT 1,
    RECORD_CONTENT VARIANT,
    INGESTION_TIMESTAMP TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- 4. Create Curated Structured Telemetry Table
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

-- 5. Create Sample Stream Insertion View for Direct Flattening
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
