-- ==============================================================================
-- Cloud Data Engineering Lab - Assignment 02
-- Database & Table Creation DDL for Amazon RDS MySQL
-- ==============================================================================

-- 1. Create the ETL Database if it does not already exist
CREATE DATABASE IF NOT EXISTS etl_database
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE etl_database;

-- 2. Create the target 'customers' table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    city VARCHAR(100),
    purchase_amount DECIMAL(10, 2) DEFAULT 0.00,
    purchase_category VARCHAR(50) DEFAULT 'Standard',
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Show table structure
DESCRIBE customers;
