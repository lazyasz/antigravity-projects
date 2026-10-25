@echo off
title Hive Interactive CLI - dhruv45
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot
set HADOOP_HOME=%~dp0hadoop-3.3.6
set PATH=%HADOOP_HOME%\bin;%JAVA_HOME%\bin;%PATH%

"C:\Users\dhruv\AppData\Local\Programs\Python\Python314\python.exe" "%~dp0hive_cli.py"
pause
