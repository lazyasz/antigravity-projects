-- ==============================================================================
-- Cloud Data Engineering Lab - Assignment 02
-- Verification & Analysis SQL Queries for Amazon RDS MySQL
-- ==============================================================================

USE etl_database;

-- 1. Verify total count of loaded records
SELECT COUNT(*) AS total_customers_loaded FROM customers;

-- 2. Inspect all loaded records
SELECT 
    customer_id,
    name,
    age,
    city,
    purchase_amount,
    purchase_category,
    processed_at
FROM customers
ORDER BY customer_id ASC;

-- 3. Distribution of customers across cities
SELECT 
    city, 
    COUNT(*) AS customer_count,
    ROUND(AVG(age), 1) AS avg_age,
    SUM(purchase_amount) AS total_spending
FROM customers
GROUP BY city
ORDER BY customer_count DESC;

-- 4. Customer segmentation summary by purchase category
SELECT 
    purchase_category,
    COUNT(*) AS count_in_category,
    MIN(purchase_amount) AS min_amount,
    MAX(purchase_amount) AS max_amount
FROM customers
GROUP BY purchase_category;
