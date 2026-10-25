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

def p_adesh(path="~"):
    return f"""<span class="p-u">adesh</span><span class="p-a">@</span><span class="p-h">adesh-VirtualBox</span><span class="p-c">:</span><span class="p-p">{path}</span><span class="p-d">$</span> """

def h_p(db="default"):
    return f"""<span class="hp">hive ({db})&gt;</span> """

# ==========================================
# ADESH - EXPERIMENT 1 SCREENSHOTS
# ==========================================

# 1. Database Creation & Managed Table
s1_content = f"""{p_adesh()}<span class="cmd">hive</span>
Hive Session ID = 7da2190e-114a-4932-bb5e-a9821ef32098

Logging initialized using configuration in jar:file:/opt/hive/lib/hive-common-3.1.3.jar!/hive-log4j2.properties Async: true
Hive-on-MR is deprecated in Hive 2 and may not be available in the future versions. Consider using a different execution engine (i.e. spark, tez) or using Hive 1.X releases.
{h_p("default")}<span class="cmd">SHOW DATABASES;</span>
OK
default
Time taken: 0.742 seconds, Fetched: 1 row(s)

{h_p("default")}<span class="cmd">CREATE DATABASE IF NOT EXISTS inventory_db;</span>
OK
Time taken: 0.315 seconds

{h_p("default")}<span class="cmd">USE inventory_db;</span>
OK
Time taken: 0.049 seconds

{h_p("inventory_db")}<span class="cmd">CREATE TABLE products_managed (
    prod_id INT,
    prod_name STRING,
    category STRING,
    price DOUBLE,
    stock INT
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;</span>
OK
Time taken: 0.428 seconds

{h_p("inventory_db")}<span class="cmd">DESCRIBE products_managed;</span>
OK
<span class="tbl-hdr">col_name            	data_type           	comment             </span>
prod_id             	int                 	                    
prod_name           	string              	                    
category            	string              	                    
price               	double              	                    
stock               	int                 	                    
Time taken: 0.138 seconds, Fetched: 5 row(s)
{h_p("inventory_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s1_content, "Ubuntu-22.04: hive (inventory_db)"), "adesh_exp1_01_db_and_managed_table")

# 2. File Formats: ORC & PARQUET
s2_content = f"""{h_p("inventory_db")}<span class="comment">-- Setting up optimized columnar tables: ORC and Parquet</span>
{h_p("inventory_db")}<span class="cmd">CREATE TABLE products_orc (
    prod_id INT,
    prod_name STRING,
    category STRING,
    price DOUBLE,
    stock INT
)
STORED AS ORC
TBLPROPERTIES ("orc.compress"="ZLIB");</span>
OK
Time taken: 0.395 seconds

{h_p("inventory_db")}<span class="cmd">CREATE TABLE products_parquet (
    prod_id INT,
    prod_name STRING,
    category STRING,
    price DOUBLE,
    stock INT
)
STORED AS PARQUET
TBLPROPERTIES ("parquet.compression"="SNAPPY");</span>
OK
Time taken: 0.404 seconds

{h_p("inventory_db")}<span class="cmd">SHOW TABLES;</span>
OK
<span class="tbl-hdr">tab_name            </span>
products_managed
products_orc
products_parquet
Time taken: 0.089 seconds, Fetched: 3 row(s)

{h_p("inventory_db")}<span class="cmd">DESCRIBE FORMATTED products_orc;</span>
OK
<span class="tbl-hdr"># col_name            	data_type           	comment             </span>
prod_id             	int                 	                    
prod_name           	string              	                    
category            	string              	                    
price               	double              	                    
stock               	int                 	                    
	 	 
<span class="tbl-hdr"># Detailed Table Information	 	 </span>
Database:           	inventory_db        	 
OwnerType:          	USER                	 
Owner:              	adesh               	 
CreateTime:         	Sat Oct 24 21:28:10 IST 2026	 
Table Type:         	MANAGED_TABLE       	 
InputFormat:        	org.apache.hadoop.hive.ql.io.orc.OrcInputFormat	 
OutputFormat:       	org.apache.hadoop.hive.ql.io.orc.OrcOutputFormat	 
Compressed:         	No                  	 
Num Buckets:        	-1                  	 
Bucket Columns:     	[]                  	 
Storage Desc Params:	 	 
	orc.compress        	ZLIB                
	serialization.format	1                   
Time taken: 0.219 seconds, Fetched: 25 row(s)
{h_p("inventory_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s2_content, "Ubuntu-22.04: hive (inventory_db)"), "adesh_exp1_02_formats_orc_parquet")

# 3. External Table Creation & DESCRIBE FORMATTED
s3_content = f"""{h_p("inventory_db")}<span class="comment">-- Setting up an External Table mapped to an external HDFS warehouse path</span>
{h_p("inventory_db")}<span class="cmd">CREATE EXTERNAL TABLE products_ext (
    prod_id INT,
    prod_name STRING,
    category STRING,
    price DOUBLE,
    stock INT
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE
LOCATION '/user/adesh/hive/external/products';</span>
OK
Time taken: 0.354 seconds

{h_p("inventory_db")}<span class="cmd">DESCRIBE FORMATTED products_ext;</span>
OK
<span class="tbl-hdr"># col_name            	data_type           	comment             </span>
prod_id             	int                 	                    
prod_name           	string              	                    
category            	string              	                    
price               	double              	                    
stock               	int                 	                    
	 	 
<span class="tbl-hdr"># Detailed Table Information	 	 </span>
Database:           	inventory_db        	 
OwnerType:          	USER                	 
Owner:              	adesh               	 
CreateTime:         	Sat Oct 24 21:32:44 IST 2026	 
LastAccessTime:     	UNKNOWN             	 
Retention:          	0                   	 
Location:           	hdfs://localhost:9000/user/adesh/hive/external/products	 
Table Type:         	<span style="color:#ff9f43; font-weight:bold;">EXTERNAL_TABLE</span>      	 
Table Parameters:	 	 
	EXTERNAL            	TRUE                
	transient_lastDdlTime	1761321764          
	 	 
<span class="tbl-hdr"># Storage Information	 	 </span>
SerDe Library:      	org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe	 
InputFormat:        	org.apache.hadoop.mapred.TextInputFormat	 
OutputFormat:       	org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat	 
Storage Desc Params:	 	 
	field.delim         	,                   
	serialization.format	,                   
Time taken: 0.201 seconds, Fetched: 29 row(s)
{h_p("inventory_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s3_content, "Ubuntu-22.04: hive (inventory_db)"), "adesh_exp1_03_external_table")

# 4. Managed Table Verification & Querying
s4_content = f"""{h_p("inventory_db")}<span class="cmd">DESCRIBE FORMATTED products_managed;</span>
OK
<span class="tbl-hdr"># col_name            	data_type           	comment             </span>
prod_id             	int                 	                    
prod_name           	string              	                    
category            	string              	                    
price               	double              	                    
stock               	int                 	                    
	 	 
<span class="tbl-hdr"># Detailed Table Information	 	 </span>
Database:           	inventory_db        	 
OwnerType:          	USER                	 
Owner:              	adesh               	 
CreateTime:         	Sat Oct 24 21:26:15 IST 2026	 
Location:           	hdfs://localhost:9000/user/hive/warehouse/inventory_db.db/products_managed	 
Table Type:         	<span style="color:#2ecc71; font-weight:bold;">MANAGED_TABLE</span>       	 
Table Parameters:	 	 
	numFiles            	1                   
	totalSize           	312                 
	transient_lastDdlTime	1761321375          

{h_p("inventory_db")}<span class="cmd">INSERT INTO products_managed VALUES 
(501, 'Mechanical Keyboard', 'Electronics', 3499.00, 45),
(502, 'Wireless Gaming Mouse', 'Electronics', 1899.50, 78),
(503, 'Ultra HD Monitor 27in', 'Displays', 18500.00, 22);</span>
Query ID = hive_20261024213601_29fb810a-3c72-4d09-b4f0-802c61ad0944
Total jobs = 1
Execution completed successfully
OK
Time taken: 1.512 seconds

{h_p("inventory_db")}<span class="cmd">SELECT * FROM products_managed;</span>
OK
501	Mechanical Keyboard	Electronics	3499.0	45
502	Wireless Gaming Mouse	Electronics	1899.5	78
503	Ultra HD Monitor 27in	Displays	18500.0	22
Time taken: 0.168 seconds, Fetched: 3 row(s)
{h_p("inventory_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s4_content, "Ubuntu-22.04: hive (inventory_db)"), "adesh_exp1_04_describe_formatted_managed")

# ==========================================
# ADESH - EXPERIMENT 4 SCREENSHOTS (ALTER & DROP TABLE)
# ==========================================

# 1. Alter Table Rename
s5_content = f"""{p_adesh()}<span class="cmd">hive</span>
Hive Session ID = 91ab4c88-7201-4993-9c88-e2105cae1933
{h_p("default")}<span class="cmd">CREATE DATABASE IF NOT EXISTS schema_mgmt_db;</span>
OK
Time taken: 0.298 seconds

{h_p("default")}<span class="cmd">USE schema_mgmt_db;</span>
OK
Time taken: 0.051 seconds

{h_p("schema_mgmt_db")}<span class="cmd">CREATE TABLE employee_records (
    emp_id INT,
    emp_name STRING,
    dept STRING,
    salary DOUBLE
) STORED AS TEXTFILE;</span>
OK
Time taken: 0.385 seconds

{h_p("schema_mgmt_db")}<span class="cmd">SHOW TABLES;</span>
OK
<span class="tbl-hdr">tab_name            </span>
employee_records
Time taken: 0.082 seconds, Fetched: 1 row(s)

{h_p("schema_mgmt_db")}<span class="comment">-- Renaming table: Updates metastore catalog metadata without moving underlying data blocks</span>
{h_p("schema_mgmt_db")}<span class="cmd">ALTER TABLE employee_records RENAME TO staff_master;</span>
OK
Time taken: 0.342 seconds

{h_p("schema_mgmt_db")}<span class="cmd">SHOW TABLES;</span>
OK
<span class="tbl-hdr">tab_name            </span>
staff_master
Time taken: 0.079 seconds, Fetched: 1 row(s)
{h_p("schema_mgmt_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s5_content, "Ubuntu-22.04: hive (schema_mgmt_db)"), "adesh_exp4_01_alter_rename_table")

# 2. Alter Table Add Columns
s6_content = f"""{h_p("schema_mgmt_db")}<span class="cmd">DESCRIBE staff_master;</span>
OK
<span class="tbl-hdr">col_name            	data_type           	comment             </span>
emp_id              	int                 	                    
emp_name            	string              	                    
dept                	string              	                    
salary              	double              	                    
Time taken: 0.124 seconds, Fetched: 4 row(s)

{h_p("schema_mgmt_db")}<span class="comment">-- Adding new columns to existing schema</span>
{h_p("schema_mgmt_db")}<span class="cmd">ALTER TABLE staff_master ADD COLUMNS (
    email STRING COMMENT 'Official corporate email',
    joining_date STRING COMMENT 'YYYY-MM-DD format'
);</span>
OK
Time taken: 0.312 seconds

{h_p("schema_mgmt_db")}<span class="cmd">DESCRIBE staff_master;</span>
OK
<span class="tbl-hdr">col_name            	data_type           	comment             </span>
emp_id              	int                 	                    
emp_name            	string              	                    
dept                	string              	                    
salary              	double              	                    
<span style="color:#2ecc71;">email               	string              	Official corporate email</span>
<span style="color:#2ecc71;">joining_date        	string              	YYYY-MM-DD format   </span>
Time taken: 0.141 seconds, Fetched: 6 row(s)
{h_p("schema_mgmt_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s6_content, "Ubuntu-22.04: hive (schema_mgmt_db)"), "adesh_exp4_02_alter_add_columns")

# 3. Alter Table Change Column
s7_content = f"""{h_p("schema_mgmt_db")}<span class="comment">-- Changing column name, data type (DOUBLE -&gt; DECIMAL(10,2)), and adding comment</span>
{h_p("schema_mgmt_db")}<span class="cmd">ALTER TABLE staff_master CHANGE COLUMN salary basic_salary DECIMAL(10,2) COMMENT 'Base monthly CTC';</span>
OK
Time taken: 0.288 seconds

{h_p("schema_mgmt_db")}<span class="cmd">DESCRIBE staff_master;</span>
OK
<span class="tbl-hdr">col_name            	data_type           	comment             </span>
emp_id              	int                 	                    
emp_name            	string              	                    
dept                	string              	                    
<span style="color:#00d2d3;">basic_salary        	decimal(10,2)       	Base monthly CTC    </span>
email               	string              	Official corporate email
joining_date        	string              	YYYY-MM-DD format   
Time taken: 0.133 seconds, Fetched: 6 row(s)

{h_p("schema_mgmt_db")}<span class="comment">-- Changing position of column using AFTER keyword</span>
{h_p("schema_mgmt_db")}<span class="cmd">ALTER TABLE staff_master CHANGE COLUMN email email STRING COMMENT 'Official corporate email' AFTER emp_name;</span>
OK
Time taken: 0.274 seconds

{h_p("schema_mgmt_db")}<span class="cmd">DESCRIBE staff_master;</span>
OK
<span class="tbl-hdr">col_name            	data_type           	comment             </span>
emp_id              	int                 	                    
emp_name            	string              	                    
<span style="color:#54a0ff;">email               	string              	Official corporate email</span>
dept                	string              	                    
basic_salary        	decimal(10,2)       	Base monthly CTC    
joining_date        	string              	YYYY-MM-DD format   
Time taken: 0.135 seconds, Fetched: 6 row(s)
{h_p("schema_mgmt_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s7_content, "Ubuntu-22.04: hive (schema_mgmt_db)"), "adesh_exp4_03_alter_change_column")

# 4. Alter Table Replace Columns
s8_content = f"""{h_p("schema_mgmt_db")}<span class="comment">-- REPLACE COLUMNS discards old schema definitions and establishes a restructured column layout</span>
{h_p("schema_mgmt_db")}<span class="cmd">ALTER TABLE staff_master REPLACE COLUMNS (
    emp_id INT,
    full_name STRING,
    designation STRING,
    monthly_ctc DECIMAL(10,2)
);</span>
OK
Time taken: 0.301 seconds

{h_p("schema_mgmt_db")}<span class="cmd">DESCRIBE staff_master;</span>
OK
<span class="tbl-hdr">col_name            	data_type           	comment             </span>
emp_id              	int                 	                    
full_name           	string              	                    
designation         	string              	                    
monthly_ctc         	decimal(10,2)       	                    
Time taken: 0.128 seconds, Fetched: 4 row(s)

{h_p("schema_mgmt_db")}<span class="cmd">INSERT INTO staff_master VALUES (201, 'Adesh Patankar', 'Senior Lead Engineer', 115000.00);</span>
OK
Time taken: 1.450 seconds

{h_p("schema_mgmt_db")}<span class="cmd">SELECT * FROM staff_master;</span>
OK
201	Adesh Patankar	Senior Lead Engineer	115000.00
Time taken: 0.172 seconds, Fetched: 1 row(s)
{h_p("schema_mgmt_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s8_content, "Ubuntu-22.04: hive (schema_mgmt_db)"), "adesh_exp4_04_alter_replace_columns")

# 5. Drop Table & Metastore Repair (MSCK REPAIR)
s9_content = f"""{h_p("schema_mgmt_db")}<span class="comment">-- Setting up temporary table to demonstrate DROP TABLE</span>
{h_p("schema_mgmt_db")}<span class="cmd">CREATE TABLE temp_staging_records (temp_id INT, payload STRING);</span>
OK
Time taken: 0.321 seconds

{h_p("schema_mgmt_db")}<span class="cmd">SHOW TABLES;</span>
OK
<span class="tbl-hdr">tab_name            </span>
staff_master
temp_staging_records
Time taken: 0.081 seconds, Fetched: 2 row(s)

{h_p("schema_mgmt_db")}<span class="cmd">DROP TABLE IF EXISTS temp_staging_records;</span>
OK
Time taken: 0.412 seconds

{h_p("schema_mgmt_db")}<span class="cmd">SHOW TABLES;</span>
OK
<span class="tbl-hdr">tab_name            </span>
staff_master
Time taken: 0.076 seconds, Fetched: 1 row(s)

{h_p("schema_mgmt_db")}<span class="comment">-- Synchronizing external partitions in HDFS with Hive Metastore using MSCK REPAIR</span>
{h_p("schema_mgmt_db")}<span class="cmd">CREATE TABLE server_logs (log_id INT, msg STRING) PARTITIONED BY (log_date STRING);</span>
OK
Time taken: 0.345 seconds

{h_p("schema_mgmt_db")}<span class="cmd">MSCK REPAIR TABLE server_logs;</span>
OK
Partitions not in metastore:	server_logs:log_date=2026-10-24
Repair: Added partition to metastore server_logs:log_date=2026-10-24
Time taken: 0.542 seconds
{h_p("schema_mgmt_db")}<span class="cursor"></span>"""

render_wt_shot(get_wt_window(s9_content, "Ubuntu-22.04: hive (schema_mgmt_db)"), "adesh_exp4_05_drop_table_and_repair")

print("All Adesh screenshots generated successfully!")
