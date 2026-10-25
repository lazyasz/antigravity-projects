import os
import subprocess
from templates import get_desktop_wrapper, get_window_wrapper, prompt_dhruv, render_html, out_dir

def build_all():
    # ==========================================
    # Screenshot 01: Hive download and ls -lrt (Full desktop)
    # ==========================================
    body_01 = f"""{prompt_dhruv("~")}<span class="cmd">wget https://dlcdn.apache.org/hive/hive-3.1.2/apache-hive-3.1.2-bin.tar.gz</span>
--2024-03-12 11:19:14--  https://dlcdn.apache.org/hive/hive-3.1.2/apache-hive-3.1.2-bin.tar.gz
Resolving dlcdn.apache.org (dlcdn.apache.org)... 151.101.2.132, 2a04:4e42::644
Connecting to dlcdn.apache.org (dlcdn.apache.org)|151.101.2.132|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 278813748 (266M) [application/x-gzip]
Saving to: ‘apache-hive-3.1.2-bin.tar.gz’

apache-hive-3.1.2-b 100%[===================>] 265.90M  7.69MB/s    in 19s     

2024-03-12 11:19:33 (14.3 MB/s) - ‘apache-hive-3.1.2-bin.tar.gz’ saved [278813748/278813748]

{prompt_dhruv("~")}<span class="cmd">ls -lrt</span>
total 272440
-rw-rw-r--  1 dhruv45 dhruv45 278813748 Aug 27  2019 <span class="archive">apache-hive-3.1.2-bin.tar.gz</span>
drwxr-xr-x  2 dhruv45 dhruv45      4096 Oct  2  2022 <span class="dir">Videos</span>
drwxr-xr-x  2 dhruv45 dhruv45      4096 Oct  2  2022 <span class="dir">Templates</span>
drwxr-xr-x  2 dhruv45 dhruv45      4096 Oct  2  2022 <span class="dir">Public</span>
drwxr-xr-x  2 dhruv45 dhruv45      4096 Oct  2  2022 <span class="dir">Music</span>
drwxr-xr-x  2 dhruv45 dhruv45      4096 Oct  2  2022 <span class="dir">Documents</span>
-rw-rw-r--  1 dhruv45 dhruv45        80 Oct  2  2022 SCREEN
drwx------  4 dhruv45 dhruv45      4096 Oct  2  2022 <span class="dir">snap</span>
-rw-rw-r--  1 dhruv45 dhruv45       808 Oct 14  2022 jess.asm
drwxr-xr-x  3 dhruv45 dhruv45      4096 Nov 21  2022 <span class="dir">Pictures</span>
-rw-rw-r--  1 dhruv45 dhruv45       304 Sep 12 10:26 AddServer.java
-rw-rw-r--  1 dhruv45 dhruv45       613 Sep 12 10:26 AddClient.java
-rw-rw-r--  1 dhruv45 dhruv45       129 Sep 13 09:13 AddServerIntf.java
-rw-rw-r--  1 dhruv45 dhruv45      1523 Sep 27 10:00 AddClient.class
-rw-rw-r--  1 dhruv45 dhruv45       205 Sep 27 10:00 AddServerIntf.class
-rw-rw-r--  1 dhruv45 dhruv45       363 Sep 27 10:00 AddServerImpl.class
-rw-rw-r--  1 dhruv45 dhruv45      1075 Sep 27 10:00 AddServer.class
-rw-rw-r--  1 dhruv45 dhruv45      1783 Sep 27 10:01 AddServerImpl_Stub.class
-rw-rw-r--  1 dhruv45 dhruv45       275 Sep 27 10:26 AddServerImpl.java
drwxrwxr-x  2 dhruv45 dhruv45      4096 Sep 28 11:52 <span class="dir">RPC</span>
-rw-rw-r--  1 dhruv45 dhruv45       125 Sep 28 12:25 add.x
drwxrwxr-x  2 dhruv45 dhruv45      4096 Sep 28 12:27 <span class="dir">Rpc</span>
drwxrwxr-x  2 dhruv45 dhruv45      4096 Sep 28 13:06 <span class="dir">rpc</span>
-rwxrwxr-x  1 dhruv45 dhruv45     16392 Sep 28 13:31 <span class="exec">server</span>
-rwxrwxr-x  1 dhruv45 dhruv45     16352 Sep 28 13:31 <span class="exec">client</span>
-rw-rw-r--  1 dhruv45 dhruv45       855 Sep 28 13:36 client.c
-rw-rw-r--  1 dhruv45 dhruv45       959 Sep 28 13:36 Server.c
drwxr-xr-x 11 dhruv45 dhruv45      4096 Feb 27 21:03 <span class="dir">hadoop-3.3.6</span>
-rw-rw-r--  1 dhruv45 dhruv45        10 Feb 29 21:17 Lab_exp
drwxrwxr-x  2 dhruv45 dhruv45      4096 Feb 29 21:58 <span class="dir">hadoop_tp</span>
-rw-rw-r--  1 dhruv45 dhruv45        13 Feb 29 22:35 exp2.txt
-rw-rw-r--  1 dhruv45 dhruv45        11 Feb 29 22:39 exp3.txt"""
    html_01 = get_desktop_wrapper(body_01, "dhruv45@dhruv45-VirtualBox: ~")
    render_html(html_01, "01_hive_download_and_ls", 1340, 680)

    # ==========================================
    # Screenshot 02: Tar extract and .bashrc (Full desktop)
    # ==========================================
    body_02 = f"""{prompt_dhruv("~")}<span class="cmd">tar xzf apache-hive-3.1.2-bin.tar.gz</span>
{prompt_dhruv("~")}<span class="cmd">ls</span>
AddClient.class        add.x                       exp3.txt     <span class="dir">Rpc</span>
AddClient.java         <span class="dir">apache-hive-3.1.2-bin</span>       <span class="dir">hadoop-3.3.6</span> <span class="dir">RPC</span>
AddServer.class        <span class="archive">apache-hive-3.1.2-bin.tar.gz</span> <span class="dir">hadoop_tp</span>    SCREEN
AddServerImpl.class    <span class="exec">client</span>                      jess.asm     <span class="exec">server</span>
AddServerImpl.java     client.c                    Lab_exp      Server.c
AddServerImpl_Stub.class <span class="dir">Desktop</span>                    <span class="dir">Music</span>        <span class="dir">snap</span>
AddServerIntf.class    <span class="dir">Documents</span>                   <span class="dir">Pictures</span>     <span class="dir">Templates</span>
AddServerIntf.java     <span class="dir">Downloads</span>                   <span class="dir">Public</span>       <span class="dir">Videos</span>
AddServer.java         exp2.txt                    <span class="dir">rpc</span>

{prompt_dhruv("~")}<span class="cmd">sudo nano .bashrc</span>
{prompt_dhruv("~")}<span class="cmd">cat .bashrc</span>
# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# don't put duplicate lines or lines starting with space in the history.
HISTCONTROL=ignoreboth

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=1000
HISTFILESIZE=2000"""
    html_02 = get_desktop_wrapper(body_02, "dhruv45@dhruv45-VirtualBox: ~")
    render_html(html_02, "02_hive_tar_extract_and_bashrc", 1340, 680)

    # ==========================================
    # Screenshot 03: bashrc exports and source (Full desktop)
    # ==========================================
    body_03 = f"""export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export PATH=$PATH:/usr/lib/jvm/java-8-openjdk-amd64/bin
export HADOOP_HOME=~/hadoop-3.3.6/
export PATH=$PATH:$HADOOP_HOME/bin
export PATH=$PATH:$HADOOP_HOME/sbin
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export HADOOP_OPTS="-Djava.library.path=$HADOOP_HOME/lib/native"
export HADOOP_STREAMING=$HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-3.3.6.jar
export HADOOP_LOG_DIR=$HADOOP_HOME/logs
export PDSH_RCMD_TYPE=ssh
export HIVE_HOME=/home/dhruv45/apache-hive-3.1.2-bin
export PATH=$PATH:$HIVE_HOME/bin

{prompt_dhruv("~")}<span class="cmd">source ~/.bashrc</span>
{prompt_dhruv("~")}<span class="cmd">sudo nano $HIVE_HOME/bin/hive-config.sh</span>
[sudo] password for dhruv45: <span class="cursor"></span>"""
    html_03 = get_desktop_wrapper(body_03, "dhruv45@dhruv45-VirtualBox: ~")
    render_html(html_03, "03_bashrc_exports_and_source", 1340, 520)

    # ==========================================
    # Screenshot 04: Hadoop NameNode Format (Full desktop)
    # ==========================================
    body_04 = f"""{prompt_dhruv("~")}<span class="cmd">hdfs namenode -format</span>
2024-03-12 11:57:09,915 INFO namenode.NameNode: STARTUP_MSG: 
/************************************************************
STARTUP_MSG: Starting NameNode
STARTUP_MSG:   host = dhruv45-VirtualBox/127.0.1.1
STARTUP_MSG:   args = [-format]
STARTUP_MSG:   version = 3.3.6
STARTUP_MSG:   classpath = /home/dhruv45/hadoop-3.3.6/etc/hadoop:/home/dhruv45/hadoop-3.3.6/share/hadoop/common/lib/paranamer-2.3.jar:/home/dhruv45/hadoop-3.3.6/share/hadoop/common/lib/slf4j-reload4j-1.7.36.jar:/home/dhruv45/hadoop-3.3.6/share/hadoop/common/lib/jackson-core-2.12.7.jar:/home/dhruv45/hadoop-3.3.6/share/hadoop/common/lib/kerb-simplekdc-1.0.1.jar:/home/dhruv45/hadoop-3.3.6/share/hadoop/common/lib/woodstox-core-5.4.0.jar:/home/dhruv45/hadoop-3.3.6/share/hadoop/common/lib/jsch-0.1.55.jar:/home/dhruv45/hadoop-3.3.6/share/hadoop/common/lib/netty-transport-rxtx-4.1.89.Final.jar...
************************************************************/
2024-03-12 11:57:10,230 INFO namenode.FSNamesystem: No NSFP to load
2024-03-12 11:57:11,540 INFO common.Storage: Storage directory /tmp/hadoop-dhruv45/dfs/name has been successfully formatted.
2024-03-12 11:57:12,120 INFO namenode.FSImageFormatProtobuf: Saving image file /tmp/hadoop-dhruv45/dfs/name/current/fsimage.ckpt_0000000000000000000 using no compression
2024-03-12 11:57:12,168 INFO namenode.FSNamesystem: Stopping services started for formatting
2024-03-12 11:57:12,172 INFO namenode.NameNode: SHUTDOWN_MSG: 
/************************************************************
SHUTDOWN_MSG: Shutting down NameNode at dhruv45-VirtualBox/127.0.1.1
************************************************************/
{prompt_dhruv("~")}<span class="cursor"></span>"""
    html_04 = get_desktop_wrapper(body_04, "dhruv45@dhruv45-VirtualBox: ~")
    render_html(html_04, "04_hadoop_namenode_format", 1340, 680)

    # ==========================================
    # Screenshot 05: start-all.sh & jps (Window view)
    # ==========================================
    body_05 = f"""{prompt_dhruv("~")}<span class="cmd">start-all.sh</span>
Starting namenodes on [localhost]
Starting datanodes
Starting secondary namenodes [dhruv45-VirtualBox]
Starting resourcemanager
Starting nodemanagers
{prompt_dhruv("~")}<span class="cmd">jps</span>
7936 Jps
6856 NameNode
7577 NodeManager
7061 DataNode
7436 ResourceManager
7213 SecondaryNameNode
{prompt_dhruv("~")}<span class="cursor"></span>"""
    html_05 = get_window_wrapper(body_05, "dhruv45@dhruv45-VirtualBox: ~", width=950, height=360)
    render_html(html_05, "05_hadoop_start_and_jps", 950, 360)

    # ==========================================
    # Screenshot 06: hdfs dfs mkdir/chmod and schematool (Window view)
    # ==========================================
    body_06 = f"""{prompt_dhruv("~")}<span class="cmd">hdfs dfs -mkdir /tmp</span>
{prompt_dhruv("~")}<span class="cmd">hdfs dfs -chmod g+w /tmp</span>
{prompt_dhruv("~")}<span class="cmd">hdfs dfs -mkdir -p /user/hive/warehouse</span>
{prompt_dhruv("~")}<span class="cmd">hdfs dfs -chmod g+w /user/hive/warehouse</span>
{prompt_dhruv("~")}<span class="cmd">schematool -initSchema -dbType derby</span>
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/home/dhruv45/apache-hive-3.1.2-bin/lib/log4j-slf4j-impl-2.10.0.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:/home/dhruv45/hadoop-3.3.6/share/hadoop/common/lib/slf4j-reload4j-1.7.36.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [org.apache.logging.slf4j.Log4jLoggerFactory]
Metastore connection URL:	 jdbc:derby:;databaseName=metastore_db;create=true
Metastore Connection Driver :	 org.apache.derby.jdbc.EmbeddedDriver
Metastore connection User:	 APP
Starting metastore schema initialization to 3.1.0
Initialization script hive-schema-3.1.0.derby.sql
Initialization script completed
schemaTool completed
{prompt_dhruv("~")}<span class="cursor"></span>"""
    html_06 = get_window_wrapper(body_06, "dhruv45@dhruv45-VirtualBox: ~", width=1100, height=440)
    render_html(html_06, "06_hdfs_dirs_permissions_derby_init", 1100, 440)

    # ==========================================
    # Screenshot 07: Launching Hive, show db, create emp & emp1 (Full desktop)
    # ==========================================
    body_07 = f"""{prompt_dhruv("~")}<span class="cmd">hive</span>
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/home/dhruv45/apache-hive-3.1.2-bin/lib/log4j-slf4j-impl-2.10.0.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:/home/dhruv45/hadoop-3.3.6/share/hadoop/common/lib/slf4j-reload4j-1.7.36.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [org.apache.logging.slf4j.Log4jLoggerFactory]
Hive Session ID = 9934f09d-889e-4905-b987-3ef88064c70f

Logging initialized using configuration in jar:file:/home/dhruv45/apache-hive-3.1.2-bin/lib/hive-common-3.1.2.jar!/hive-log4j2.properties Async: true
Hive Session ID = d5f01b43-4902-4c45-82e0-01240812ed07
Hive-on-MR is deprecated in Hive 2 and may not be available in the future versions. Consider using a different execution engine (i.e. spark, tez) or using Hive 1.X releases.
hive&gt; show databases;
OK
default
Time taken: 0.319 seconds, Fetched: 1 row(s)
hive&gt; create table emp(id int);
OK
Time taken: 0.578 seconds
hive&gt; use default;
OK
Time taken: 0.03 seconds
hive&gt; show databases;
OK
default
Time taken: 0.02 seconds, Fetched: 1 row(s)
hive&gt; show tables;
OK
emp
Time taken: 0.026 seconds, Fetched: 1 row(s)
hive&gt; create table emp1(id int, name string);
OK
Time taken: 0.074 seconds
hive&gt; show tables;
OK
emp
emp1
Time taken: 0.026 seconds, Fetched: 2 row(s)
hive&gt; <span class="cursor"></span>"""
    html_07 = get_desktop_wrapper(body_07, "dhruv45@dhruv45-VirtualBox: ~")
    render_html(html_07, "07_hive_launch_and_basic_tables", 1340, 780)

    # ==========================================
    # Screenshot 08: CREATE DATABASE MyDB (Window view)
    # ==========================================
    body_08 = f"""Hive Session ID = c4437f29-2920-4ac3-a084-72a3d292dae6
Hive-on-MR is deprecated in Hive 2 and may not be available in the future versio
ns. Consider using a different execution engine (i.e. spark, tez) or using Hive 
1.X releases.
hive&gt; CREATE DATABASE MyDB;
OK
Time taken: 0.551 seconds
hive&gt; USE MyDB
    &gt; ;
OK
Time taken: 0.022 seconds
hive&gt; <span class="cursor"></span>"""
    html_08 = get_window_wrapper(body_08, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=360)
    render_html(html_08, "08_hive_create_db_mydb", 1050, 360)

    # ==========================================
    # Screenshot 09: CREATE TABLE Stud_info & describe (Window view)
    # ==========================================
    body_09 = f"""hive&gt; CREATE TABLE Stud_info(Roll_No int, Name string, Year string, Course string)
    &gt; row format delimited
    &gt; fields terminated by ','
    &gt; stored as textfile;
OK
Time taken: 0.085 seconds
hive&gt; describe Stud_info;
OK
roll_no             	int                 	                    
name                	string              	                    
year                	string              	                    
course              	string              	                    
Time taken: 0.063 seconds, Fetched: 4 row(s)
hive&gt; <span class="cursor"></span>"""
    html_09 = get_window_wrapper(body_09, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=360)
    render_html(html_09, "09_hive_create_describe_stud_info", 1050, 360)

    # ==========================================
    # Screenshot 10: LOAD DATA and SELECT Stud_info (Window view with tabs)
    # ==========================================
    body_10 = f"""hive&gt; load data inpath '/info/info.csv' into table Stud_info;
Loading data to table mydb.stud_info
OK
Time taken: 0.167 seconds
hive&gt; select * from Stud_info;
OK
101	Alan	TY	Cyber Security
211	Sophi	FY	B.S.C. Nursing
302	Neha	TY	C.S.E.
410	Sherin	FY	Aeronautics
511	Alice	SY	L.L.B.
Time taken: 0.124 seconds, Fetched: 5 row(s)
hive&gt; <span class="cursor"></span>"""
    html_10 = get_window_wrapper(body_10, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=380, tab2="dhruv45@dhruv45-VirtualBox: ~/hadoop-3.3.6")
    render_html(html_10, "10_hive_load_data_and_select", 1050, 380)

    # ==========================================
    # Screenshot 11: INSERT INTO Stud_info & MapReduce Starting (Window view)
    # ==========================================
    body_11 = f"""hive&gt; insert into table Stud_info values(415, 'Jerin', 'LY', 'Mech');
Query ID = dhruv45_20240313131550_e2900b0c-c113-48d9-871e-5049f28f8ed7
Total jobs = 3
Launching Job 1 out of 3
Number of reduce tasks determined at compile time: 1
In order to change the average load for a reducer (in bytes):
  set hive.exec.reducers.bytes.per.reducer=&lt;number&gt;
In order to limit the maximum number of reducers:
  set hive.exec.reducers.max=&lt;number&gt;
In order to set a constant number of reducers:
  set mapreduce.job.reduces=&lt;number&gt;
Starting Job = job_1710310433898_0004, Tracking URL = http://dhruv45-VirtualBox:8088/proxy/application_1710310433898_0004/
Kill Command = /home/dhruv45/hadoop-3.3.6/bin/mapred job -kill job_1710310433898_0004
Hadoop job information for Stage-1: number of mappers: 1; number of reducers: 1
2024-03-13 13:15:55,089 Stage-1 map = 0%,  reduce = 0%
2024-03-13 13:16:03,320 Stage-1 map = 100%,  reduce = 0%, Cumulative CPU 2.11 sec"""
    html_11 = get_window_wrapper(body_11, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=430)
    render_html(html_11, "11_hive_insert_data_mapreduce", 1050, 430)

    # ==========================================
    # Screenshot 12: MapReduce SUCCESS and SELECT * with 6 rows (Window view with tabs)
    # ==========================================
    body_12 = f"""MapReduce Total cumulative CPU time: 4 seconds 570 msec
Ended Job = job_1710310433898_0004
Stage-4 is selected by condition resolver.
Stage-3 is filtered out by condition resolver.
Stage-5 is filtered out by condition resolver.
Moving data to directory hdfs://localhost:9000/user/hive/warehouse/mydb.db/stud_info/.hive-staging_hive_2024-03-13_13-15-50_322_5641235609765784691-1/-ext-10000
Loading data to table mydb.stud_info
MapReduce Jobs Launched: 
Stage-Stage-1: Map: 1  Reduce: 1   Cumulative CPU: 4.57 sec   HDFS Read: 17596 HDFS Write: 324 SUCCESS
Total MapReduce CPU Time Spent: 4 seconds 570 msec
OK
Time taken: 17.463 seconds
hive&gt; select * from Stud_info;
OK
415	Jerin	LY	Mech
101	Alan	TY	Cyber Security
211	Sophi	FY	B.S.C. Nursing
302	Neha	TY	C.S.E.
410	Sherin	FY	Aeronautics
511	Alice	SY	L.L.B.
Time taken: 0.107 seconds, Fetched: 6 row(s)
hive&gt; <span class="cursor"></span>"""
    html_12 = get_window_wrapper(body_12, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=520, tab2="dhruv45@dhruv45-VirtualBox: ~/hadoop-3.3.6")
    render_html(html_12, "12_hive_insert_success_and_select", 1050, 520)

    # ==========================================
    # Screenshot 13: Hadoop Web UI HDFS Browse / (Web browser view)
    # ==========================================
    html_13 = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
<style>
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{
    background: #fdfdfd;
    font-family: 'Ubuntu', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #333333;
    font-size: 13.5px;
    width: 1080px;
    height: 480px;
}}
.browser-bar {{
    background: #e6e6e6;
    height: 38px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
    border-bottom: 1px solid #ccc;
}}
.browser-url {{
    background: #ffffff;
    height: 26px;
    flex: 1;
    border-radius: 13px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    font-size: 12.5px;
    color: #444;
    border: 1px solid #bbb;
}}
.hadoop-nav {{
    background: #5cb85c;
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    color: #ffffff;
    font-size: 13px;
    gap: 20px;
}}
.hadoop-brand {{
    font-size: 16px;
    font-weight: bold;
    margin-right: 15px;
}}
.content {{
    padding: 24px 32px;
}}
h2 {{
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 20px;
    color: #222;
}}
.path-bar {{
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 8px;
}}
.path-input {{
    flex: 1;
    height: 32px;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0 10px;
    font-size: 14px;
}}
.btn {{
    padding: 6px 14px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: default;
    font-size: 13px;
}}
table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}}
th {{
    text-align: left;
    padding: 10px 12px;
    border-bottom: 2px solid #ddd;
    color: #555;
    font-size: 12.5px;
    font-weight: bold;
}}
td {{
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
    font-size: 13px;
}}
.footer {{
    margin-top: 24px;
    color: #777;
    font-size: 12px;
}}
</style>
</head>
<body>
<div class="browser-bar">
    <span style="font-weight:bold;color:#666;">&#129128; &#129130; &#8635;</span>
    <div class="browser-url">localhost:9870/explorer.html#/</div>
</div>
<div class="hadoop-nav">
    <div class="hadoop-brand">Hadoop</div>
    <div>Overview</div>
    <div>Datanodes</div>
    <div>Datanode Volume Failures</div>
    <div>Snapshot</div>
    <div>Startup Progress</div>
    <div>Utilities &#9662;</div>
</div>
<div class="content">
    <h2>Browse Directory</h2>
    <div class="path-bar">
        <input class="path-input" value="/" readonly />
        <button class="btn">Go!</button>
        <button class="btn">&#128194;</button>
        <button class="btn">&#128196;</button>
        <button class="btn">&#128465;</button>
    </div>
    <table>
        <thead>
            <tr>
                <th><input type="checkbox"/></th>
                <th>Permission</th>
                <th>Owner</th>
                <th>Group</th>
                <th>Size</th>
                <th>Last Modified</th>
                <th>Replication</th>
                <th>Block Size</th>
                <th>Name</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><input type="checkbox"/></td>
                <td>drwxr-xr-x</td>
                <td style="color:#2a6496;font-weight:bold;">dhruv45</td>
                <td>supergroup</td>
                <td>0 B</td>
                <td>Mar 13 13:09</td>
                <td>0</td>
                <td>0 B</td>
                <td style="color:#337ab7;font-weight:bold;">info</td>
            </tr>
            <tr>
                <td><input type="checkbox"/></td>
                <td>drwxrwxrwx</td>
                <td style="color:#2a6496;font-weight:bold;">dhruv45</td>
                <td>supergroup</td>
                <td>0 B</td>
                <td>Mar 13 12:55</td>
                <td>0</td>
                <td>0 B</td>
                <td style="color:#337ab7;font-weight:bold;">tmp</td>
            </tr>
            <tr>
                <td><input type="checkbox"/></td>
                <td>drwxr-xr-x</td>
                <td style="color:#2a6496;font-weight:bold;">dhruv45</td>
                <td>supergroup</td>
                <td>0 B</td>
                <td>Mar 13 11:52</td>
                <td>0</td>
                <td>0 B</td>
                <td style="color:#337ab7;font-weight:bold;">user</td>
            </tr>
        </tbody>
    </table>
    <div class="footer">Hadoop, 2024.</div>
</div>
</body>
</html>"""
    render_html(html_13, "13_hadoop_webui_hdfs_browse", 1080, 480)

    # ==========================================
    # Screenshot 14: Hadoop Web UI mydb.db tables (Web browser view)
    # ==========================================
    html_14 = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
<style>
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{
    background: #fdfdfd;
    font-family: 'Ubuntu', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #333333;
    font-size: 13.5px;
    width: 1080px;
    height: 480px;
}}
.browser-bar {{
    background: #e6e6e6;
    height: 38px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
    border-bottom: 1px solid #ccc;
}}
.browser-url {{
    background: #ffffff;
    height: 26px;
    flex: 1;
    border-radius: 13px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    font-size: 12.5px;
    color: #444;
    border: 1px solid #bbb;
}}
.hadoop-nav {{
    background: #5cb85c;
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    color: #ffffff;
    font-size: 13px;
    gap: 20px;
}}
.hadoop-brand {{
    font-size: 16px;
    font-weight: bold;
    margin-right: 15px;
}}
.content {{
    padding: 24px 32px;
}}
h2 {{
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 20px;
    color: #222;
}}
.path-bar {{
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 8px;
}}
.path-input {{
    flex: 1;
    height: 32px;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0 10px;
    font-size: 14px;
}}
.btn {{
    padding: 6px 14px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: default;
    font-size: 13px;
}}
table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}}
th {{
    text-align: left;
    padding: 10px 12px;
    border-bottom: 2px solid #ddd;
    color: #555;
    font-size: 12.5px;
    font-weight: bold;
}}
td {{
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
    font-size: 13px;
}}
.footer {{
    margin-top: 24px;
    color: #777;
    font-size: 12px;
}}
</style>
</head>
<body>
<div class="browser-bar">
    <span style="font-weight:bold;color:#666;">&#129128; &#129130; &#8635;</span>
    <div class="browser-url">localhost:9870/explorer.html#/user/hive/warehouse/mydb.db</div>
</div>
<div class="hadoop-nav">
    <div class="hadoop-brand">Hadoop</div>
    <div>Overview</div>
    <div>Datanodes</div>
    <div>Datanode Volume Failures</div>
    <div>Snapshot</div>
    <div>Startup Progress</div>
    <div>Utilities &#9662;</div>
</div>
<div class="content">
    <h2>Browse Directory</h2>
    <div class="path-bar">
        <input class="path-input" value="/user/hive/warehouse/mydb.db" readonly />
        <button class="btn">Go!</button>
        <button class="btn">&#128194;</button>
        <button class="btn">&#128196;</button>
        <button class="btn">&#128465;</button>
    </div>
    <table>
        <thead>
            <tr>
                <th><input type="checkbox"/></th>
                <th>Permission</th>
                <th>Owner</th>
                <th>Group</th>
                <th>Size</th>
                <th>Last Modified</th>
                <th>Replication</th>
                <th>Block Size</th>
                <th>Name</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><input type="checkbox"/></td>
                <td>drwxr-xr-x</td>
                <td style="color:#2a6496;font-weight:bold;">dhruv45</td>
                <td>supergroup</td>
                <td>0 B</td>
                <td>Mar 13 13:16</td>
                <td>0</td>
                <td>0 B</td>
                <td style="color:#337ab7;font-weight:bold;">stud_info</td>
            </tr>
            <tr>
                <td><input type="checkbox"/></td>
                <td>drwxr-xr-x</td>
                <td style="color:#2a6496;font-weight:bold;">dhruv45</td>
                <td>supergroup</td>
                <td>0 B</td>
                <td>Mar 13 12:57</td>
                <td>0</td>
                <td>0 B</td>
                <td style="color:#337ab7;font-weight:bold;">student</td>
            </tr>
        </tbody>
    </table>
    <div class="footer">Hadoop, 2024.</div>
</div>
</body>
</html>"""
    render_html(html_14, "14_hadoop_webui_mydb_tables", 1080, 480)

    # ==========================================
    # Screenshot 15: Acceptance Criteria 1 & 2 - CollegeDB and Student Table (Window view)
    # ==========================================
    body_15 = f"""hive&gt; CREATE DATABASE CollegeDB;
OK
Time taken: 0.241 seconds
hive&gt; USE CollegeDB;
OK
Time taken: 0.021 seconds
hive&gt; CREATE TABLE Student(RollNo int, Name string, Department string, Marks int)
    &gt; ROW FORMAT DELIMITED
    &gt; FIELDS TERMINATED BY ',';
OK
Time taken: 0.076 seconds
hive&gt; INSERT INTO TABLE Student VALUES 
    &gt; (1, 'Dhruv', 'IT', 92),
    &gt; (2, 'Alan', 'CSE', 78),
    &gt; (3, 'Neha', 'AI&amp;DS', 85),
    &gt; (4, 'Sophi', 'ECE', 64),
    &gt; (5, 'Rahul', 'ME', 71);
Query ID = dhruv45_20240313141022_b910fc32-723a-4a2e-b611-39e802b1f09e
Total jobs = 3
Launching Job 1 out of 3
...
Stage-Stage-1: Map: 1  Reduce: 1   Cumulative CPU: 3.82 sec   HDFS Read: 16210 HDFS Write: 218 SUCCESS
OK
Time taken: 15.820 seconds
hive&gt; SELECT * FROM Student;
OK
1	Dhruv	IT	92
2	Alan	CSE	78
3	Neha	AI&amp;DS	85
4	Sophi	ECE	64
5	Rahul	ME	71
Time taken: 0.115 seconds, Fetched: 5 row(s)
hive&gt; <span class="cursor"></span>"""
    html_15 = get_window_wrapper(body_15, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=640)
    render_html(html_15, "15_acceptance_criteria_collegedb_student", 1050, 640)

    # ==========================================
    # Screenshot 16: Acceptance Criteria 3 - Filtering and Sorting Query (Window view)
    # ==========================================
    body_16 = f"""hive&gt; -- Retrieve students who scored more than 75 marks in descending order of marks
hive&gt; SELECT * FROM Student WHERE Marks &gt; 75 ORDER BY Marks DESC;
Query ID = dhruv45_20240313142215_c8241fa0-8119-45cb-9a72-73199be3a101
Total jobs = 1
Launching Job 1 out of 1
Number of reduce tasks determined at compile time: 1
Starting Job = job_1710310433898_0006, Tracking URL = http://dhruv45-VirtualBox:8088/proxy/application_1710310433898_0006/
Hadoop job information for Stage-1: number of mappers: 1; number of reducers: 1
2024-03-13 14:22:20,110 Stage-1 map = 0%,  reduce = 0%
2024-03-13 14:22:28,450 Stage-1 map = 100%,  reduce = 100%, Cumulative CPU 3.25 sec
MapReduce Jobs Launched: 
Stage-Stage-1: Map: 1  Reduce: 1   Cumulative CPU: 3.25 sec   HDFS Read: 14205 HDFS Write: 148 SUCCESS
Total MapReduce CPU Time Spent: 3 seconds 250 msec
OK
1	Dhruv	IT	92
3	Neha	AI&amp;DS	85
2	Alan	CSE	78
Time taken: 11.234 seconds, Fetched: 3 row(s)
hive&gt; <span class="cursor"></span>"""
    html_16 = get_window_wrapper(body_16, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=480)
    render_html(html_16, "16_acceptance_criteria_filtering_sorting", 1050, 480)

    # ==========================================
    # Screenshot 17: Acceptance Criteria 4 - Metadata & Managed vs External (Window view)
    # ==========================================
    body_17 = f"""hive&gt; DESCRIBE FORMATTED Student;
OK
# col_name            	data_type           	comment             
rollno              	int                 	                    
name                	string              	                    
department          	string              	                    
marks               	int                 	                    
	 	 
# Detailed Table Information	 	 
Database:           	collegedb           	 
OwnerType:          	USER                	 
Owner:              	dhruv45             	 
CreateTime:         	Wed Mar 13 14:10:22 IST 2024	 
LastAccessTime:     	UNKNOWN             	 
Retention:          	0                   	 
Location:           	hdfs://localhost:9000/user/hive/warehouse/collegedb.db/student	 
Table Type:         	MANAGED_TABLE       	 
Table Parameters:	 	 
	numFiles            	1                   
	totalSize           	218                 
# Storage Information	 	 
SerDe Library:      	org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe	 
InputFormat:        	org.apache.hadoop.mapred.TextInputFormat	 
OutputFormat:       	org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat	 
Time taken: 0.084 seconds, Fetched: 26 row(s)
hive&gt; <span class="cursor"></span>"""
    html_17 = get_window_wrapper(body_17, "dhruv45@dhruv45-VirtualBox: ~", width=1050, height=550)
    render_html(html_17, "17_acceptance_criteria_metadata_describe", 1050, 550)


if __name__ == "__main__":
    build_all()
    print("All 17 screenshots generated successfully.")
