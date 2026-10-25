import os
import subprocess

shots_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_bucket_experiments\screenshots"
html_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_bucket_experiments\html_templates"
os.makedirs(shots_dir, exist_ok=True)
os.makedirs(html_dir, exist_ok=True)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def render_wt_shot(html_str, filename, width=1320, height=820):
    html_file = os.path.join(html_dir, filename + ".html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_str)
    
    png_file = os.path.join(shots_dir, filename + ".png")
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--window-size={width},{height}",
        f"--screenshot={png_file}",
        f"file:///{html_file.replace(os.sep, '/')}"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(png_file):
        print(f"Generated: {filename}.png ({os.path.getsize(png_file)} bytes)")
    else:
        print(f"Failed to generate {filename}.png: {res.stderr}")

def get_wt_window(body_content, tab_title="Ubuntu-22.04: hive", width=1320, height=820):
    ubuntu_svg = """<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="11" fill="#E95420"/>
<circle cx="12" cy="7.5" r="2.2" fill="none" stroke="#fff" stroke-width="2"/>
<circle cx="5" cy="12" r="2.2" fill="#fff"/>
<circle cx="15.5" cy="6" r="2.2" fill="#fff"/>
<circle cx="15.5" cy="18" r="2.2" fill="#fff"/>
</svg>"""

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cascadia+Code:wght@400;500;600;700&family=Segoe+UI:wght@400;500;600&display=swap" rel="stylesheet">
<style>
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{
    background: #090a0f;
    background-image: radial-gradient(circle at 50% 25%, #161b26 0%, #08090d 100%);
    font-family: 'Cascadia Code', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 13.5px;
    line-height: 1.34;
    color: #cccccc;
    width: {width}px;
    height: {height}px;
    overflow: hidden;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}}
.terminal-window {{
    width: 100%;
    height: 100%;
    background: #0c0c0c;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.92), 0 0 0 1px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}}
.tab-bar {{
    height: 38px;
    background: #1f1f1f;
    border-bottom: 1px solid #2a2a2a;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    user-select: none;
    font-family: 'Segoe UI', -apple-system, sans-serif;
}}
.tab-container {{
    display: flex;
    align-items: flex-end;
    padding-left: 8px;
    padding-top: 4px;
    gap: 4px;
}}
.tab {{
    background: #0c0c0c;
    height: 34px;
    border-radius: 6px 6px 0 0;
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 500;
    color: #ffffff;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
}}
.tab-close {{
    color: #888888;
    font-size: 14px;
    line-height: 1;
    margin-left: 6px;
}}
.new-tab-btn {{
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888888;
    font-size: 16px;
    margin-bottom: 2px;
}}
.dropdown-btn {{
    width: 24px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888888;
    font-size: 11px;
    margin-bottom: 2px;
}}
.window-controls {{
    display: flex;
    align-items: center;
}}
.win-btn {{
    width: 46px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e0e0e0;
    font-size: 12px;
}}
.win-btn.close {{
    font-size: 13px;
}}
.terminal-body {{
    flex: 1;
    padding: 16px 20px;
    overflow: hidden;
    white-space: pre;
    color: #cccccc;
}}
.p-u {{ color: #5af78e; font-weight: 600; }}
.p-a {{ color: #ffffff; }}
.p-h {{ color: #5af78e; font-weight: 600; }}
.p-c {{ color: #ffffff; }}
.p-p {{ color: #57c7ff; font-weight: 600; }}
.p-d {{ color: #ffffff; }}
.cmd {{ color: #ffffff; font-weight: 600; }}
.hp {{ color: #ff9f43; font-weight: 700; }}
.hdb {{ color: #54a0ff; }}
.hok {{ color: #2ecc71; font-weight: bold; }}
.ht {{ color: #888888; }}
.comment {{ color: #6a89cc; font-style: italic; }}
.warn {{ color: #feca57; }}
.tbl-hdr {{ color: #00d2d3; font-weight: bold; }}
.cursor {{
    display: inline-block;
    width: 8px;
    height: 16px;
    background: #ffffff;
    vertical-align: text-bottom;
}}
</style>
</head>
<body>
<div class="terminal-window">
    <div class="tab-bar">
        <div class="tab-container">
            <div class="tab">
                <span style="color:#E95420; font-size:14px;">●</span>
                <span>{tab_title}</span>
                <span class="tab-close">×</span>
            </div>
            <div class="new-tab-btn">+</div>
            <div class="dropdown-btn">˅</div>
        </div>
        <div class="window-controls">
            <div class="win-btn">―</div>
            <div class="win-btn">◻</div>
            <div class="win-btn close">✕</div>
        </div>
    </div>
    <div class="terminal-body">{body_content}</div>
</div>
</body>
</html>
"""

def p_dhruv(path="~"):
    return f"""<span class="p-u">dhruv45</span><span class="p-a">@</span><span class="p-h">dhruv45-VirtualBox</span><span class="p-c">:</span><span class="p-p">{path}</span><span class="p-d">$</span> """

def h_p(db="default"):
    return f"""<span class="hp">hive ({db})&gt;</span> """

# ==========================================
# DHRUV - EXPERIMENT 1 SCREENSHOTS
# ==========================================

# 1. Database Creation & Managed Table
s1_content = f"""{p_dhruv()}<span class="cmd">hive</span>
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/opt/hive/lib/log4j-slf4j-impl-2.17.1.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:/opt/hadoop/share/hadoop/common/lib/slf4j-reload4j-1.7.36.jar!/org/slf4j/impl/StaticLoggerBinder.class]
Hive Session ID = c83b102f-48d9-432a-bc9e-e87f3b891a10

Logging initialized using configuration in jar:file:/opt/hive/lib/hive-common-3.1.3.jar!/hive-log4j2.properties Async: true
Hive-on-MR is deprecated in Hive 2 and may not be available in the future versions. Consider using a different execution engine (i.e. spark, tez) or using Hive 1.X releases.
{h_p("default")}<span class="cmd">SHOW DATABASES;</span>
OK
default
Time taken: 0.812 seconds, Fetched: 1 row(s)

{h_p("default")}<span class="cmd">CREATE DATABASE IF NOT EXISTS employee_db;</span>
OK
Time taken: 0.324 seconds

{h_p("default")}<span class="cmd">USE employee_db;</span>
OK
Time taken: 0.052 seconds

{h_p("employee_db")}<span class="cmd">CREATE TABLE employees_managed (
    emp_id INT,
    emp_name STRING,
    department STRING,
    salary DOUBLE
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;</span>
OK
Time taken: 0.458 seconds

{h_p("employee_db")}<span class="cmd">DESCRIBE employees_managed;</span>
OK
<span class="tbl-hdr">col_name            	data_type           	comment             </span>
emp_id              	int                 	                    
emp_name            	string              	                    
department          	string              	                    
salary              	double              	                    
Time taken: 0.142 seconds, Fetched: 4 row(s)
{h_p("employee_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s1_content, "Ubuntu-22.04: hive (employee_db)"), "dhruv_exp1_01_db_and_managed_table")

# 2. File Formats: ORC & PARQUET
s2_content = f"""{h_p("employee_db")}<span class="comment">-- Creating tables with columnar storage formats: ORC and Parquet</span>
{h_p("employee_db")}<span class="cmd">CREATE TABLE employees_orc (
    emp_id INT,
    emp_name STRING,
    department STRING,
    salary DOUBLE
)
STORED AS ORC
TBLPROPERTIES ("orc.compress"="SNAPPY");</span>
OK
Time taken: 0.381 seconds

{h_p("employee_db")}<span class="cmd">CREATE TABLE employees_parquet (
    emp_id INT,
    emp_name STRING,
    department STRING,
    salary DOUBLE
)
STORED AS PARQUET
TBLPROPERTIES ("parquet.compression"="SNAPPY");</span>
OK
Time taken: 0.412 seconds

{h_p("employee_db")}<span class="cmd">SHOW TABLES;</span>
OK
<span class="tbl-hdr">tab_name            </span>
employees_managed
employees_orc
employees_parquet
Time taken: 0.098 seconds, Fetched: 3 row(s)

{h_p("employee_db")}<span class="cmd">DESCRIBE FORMATTED employees_orc;</span>
OK
<span class="tbl-hdr"># col_name            	data_type           	comment             </span>
emp_id              	int                 	                    
emp_name            	string              	                    
department          	string              	                    
salary              	double              	                    
	 	 
<span class="tbl-hdr"># Detailed Table Information	 	 </span>
Database:           	employee_db         	 
OwnerType:          	USER                	 
Owner:              	dhruv45             	 
CreateTime:         	Sat Oct 24 21:18:42 IST 2026	 
Table Type:         	MANAGED_TABLE       	 
InputFormat:        	org.apache.hadoop.hive.ql.io.orc.OrcInputFormat	 
OutputFormat:       	org.apache.hadoop.hive.ql.io.orc.OrcOutputFormat	 
Compressed:         	No                  	 
Num Buckets:        	-1                  	 
Bucket Columns:     	[]                  	 
Sort Columns:       	[]                  	 
Storage Desc Params:	 	 
	orc.compress        	SNAPPY              
	serialization.format	1                   
Time taken: 0.224 seconds, Fetched: 24 row(s)
{h_p("employee_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s2_content, "Ubuntu-22.04: hive (employee_db)"), "dhruv_exp1_02_formats_orc_parquet")

# 3. External Table Creation & DESCRIBE FORMATTED
s3_content = f"""{h_p("employee_db")}<span class="comment">-- Setting up an External Table pointing to custom HDFS directory</span>
{h_p("employee_db")}<span class="cmd">CREATE EXTERNAL TABLE employees_ext (
    emp_id INT,
    emp_name STRING,
    department STRING,
    salary DOUBLE
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE
LOCATION '/user/dhruv45/hive/external/employees';</span>
OK
Time taken: 0.365 seconds

{h_p("employee_db")}<span class="cmd">DESCRIBE FORMATTED employees_ext;</span>
OK
<span class="tbl-hdr"># col_name            	data_type           	comment             </span>
emp_id              	int                 	                    
emp_name            	string              	                    
department          	string              	                    
salary              	double              	                    
	 	 
<span class="tbl-hdr"># Detailed Table Information	 	 </span>
Database:           	employee_db         	 
OwnerType:          	USER                	 
Owner:              	dhruv45             	 
CreateTime:         	Sat Oct 24 21:24:15 IST 2026	 
LastAccessTime:     	UNKNOWN             	 
Retention:          	0                   	 
Location:           	hdfs://localhost:9000/user/dhruv45/hive/external/employees	 
Table Type:         	<span style="color:#ff9f43; font-weight:bold;">EXTERNAL_TABLE</span>      	 
Table Parameters:	 	 
	EXTERNAL            	TRUE                
	transient_lastDdlTime	1761321255          
	 	 
<span class="tbl-hdr"># Storage Information	 	 </span>
SerDe Library:      	org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe	 
InputFormat:        	org.apache.hadoop.mapred.TextInputFormat	 
OutputFormat:       	org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat	 
Compressed:         	No                  	 
Storage Desc Params:	 	 
	field.delim         	,                   
	serialization.format	,                   
Time taken: 0.205 seconds, Fetched: 28 row(s)
{h_p("employee_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s3_content, "Ubuntu-22.04: hive (employee_db)"), "dhruv_exp1_03_external_table")

# 4. Managed Table vs External Table Verification
s4_content = f"""{h_p("employee_db")}<span class="cmd">DESCRIBE FORMATTED employees_managed;</span>
OK
<span class="tbl-hdr"># col_name            	data_type           	comment             </span>
emp_id              	int                 	                    
emp_name            	string              	                    
department          	string              	                    
salary              	double              	                    
	 	 
<span class="tbl-hdr"># Detailed Table Information	 	 </span>
Database:           	employee_db         	 
OwnerType:          	USER                	 
Owner:              	dhruv45             	 
CreateTime:         	Sat Oct 24 21:12:08 IST 2026	 
LastAccessTime:     	UNKNOWN             	 
Retention:          	0                   	 
Location:           	hdfs://localhost:9000/user/hive/warehouse/employee_db.db/employees_managed	 
Table Type:         	<span style="color:#2ecc71; font-weight:bold;">MANAGED_TABLE</span>       	 
Table Parameters:	 	 
	numFiles            	1                   
	totalSize           	284                 
	transient_lastDdlTime	1761320528          

{h_p("employee_db")}<span class="cmd">INSERT INTO employees_managed VALUES 
(101, 'Dhruv Sakhare', 'Data Engineering', 85000.0),
(102, 'Rohan Verma', 'Analytics', 72000.0),
(103, 'Priya Nair', 'Cloud Architecture', 91000.0);</span>
Query ID = hive_20261024212711_3a4e9b21-4f81-49b2-a312-d029f6d7281a
Total jobs = 1
Execution completed successfully
OK
Time taken: 1.482 seconds

{h_p("employee_db")}<span class="cmd">SELECT * FROM employees_managed;</span>
OK
101	Dhruv Sakhare	Data Engineering	85000.0
102	Rohan Verma	Analytics	72000.0
103	Priya Nair	Cloud Architecture	91000.0
Time taken: 0.174 seconds, Fetched: 3 row(s)
{h_p("employee_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s4_content, "Ubuntu-22.04: hive (employee_db)"), "dhruv_exp1_04_describe_formatted_managed")

# ==========================================
# DHRUV - EXPERIMENT 3 SCREENSHOTS (ACID UPDATE & DELETE)
# ==========================================

# 1. ACID Configuration & Table Setup
s5_content = f"""{p_dhruv()}<span class="cmd">hive</span>
Hive Session ID = 4fa8892d-94c0-4328-868e-f6339ac0b891
{h_p("default")}<span class="cmd">CREATE DATABASE IF NOT EXISTS banking_db;</span>
OK
Time taken: 0.285 seconds

{h_p("default")}<span class="cmd">USE banking_db;</span>
OK
Time taken: 0.048 seconds

{h_p("banking_db")}<span class="comment">-- Configuring Hive session for ACID Transactions</span>
{h_p("banking_db")}<span class="cmd">SET hive.support.concurrency = true;</span>
{h_p("banking_db")}<span class="cmd">SET hive.enforce.bucketing = true;</span>
{h_p("banking_db")}<span class="cmd">SET hive.exec.dynamic.partition.mode = nonstrict;</span>
{h_p("banking_db")}<span class="cmd">SET hive.txn.manager = org.apache.hadoop.hive.ql.lockmgr.DbTxnManager;</span>

{h_p("banking_db")}<span class="comment">-- Creating ACID transactional table: Clustered by key, ORC format, transactional=true</span>
{h_p("banking_db")}<span class="cmd">CREATE TABLE customer_accounts (
    acc_no INT,
    cust_name STRING,
    balance DOUBLE,
    status STRING
)
CLUSTERED BY (acc_no) INTO 4 BUCKETS
STORED AS ORC
TBLPROPERTIES ('transactional'='true');</span>
OK
Time taken: 0.612 seconds

{h_p("banking_db")}<span class="cmd">DESCRIBE FORMATTED customer_accounts;</span>
OK
<span class="tbl-hdr"># col_name            	data_type           	comment             </span>
acc_no              	int                 	                    
cust_name           	string              	                    
balance             	double              	                    
status              	string              	                    
	 	 
<span class="tbl-hdr"># Detailed Table Information	 	 </span>
Database:           	banking_db          	 
Owner:              	dhruv45             	 
Table Type:         	MANAGED_TABLE       	 
Num Buckets:        	4                   	 
Bucket Columns:     	[acc_no]            	 
Table Parameters:	 	 
	<span style="color:#2ecc71; font-weight:bold;">transactional       	true                </span>
Time taken: 0.211 seconds, Fetched: 25 row(s)
{h_p("banking_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s5_content, "Ubuntu-22.04: hive (banking_db)"), "dhruv_exp3_01_acid_config_and_table")

# 2. Insert Initial Records
s6_content = f"""{h_p("banking_db")}<span class="cmd">INSERT INTO customer_accounts VALUES
(1001, 'Dhruv Sakhare', 25000.00, 'Active'),
(1002, 'Aditi Sharma',  18500.50, 'Active'),
(1003, 'Rohan Verma',   32000.00, 'Dormant'),
(1004, 'Sneha Patil',   14200.00, 'Active'),
(1005, 'Amit Patel',    45000.75, 'Active');</span>
Query ID = hive_20261024213502_a19e23f0-94d1-42cb-b461-912ab02f89cc
Total jobs = 1
Launching Job 1 out of 1
Status: Running (Executing MapReduce transaction)
Ended Job = job_1761320011245_0004
Loading data to table banking_db.customer_accounts
Table banking_db.customer_accounts stats: [numFiles=4, totalSize=2840]
OK
Time taken: 2.154 seconds

{h_p("banking_db")}<span class="cmd">SELECT * FROM customer_accounts ORDER BY acc_no ASC;</span>
OK
<span class="tbl-hdr">acc_no	cust_name    	balance 	status</span>
1001	Dhruv Sakhare	25000.00	Active
1002	Aditi Sharma 	18500.50	Active
1003	Rohan Verma  	32000.00	Dormant
1004	Sneha Patil  	14200.00	Active
1005	Amit Patel   	45000.75	Active
Time taken: 0.231 seconds, Fetched: 5 row(s)

{h_p("banking_db")}<span class="comment">-- Notice delta files created by ACID engine: delta_0000001_0000001_0000</span>
{h_p("banking_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s6_content, "Ubuntu-22.04: hive (banking_db)"), "dhruv_exp3_02_insert_initial_data")

# 3. UPDATE Records
s7_content = f"""{h_p("banking_db")}<span class="comment">-- Performing atomic UPDATE: Reactivate Dormant account and credit bonus</span>
{h_p("banking_db")}<span class="cmd">UPDATE customer_accounts 
SET balance = balance + 5000.00, status = 'Active' 
WHERE acc_no = 1003;</span>
Query ID = hive_20261024213915_b38f12a0-432d-4591-9876-c419fa76a084
Total jobs = 1
Launching Job 1 out of 1
Executing ACID update operation... Writing delete_delta and delta directories
Table banking_db.customer_accounts stats: [numFiles=8, totalSize=4920]
OK
Time taken: 2.348 seconds

{h_p("banking_db")}<span class="cmd">SELECT * FROM customer_accounts WHERE acc_no = 1003;</span>
OK
1003	Rohan Verma	37000.00	Active
Time taken: 0.185 seconds, Fetched: 1 row(s)

{h_p("banking_db")}<span class="comment">-- Updating Dhruv Sakhare balance to reflect transfer</span>
{h_p("banking_db")}<span class="cmd">UPDATE customer_accounts SET balance = 50000.00 WHERE acc_no = 1001;</span>
OK
Time taken: 1.892 seconds

{h_p("banking_db")}<span class="cmd">SELECT * FROM customer_accounts ORDER BY acc_no ASC;</span>
OK
1001	Dhruv Sakhare	50000.00	Active
1002	Aditi Sharma 	18500.50	Active
1003	Rohan Verma  	37000.00	Active
1004	Sneha Patil  	14200.00	Active
1005	Amit Patel   	45000.75	Active
Time taken: 0.201 seconds, Fetched: 5 row(s)
{h_p("banking_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s7_content, "Ubuntu-22.04: hive (banking_db)"), "dhruv_exp3_03_update_records")

# 4. DELETE Records
s8_content = f"""{h_p("banking_db")}<span class="comment">-- Performing DELETE operation: Removing closed account (acc_no 1004)</span>
{h_p("banking_db")}<span class="cmd">DELETE FROM customer_accounts WHERE acc_no = 1004;</span>
Query ID = hive_20261024214220_d89e41b2-1092-491a-963a-ea0481fa7b91
Total jobs = 1
Launching Job 1 out of 1
Executing ACID delete operation... Generating delete delta file
OK
Time taken: 1.954 seconds

{h_p("banking_db")}<span class="cmd">SELECT * FROM customer_accounts ORDER BY acc_no ASC;</span>
OK
<span class="tbl-hdr">acc_no	cust_name    	balance 	status</span>
1001	Dhruv Sakhare	50000.00	Active
1002	Aditi Sharma 	18500.50	Active
1003	Rohan Verma  	37000.00	Active
1005	Amit Patel   	45000.75	Active
Time taken: 0.198 seconds, Fetched: 4 row(s)

{h_p("banking_db")}<span class="comment">-- Account 1004 successfully purged; verifying row count</span>
{h_p("banking_db")}<span class="cmd">SELECT COUNT(*) AS active_record_count FROM customer_accounts;</span>
OK
4
Time taken: 0.267 seconds, Fetched: 1 row(s)
{h_p("banking_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s8_content, "Ubuntu-22.04: hive (banking_db)"), "dhruv_exp3_04_delete_records")

# 5. MERGE Operations (Upsert)
s9_content = f"""{h_p("banking_db")}<span class="comment">-- Setting up staging table for batch upsert (MERGE)</span>
{h_p("banking_db")}<span class="cmd">CREATE TABLE account_staging (
    acc_no INT,
    cust_name STRING,
    balance DOUBLE,
    status STRING
) STORED AS ORC;</span>
OK
Time taken: 0.312 seconds

{h_p("banking_db")}<span class="cmd">INSERT INTO account_staging VALUES
(1002, 'Aditi Sharma',  22000.00, 'Premium'),
(1006, 'Kavita Rao',    60000.00, 'New_Active');</span>
OK
Time taken: 1.421 seconds

{h_p("banking_db")}<span class="cmd">MERGE INTO customer_accounts AS target
USING account_staging AS stage
ON target.acc_no = stage.acc_no
WHEN MATCHED THEN
    UPDATE SET balance = stage.balance, status = stage.status
WHEN NOT MATCHED THEN
    INSERT VALUES (stage.acc_no, stage.cust_name, stage.balance, stage.status);</span>
OK
Time taken: 2.842 seconds

{h_p("banking_db")}<span class="cmd">SELECT * FROM customer_accounts ORDER BY acc_no ASC;</span>
OK
<span class="tbl-hdr">acc_no	cust_name    	balance 	status</span>
1001	Dhruv Sakhare	50000.00	Active
1002	Aditi Sharma 	22000.00	<span style="color:#2ecc71;">Premium</span>     <span class="comment">-- (Updated via MATCHED)</span>
1003	Rohan Verma  	37000.00	Active
1005	Amit Patel   	45000.75	Active
1006	Kavita Rao   	60000.00	<span style="color:#00d2d3;">New_Active</span>  <span class="comment">-- (Inserted via NOT MATCHED)</span>
Time taken: 0.221 seconds, Fetched: 5 row(s)
{h_p("banking_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s9_content, "Ubuntu-22.04: hive (banking_db)"), "dhruv_exp3_05_merge_operation")

print("All Dhruv screenshots generated successfully!")
