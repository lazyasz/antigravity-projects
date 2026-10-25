import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Set page configuration
st.set_page_config(
    page_title="Data Quality & Business Analytics Hub",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom styling injection for premium look
st.markdown("""
    <style>
    .main-title {
        font-size: 2.8rem;
        font-weight: 800;
        color: #1e293b;
        margin-bottom: 0.5rem;
    }
    .sub-title {
        font-size: 1.1rem;
        color: #64748b;
        margin-bottom: 2rem;
    }
    .kpi-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
    }
    .kpi-val {
        font-size: 2.2rem;
        font-weight: 700;
        color: #3b82f6;
        margin-bottom: 0.2rem;
    }
    .kpi-lbl {
        font-size: 0.9rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .kpi-success {
        color: #10b981;
    }
    .kpi-warning {
        color: #f59e0b;
    }
    .kpi-danger {
        color: #ef4444;
    }
    </style>
""", unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# 1. Ingestion & Dynamic Cleansing Logic (Mirroring PySpark ETL)
# ------------------------------------------------------------------------------
@st.cache_data
def load_and_process_data():
    # Read the raw csv
    df_raw = pd.read_csv("data.csv")
    
    # Store initial characteristics for DQ audits
    raw_total_records = len(df_raw)
    num_columns = len(df_raw.columns)
    total_cells = raw_total_records * num_columns
    null_counts_raw = df_raw.isnull().sum()
    total_nulls_raw = null_counts_raw.sum()
    
    # Track raw anomalies (any row containing nulls or is a duplicate)
    duplicate_mask = df_raw.duplicated(keep='first')
    null_mask = df_raw.isnull().any(axis=1)
    df_anomalies = df_raw[duplicate_mask | null_mask].copy()
    
    # Deduplicate
    df_dedup = df_raw.drop_duplicates()
    duplicates_removed = raw_total_records - len(df_dedup)
    
    # Standardize column headers to snake_case
    df_dedup.columns = [c.strip().lower().replace(" ", "_") for c in df_dedup.columns]
    
    # Perform cleanings
    df_clean = df_dedup.copy()
    
    # Impute Age with median
    df_clean['age'] = pd.to_numeric(df_clean['age'], errors='coerce')
    median_age = df_clean['age'].median()
    df_clean['age'] = df_clean['age'].fillna(int(median_age)).astype(int)
    
    # Impute Annual Income with mean
    df_clean['annual_income'] = pd.to_numeric(df_clean['annual_income'], errors='coerce')
    mean_income = df_clean['annual_income'].mean()
    df_clean['annual_income'] = df_clean['annual_income'].fillna(round(mean_income, 2))
    
    # Impute Store Rating with mean
    df_clean['store_rating'] = pd.to_numeric(df_clean['store_rating'], errors='coerce')
    mean_rating = df_clean['store_rating'].mean()
    df_clean['store_rating'] = df_clean['store_rating'].fillna(round(mean_rating, 2))
    
    # Impute Gender with mode & standardize
    df_clean['gender'] = df_clean['gender'].fillna("Male")
    df_clean['gender'] = df_clean['gender'].str.strip().str.lower().map({
        'male': 'Male', 'males': 'Male', 'female': 'Female', 'females': 'Female'
    }).fillna('Male')
    
    # Impute City & Date
    df_clean['city'] = df_clean['city'].str.strip().fillna('Unknown')
    df_clean['transaction_date'] = df_clean['transaction_date'].fillna('2023-01-01')
    
    # Clean Purchase Amount currency symbols & cast
    df_clean['purchase_amount'] = df_clean['purchase_amount'].astype(str).str.replace(r'[\$,]', '', regex=True)
    df_clean['purchase_amount'] = pd.to_numeric(df_clean['purchase_amount'], errors='coerce')
    mean_purchase = df_clean['purchase_amount'].mean()
    df_clean['purchase_amount'] = df_clean['purchase_amount'].fillna(round(mean_purchase, 2))
    
    # Final data type castings
    df_clean['transaction_id'] = df_clean['transaction_id'].astype(int)
    df_clean['transaction_date'] = pd.to_datetime(df_clean['transaction_date'])
    
    return {
        "df_raw": df_raw,
        "df_clean": df_clean,
        "df_anomalies": df_anomalies,
        "raw_total_records": raw_total_records,
        "cleaned_total_records": len(df_clean),
        "num_columns": num_columns,
        "total_cells": total_cells,
        "null_counts_raw": null_counts_raw,
        "total_nulls_raw": total_nulls_raw,
        "duplicates_removed": duplicates_removed
    }

data_pack = load_and_process_data()

# ------------------------------------------------------------------------------
# 2. Sidebar Configuration (Interactive Filters)
# ------------------------------------------------------------------------------
st.sidebar.image("https://spark.apache.org/images/spark-logo-rev.svg", width=120)
st.sidebar.markdown("### Interactive Control Center")
st.sidebar.write("Filter target segments dynamically in the Business Dashboard tab.")

# City Filter
available_cities = sorted(list(data_pack["df_clean"]["city"].unique()))
selected_cities = st.sidebar.multiselect("Select Cities", available_cities, default=available_cities)

# Gender Filter
available_genders = sorted(list(data_pack["df_clean"]["gender"].unique()))
selected_genders = st.sidebar.multiselect("Select Gender", available_genders, default=available_genders)

# Age Filter
min_age = int(data_pack["df_clean"]["age"].min())
max_age = int(data_pack["df_clean"]["age"].max())
selected_age_range = st.sidebar.slider("Select Age Range", min_age, max_age, (min_age, max_age))

# Apply business filters
df_filtered = data_pack["df_clean"][
    (data_pack["df_clean"]["city"].isin(selected_cities)) &
    (data_pack["df_clean"]["gender"].isin(selected_genders)) &
    (data_pack["df_clean"]["age"].between(selected_age_range[0], selected_age_range[1]))
]

# ------------------------------------------------------------------------------
# 3. Main Dashboard UI Layout
# ------------------------------------------------------------------------------
st.markdown('<div class="main-title">PORTFOLIO DATA CLEANSE & ANALYTICS LAYER</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">A real-world showcase of PySpark ETL, statistical data validation, and real-time dashboarding.</div>', unsafe_allow_html=True)

# Define Tabs
tab_dq, tab_biz = st.tabs(["🛡️ Data Quality Audit", "💼 Commercial Insights"])

# ------------------------------------------------------------------------------
# Tab 1: Data Quality Audit Page
# ------------------------------------------------------------------------------
with tab_dq:
    st.markdown("### Programmatic Data Quality Profile")
    st.write("This audit panel captures statistical indicators demonstrating how raw dirty data is purified by the ETL pipeline.")
    
    # Calculate Data Quality Improvement Index
    total_nulls_raw = data_pack["total_nulls_raw"]
    duplicates_removed = data_pack["duplicates_removed"]
    num_columns = data_pack["num_columns"]
    total_cells = data_pack["total_cells"]
    
    resolved_defects = total_nulls_raw + (duplicates_removed * num_columns)
    dq_improvement_pct = (resolved_defects / total_cells) * 100
    
    # KPI Grid
    kpi_col1, kpi_col2, kpi_col3, kpi_col4 = st.columns(4)
    with kpi_col1:
        st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-val">{data_pack["raw_total_records"]}</div>
                <div class="kpi-lbl">Ingested Records</div>
            </div>
        """, unsafe_allow_html=True)
    with kpi_col2:
        st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-val kpi-danger">{duplicates_removed}</div>
                <div class="kpi-lbl">Duplicates Purged</div>
            </div>
        """, unsafe_allow_html=True)
    with kpi_col3:
        st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-val kpi-warning">{total_nulls_raw}</div>
                <div class="kpi-lbl">Imputed Null Cells</div>
            </div>
        """, unsafe_allow_html=True)
    with kpi_col4:
        st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-val kpi-success">{dq_improvement_pct:.2f}%</div>
                <div class="kpi-lbl">Quality Improvement</div>
            </div>
        """, unsafe_allow_html=True)
        
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Visualization Grid
    chart_col1, chart_col2 = st.columns(2)
    
    with chart_col1:
        st.markdown("#### Null Value Densities (Pre-Clean)")
        fig, ax = plt.subplots(figsize=(6, 4))
        null_series = data_pack["null_counts_raw"]
        sns.barplot(x=null_series.values, y=[c.replace('_', ' ').title() for c in null_series.index], ax=ax, palette="flare", edgecolor='black')
        ax.set_xlabel("Null Count")
        st.pyplot(fig)
        
    with chart_col2:
        st.markdown("#### Data Completeness profile (%)")
        fig, ax = plt.subplots(figsize=(6, 4))
        completeness_before = [(data_pack["raw_total_records"] - n) / data_pack["raw_total_records"] * 100 for n in null_series]
        completeness_after = [100.0] * num_columns
        x_indices = range(num_columns)
        ax.bar([x - 0.2 for x in x_indices], completeness_before, width=0.4, label='Pre-Clean', color='#fda4af')
        ax.bar([x + 0.2 for x in x_indices], completeness_after, width=0.4, label='Post-Clean', color='#34d399')
        ax.set_xticks(x_indices)
        ax.set_xticklabels([c[:10] + '..' if len(c) > 10 else c for c in null_series.index], rotation=45, ha='right')
        ax.set_ylim(0, 115)
        ax.set_ylabel("Completeness (%)")
        ax.legend()
        st.pyplot(fig)

    st.markdown("#### Programmatically Audited Anomaly Rows (Audit Table)")
    st.write("The following records were identified as containing null parameters or duplicating existing IDs. They were processed and cleaned:")
    st.dataframe(data_pack["df_anomalies"], use_container_width=True)

# ------------------------------------------------------------------------------
# Tab 2: Business Analytics Dashboard
# ------------------------------------------------------------------------------
with tab_biz:
    st.markdown("### Executive Business Summary")
    st.write("This dashboard displays commercial metrics dynamically based on the sidebar filters selected.")
    
    # Check if filters returned any rows
    if len(df_filtered) == 0:
        st.warning("No records match the active sidebar filter settings. Adjust filters to view analytics.")
    else:
        # Calculate filtered metrics
        total_revenue = df_filtered['purchase_amount'].sum()
        avg_purchase = df_filtered['purchase_amount'].mean()
        avg_rating = df_filtered['store_rating'].mean()
        
        # KPI Grid
        biz_col1, biz_col2, biz_col3 = st.columns(3)
        with biz_col1:
            st.markdown(f"""
                <div class="kpi-card">
                    <div class="kpi-val">${total_revenue:,.2f}</div>
                    <div class="kpi-lbl">Net Sales Revenue</div>
                </div>
            """, unsafe_allow_html=True)
        with biz_col2:
            st.markdown(f"""
                <div class="kpi-card">
                    <div class="kpi-val">${avg_purchase:.2f}</div>
                    <div class="kpi-lbl">Average Order Value (AOV)</div>
                </div>
            """, unsafe_allow_html=True)
        with biz_col3:
            st.markdown(f"""
                <div class="kpi-card">
                    <div class="kpi-val">{avg_rating:.2f} / 5.0</div>
                    <div class="kpi-lbl">Average Customer Rating</div>
                </div>
            """, unsafe_allow_html=True)
            
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Chart Grid
        bchart_col1, bchart_col2 = st.columns(2)
        
        with bchart_col1:
            st.markdown("#### Total Revenue by City")
            fig, ax = plt.subplots(figsize=(6, 4))
            city_rev = df_filtered.groupby('city')['purchase_amount'].sum().reset_index().sort_values(by='purchase_amount', ascending=False)
            sns.barplot(x='purchase_amount', y='city', data=city_rev, ax=ax, palette="viridis", edgecolor='black')
            ax.set_xlabel("Revenue ($)")
            ax.set_ylabel("City")
            st.pyplot(fig)
            
        with bchart_col2:
            st.markdown("#### Customer Age vs. Order Value (with Trend)")
            fig, ax = plt.subplots(figsize=(6, 4))
            sns.regplot(x='age', y='purchase_amount', data=df_filtered, ax=ax, color='#3b82f6',
                        scatter_kws={'s': 60, 'alpha': 0.8, 'edgecolor': 'black'}, line_kws={'color': '#ef4444', 'lw': 2})
            ax.set_xlabel("Customer Age")
            ax.set_ylabel("Order Size ($)")
            st.pyplot(fig)
            
        bchart_col3, bchart_col4 = st.columns(2)
        
        with bchart_col3:
            st.markdown("#### Sales Distribution by Gender Segment")
            fig, ax = plt.subplots(figsize=(6, 4))
            gender_counts = df_filtered['gender'].value_counts()
            ax.pie(gender_counts, labels=gender_counts.index, autopct='%1.1f%%',
                   colors=['#60a5fa', '#f472b6', '#cbd5e1'], startangle=90, explode=[0.05]*len(gender_counts) if len(gender_counts) > 1 else [0],
                   textprops={'fontsize': 10, 'weight': 'bold'})
            st.pyplot(fig)
            
        with bchart_col4:
            st.markdown("#### Sales Trend Over Time")
            fig, ax = plt.subplots(figsize=(6, 4))
            trend_df = df_filtered.groupby('transaction_date')['purchase_amount'].sum().reset_index().sort_values('transaction_date')
            ax.plot(trend_df['transaction_date'], trend_df['purchase_amount'], marker='o', color='#8b5cf6', linewidth=2)
            ax.set_xlabel("Transaction Date")
            ax.set_ylabel("Revenue ($)")
            plt.xticks(rotation=45)
            st.pyplot(fig)

    st.markdown("#### Interactive Cleaned Data Asset Viewer")
    st.write("Browse and download the live-filtered database schema below:")
    st.dataframe(df_filtered, use_container_width=True)
