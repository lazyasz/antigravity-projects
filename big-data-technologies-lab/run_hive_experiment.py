import os
import sys

# Ensure JAVA_HOME and HADOOP_HOME are set
hadoop_home = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\hadoop-3.3.6"
os.environ["HADOOP_HOME"] = hadoop_home
os.environ["JAVA_HOME"] = r"C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
os.environ["PATH"] = os.path.join(hadoop_home, "bin") + os.pathsep + os.path.join(os.environ["JAVA_HOME"], "bin") + os.pathsep + os.environ.get("PATH", "")

print(f"Using Python: {sys.executable}")
print(f"JAVA_HOME: {os.environ['JAVA_HOME']}")
print(f"HADOOP_HOME: {os.environ['HADOOP_HOME']}")

try:
    from pyspark.sql import SparkSession
    print("Initializing Spark / Hive Engine...")
    spark = SparkSession.builder \
        .appName("Hive_Experiment_6") \
        .config("spark.hadoop.home.dir", hadoop_home) \
        .config("spark.sql.warehouse.dir", r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\warehouse") \
        .config("spark.driver.extraJavaOptions", f"-Dderby.system.home=C:\\Users\\dhruv\\.gemini\\antigravity-ide\\scratch\\bdtl_exp6\\derby -Dhadoop.home.dir={hadoop_home}") \
        .enableHiveSupport() \
        .getOrCreate()

    print("\n=== ENGINE STARTED SUCCESSFULLY ===")
    
    print("\n--- 1. SHOW DATABASES ---")
    spark.sql("SHOW DATABASES").show()

    print("\n--- 2. CREATE DATABASE MyDB ---")
    spark.sql("CREATE DATABASE IF NOT EXISTS MyDB")
    spark.sql("SHOW DATABASES").show()

    print("\n--- 3. USE MyDB ---")
    spark.sql("USE MyDB")

    print("\n--- 4. CREATE TABLE Stud_info ---")
    spark.sql("""
        CREATE TABLE IF NOT EXISTS Stud_info (
            Roll_No INT,
            Name STRING,
            Year STRING,
            Course STRING
        )
        ROW FORMAT DELIMITED
        FIELDS TERMINATED BY ','
        STORED AS TEXTFILE
    """)

    print("\n--- 5. DESCRIBE Stud_info ---")
    spark.sql("DESCRIBE Stud_info").show()

    print("\n--- 6. INSERTING DATA INTO Stud_info ---")
    # Initial records corresponding to info.csv
    spark.sql("""
        INSERT INTO TABLE Stud_info VALUES
        (101, 'Alan', 'TY', 'Cyber Security'),
        (211, 'Sophi', 'FY', 'B.S.C. Nursing'),
        (302, 'Neha', 'TY', 'C.S.E.'),
        (410, 'Sherin', 'FY', 'Aeronautics'),
        (511, 'Alice', 'SY', 'L.L.B.')
    """)
    print("\n--- 7. SELECT * FROM Stud_info (After Load) ---")
    spark.sql("SELECT * FROM Stud_info").show()

    print("\n--- 8. INSERT COMMAND (Jerin, Mech) ---")
    spark.sql("INSERT INTO TABLE Stud_info VALUES (415, 'Jerin', 'LY', 'Mech')")
    
    print("\n--- 9. SELECT * FROM Stud_info (After Insert) ---")
    spark.sql("SELECT * FROM Stud_info").show()

    # Acceptance criteria questions
    print("\n================ ACCEPTANCE CRITERIA QUERIES ================")
    print("\n--- Q1 & Q2: CollegeDB & Student Table ---")
    spark.sql("CREATE DATABASE IF NOT EXISTS CollegeDB")
    spark.sql("USE CollegeDB")
    spark.sql("""
        CREATE TABLE IF NOT EXISTS Student (
            RollNo INT,
            Name STRING,
            Department STRING,
            Marks INT
        )
        ROW FORMAT DELIMITED
        FIELDS TERMINATED BY ','
    """)
    spark.sql("""
        INSERT INTO TABLE Student VALUES
        (1, 'Dhruv', 'IT', 92),
        (2, 'Alan', 'CSE', 78),
        (3, 'Neha', 'AI&DS', 85),
        (4, 'Sophi', 'ECE', 64),
        (5, 'Rahul', 'ME', 71)
    """)
    print("\n--- SELECT * FROM Student ---")
    spark.sql("SELECT * FROM Student").show()

    print("\n--- Q3: Filter & Sort (Marks > 75 ORDER BY Marks DESC) ---")
    spark.sql("SELECT * FROM Student WHERE Marks > 75 ORDER BY Marks DESC").show()

    print("\n--- Q4: DESCRIBE FORMATTED Student ---")
    spark.sql("DESCRIBE FORMATTED Student").show(truncate=False)

    spark.stop()
    print("\n=== EXPERIMENT EXECUTION COMPLETED SUCCESSFULLY ===")

except Exception as e:
    import traceback
    traceback.print_exc()
