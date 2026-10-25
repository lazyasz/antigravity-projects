"""
==============================================================================
Assignment No. 04 - Cloud Data Engineering Lab
Real-Time Stream Analytics & Visualization Dashboard (Streamlit in Snowflake)
==============================================================================
"""

import os
import json
import time
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from pathlib import Path

# Page Config
st.set_page_config(
    page_title="Snowflake Real-Time Streaming Analytics",
    page_icon="❄️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #29B5E8;
        margin-bottom: 0px;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #8b949e;
        margin-bottom: 20px;
    }
    .metric-card {
        background-color: #111827;
        border: 1px solid #374151;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
    }
    .anomaly-badge {
        background-color: #ef4444;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)


LOCAL_STORE = Path(__file__).resolve().parent.parent / "data" / "snowflake_stream_buffer.json"


def load_dataset() -> pd.DataFrame:
    """Loads dataset from Snowflake or local streaming buffer."""
    # Check Snowflake live connection if available
    try:
        import snowflake.connector
        from dotenv import load_dotenv
        load_dotenv(Path(__file__).resolve().parent.parent / ".env")
        
        acc = os.getenv("SNOWFLAKE_ACCOUNT", "")
        usr = os.getenv("SNOWFLAKE_USER", "")
        pwd = os.getenv("SNOWFLAKE_PASSWORD", "")
        if acc and usr and pwd and acc != "demo_account":
            conn = snowflake.connector.connect(
                account=acc, user=usr, password=pwd,
                warehouse=os.getenv("SNOWFLAKE_WAREHOUSE", "STREAMING_WH"),
                database=os.getenv("SNOWFLAKE_DATABASE", "STREAMING_ANALYTICS_DB"),
                schema="PUBLIC"
            )
            df = pd.read_sql("SELECT * FROM V_STREAM_FLATTENED ORDER BY EVENT_TIMESTAMP ASC", conn)
            conn.close()
            return df
    except Exception:
        pass

    # Read from local storage buffer
    if not LOCAL_STORE.exists():
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
            "LATITUDE": r["telemetry"]["location"]["latitude"],
            "LONGITUDE": r["telemetry"]["location"]["longitude"],
            "STATUS": status,
            "IS_ANOMALY": is_anomaly
        })

    return pd.DataFrame(flattened)


# Sidebar Controls
st.sidebar.image("https://upload.wikimedia.org/wikipedia/commons/f/ff/Snowflake_Inc._logo.svg", width=160)
st.sidebar.title("Stream Controls")
auto_refresh = st.sidebar.checkbox("Auto-Stream Ingestion Mode", value=False)
window_size_min = st.sidebar.selectbox("Tumbling Window Size", [1, 2, 5, 10], index=0)
anomaly_filter = st.sidebar.radio("Filter Events", ["All Stream Events", "Anomalies Only"])

if st.sidebar.button("🔄 Ingest 15 New Stream Events"):
    from stream_to_snowflake import run_stream_ingestion
    run_stream_ingestion(total_events=15, batch_size=5, anomaly_rate=20)
    st.sidebar.success("Ingested 15 events into Snowflake buffer!")
    time.sleep(0.5)
    st.rerun()

df = load_dataset()

# Title Section
st.markdown('<p class="main-header">❄️ Snowflake Real-Time Streaming Analytics & Windowing Dashboard</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Live IoT Fleet Telemetry | Continuous Stream Ingestion, Dynamic Tables & Time-Window Aggregations</p>', unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# 1. TOP METRICS ROW (REAL-TIME COUNTING)
# ------------------------------------------------------------------------------
total_events = len(df)
active_vehicles = df["VEHICLE_ID"].nunique()
avg_speed = df["SPEED_KMH"].mean()
avg_temp = df["ENGINE_TEMP_C"].mean()
total_anomalies = df["IS_ANOMALY"].sum()
anomaly_pct = (total_anomalies / total_events) * 100.0 if total_events > 0 else 0

m1, m2, m3, m4, m5 = st.columns(5)
m1.metric("Total Stream Events", f"{total_events:,}")
m2.metric("Active Fleet Vehicles", active_vehicles)
m3.metric("Fleet Avg Speed", f"{avg_speed:.1f} km/h")
m4.metric("Fleet Avg Temp", f"{avg_temp:.1f} °C")
m5.metric("Anomalies Detected", f"{total_anomalies}", delta=f"{anomaly_pct:.1f}% rate", delta_color="inverse")

st.markdown("---")

# ------------------------------------------------------------------------------
# 2. ROW 1: COUNTING & VEHICLE ACTIVITY
# ------------------------------------------------------------------------------
col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("📊 Real-Time Event Counting by Vehicle")
    counts_df = df.groupby("VEHICLE_ID").agg(
        TOTAL_MESSAGES=("EVENT_ID", "count"),
        ANOMALIES=("IS_ANOMALY", "sum")
    ).reset_index()

    fig_bar = px.bar(
        counts_df,
        x="VEHICLE_ID",
        y="TOTAL_MESSAGES",
        color="ANOMALIES",
        color_continuous_scale="Reds",
        title="Event Message Volume Per Vehicle",
        labels={"TOTAL_MESSAGES": "Messages Count", "VEHICLE_ID": "Vehicle ID"}
    )
    fig_bar.update_layout(template="plotly_dark", height=340)
    st.plotly_chart(fig_bar, use_container_width=True)

with col2:
    st.subheader("🏎️ Fleet Speed Distribution (Histogram)")
    fig_hist = px.histogram(
        df,
        x="SPEED_KMH",
        color="IS_ANOMALY",
        nbins=25,
        color_discrete_map={False: "#29B5E8", True: "#EF4444"},
        title="Telemetry Speed Density & Outlier Surge Analysis",
        labels={"SPEED_KMH": "Speed (km/h)", "IS_ANOMALY": "Is Anomaly"}
    )
    fig_hist.update_layout(template="plotly_dark", height=340)
    st.plotly_chart(fig_hist, use_container_width=True)

# ------------------------------------------------------------------------------
# 3. ROW 2: TUMBLING & SLIDING WINDOW ANALYTICS
# ------------------------------------------------------------------------------
col3, col4 = st.columns([1, 1])

with col3:
    st.subheader(f"⏱️ {window_size_min}-Minute Tumbling Window (Avg vs Peak Speed)")
    df["TUMBLING_WINDOW"] = df["EVENT_TIMESTAMP"].dt.floor(f"{window_size_min}min")
    tumbling = df.groupby("TUMBLING_WINDOW").agg(
        AVG_SPEED=("SPEED_KMH", "mean"),
        MAX_SPEED=("SPEED_KMH", "max"),
        AVG_TEMP=("ENGINE_TEMP_C", "mean")
    ).reset_index()

    fig_tumble = go.Figure()
    fig_tumble.add_trace(go.Scatter(x=tumbling["TUMBLING_WINDOW"], y=tumbling["AVG_SPEED"], name="Window Avg Speed", line=dict(color="#29B5E8", width=3)))
    fig_tumble.add_trace(go.Scatter(x=tumbling["TUMBLING_WINDOW"], y=tumbling["MAX_SPEED"], name="Window Peak Speed", line=dict(color="#F59E0B", dash="dash", width=2)))
    fig_tumble.update_layout(template="plotly_dark", height=340, xaxis_title="Time Window", yaxis_title="Speed (km/h)")
    st.plotly_chart(fig_tumble, use_container_width=True)

with col4:
    st.subheader("📈 Sliding Window: 5-Event Moving Average")
    df["SPEED_MOV_AVG"] = df.groupby("VEHICLE_ID")["SPEED_KMH"].transform(lambda s: s.rolling(5, min_periods=1).mean())
    df["TEMP_MOV_AVG"] = df.groupby("VEHICLE_ID")["ENGINE_TEMP_C"].transform(lambda s: s.rolling(5, min_periods=1).mean())

    sample_v = df["VEHICLE_ID"].iloc[0] if not df.empty else "TRUCK-001"
    v_df = df[df["VEHICLE_ID"] == sample_v]

    fig_slide = go.Figure()
    fig_slide.add_trace(go.Scatter(x=v_df["EVENT_TIMESTAMP"], y=v_df["SPEED_KMH"], mode="markers", name="Raw Speed", marker=dict(color="#6B7280", size=6)))
    fig_slide.add_trace(go.Scatter(x=v_df["EVENT_TIMESTAMP"], y=v_df["SPEED_MOV_AVG"], mode="lines", name="5-Event Moving Avg", line=dict(color="#10B981", width=3)))
    fig_slide.update_layout(template="plotly_dark", height=340, title=f"Vehicle {sample_v} Moving Average Trend", xaxis_title="Timestamp", yaxis_title="Speed (km/h)")
    st.plotly_chart(fig_slide, use_container_width=True)

# ------------------------------------------------------------------------------
# 4. ROW 3: REAL-TIME ANOMALY DETECTION FEED
# ------------------------------------------------------------------------------
st.subheader("🚨 Critical Anomaly Detection Stream")

if anomaly_filter == "Anomalies Only":
    display_df = df[df["IS_ANOMALY"] == True]
else:
    display_df = df

st.dataframe(
    display_df[["EVENT_ID", "EVENT_TIMESTAMP", "VEHICLE_ID", "SPEED_KMH", "ENGINE_TEMP_C", "RPM", "STATUS", "IS_ANOMALY"]].sort_values(by="EVENT_TIMESTAMP", ascending=False).head(20),
    use_container_width=True,
    height=280
)
