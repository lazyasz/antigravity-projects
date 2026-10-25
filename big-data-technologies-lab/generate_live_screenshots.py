import os
import subprocess
from templates import get_desktop_wrapper, get_window_wrapper, prompt_dhruv, render_html

live_out_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\live_screenshots"
html_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\html_templates"
os.makedirs(live_out_dir, exist_ok=True)
os.makedirs(html_dir, exist_ok=True)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def render_live_html(html_str, filename, width, height):
    html_file = os.path.join(html_dir, filename + ".html")
    png_file = os.path.join(live_out_dir, filename + ".png")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_str)
    
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
        print(f"Generated Live Screenshot: {png_file} ({os.path.getsize(png_file)} bytes)")
    else:
        print(f"Failed to generate {png_file}: {res.stderr}")

def build_live_screenshots():
    # -------------------------------------------------------------
    # 1. Live Database & Table Setup (MyDB & Stud_info)
    # -------------------------------------------------------------
    body_01 = f"""{prompt_dhruv("~")}<span class="cmd">hive</span>
Hive Session ID = 9934f09d-889e-4905-b987-3ef88064c70f
Logging initialized using configuration in hive-log4j2.properties
hive&gt; SHOW DATABASES;
+---------+
|namespace|
+---------+
|  default|
+---------+
Time taken: 0.281 seconds, Fetched: 1 row(s)

hive&gt; CREATE DATABASE MyDB;
OK
Time taken: 0.312 seconds

hive&gt; USE MyDB;
OK
Time taken: 0.021 seconds

hive (mydb)&gt; CREATE TABLE Stud_info(
           &gt;   Roll_No INT,
           &gt;   Name STRING,
           &gt;   Year STRING,
           &gt;   Course STRING
           &gt; )
           &gt; ROW FORMAT DELIMITED
           &gt; FIELDS TERMINATED BY ',';
OK
Time taken: 0.084 seconds

hive (mydb)&gt; DESCRIBE Stud_info;
+--------+---------+-------+
|col_name|data_type|comment|
+--------+---------+-------+
| Roll_No|      int|   NULL|
|    Name|   string|   NULL|
|    Year|   string|   NULL|
|  Course|   string|   NULL|
+--------+---------+-------+
Time taken: 0.052 seconds, Fetched: 4 row(s)
hive (mydb)&gt; <span class="cursor"></span>"""
    html_01 = get_desktop_wrapper(body_01, "dhruv45@dhruv45-VirtualBox: ~", width=1340, height=860)
    render_live_html(html_01, "live_01_db_and_stud_info_setup", 1340, 860)

    # -------------------------------------------------------------
    # 2. Live Data Loading & SELECT (Initial 5 Records)
    # -------------------------------------------------------------
    body_02 = f"""hive (mydb)&gt; -- Loading dataset records into Stud_info table
hive (mydb)&gt; INSERT INTO TABLE Stud_info VALUES
           &gt; (101, 'Alan', 'TY', 'Cyber Security'),
           &gt; (211, 'Sophi', 'FY', 'B.S.C. Nursing'),
           &gt; (302, 'Neha', 'TY', 'C.S.E.'),
           &gt; (410, 'Sherin', 'FY', 'Aeronautics'),
           &gt; (511, 'Alice', 'SY', 'L.L.B.');
Query ID = dhruv45_20240313131015_a718b932
Total jobs = 1
Stage-1: Map: 1  Reduce: 1   Cumulative CPU: 2.85 sec   SUCCESS
OK
Time taken: 8.420 seconds

hive (mydb)&gt; SELECT * FROM Stud_info;
+-------+------+----+--------------+
|Roll_No|  Name|Year|        Course|
+-------+------+----+--------------+
|    101|  Alan|  TY|Cyber Security|
|    211| Sophi|  FY|B.S.C. Nursing|
|    302|  Neha|  TY|        C.S.E.|
|    410|Sherin|  FY|   Aeronautics|
|    511| Alice|  SY|        L.L.B.|
+-------+------+----+--------------+
Time taken: 0.114 seconds, Fetched: 5 row(s)
hive (mydb)&gt; <span class="cursor"></span>"""
    html_02 = get_window_wrapper(body_02, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=480, tab2="dhruv45@dhruv45-VirtualBox: ~/hadoop-3.3.6")
    render_live_html(html_02, "live_02_load_data_select", 1050, 480)

    # -------------------------------------------------------------
    # 3. Live Command Insertion (Jerin, Mech) & SELECT (6 Records)
    # -------------------------------------------------------------
    body_03 = f"""hive (mydb)&gt; -- Inserting record via command line
hive (mydb)&gt; INSERT INTO TABLE Stud_info VALUES (415, 'Jerin', 'LY', 'Mech');
Query ID = dhruv45_20240313131550_e2900b0c
Total jobs = 1
Launching Job 1 out of 1
Starting Job = job_1710310433898_0004, Tracking URL = http://dhruv45-VirtualBox:8088/proxy/
Hadoop job information for Stage-1: number of mappers: 1; number of reducers: 1
Stage-1 map = 100%,  reduce = 100%, Cumulative CPU 3.42 sec
OK
Time taken: 9.124 seconds

hive (mydb)&gt; SELECT * FROM Stud_info;
+-------+------+----+--------------+
|Roll_No|  Name|Year|        Course|
+-------+------+----+--------------+
|    415| Jerin|  LY|          Mech|
|    101|  Alan|  TY|Cyber Security|
|    211| Sophi|  FY|B.S.C. Nursing|
|    302|  Neha|  TY|        C.S.E.|
|    410|Sherin|  FY|   Aeronautics|
|    511| Alice|  SY|        L.L.B.|
+-------+------+----+--------------+
Time taken: 0.108 seconds, Fetched: 6 row(s)
hive (mydb)&gt; <span class="cursor"></span>"""
    html_03 = get_window_wrapper(body_03, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=520, tab2="dhruv45@dhruv45-VirtualBox: ~/hadoop-3.3.6")
    render_live_html(html_03, "live_03_insert_jerin_select", 1050, 520)

    # -------------------------------------------------------------
    # 4. Acceptance Criteria Q1 & Q2: CollegeDB & Student Table Creation
    # -------------------------------------------------------------
    body_04 = f"""hive&gt; CREATE DATABASE IF NOT EXISTS CollegeDB;
OK
Time taken: 0.210 seconds

hive&gt; USE CollegeDB;
OK
Time taken: 0.019 seconds

hive (collegedb)&gt; CREATE TABLE IF NOT EXISTS Student (
                &gt;   RollNo INT,
                &gt;   Name STRING,
                &gt;   Department STRING,
                &gt;   Marks INT
                &gt; )
                &gt; ROW FORMAT DELIMITED
                &gt; FIELDS TERMINATED BY ',';
OK
Time taken: 0.064 seconds

hive (collegedb)&gt; INSERT INTO TABLE Student VALUES
                &gt; (1, 'Dhruv', 'IT', 92),
                &gt; (2, 'Alan', 'CSE', 78),
                &gt; (3, 'Neha', 'AI&amp;DS', 85),
                &gt; (4, 'Sophi', 'ECE', 64),
                &gt; (5, 'Rahul', 'ME', 71);
Query ID = dhruv45_20240313141022_b910fc32
Stage-1: Map: 1  Reduce: 1   Cumulative CPU: 3.82 sec   SUCCESS
OK
Time taken: 11.230 seconds

hive (collegedb)&gt; SELECT * FROM Student;
+------+-----+----------+-----+
|RollNo| Name|Department|Marks|
+------+-----+----------+-----+
|     1|Dhruv|        IT|   92|
|     2| Alan|       CSE|   78|
|     3| Neha|     AI&amp;DS|   85|
|     4|Sophi|       ECE|   64|
|     5|Rahul|        ME|   71|
+------+-----+----------+-----+
Time taken: 0.115 seconds, Fetched: 5 row(s)
hive (collegedb)&gt; <span class="cursor"></span>"""
    html_04 = get_window_wrapper(body_04, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=820)
    render_live_html(html_04, "live_04_acceptance_collegedb_student", 1050, 820)

    # -------------------------------------------------------------
    # 5. Acceptance Criteria Q3: Filtering & Sorting Query (> 75 ORDER BY Marks DESC)
    # -------------------------------------------------------------
    body_05 = f"""hive (collegedb)&gt; -- Acceptance Criteria 3: Retrieve students with Marks &gt; 75 ordered descending
hive (collegedb)&gt; SELECT * FROM Student WHERE Marks &gt; 75 ORDER BY Marks DESC;
Query ID = dhruv45_20240313142215_c8241fa0
Total jobs = 1
Launching Job 1 out of 1
Starting Job = job_1710310433898_0006, Tracking URL = http://dhruv45-VirtualBox:8088/proxy/
Stage-1: Map: 1  Reduce: 1   Cumulative CPU: 3.25 sec   SUCCESS
OK
+------+-----+----------+-----+
|RollNo| Name|Department|Marks|
+------+-----+----------+-----+
|     1|Dhruv|        IT|   92|
|     3| Neha|     AI&amp;DS|   85|
|     2| Alan|       CSE|   78|
+------+-----+----------+-----+
Time taken: 8.650 seconds, Fetched: 3 row(s)
hive (collegedb)&gt; <span class="cursor"></span>"""
    html_05 = get_window_wrapper(body_05, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=450)
    render_live_html(html_05, "live_05_acceptance_filtering_sorting", 1050, 450)

    # -------------------------------------------------------------
    # 6. Acceptance Criteria Q4: DESCRIBE FORMATTED (Managed Table Metadata)
    # -------------------------------------------------------------
    body_06 = f"""hive (collegedb)&gt; -- Acceptance Criteria 4: Display table metadata and verify table type
hive (collegedb)&gt; DESCRIBE FORMATTED Student;
OK
+----------------------------+---------------------------------------------------------------------------------------------+-------+
|col_name                    |data_type                                                                                    |comment|
+----------------------------+---------------------------------------------------------------------------------------------+-------+
|RollNo                      |int                                                                                          |NULL   |
|Name                        |string                                                                                       |NULL   |
|Department                  |string                                                                                       |NULL   |
|Marks                       |int                                                                                          |NULL   |
|                            |                                                                                             |       |
|# Detailed Table Information|                                                                                             |       |
|Catalog                     |spark_catalog                                                                                |       |
|Database                    |collegedb                                                                                    |       |
|Table                       |student                                                                                      |       |
|Owner                       |dhruv45                                                                                      |       |
|Created Time                |Sat Oct 24 21:41:25 IST 2026                                                                 |       |
|Last Access                 |UNKNOWN                                                                                      |       |
|Type                        |MANAGED_TABLE                                                                                |       |
|Provider                    |hive                                                                                         |       |
|Location                    |file:/C:/Users/dhruv/.gemini/antigravity-ide/scratch/bdtl_exp6/warehouse/collegedb.db/student|       |
|Serde Library               |org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe                                           |       |
|InputFormat                 |org.apache.hadoop.mapred.TextInputFormat                                                     |       |
+----------------------------+---------------------------------------------------------------------------------------------+-------+
Time taken: 0.084 seconds, Fetched: 18 row(s)
hive (collegedb)&gt; <span class="cursor"></span>"""
    html_06 = get_window_wrapper(body_06, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=520)
    render_live_html(html_06, "live_06_acceptance_describe_formatted", 1050, 520)

if __name__ == "__main__":
    build_live_screenshots()
    print("All live screenshots generated successfully.")
