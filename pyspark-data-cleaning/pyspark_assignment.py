# ==============================================================================
# CS 405 - Large Scale Data Engineering
# Assignment: Data Cleaning and Preprocessing of a Large Dataset Using PySpark
# ==============================================================================

# ------------------------------------------------------------------------------
# 2. Import Required Libraries
# ------------------------------------------------------------------------------
print("Initializing environment and importing libraries...")
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, trim, regexp_replace, to_date, sum as spark_sum
from pyspark.sql.functions import mean as spark_mean
from pyspark.sql.types import IntegerType, DoubleType, DateType
import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


# ------------------------------------------------------------------------------
# 3. Create Spark Session
# ------------------------------------------------------------------------------
print("Creating local Spark Session...")
spark = SparkSession.builder \
    .appName("PySparkDataCleaningAssignment") \
    .master("local[*]") \
    .config("spark.sql.shuffle.partitions", "4") \
    .getOrCreate()

# Reduce log level to prevent verbose info printouts
spark.sparkContext.setLogLevel("WARN")

# ------------------------------------------------------------------------------
# 4. Load Dataset (data.csv)
# ------------------------------------------------------------------------------
dataset_path = "data.csv"
print(f"Loading raw dataset from: {dataset_path}...")
df_raw = spark.read.csv(dataset_path, header=True, inferSchema=False)

# ------------------------------------------------------------------------------
# 5. Initial Data Exploration
# ------------------------------------------------------------------------------
print("\n--- Raw DataFrame Schema ---")
df_raw.printSchema()

row_count = df_raw.count()
col_count = len(df_raw.columns)
print(f"DataFrame Dimensions: {row_count} rows, {col_count} columns")

print("\n--- Preview of Raw Records (First 5 Rows) ---")
df_raw.show(5, truncate=False)

# ------------------------------------------------------------------------------
# 6. Missing Value Analysis
# ------------------------------------------------------------------------------
print("\nChecking for missing values in each column...")
null_counts_df = df_raw.select([
    spark_sum(col(c).isNull().cast("integer")).alias(c) for c in df_raw.columns
])
null_counts_df.show()

# ------------------------------------------------------------------------------
# 7. Missing Value Treatment
# ------------------------------------------------------------------------------
print("\nPerforming missing value treatment...")
# Temporarily cast numerical fields to calculate metrics
temp_stats_df = df_raw.select(
    col("Age").cast("double").alias("age"),
    col("Annual Income").cast("double").alias("income"),
    col("Store Rating").cast("double").alias("rating"),
    col("Gender")
)

# Compute metrics
median_age = temp_stats_df.approxQuantile("age", [0.5], 0.0)[0]
mean_income = temp_stats_df.select(spark_mean("income")).collect()[0][0]
mean_rating = temp_stats_df.select(spark_mean("rating")).collect()[0][0]

gender_counts = temp_stats_df.filter(col("Gender").isNotNull() & (col("Gender") != "")) \
    .groupBy("Gender") \
    .count() \
    .orderBy("count", ascending=False)
mode_gender = gender_counts.first()["Gender"] if gender_counts.count() > 0 else "Unknown"

print(f"Calculated Imputation Metrics:")
print(f"  - Median Age: {median_age}")
print(f"  - Mean Annual Income: ${mean_income:.2f}")
print(f"  - Mean Store Rating: {mean_rating:.2f}")
print(f"  - Mode Gender: '{mode_gender}'")

# Impute values
imputation_dict = {
    "Age": str(int(median_age)),
    "Annual Income": str(round(mean_income, 2)),
    "Store Rating": str(round(mean_rating, 2)),
    "Gender": mode_gender,
    "City": "Unknown",
    "Transaction Date": "2023-01-01"
}
df_imputed = df_raw.fillna(imputation_dict)

# ------------------------------------------------------------------------------
# 8. Duplicate Detection and Removal
# ------------------------------------------------------------------------------
count_before = df_imputed.count()
df_no_duplicates = df_imputed.dropDuplicates()
count_after = df_no_duplicates.count()
duplicates_removed = count_before - count_after

print(f"\nDeduplication Summary:")
print(f"  - Record count BEFORE duplicate removal: {count_before}")
print(f"  - Record count AFTER duplicate removal:  {count_after}")
print(f"  - Total duplicate records removed:       {duplicates_removed}")

# ------------------------------------------------------------------------------
# 9. Column Name Standardization
# ------------------------------------------------------------------------------
print("\nStandardizing column names to lowercase and snake_case...")
current_columns = df_no_duplicates.columns
standard_columns = [col_name.strip().lower().replace(" ", "_") for col_name in current_columns]

df_standardized = df_no_duplicates
for old_name, new_name in zip(current_columns, standard_columns):
    df_standardized = df_standardized.withColumnRenamed(old_name, new_name)

# ------------------------------------------------------------------------------
# 10. String Cleaning
# ------------------------------------------------------------------------------
print("Trimming whitespace and standardizing categorical casing...")
df_trimmed = df_standardized
string_cols = [c for c, t in df_standardized.dtypes if t == "string"]
for col_name in string_cols:
    df_trimmed = df_trimmed.withColumn(col_name, trim(col(col_name)))

df_string_cleaned = df_trimmed.withColumn(
    "gender",
    when(col("gender").isin(["male", "MALE", "Male"]), "Male")
    .when(col("gender").isin(["female", "FEMALE", "Female"]), "Female")
    .otherwise("Unknown")
)

# ------------------------------------------------------------------------------
# 11. Data Type Corrections
# ------------------------------------------------------------------------------
print("Applying schema corrections and casting columns to proper datatypes...")
# Strip currency formatting from purchase_amount
df_typed = df_string_cleaned.withColumn(
    "purchase_amount",
    regexp_replace(col("purchase_amount"), "[\\$,]", "").cast(DoubleType())
)

# Impute purchase_amount null values with the mean of the cleaned column
mean_purchase = df_typed.select(spark_mean("purchase_amount")).collect()[0][0]
df_typed = df_typed.fillna({"purchase_amount": mean_purchase})
print(f"  - Mean Purchase Amount: ${mean_purchase:.2f}")

# Cast other fields
df_typed = df_typed \
    .withColumn("transaction_id", col("transaction_id").cast(IntegerType())) \
    .withColumn("transaction_date", to_date(col("transaction_date"), "yyyy-MM-dd")) \
    .withColumn("age", col("age").cast(IntegerType())) \
    .withColumn("annual_income", col("annual_income").cast(DoubleType())) \
    .withColumn("store_rating", col("store_rating").cast(DoubleType()))

print("\n--- Final Casted DataFrame Schema ---")
df_typed.printSchema()

# ------------------------------------------------------------------------------
# 12. Summary Statistics
# ------------------------------------------------------------------------------
print("\n--- Cleaned Dataset Descriptive Statistics ---")
df_typed.describe().show()

# ------------------------------------------------------------------------------
# 13. Final Data Validation
# ------------------------------------------------------------------------------
print("Performing final validations...")
null_counts = df_typed.select([
    spark_sum(col(c).isNull().cast("integer")).alias(c) for c in df_typed.columns
]).collect()[0]

total_nulls_remaining = sum(null_counts)
duplicate_count = df_typed.count() - df_typed.dropDuplicates().count()

print(f"  - Total Nulls Remaining: {total_nulls_remaining}")
print(f"  - Duplicate Record Count: {duplicate_count}")
print(f"  - Final shape: {df_typed.count()} rows x {len(df_typed.columns)} columns")

assert total_nulls_remaining == 0, "Validation Failed: Nulls still present!"
assert duplicate_count == 0, "Validation Failed: Duplicates still present!"
print("\n>>> ALL DATA QUALITY VALIDATIONS PASSED SUCCESSFULLY! <<<")

# ------------------------------------------------------------------------------
# 14. Data Quality Metrics & Dashboard
# ------------------------------------------------------------------------------
print("\nGenerating Data Quality Metrics & Dashboard...")
raw_total_records = df_raw.count()
cleaned_total_records = df_typed.count()
num_columns = len(df_raw.columns)
total_cells = raw_total_records * num_columns

# Calculate nulls before cleaning
null_counts_raw = df_raw.select([
    spark_sum(col(c).isNull().cast("integer")).alias(c) for c in df_raw.columns
]).collect()[0]
total_nulls_raw = sum(null_counts_raw)

# Calculate nulls after cleaning (validated as 0)
total_nulls_cleaned = 0

# Resolved defects = nulls filled + (duplicates * columns)
resolved_defects = total_nulls_raw + (duplicates_removed * num_columns)
dq_improvement_pct = (resolved_defects / total_cells) * 100

print(f"Data Quality Dashboard Summary Metrics:")
print(f"  - Total Records (Raw): {raw_total_records}")
print(f"  - Total Records (Cleaned): {cleaned_total_records}")
print(f"  - Total Columns: {num_columns}")
print(f"  - Missing Values (Raw): {total_nulls_raw}")
print(f"  - Missing Values (Cleaned): {total_nulls_cleaned}")
print(f"  - Duplicate Rows Removed: {duplicates_removed}")
print(f"  - DQ Improvement %: {dq_improvement_pct:.2f}%")

# Generate Data Quality Dashboard Plot
sns.set_theme(style="whitegrid")
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle("ENTERPRISE DATA QUALITY DASHBOARD", fontsize=18, fontweight='bold', color='#1e293b')

# Grid [0, 0]: KPI Cards
axes[0, 0].axis('off')
axes[0, 0].set_title("Key Performance Indicators (Data Quality)", fontsize=14, fontweight='bold', color='#475569')
axes[0, 0].patch.set_facecolor('#f8fafc')
kpi_text = (
    f"Total Raw Records: {raw_total_records}\n"
    f"Total Columns: {num_columns}\n"
    f"Duplicates Purged: {duplicates_removed}\n"
    f"Initial Null Cells: {total_nulls_raw}\n"
    f"Final Null Cells: {total_nulls_cleaned}\n\n"
    f"DATA QUALITY IMPROVEMENT:\n"
    f"★ {dq_improvement_pct:.2f}% ★"
)
axes[0, 0].text(0.1, 0.5, kpi_text, fontsize=14, fontfamily='monospace',
                verticalalignment='center', bbox=dict(boxstyle='round,pad=1.5', facecolor='#eff6ff', edgecolor='#3b82f6'))

# Grid [0, 1]: Nulls Before Cleaning
columns_for_plot = [c.replace('_', ' ').title() for c in df_raw.columns]
axes[0, 1].barh(columns_for_plot, list(null_counts_raw), color='#f43f5e', edgecolor='#be123c')
axes[0, 1].set_title("Missing Values Count by Column (Raw)", fontsize=14, fontweight='bold', color='#475569')
axes[0, 1].set_xlabel("Null Count")

# Grid [1, 0]: Unique vs Duplicate Records
axes[1, 0].pie([cleaned_total_records, duplicates_removed], labels=['Unique', 'Duplicates Removed'],
               autopct='%1.1f%%', colors=['#10b981', '#f43f5e'], startangle=90, explode=(0, 0.1 if duplicates_removed > 0 else 0),
               textprops={'fontsize': 12, 'weight': 'bold'})
axes[1, 0].set_title("Deduplication Breakdown", fontsize=14, fontweight='bold', color='#475569')

# Grid [1, 1]: Dataset Health Profile
completeness_before = [(raw_total_records - n) / raw_total_records * 100 for n in null_counts_raw]
completeness_after = [100.0] * num_columns
x_indices = range(num_columns)
axes[1, 1].bar([x - 0.2 for x in x_indices], completeness_before, width=0.4, label='Pre-Clean', color='#fda4af')
axes[1, 1].bar([x + 0.2 for x in x_indices], completeness_after, width=0.4, label='Post-Clean', color='#34d399')
axes[1, 1].set_title("Data Completeness Profile (%)", fontsize=14, fontweight='bold', color='#475569')
axes[1, 1].set_xticks(x_indices)
axes[1, 1].set_xticklabels([c[:10] + '..' if len(c) > 10 else c for c in df_raw.columns], rotation=45, ha='right')
axes[1, 1].set_ylim(0, 115)
axes[1, 1].set_ylabel("Completeness (%)")
axes[1, 1].legend()

plt.tight_layout()
plt.savefig("data_quality_dashboard.png", dpi=150)
plt.close()
print("Saved: 'data_quality_dashboard.png'")

# ------------------------------------------------------------------------------
# 15. Business Insights Dashboard
# ------------------------------------------------------------------------------
print("\nGenerating Business Insights Dashboard...")
pdf = df_typed.toPandas()

# Calculate business KPIs
total_revenue = pdf['purchase_amount'].sum()
avg_purchase = pdf['purchase_amount'].mean()
avg_rating = pdf['store_rating'].mean()

print(f"Business Dashboard Summary Metrics:")
print(f"  - Total Net Revenue: ${total_revenue:.2f}")
print(f"  - Average Transaction Value: ${avg_purchase:.2f}")
print(f"  - Average Store Rating: {avg_rating:.2f}/5.0")

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle("EXECUTIVE BUSINESS INSIGHTS DASHBOARD", fontsize=18, fontweight='bold', color='#1e293b')

# Grid [0, 0]: Financial & Experience KPIs
axes[0, 0].axis('off')
axes[0, 0].set_title("Key Performance Indicators (Business)", fontsize=14, fontweight='bold', color='#475569')
axes[0, 0].patch.set_facecolor('#f8fafc')
biz_kpi_text = (
    f"TOTAL NET REVENUE:\n"
    f"★ ${total_revenue:,.2f} ★\n\n"
    f"AVERAGE ORDER VALUE (AOV):\n"
    f"★ ${avg_purchase:.2f} ★\n\n"
    f"AVERAGE STORE RATING:\n"
    f"★ {avg_rating:.2f} / 5.00 ★"
)
axes[0, 0].text(0.1, 0.5, biz_kpi_text, fontsize=14, fontfamily='monospace',
                verticalalignment='center', bbox=dict(boxstyle='round,pad=1.5', facecolor='#f0fdf4', edgecolor='#22c55e'))

# Grid [0, 1]: Revenue by City
city_rev = pdf.groupby('city')['purchase_amount'].sum().reset_index().sort_values(by='purchase_amount', ascending=False)
sns.barplot(x='purchase_amount', y='city', data=city_rev, ax=axes[0, 1], palette="viridis", edgecolor='black')
axes[0, 1].set_title("Total Sales Revenue by Market / City", fontsize=14, fontweight='bold', color='#475569')
axes[0, 1].set_xlabel("Revenue ($)")
axes[0, 1].set_ylabel("City")

# Grid [1, 0]: Age vs. Purchase Amount Correlation
sns.regplot(x='age', y='purchase_amount', data=pdf, ax=axes[1, 0], color='#3b82f6',
            scatter_kws={'s': 80, 'alpha': 0.8, 'edgecolor': 'black'}, line_kws={'color': '#ef4444', 'lw': 2})
axes[1, 0].set_title("Purchase Size by Customer Age", fontsize=14, fontweight='bold', color='#475569')
axes[1, 0].set_xlabel("Age")
axes[1, 0].set_ylabel("Purchase Amount ($)")

# Grid [1, 1]: Gender Distribution
gender_counts = pdf['gender'].value_counts()
axes[1, 1].pie(gender_counts, labels=gender_counts.index, autopct='%1.1f%%',
               colors=['#60a5fa', '#f472b6', '#cbd5e1'], startangle=90, explode=[0.05]*len(gender_counts) if len(gender_counts) > 1 else [0],
               textprops={'fontsize': 12, 'weight': 'bold'})
axes[1, 1].set_title("Customer Segmentation by Gender", fontsize=14, fontweight='bold', color='#475569')

plt.tight_layout()
plt.savefig("business_insights_dashboard.png", dpi=150)
plt.close()
print("Saved: 'business_insights_dashboard.png'")

# ------------------------------------------------------------------------------
# 16. Power BI Dashboard Design Plan
# ------------------------------------------------------------------------------
print("\n" + "="*80)
print("POWER BI DASHBOARD DESIGN PLAN")
print("="*80)
print("""
[Page 1: Data Quality Audit]
- Visual 1: Card - Total Raw Rows, Duplicates Dropped, Data Completeness %
- Visual 2: Stacked Bar Chart - Null count before vs after cleaning per field
- Visual 3: Donut Chart - Record Distribution (Clean vs Duplicates Removed)
- Visual 4: Table - Sample anomalies and raw inputs

[Page 2: Executive Business Summary]
- Visual 1: Card - Revenue ($), Order Volume (Count), Avg Order Value ($), Avg Rating
- Visual 2: Clustered Bar Chart - Revenue and Order Volume by City
- Visual 3: Scatter Plot - Purchase Amount by Age with Trend Line & Slicers
- Visual 4: Donut Chart - Revenue Contribution % by Gender Segment
- Visual 5: Matrix Table - City wise Breakdown showing Sales, Customers, and Rating

[Key Slicers & Filters]:
- City Slicer (Multi-select)
- Gender Slicer (Checkbox)
- Transaction Date Range (Timeline slider)
""")
print("="*80 + "\n")

# ------------------------------------------------------------------------------
# 17. Export Cleaned Dataset
# ------------------------------------------------------------------------------
cleaned_data_csv = "cleaned_data.csv"
cleaned_data_parquet = "cleaned_data.parquet"

print(f"Exporting cleaned dataset to CSV: '{cleaned_data_csv}'...")
df_typed.coalesce(1).write.csv(cleaned_data_csv, header=True, mode="overwrite")

print(f"Exporting cleaned dataset to Parquet: '{cleaned_data_parquet}'...")
df_typed.write.mode("overwrite").parquet(cleaned_data_parquet)
print("Exports completed successfully.")

# Stop the Spark Session
spark.stop()
print("Spark Session stopped successfully.")
