"""
==============================================================================
Assignment No. 04 - Cloud Data Engineering Lab
Real-Time Stream Analytics Verifier (Counting, Windowing & Anomalies)
==============================================================================
Description:
    Executes and outputs the core real-time analytics calculations:
    1. Real-Time Counting & Throughput
    2. 1-Minute & 5-Minute Tumbling Windows
    3. Sliding Moving Averages (5-Event Rolling Window)
    4. Pattern & Anomaly Detection Queries
==============================================================================
"""

import os
import sys
import json
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv

project_root = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=project_root / ".env")

try:
    import snowflake.connector
    SNOWFLAKE_INSTALLED = True
except ImportError:
    SNOWFLAKE_INSTALLED = False

try:
    import colorama
    from colorama import Fore, Style
    colorama.init(autoreset=True)
    GREEN = Fore.GREEN
    CYAN = Fore.CYAN
    YELLOW = Fore.YELLOW
    RED = Fore.RED
    BOLD = Style.BRIGHT
    RESET = Style.RESET_ALL
except ImportError:
    GREEN = CYAN = YELLOW = RED = BOLD = RESET = ""

LOCAL_STORE = project_root / "data" / "snowflake_stream_buffer.json"


def load_data() -> pd.DataFrame:
    """Loads dataframe from Snowflake or local streaming buffer."""
    account = os.getenv("SNOWFLAKE_ACCOUNT", "").strip()
    user = os.getenv("SNOWFLAKE_USER", "").strip()
    password = os.getenv("SNOWFLAKE_PASSWORD", "").strip()

    if SNOWFLAKE_INSTALLED and account and user and password and account != "demo_account":
        try:
            conn = snowflake.connector.connect(
                account=account,
                user=user,
                password=password,
                warehouse=os.getenv("SNOWFLAKE_WAREHOUSE", "STREAMING_WH"),
                database=os.getenv("SNOWFLAKE_DATABASE", "STREAMING_ANALYTICS_DB"),
                schema="PUBLIC",
            )
            df = pd.read_sql("SELECT * FROM V_STREAM_FLATTENED ORDER BY EVENT_TIMESTAMP ASC", conn)
            conn.close()
            return df
        except Exception:
            pass

    # Fallback to local streaming buffer
    if not LOCAL_STORE.exists():
        # Generate on the fly if buffer not present
        from stream_to_snowflake import run_stream_ingestion
        run_stream_ingestion(total_events=50, batch_size=10, anomaly_rate=10)

    with open(LOCAL_STORE, "r") as f:
        records = json.load(f)

    flattened = []
    for r in records:
        speed = r["telemetry"]["speed_kmh"]
        temp = r["telemetry"]["engine_temp_c"]
        status = r["status"]
        is_anomaly = status == "CRITICAL_ANOMALY" or temp > 100.0 or speed > 115.0

        flattened.append({
            "EVENT_ID": r["event_id"],
            "EVENT_TIMESTAMP": pd.to_datetime(r["timestamp"]),
            "VEHICLE_ID": r["vehicle_id"],
            "SPEED_KMH": speed,
            "ENGINE_TEMP_C": temp,
            "RPM": r["telemetry"]["rpm"],
            "FUEL_LEVEL_PCT": r["telemetry"]["fuel_level_pct"],
            "STATUS": status,
            "IS_ANOMALY": is_anomaly
        })

    return pd.DataFrame(flattened)


def run_analytics_verification():
    print("=" * 85)
    print(f"  {BOLD}SNOWFLAKE STREAMING ANALYTICS VERIFICATION (ASSIGNMENT NO. 04){RESET}")
    print("=" * 85)

    df = load_data()
    if df.empty:
        print(f"{RED}[ERROR] No streaming data found.{RESET}")
        return

    # --------------------------------------------------------------------------
    # 1. REAL-TIME COUNTING & OVERALL METRICS
    # --------------------------------------------------------------------------
    total_events = len(df)
    unique_vehicles = df["VEHICLE_ID"].nunique()
    avg_speed = df["SPEED_KMH"].mean()
    avg_temp = df["ENGINE_TEMP_C"].mean()
    total_anomalies = df["IS_ANOMALY"].sum()
    anomaly_rate = (total_anomalies / total_events) * 100.0

    print(f"\n{CYAN}{BOLD}--- [1] REAL-TIME COUNTING & FLEET TELEMETRY SUMMARY ---{RESET}")
    print(f" * Total Stream Events Ingested : {BOLD}{total_events}{RESET}")
    print(f" * Active Vehicles Count        : {BOLD}{unique_vehicles}{RESET}")
    print(f" * Fleet Average Speed          : {avg_speed:.2f} km/h")
    print(f" * Fleet Average Engine Temp    : {avg_temp:.2f} C")
    print(f" * Total Anomalies Detected     : {RED if total_anomalies > 0 else GREEN}{total_anomalies}{RESET}")
    print(f" * Fleet Anomaly Rate           : {anomaly_rate:.2f}%\n")

    # Counts by Vehicle
    counts_df = df.groupby("VEHICLE_ID").agg(
        TOTAL_MESSAGES=("EVENT_ID", "count"),
        AVG_SPEED=("SPEED_KMH", "mean"),
        AVG_TEMP=("ENGINE_TEMP_C", "mean"),
        ANOMALIES=("IS_ANOMALY", "sum")
    ).reset_index()

    print(f"{'VEHICLE_ID':<14} | {'MESSAGES':<10} | {'AVG SPEED (km/h)':<18} | {'AVG TEMP (C)':<14} | {'ANOMALIES':<10}")
    print("-" * 75)
    for _, row in counts_df.iterrows():
        print(f"{row['VEHICLE_ID']:<14} | {row['TOTAL_MESSAGES']:<10} | {row['AVG_SPEED']:<18.2f} | {row['AVG_TEMP']:<14.2f} | {row['ANOMALIES']:<10}")

    # --------------------------------------------------------------------------
    # 2. TUMBLING WINDOW ANALYTICS (1-Minute Fixed Time Slices)
    # --------------------------------------------------------------------------
    print(f"\n{CYAN}{BOLD}--- [2] TUMBLING WINDOW ANALYTICS (1-Minute Time Windows) ---{RESET}")
    df["WINDOW_1MIN"] = df["EVENT_TIMESTAMP"].dt.floor("1min")
    tumbling_df = df.groupby("WINDOW_1MIN").agg(
        EVENTS_IN_WINDOW=("EVENT_ID", "count"),
        WINDOW_AVG_SPEED=("SPEED_KMH", "mean"),
        WINDOW_PEAK_SPEED=("SPEED_KMH", "max"),
        WINDOW_AVG_TEMP=("ENGINE_TEMP_C", "mean"),
        WINDOW_PEAK_TEMP=("ENGINE_TEMP_C", "max"),
        ANOMALIES_COUNT=("IS_ANOMALY", "sum")
    ).reset_index()

    print(f"{'WINDOW START':<22} | {'EVENTS':<8} | {'AVG SPEED':<12} | {'PEAK SPEED':<12} | {'AVG TEMP':<10} | {'PEAK TEMP':<10} | {'ANOMALIES':<10}")
    print("-" * 95)
    for _, r in tumbling_df.iterrows():
        w_start = r['WINDOW_1MIN'].strftime("%Y-%m-%d %H:%M:%S")
        print(f"{w_start:<22} | {r['EVENTS_IN_WINDOW']:<8} | {r['WINDOW_AVG_SPEED']:<12.2f} | {r['WINDOW_PEAK_SPEED']:<12.2f} | {r['WINDOW_AVG_TEMP']:<10.2f} | {r['WINDOW_PEAK_TEMP']:<10.2f} | {r['ANOMALIES_COUNT']:<10}")

    # --------------------------------------------------------------------------
    # 3. SLIDING WINDOW ANALYTICS (5-Event Rolling Moving Averages)
    # --------------------------------------------------------------------------
    print(f"\n{CYAN}{BOLD}--- [3] SLIDING WINDOW ANALYTICS (5-Event Moving Averages) ---{RESET}")
    df["SPEED_MOVING_AVG_5"] = df.groupby("VEHICLE_ID")["SPEED_KMH"].transform(lambda s: s.rolling(window=5, min_periods=1).mean())
    df["TEMP_MOVING_AVG_5"] = df.groupby("VEHICLE_ID")["ENGINE_TEMP_C"].transform(lambda s: s.rolling(window=5, min_periods=1).mean())

    sample_sliding = df.tail(8)
    print(f"{'TIMESTAMP':<20} | {'VEHICLE_ID':<12} | {'SPEED':<10} | {'SPEED (5-MOV-AVG)':<18} | {'TEMP':<8} | {'TEMP (5-MOV-AVG)':<18}")
    print("-" * 95)
    for _, r in sample_sliding.iterrows():
        t_str = r['EVENT_TIMESTAMP'].strftime("%H:%M:%S")
        print(f"{t_str:<20} | {r['VEHICLE_ID']:<12} | {r['SPEED_KMH']:<10.2f} | {r['SPEED_MOVING_AVG_5']:<18.2f} | {r['ENGINE_TEMP_C']:<8.2f} | {r['TEMP_MOVING_AVG_5']:<18.2f}")

    # --------------------------------------------------------------------------
    # 4. REAL-TIME ANOMALY & PATTERN DETECTION
    # --------------------------------------------------------------------------
    print(f"\n{CYAN}{BOLD}--- [4] REAL-TIME ANOMALY & PATTERN ALERTS ---{RESET}")
    anomalies_df = df[df["IS_ANOMALY"] == True]
    if not anomalies_df.empty:
        print(f"{'TIMESTAMP':<20} | {'VEHICLE_ID':<12} | {'SPEED (km/h)':<14} | {'ENGINE TEMP (C)':<16} | {'CLASSIFICATION':<26}")
        print("-" * 95)
        for _, r in anomalies_df.iterrows():
            t_str = r['EVENT_TIMESTAMP'].strftime("%Y-%m-%d %H:%M:%S")
            if r['ENGINE_TEMP_C'] > 105.0 and r['SPEED_KMH'] > 115.0:
                classification = "CRITICAL: SURGE & OVERHEAT"
            elif r['ENGINE_TEMP_C'] > 100.0:
                classification = "WARNING: ENGINE OVERHEATING"
            else:
                classification = "WARNING: SPEED VIOLATION"

            print(f"{t_str:<20} | {r['VEHICLE_ID']:<12} | {RED}{r['SPEED_KMH']:<14.2f} | {r['ENGINE_TEMP_C']:<16.2f} | {classification:<26}{RESET}")
    else:
        print(f"{GREEN}[+] Zero critical anomalies in current window.{RESET}")

    print("\n" + "=" * 85)
    print(f"{GREEN}[+] REAL-TIME STREAMING ANALYTICS VERIFICATION COMPLETE{RESET}")
    print("=" * 85)


if __name__ == "__main__":
    run_analytics_verification()
