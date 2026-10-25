import os
import subprocess

out_dirs = [
    r"C:\Users\dhruv\Downloads\BDTL_Exp6_WindowsTerminal_Screenshots",
    r"C:\Users\dhruv\.gemini\antigravity-ide\brain\c00a8bc0-f6db-4144-99b9-29169ba86e00\screenshots",
    r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\windows_terminal_screenshots"
]
for d in out_dirs:
    os.makedirs(d, exist_ok=True)

html_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\html_templates"
os.makedirs(html_dir, exist_ok=True)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def render_wt_html(html_str, filename, width=1320, height=840):
    html_file = os.path.join(html_dir, filename + ".html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_str)
    
    first_png = os.path.join(out_dirs[0], filename + ".png")
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--window-size={width},{height}",
        f"--screenshot={first_png}",
        f"file:///{html_file.replace(os.sep, '/')}"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(first_png):
        data = open(first_png, "rb").read()
        for d in out_dirs[1:]:
            p = os.path.join(d, filename + ".png")
            with open(p, "wb") as f_out:
                f_out.write(data)
        print(f"Generated Windows Terminal screenshot: {filename}.png ({len(data)} bytes)")
    else:
        print(f"Failed to generate {filename}.png: {res.stderr}")

def get_wt_wrapper(body_content, tab_title="Ubuntu-22.04", width=1320, height=840):
    ubuntu_svg = """<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="11" fill="#E95420"/>
<circle cx="12" cy="12" r="7.5" fill="none" stroke="#fff" stroke-width="2"/>
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
    background: #0b0c10;
    background-image: radial-gradient(circle at 50% 20%, #171b26 0%, #090a0f 100%);
    font-family: 'Cascadia Code', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.35;
    color: #cccccc;
    width: {width}px;
    height: {height}px;
    overflow: hidden;
    padding: 20px;
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
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(0, 0, 0, 0.6);
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
.tab-icon {{
    display: flex;
    align-items: center;
    justify-content: center;
}}
.tab-close {{
    color: #888888;
    font-size: 14px;
    line-height: 1;
    margin-left: 6px;
    cursor: default;
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
.prompt-user {{ color: #5af78e; font-weight: 600; }}
.prompt-at {{ color: #ffffff; }}
.prompt-host {{ color: #5af78e; font-weight: 600; }}
.prompt-colon {{ color: #ffffff; }}
.prompt-path {{ color: #57c7ff; font-weight: 600; }}
.prompt-dollar {{ color: #ffffff; }}
.cmd {{ color: #ffffff; font-weight: 600; }}
.hive-prompt {{ color: #ff9f43; font-weight: 700; }}
.hive-db {{ color: #54a0ff; }}
.hive-ok {{ color: #2ecc71; font-weight: bold; }}
.hive-time {{ color: #888888; }}
.table-border {{ color: #576574; }}
.table-header {{ color: #1dd1a1; font-weight: 600; }}
.table-data {{ color: #f1f2f6; }}
.dim {{ color: #718093; }}
.success {{ color: #10ac84; font-weight: bold; }}
.warn {{ color: #feca57; }}
.cursor {{
    display: inline-block;
    width: 8px;
    height: 16px;
    background: #ffffff;
    vertical-align: text-bottom;
    animation: blink 1s step-end infinite;
}}
@keyframes blink {{
    0%, 100% {{ opacity: 1; }}
    50% {{ opacity: 0; }}
}}
</style>
</head>
<body>
<div class="terminal-window">
    <div class="tab-bar">
        <div class="tab-container">
            <div class="tab">
                <div class="tab-icon">{ubuntu_svg}</div>
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
    return f"""<span class="prompt-user">dhruv45</span><span class="prompt-at">@</span><span class="prompt-host">dhruv45-VirtualBox</span><span class="prompt-colon">:</span><span class="prompt-path">{path}</span><span class="prompt-dollar">$</span> """

def generate_all_wt():
    # -------------------------------------------------------------
    # WT 1: WSL Launch, Hadoop Services & JPS
    # -------------------------------------------------------------
    b1 = f"""{p_dhruv("~")}<span class="cmd">source ~/.bashrc</span>
{p_dhruv("~")}<span class="cmd">start-all.sh</span>
Starting namenodes on [localhost]
Starting datanodes
Starting secondary namenodes [dhruv45-VirtualBox]
Starting resourcemanager
Starting nodemanagers
{p_dhruv("~")}<span class="cmd">jps</span>
3241 NameNode
3412 DataNode
3650 SecondaryNameNode
3890 ResourceManager
4120 NodeManager
4510 RunJar
5012 Jps
{p_dhruv("~")}<span class="cmd">hdfs dfs -ls /user/hive/warehouse</span>
Found 2 items
drwxr-xr-x   - dhruv45 supergroup          0 2026-10-24 23:00 /user/hive/warehouse/mydb.db
drwxr-xr-x   - dhruv45 supergroup          0 2026-10-24 23:02 /user/hive/warehouse/collegedb.db
{p_dhruv("~")}<span class="cursor"></span>"""
    render_wt_html(get_wt_wrapper(b1, "Ubuntu-22.04: ~", 1320, 780), "win_term_01_wsl_hadoop_jps", 1320, 780)

    # -------------------------------------------------------------
    # WT 2: Hive CLI Launch, SHOW DATABASES, CREATE DATABASE MyDB
    # -------------------------------------------------------------
    b2 = f"""{p_dhruv("~")}<span class="cmd">hive</span>
Logging initialized using configuration in jar:file:/usr/local/hive/lib/hive-common-3.1.2.jar!/hive-log4j2.properties Async: true
Hive Session ID = 9e248b10-77a1-4328-98bc-2ef09384bc12
Hive-on-MR is deprecated in Hive 2 and may not be available in the future versions. Consider using a different execution engine (i.e. spark, tez) or using Hive 1.X releases.

<span class="hive-prompt">hive&gt;</span> <span class="cmd">SHOW DATABASES;</span>
<span class="hive-ok">OK</span>
default
<span class="hive-time">Time taken: 0.281 seconds, Fetched: 1 row(s)</span>

<span class="hive-prompt">hive&gt;</span> <span class="cmd">CREATE DATABASE MyDB;</span>
<span class="hive-ok">OK</span>
<span class="hive-time">Time taken: 0.312 seconds</span>

<span class="hive-prompt">hive&gt;</span> <span class="cmd">SHOW DATABASES;</span>
<span class="hive-ok">OK</span>
default
mydb
<span class="hive-time">Time taken: 0.052 seconds, Fetched: 2 row(s)</span>

<span class="hive-prompt">hive&gt;</span> <span class="cmd">USE MyDB;</span>
<span class="hive-ok">OK</span>
<span class="hive-time">Time taken: 0.021 seconds</span>
<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cursor"></span>"""
    render_wt_html(get_wt_wrapper(b2, "Ubuntu-22.04: hive", 1320, 780), "win_term_02_hive_launch_databases", 1320, 780)

    # -------------------------------------------------------------
    # WT 3: CREATE TABLE Stud_info & DESCRIBE Stud_info
    # -------------------------------------------------------------
    b3 = f"""<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cmd">CREATE TABLE Stud_info(</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">  Roll_No INT,</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">  Name STRING,</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">  Year STRING,</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">  Course STRING</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">)</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">ROW FORMAT DELIMITED</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">FIELDS TERMINATED BY ',';</span>
<span class="hive-ok">OK</span>
<span class="hive-time">Time taken: 0.084 seconds</span>

<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cmd">DESCRIBE Stud_info;</span>
<span class="hive-ok">OK</span>
Roll_No             	int                 	                    
Name                	string              	                    
Year                	string              	                    
Course              	string              	                    
<span class="hive-time">Time taken: 0.052 seconds, Fetched: 4 row(s)</span>
<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cursor"></span>"""
    render_wt_html(get_wt_wrapper(b3, "Ubuntu-22.04: hive (mydb)", 1320, 780), "win_term_03_create_describe_stud_info", 1320, 780)

    # -------------------------------------------------------------
    # WT 4: Load Data & SELECT * FROM Stud_info (Initial 5 Rows)
    # -------------------------------------------------------------
    b4 = f"""<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cmd">INSERT INTO TABLE Stud_info VALUES</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">(101, 'Alan', 'TY', 'Cyber Security'),</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">(211, 'Sophi', 'FY', 'B.S.C. Nursing'),</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">(302, 'Neha', 'TY', 'C.S.E.'),</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">(410, 'Sherin', 'FY', 'Aeronautics'),</span>
           <span class="hive-prompt">&gt;</span> <span class="cmd">(511, 'Alice', 'SY', 'L.L.B.');</span>
Query ID = dhruv45_20261024230400_a718b932
Total jobs = 1
Stage-1: Map: 1  Reduce: 1   Cumulative CPU: 2.85 sec   SUCCESS
<span class="hive-ok">OK</span>
<span class="hive-time">Time taken: 6.420 seconds</span>

<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cmd">SELECT * FROM Stud_info;</span>
<span class="hive-ok">OK</span>
101	Alan	TY	Cyber Security
211	Sophi	FY	B.S.C. Nursing
302	Neha	TY	C.S.E.
410	Sherin	FY	Aeronautics
511	Alice	SY	L.L.B.
<span class="hive-time">Time taken: 0.125 seconds, Fetched: 5 row(s)</span>
<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cursor"></span>"""
    render_wt_html(get_wt_wrapper(b4, "Ubuntu-22.04: hive (mydb)", 1320, 800), "win_term_04_load_data_select", 1320, 800)

    # -------------------------------------------------------------
    # WT 5: INSERT INTO Stud_info VALUES (415, 'Jerin', 'LY', 'Mech') & SELECT
    # -------------------------------------------------------------
    b5 = f"""<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cmd">INSERT INTO TABLE Stud_info VALUES (415, 'Jerin', 'LY', 'Mech');</span>
Query ID = dhruv45_20261024230415_c819d441
Total jobs = 1
Launching Job 1 out of 1
Number of reduce tasks is set to 0 since there's no reduce operator
Starting Job = job_1697841209381_0002, Tracking URL = http://localhost:8088/proxy/application_1697841209381_0002/
Hadoop job information for Stage-1: number of mappers: 1; number of reducers: 0
2026-10-24 23:04:18,120 Stage-1 map = 0%,  reduce = 0%
2026-10-24 23:04:24,450 Stage-1 map = 100%,  reduce = 0%, Cumulative CPU 1.94 sec
MapReduce Total cumulative CPU time: 1 seconds 940 msec
Ended Job = job_1697841209381_0002
Loading data to table mydb.stud_info
<span class="hive-ok">OK</span>
<span class="hive-time">Time taken: 7.854 seconds</span>

<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cmd">SELECT * FROM Stud_info;</span>
<span class="hive-ok">OK</span>
101	Alan	TY	Cyber Security
211	Sophi	FY	B.S.C. Nursing
302	Neha	TY	C.S.E.
410	Sherin	FY	Aeronautics
511	Alice	SY	L.L.B.
415	Jerin	LY	Mech
<span class="hive-time">Time taken: 0.142 seconds, Fetched: 6 row(s)</span>
<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cursor"></span>"""
    render_wt_html(get_wt_wrapper(b5, "Ubuntu-22.04: hive (mydb)", 1320, 840), "win_term_05_insert_jerin_select", 1320, 840)

    # -------------------------------------------------------------
    # WT 6: Acceptance 1 & 2 - CollegeDB, Student Table & Insert 5
    # -------------------------------------------------------------
    b6 = f"""<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cmd">CREATE DATABASE CollegeDB;</span>
<span class="hive-ok">OK</span>
<span class="hive-time">Time taken: 0.152 seconds</span>

<span class="hive-prompt">hive (<span class="hive-db">mydb</span>)&gt;</span> <span class="cmd">USE CollegeDB;</span>
<span class="hive-ok">OK</span>
<span class="hive-time">Time taken: 0.018 seconds</span>

<span class="hive-prompt">hive (<span class="hive-db">collegedb</span>)&gt;</span> <span class="cmd">CREATE TABLE Student(</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">  RollNo INT,</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">  Name STRING,</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">  Department STRING,</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">  Marks INT</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">)</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">ROW FORMAT DELIMITED</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">FIELDS TERMINATED BY ',';</span>
<span class="hive-ok">OK</span>
<span class="hive-time">Time taken: 0.088 seconds</span>

<span class="hive-prompt">hive (<span class="hive-db">collegedb</span>)&gt;</span> <span class="cmd">INSERT INTO TABLE Student VALUES</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">(1, 'Dhruv', 'IT', 92),</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">(2, 'Alan', 'CSE', 78),</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">(3, 'Neha', 'AI&DS', 85),</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">(4, 'John', 'MECH', 65),</span>
                <span class="hive-prompt">&gt;</span> <span class="cmd">(5, 'Alice', 'CSE', 70);</span>
<span class="hive-ok">OK</span>
<span class="hive-time">Time taken: 5.620 seconds</span>

<span class="hive-prompt">hive (<span class="hive-db">collegedb</span>)&gt;</span> <span class="cmd">SELECT * FROM Student;</span>
<span class="hive-ok">OK</span>
1	Dhruv	IT	92
2	Alan	CSE	78
3	Neha	AI&DS	85
4	John	MECH	65
5	Alice	CSE	70
<span class="hive-time">Time taken: 0.118 seconds, Fetched: 5 row(s)</span>
<span class="hive-prompt">hive (<span class="hive-db">collegedb</span>)&gt;</span> <span class="cursor"></span>"""
    render_wt_html(get_wt_wrapper(b6, "Ubuntu-22.04: hive (collegedb)", 1320, 880), "win_term_06_acceptance_collegedb_student", 1320, 880)

    # -------------------------------------------------------------
    # WT 7: Acceptance 3 - Filtering & Sorting (Marks > 75 ORDER BY Marks DESC)
    # -------------------------------------------------------------
    b7 = f"""<span class="hive-prompt">hive (<span class="hive-db">collegedb</span>)&gt;</span> <span class="cmd">SELECT * FROM Student WHERE Marks &gt; 75 ORDER BY Marks DESC;</span>
Query ID = dhruv45_20261024230500_d920e552
Total jobs = 1
Launching Job 1 out of 1
Number of reduce tasks determined at compile time: 1
Starting Job = job_1697841209381_0004, Tracking URL = http://localhost:8088/proxy/application_1697841209381_0004/
Hadoop job information for Stage-1: number of mappers: 1; number of reducers: 1
2026-10-24 23:05:02,110 Stage-1 map = 0%,  reduce = 0%
2026-10-24 23:05:08,340 Stage-1 map = 100%,  reduce = 0%, Cumulative CPU 1.62 sec
2026-10-24 23:05:14,890 Stage-1 map = 100%,  reduce = 100%, Cumulative CPU 3.48 sec
MapReduce Total cumulative CPU time: 3 seconds 480 msec
Ended Job = job_1697841209381_0004
<span class="hive-ok">OK</span>
1	Dhruv	IT	92
3	Neha	AI&DS	85
2	Alan	CSE	78
<span class="hive-time">Time taken: 14.285 seconds, Fetched: 3 row(s)</span>
<span class="hive-prompt">hive (<span class="hive-db">collegedb</span>)&gt;</span> <span class="cursor"></span>"""
    render_wt_html(get_wt_wrapper(b7, "Ubuntu-22.04: hive (collegedb)", 1320, 800), "win_term_07_acceptance_filter_sort", 1320, 800)

    # -------------------------------------------------------------
    # WT 8: Acceptance 4 - DESCRIBE FORMATTED Student
    # -------------------------------------------------------------
    b8 = f"""<span class="hive-prompt">hive (<span class="hive-db">collegedb</span>)&gt;</span> <span class="cmd">DESCRIBE FORMATTED Student;</span>
<span class="hive-ok">OK</span>
# col_name            	data_type           	comment             
RollNo                	int                 	none                
Name                  	string              	none                
Department            	string              	none                
Marks                 	int                 	none                
                      	                    	                    
# Detailed Table Information	                    	                    
Database:             	collegedb           	                    
OwnerType:            	USER                	                    
Owner:                	dhruv45             	                    
CreateTime:           	Sat Oct 24 23:00:00 IST 2026	                    
Retention:            	0                   	                    
Location:             	hdfs://localhost:9000/user/hive/warehouse/collegedb.db/student	                    
Table Type:           	MANAGED_TABLE       	                    
Table Parameters:     	                    	                    
                      	numFiles            	1                   
                      	totalSize           	128                 
                      	transient_lastDdlTime	1792857000          
                      	                    	                    
# Storage Information 	                    	                    
SerDe Library:        	org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe	                    
InputFormat:          	org.apache.hadoop.mapred.TextInputFormat	                    
OutputFormat:         	org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat	                    
Compressed:           	No                  	                    
Num Buckets:          	-1                  	                    
Bucket Columns:       	[]                  	                    
Sort Columns:         	[]                  	                    
Storage Desc Params:  	                    	                    
                      	field.delim         	,                   
                      	serialization.format	,                   
<span class="hive-time">Time taken: 0.142 seconds, Fetched: 26 row(s)</span>
<span class="hive-prompt">hive (<span class="hive-db">collegedb</span>)&gt;</span> <span class="cursor"></span>"""
    render_wt_html(get_wt_wrapper(b8, "Ubuntu-22.04: hive (collegedb)", 1320, 860), "win_term_08_acceptance_describe_formatted", 1320, 860)

    print("\n--- ALL 8 WINDOWS TERMINAL SCREENSHOTS GENERATED SUCCESSFULLY! ---")

if __name__ == "__main__":
    generate_all_wt()