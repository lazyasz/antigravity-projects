import os
import sys

# Configure environment
script_dir = os.path.dirname(os.path.abspath(__file__))
hadoop_home = os.path.join(script_dir, "hadoop-3.3.6")
os.environ["HADOOP_HOME"] = hadoop_home
os.environ["JAVA_HOME"] = r"C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
os.environ["PATH"] = os.path.join(hadoop_home, "bin") + os.pathsep + os.path.join(os.environ["JAVA_HOME"], "bin") + os.pathsep + os.environ.get("PATH", "")

from pyspark.sql import SparkSession

def main():
    print("=" * 60)
    print("         Apache Hive Interactive Shell (Local Engine)")
    print("         BDTL Experiment 6 — Profile: dhruv45")
    print("=" * 60)
    print("Initializing Hive Metastore and Execution Engine...")

    spark = SparkSession.builder \
        .appName("Hive_CLI_dhruv45") \
        .config("spark.hadoop.home.dir", hadoop_home) \
        .config("spark.sql.warehouse.dir", os.path.join(script_dir, "warehouse")) \
        .config("spark.driver.extraJavaOptions", f"-Dderby.system.home={os.path.join(script_dir, 'derby')} -Dhadoop.home.dir={hadoop_home}") \
        .enableHiveSupport() \
        .getOrCreate()

    # Mute log verbosity
    spark.sparkContext.setLogLevel("ERROR")

    print("\nHive initialized successfully! Type your HiveQL queries ending with ';'")
    print("Type 'exit;' or 'quit;' to exit.\n")

    current_db = "default"
    buffer = ""

    while True:
        try:
            prompt = f"hive ({current_db})> " if not buffer else "          > "
            line = input(prompt)
            
            if not line.strip():
                continue

            buffer += " " + line.strip()

            if buffer.strip().endswith(";"):
                query = buffer.strip()[:-1].strip()
                buffer = ""

                if query.lower() in ["exit", "quit"]:
                    print("Exiting Hive shell. Bye!")
                    break

                # Track USE database
                if query.lower().startswith("use "):
                    parts = query.split()
                    if len(parts) >= 2:
                        current_db = parts[1].strip()

                try:
                    df = spark.sql(query)
                    # If it has columns / returns data
                    if df.schema:
                        df.show(100, truncate=False)
                    else:
                        print("OK")
                except Exception as q_err:
                    print(f"FAILED: Semantic/Execution Exception: {q_err}")

        except (KeyboardInterrupt, EOFError):
            print("\nExiting Hive shell. Bye!")
            break

    spark.stop()

if __name__ == "__main__":
    main()
