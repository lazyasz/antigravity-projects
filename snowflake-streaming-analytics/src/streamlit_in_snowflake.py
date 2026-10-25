# ==============================================================================
# ASSIGNMENT NO. 04: CLOUD DATA ENGINEERING LAB
# ❄️ SNOWFLAKE STREAMING DATA CLOUD — IoT SMART FLEET COMMAND CENTER
# ==============================================================================

import time
import random
import streamlit as st
import pandas as pd
import altair as alt
from datetime import datetime, timezone
from snowflake.snowpark.context import get_active_session

# Page Configuration
st.set_page_config(
    page_title="Snowflake IoT Fleet Command Center",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-Tech Dark Mode Styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Outfit', sans-serif;
    }
    
    .hero-title {
        font-size: 2.2rem;
        font-weight: 700;
        background: linear-gradient(90deg, #29B5E8 0%, #00F5D4 50%, #7B2CBF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 2px;
    }
    .hero-sub {
        font-size: 0.95rem;
        color: #94A3B8;
        margin-bottom: 20px;
    }
    .live-badge {
        display: inline-block;
        background-color: rgba(16, 185, 129, 0.15);
        color: #10B981;
        border: 1px solid #10B981;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.5px;
    }
    .kpi-box {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .kpi-val {
        font-family: 'JetBrains Mono', monospace;
        font-size: 1.8rem;
        font-weight: 700;
        color: #F8FAFC;
    }
    .kpi-lbl {
        font-size: 0.8rem;
        color: #94A3B8;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
</style>
""", unsafe_allow_html=True)

# Snowflake Active Session
session = get_active_session()

# Sidebar: Controls & Live Stream Chaos Generator
st.sidebar.markdown("### ⚡ Live Stream Controls")
window_slice = st.sidebar.selectbox("⏱️ Tumbling Window Duration", ["1 Minute", "2 Minutes", "5 Minutes"], index=0)
window_min = 1 if "1" in window_slice else (2 if "2" in window_slice else 5)

st.sidebar.markdown("---")
st.sidebar.markdown("### 🧪 Live Stream Generator")
st.sidebar.caption("Click to inject simulated streaming telemetry directly into Snowflake in real time:")

col_b1, col_b2 = st.sidebar.columns(2)

if col_b1.button("🚚 Send 5 Normal"):
    events = []
    for i in range(1, 6):
        veh = f"TRUCK-{random.randint(1, 8):03d}"
        speed = round(random.uniform(45.0, 82.0), 2)
        temp = round(random.uniform(86.0, 92.0), 2)
        payload = f'{{"event_id":"IOT-LIVE-{int(time.time()*1000)}-{i}","timestamp":"{datetime.now(timezone.utc).isoformat()}","vehicle_id":"{veh}","telemetry":{{"speed_kmh":{speed},"engine_temp_c":{temp},"rpm":{int(speed*30)},"fuel_level_pct":75.0,"location":{{"latitude":18.5204,"longitude":73.8567}}}},"status":"NORMAL"}}'
        events.append(f"('{payload}')")
    
    session.sql(f"INSERT INTO RAW_STREAM_EVENTS (RECORD_CONTENT) SELECT PARSE_JSON(column1) FROM VALUES {','.join(events)};").collect()
    st.sidebar.success("Ingested 5 events!")
    time.sleep(0.3)
    st.rerun()

if col_b2.button("🚨 Inject Surge"):
    veh = f"TRUCK-{random.randint(1, 8):03d}"
    speed = round(random.uniform(128.0, 145.0), 2)
    temp = round(random.uniform(112.0, 125.0), 2)
    payload = f'{{"event_id":"IOT-ANOMALY-{int(time.time()*1000)}","timestamp":"{datetime.now(timezone.utc).isoformat()}","vehicle_id":"{veh}","telemetry":{{"speed_kmh":{speed},"engine_temp_c":{temp},"rpm":4200,"fuel_level_pct":60.0,"location":{{"latitude":18.5300,"longitude":73.8655}}}},"status":"CRITICAL_ANOMALY"}}'
    session.sql(f"INSERT INTO RAW_STREAM_EVENTS (RECORD_CONTENT) SELECT PARSE_JSON('{payload}');").collect()
    st.sidebar.error(f"Injected Anomaly on {veh}!")
    time.sleep(0.3)
    st.rerun()

# ------------------------------------------------------------------------------
# Data Ingestion from Snowflake View
# ------------------------------------------------------------------------------
@st.cache_data(ttl=3)
def fetch_streaming_data():
    query = """
        SELECT 
            EVENT_ID,
            EVENT_TIMESTAMP,
            VEHICLE_ID,
            SPEED_KMH,
            ENGINE_TEMP_C,
            RPM,
            FUEL_LEVEL_PCT,
            LATITUDE,
            LONGITUDE,
            STATUS,
            IS_ANOMALY
        FROM STREAMING_ANALYTICS_DB.PUBLIC.V_STREAM_FLATTENED
        ORDER BY EVENT_TIMESTAMP ASC;
    """
    return session.sql(query).to_pandas()

try:
    df = fetch_streaming_data()
    df['EVENT_TIMESTAMP'] = pd.to_datetime(df['EVENT_TIMESTAMP'])

    # Header Presentation
    c_head1, c_head2 = st.columns([4, 1])
    with c_head1:
        st.markdown('<div class="hero-title">❄️ Snowflake Real-Time Streaming Analytics & Windowing</div>', unsafe_allow_html=True)
        st.markdown('<div class="hero-sub">Live IoT Fleet Ingestion | Continuous Dynamic Tables, Tumbling & Sliding Window Analytics</div>', unsafe_allow_html=True)
    with c_head2:
        st.markdown('<div style="text-align:right; margin-top:15px;"><span class="live-badge">● STREAM ENGINE ACTIVE</span></div>', unsafe_allow_html=True)

    # --------------------------------------------------------------------------
    # 1. EXECUTIVE KPI METRICS ROW
    # --------------------------------------------------------------------------
    total_events = len(df)
    active_trucks = df["VEHICLE_ID"].nunique()
    avg_speed = df["SPEED_KMH"].mean()
    avg_temp = df["ENGINE_TEMP_C"].mean()
    total_anomalies = int(df["IS_ANOMALY"].sum())
    anomaly_rate = (total_anomalies / total_events) * 100.0 if total_events > 0 else 0

    k1, k2, k3, k4, k5 = st.columns(5)
    with k1:
        st.markdown(f'<div class="kpi-box"><div class="kpi-val" style="color:#29B5E8;">{total_events:,}</div><div class="kpi-lbl">Total Events Streamed</div></div>', unsafe_allow_html=True)
    with k2:
        st.markdown(f'<div class="kpi-box"><div class="kpi-val" style="color:#10B981;">{active_trucks}</div><div class="kpi-lbl">Active Fleet Trucks</div></div>', unsafe_allow_html=True)
    with k3:
        st.markdown(f'<div class="kpi-box"><div class="kpi-val" style="color:#00F5D4;">{avg_speed:.1f} <span style="font-size:1rem;">km/h</span></div><div class="kpi-lbl">Fleet Velocity</div></div>', unsafe_allow_html=True)
    with k4:
        st.markdown(f'<div class="kpi-box"><div class="kpi-val" style="color:#F59E0B;">{avg_temp:.1f} <span style="font-size:1rem;">°C</span></div><div class="kpi-lbl">Avg Thermal Load</div></div>', unsafe_allow_html=True)
    with k5:
        anom_color = "#EF4444" if total_anomalies > 0 else "#10B981"
        st.markdown(f'<div class="kpi-box"><div class="kpi-val" style="color:{anom_color};">{total_anomalies}</div><div class="kpi-lbl">Critical Anomalies ({anomaly_rate:.1f}%)</div></div>', unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # --------------------------------------------------------------------------
    # 2. ROW 1: TUMBLING TIME-WINDOWS & MESSAGE COUNTING
    # --------------------------------------------------------------------------
    row1_left, row1_right = st.columns([3, 2])

    with row1_left:
        st.subheader(f"⏱️ {window_slice} Tumbling Window: Speed & Peak Dynamics")
        df['WINDOW_TIME'] = df['EVENT_TIMESTAMP'].dt.floor(f'{window_min}min')
        
        tumble_df = df.groupby('WINDOW_TIME').agg(
            AVG_SPEED=('SPEED_KMH', 'mean'),
            PEAK_SPEED=('SPEED_KMH', 'max'),
            AVG_TEMP=('ENGINE_TEMP_C', 'mean')
        ).reset_index()

        base = alt.Chart(tumble_df).encode(x=alt.X('WINDOW_TIME:T', title='Time Window Slice'))
        line_avg = base.mark_line(color='#29B5E8', size=3, point=True).encode(
            y=alt.Y('AVG_SPEED:Q', title='Velocity (km/h)'),
            tooltip=['WINDOW_TIME:T', 'AVG_SPEED:Q', 'PEAK_SPEED:Q']
        )
        line_peak = base.mark_line(color='#EF4444', strokeDash=[4, 4], size=2).encode(
            y=alt.Y('PEAK_SPEED:Q'),
            tooltip=['WINDOW_TIME:T', 'PEAK_SPEED:Q']
        )
        
        st.altair_chart((line_avg + line_peak).properties(height=310), use_container_width=True)

    with row1_right:
        st.subheader("📊 Real-Time Message Volume by Truck")
        counts = df.groupby("VEHICLE_ID").agg(
            TOTAL=("EVENT_ID", "count"),
            ANOMALIES=("IS_ANOMALY", "sum")
        ).reset_index()

        bar = alt.Chart(counts).mark_bar(cornerRadius=6).encode(
            x=alt.X("TOTAL:Q", title="Ingested Events Count"),
            y=alt.Y("VEHICLE_ID:N", sort='-x', title="Vehicle ID"),
            color=alt.Color("ANOMALIES:Q", scale=alt.Scale(scheme='reds'), title="Anomalies"),
            tooltip=["VEHICLE_ID", "TOTAL", "ANOMALIES"]
        ).properties(height=310)
        st.altair_chart(bar, use_container_width=True)

    # --------------------------------------------------------------------------
    # 3. ROW 2: SLIDING WINDOW MOVING AVERAGE & ANOMALY PHASE MATRIX
    # --------------------------------------------------------------------------
    row2_left, row2_right = st.columns([3, 2])

    with row2_left:
        st.subheader("📈 Sliding Window: 5-Event Rolling Moving Average")
        df['SPEED_MOVING_AVG'] = df.groupby('VEHICLE_ID')['SPEED_KMH'].transform(lambda s: s.rolling(5, min_periods=1).mean())
        
        selected_veh = st.selectbox("Select Vehicle for Rolling Stream Analysis:", sorted(df['VEHICLE_ID'].unique()), index=0)
        v_data = df[df['VEHICLE_ID'] == selected_veh]

        v_base = alt.Chart(v_data).encode(x=alt.X('EVENT_TIMESTAMP:T', title='Stream Timestamp'))
        raw_pts = v_base.mark_circle(size=60, color='#64748B').encode(
            y=alt.Y('SPEED_KMH:Q', title='Speed (km/h)'),
            tooltip=['EVENT_TIMESTAMP:T', 'SPEED_KMH:Q', 'ENGINE_TEMP_C:Q']
        )
        trend_line = v_base.mark_line(color='#10B981', size=3).encode(
            y=alt.Y('SPEED_MOVING_AVG:Q'),
            tooltip=['EVENT_TIMESTAMP:T', 'SPEED_MOVING_AVG:Q']
        )
        st.altair_chart((raw_pts + trend_line).properties(height=300), use_container_width=True)

    with row2_right:
        st.subheader("🎯 Thermal vs Velocity Phase Cluster")
        scatter = alt.Chart(df).mark_circle(size=90).encode(
            x=alt.X('SPEED_KMH:Q', title='Speed (km/h)'),
            y=alt.Y('ENGINE_TEMP_C:Q', title='Engine Temperature (°C)'),
            color=alt.Color('IS_ANOMALY:N', scale=alt.Scale(domain=[False, True], range=['#29B5E8', '#EF4444']), title='Critical Anomaly'),
            tooltip=['VEHICLE_ID:N', 'SPEED_KMH:Q', 'ENGINE_TEMP_C:Q', 'STATUS:N']
        ).properties(height=300)
        st.altair_chart(scatter, use_container_width=True)

    # --------------------------------------------------------------------------
    # 4. ROW 3: REAL-TIME ANOMALY DETECTION FEED
    # --------------------------------------------------------------------------
    st.subheader("🚨 Critical Anomaly Detection Feed & Threat Log")
    anomalies_df = df[df["IS_ANOMALY"] == True].sort_values(by="EVENT_TIMESTAMP", ascending=False)
    
    if not anomalies_df.empty:
        st.dataframe(
            anomalies_df[["EVENT_TIMESTAMP", "VEHICLE_ID", "SPEED_KMH", "ENGINE_TEMP_C", "RPM", "STATUS"]],
            use_container_width=True,
            height=240
        )
    else:
        st.success("✅ All active vehicles operating within nominal physical bounds.")

except Exception as e:
    st.error(f"Error connecting to Snowflake: {e}")
    st.info("Ensure `01_setup_database.sql` has been executed in a Snowflake worksheet.")
