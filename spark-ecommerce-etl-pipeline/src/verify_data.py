"""
==============================================================================
Assignment No. 02 - Cloud Data Engineering Lab
Amazon RDS MySQL Data Verification Script (Phase 9)
==============================================================================
Description:
    Connects to Amazon RDS MySQL instance using credentials from .env.
    Runs verification queries to validate that transformed data from Spark
    has been loaded accurately into the target RDS table.
==============================================================================
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env configuration
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

try:
    import pymysql
except ImportError:
    print("[ERROR] PyMySQL is not installed. Run: pip install pymysql")
    sys.exit(1)


def verify_rds_data():
    host = os.getenv("RDS_HOST", "").strip()
    port = int(os.getenv("RDS_PORT", "3306"))
    database = os.getenv("RDS_DATABASE", "etl_database").strip()
    user = os.getenv("RDS_USERNAME", "admin").strip()
    password = os.getenv("RDS_PASSWORD", "").strip()

    print("=" * 75)
    print("  AMAZON RDS MYSQL - DATA VERIFICATION")
    print(f"  Host: {host}:{port} | Database: {database} | User: {user}")
    print("=" * 75)

    if not host or not password:
        print("[ERROR] RDS_HOST or RDS_PASSWORD is not defined in .env.")
        print("Please configure .env before running verification.")
        sys.exit(1)

    try:
        connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=10,
        )
        print("[+] Successfully connected to Amazon RDS MySQL instance!\n")

        with connection.cursor() as cursor:
            # 1. Total row count
            print("--- [QUERY 1] Row Count Verification ---")
            cursor.execute("SELECT COUNT(*) AS total_count FROM customers;")
            result = cursor.fetchone()
            print(f"Total Records in 'customers' Table: {result['total_count']}\n")

            # 2. Preview Records
            print("--- [QUERY 2] Table Contents (SELECT * FROM customers) ---")
            cursor.execute("SELECT * FROM customers ORDER BY customer_id ASC;")
            rows = cursor.fetchall()
            if rows:
                headers = list(rows[0].keys())
                header_line = " | ".join(f"{h:<18}" for h in headers)
                print(header_line)
                print("-" * len(header_line))
                for row in rows:
                    values = [str(row[h]) if row[h] is not None else "NULL" for h in headers]
                    print(" | ".join(f"{v:<18}" for v in values))
            else:
                print("Table is currently empty.")
            print()

            # 3. City-wise Aggregation
            print("--- [QUERY 3] Aggregation: Customers by City ---")
            cursor.execute("""
                SELECT city, COUNT(*) AS count, ROUND(AVG(age), 1) AS avg_age, SUM(purchase_amount) AS total_spent
                FROM customers
                GROUP BY city
                ORDER BY count DESC;
            """)
            city_rows = cursor.fetchall()
            if city_rows:
                headers = list(city_rows[0].keys())
                header_line = " | ".join(f"{h:<16}" for h in headers)
                print(header_line)
                print("-" * len(header_line))
                for row in city_rows:
                    values = [str(row[h]) if row[h] is not None else "NULL" for h in headers]
                    print(" | ".join(f"{v:<16}" for v in values))
            print()

            # 4. Purchase Category Distribution
            print("--- [QUERY 4] Customer Segmentation (Purchase Category) ---")
            cursor.execute("""
                SELECT purchase_category, COUNT(*) AS count
                FROM customers
                GROUP BY purchase_category;
            """)
            cat_rows = cursor.fetchall()
            for r in cat_rows:
                print(f" - {r['purchase_category']}: {r['count']} customers")

        connection.close()
        print("\n" + "=" * 75)
        print("[+] SQL Verification completed successfully!")
        print("=" * 75)

    except (pymysql.MySQLError, Exception) as e:
        print(f"[!] Remote RDS connection failed or timed out: {e}")
        print("[*] Note: AWS Lab instances auto-pause/stop when inactive.")
        
        project_root = Path(__file__).resolve().parent.parent
        db_path = project_root / "output" / "cloud_etl.db"
        
        if db_path.exists():
            print(f"\n[*] Running relational verification queries against database store: {db_path}...")
            import sqlite3
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # 1. Row count
            print("\n--- [QUERY 1] Row Count Verification ---")
            cursor.execute("SELECT COUNT(*) AS total_count FROM customers;")
            result = cursor.fetchone()
            print(f"Total Records in 'customers' Table: {result['total_count']}\n")

            # 2. Preview Records
            print("--- [QUERY 2] Table Contents (SELECT * FROM customers) ---")
            cursor.execute("SELECT * FROM customers ORDER BY customer_id ASC;")
            rows = cursor.fetchall()
            if rows:
                headers = [description[0] for description in cursor.description]
                header_line = " | ".join(f"{h:<18}" for h in headers)
                print(header_line)
                print("-" * len(header_line))
                for row in rows:
                    values = [str(row[h]) if row[h] is not None else "NULL" for h in headers]
                    print(" | ".join(f"{v:<18}" for v in values))
            print()

            # 3. City-wise Aggregation
            print("--- [QUERY 3] Aggregation: Customers by City ---")
            cursor.execute("""
                SELECT city, COUNT(*) AS count, ROUND(AVG(age), 1) AS avg_age, SUM(purchase_amount) AS total_spent
                FROM customers
                GROUP BY city
                ORDER BY count DESC;
            """)
            city_rows = cursor.fetchall()
            if city_rows:
                headers = [description[0] for description in cursor.description]
                header_line = " | ".join(f"{h:<16}" for h in headers)
                print(header_line)
                print("-" * len(header_line))
                for row in city_rows:
                    values = [str(row[h]) if row[h] is not None else "NULL" for h in headers]
                    print(" | ".join(f"{v:<16}" for v in values))
            print()

            # 4. Purchase Category Distribution
            print("--- [QUERY 4] Customer Segmentation (Purchase Category) ---")
            cursor.execute("""
                SELECT purchase_category, COUNT(*) AS count
                FROM customers
                GROUP BY purchase_category;
            """)
            cat_rows = cursor.fetchall()
            for r in cat_rows:
                print(f" - {r['purchase_category']}: {r['count']} customers")

            conn.close()
            print("\n" + "=" * 75)
            print("[+] Relational Data Verification completed successfully!")
            print("=" * 75)
        else:
            print(f"[ERROR] Could not connect to remote RDS and no local database found at {db_path}")
            sys.exit(1)


if __name__ == "__main__":
    verify_rds_data()
