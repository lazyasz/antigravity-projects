import os
import sys
import pymupdf

src_pdf = r"C:\Users\dhruv\Downloads\BDTL - Experiment No 6.pdf"
out_pdf1 = r"C:\Users\dhruv\Downloads\BDTL - Experiment No 6 - Dhruv Sakhare (13).pdf"
out_pdf2 = r"C:\Users\dhruv\.gemini\antigravity-ide\brain\c00a8bc0-f6db-4144-99b9-29169ba86e00\BDTL_Experiment_No_6_Dhruv_Sakhare.pdf"

img_base = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\results_screenshots"
wt_base = r"C:\Users\dhruv\Downloads\BDTL_Exp6_WindowsTerminal_Screenshots"

doc = pymupdf.open(src_pdf)
print(f"Loaded original PDF: {len(doc)} pages")

# -------------------------------------------------------------
# 1. Page 1: Student Submission Header Card
# -------------------------------------------------------------
page1 = doc[0]
rect_card = pymupdf.Rect(65, 18, 530, 62)
page1.draw_rect(rect_card, color=(0.01, 0.52, 0.78), fill=(0.94, 0.96, 0.98), width=1.2)

# Insert Text
page1.insert_text((78, 34), "STUDENT SUBMISSION DETAILS | BIG DATA TECHNOLOGIES LAB (BDT LAB: 06)", 
                  fontsize=8, fontname="helv", color=(0.01, 0.41, 0.63))
page1.insert_text((78, 50), "Name: Dhruv Sakhare    |    Roll No: 13    |    Enrollment No: ADT24SOCB0369", 
                  fontsize=10.5, fontname="helv", color=(0.06, 0.09, 0.16))

# -------------------------------------------------------------
# 2. Footers on all pages
# -------------------------------------------------------------
for p_idx, page in enumerate(doc):
    footer_text = f"BDT Lab: Exp 6 (Apache Hive)  |  Dhruv Sakhare  |  Roll No: 13  |  Enrollment: ADT24SOCB0369  |  Page {p_idx+1}"
    page.insert_text((70, page.rect.height - 20), footer_text, fontsize=7.5, fontname="helv", color=(0.45, 0.45, 0.45))

# -------------------------------------------------------------
# 3. Replace Screenshots on Pages 15 to 20
# -------------------------------------------------------------
def replace_img(page, rect, img_path):
    if os.path.exists(img_path):
        pad_rect = pymupdf.Rect(rect.x0 - 2, rect.y0 - 2, rect.x1 + 2, rect.y1 + 2)
        page.draw_rect(pad_rect, color=(1, 1, 1), fill=(1, 1, 1))
        page.insert_image(rect, filename=img_path)
        return True
    else:
        print(f"Missing image: {img_path}")
        return False

# Page 15
p15 = doc[14]
replace_img(p15, pymupdf.Rect(79.48, 124.09, 560.23, 360.33), os.path.join(img_base, "01_hive_download_and_ls.png"))
replace_img(p15, pymupdf.Rect(79.20, 364.68, 560.16, 445.08), os.path.join(img_base, "02_hive_tar_extract_and_bashrc.png"))
replace_img(p15, pymupdf.Rect(79.20, 449.40, 560.16, 646.91), os.path.join(img_base, "03_bashrc_exports_and_source.png"))

# Page 16: Hadoop Namenode format & unified start-all/jps in Windows Terminal
p16 = doc[15]
replace_img(p16, pymupdf.Rect(79.20, 78.16, 560.16, 208.72), os.path.join(img_base, "04_hadoop_namenode_format.png"))
# White out entire bottom section (260 to 635) and put full-size WT screenshot
p16.draw_rect(pymupdf.Rect(70, 260, 568, 635), color=(1, 1, 1), fill=(1, 1, 1))
p16.insert_image(pymupdf.Rect(75, 265, 565, 625), filename=os.path.join(wt_base, "win_term_01_wsl_hadoop_jps.png"))

# Page 17
p17 = doc[16]
replace_img(p17, pymupdf.Rect(77.68, 120.08, 444.64, 198.30), os.path.join(img_base, "06_hdfs_dirs_permissions_derby_init.png"))
replace_img(p17, pymupdf.Rect(77.68, 262.85, 560.32, 453.39), os.path.join(img_base, "06_hdfs_dirs_permissions_derby_init.png"))
replace_img(p17, pymupdf.Rect(77.68, 549.64, 560.32, 705.86), os.path.join(wt_base, "win_term_02_hive_launch_databases.png"))

# Page 18: Stud_info table create, describe and load data
p18 = doc[17]
# Clean out first box
p18.draw_rect(pymupdf.Rect(70, 92, 568, 255), color=(1, 1, 1), fill=(1, 1, 1))
p18.insert_image(pymupdf.Rect(75, 95, 565, 252), filename=os.path.join(wt_base, "win_term_03_create_describe_stud_info.png"))

# Clean out second box completely (both 101 and 102)
p18.draw_rect(pymupdf.Rect(70, 302, 568, 518), color=(1, 1, 1), fill=(1, 1, 1))
p18.insert_image(pymupdf.Rect(75, 305, 565, 515), filename=os.path.join(wt_base, "win_term_04_load_data_select.png"))

# Page 19
p19 = doc[18]
replace_img(p19, pymupdf.Rect(78.0, 98.9, 560.2, 285.6), os.path.join(img_base, "11_hive_insert_data_mapreduce.png"))
replace_img(p19, pymupdf.Rect(78.0, 290.1, 560.2, 623.1), os.path.join(wt_base, "win_term_05_insert_jerin_select.png"))

# Page 20
p20 = doc[19]
replace_img(p20, pymupdf.Rect(79.5, 78.3, 363.0, 218.6), os.path.join(img_base, "13_hadoop_webui_hdfs_browse.png"))
replace_img(p20, pymupdf.Rect(79.5, 223.1, 363.0, 364.8), os.path.join(img_base, "14_hadoop_webui_mydb_tables.png"))
replace_img(p20, pymupdf.Rect(79.5, 382.8, 363.0, 524.6), os.path.join(img_base, "13_hadoop_webui_hdfs_browse.png"))
replace_img(p20, pymupdf.Rect(79.5, 529.1, 363.0, 670.8), os.path.join(img_base, "14_hadoop_webui_mydb_tables.png"))

print("Replaced all result screenshots on pages 15-20.")

# -------------------------------------------------------------
# 4. Append Solution Pages for Handwritten Questions & Acceptance Criteria
# -------------------------------------------------------------
# Page 22: Questions 1, 2 & 3
p22 = doc.new_page(width=595.32, height=841.92)
p22.draw_rect(pymupdf.Rect(50, 20, 545, 55), color=(0.01, 0.52, 0.78), fill=(0.94, 0.96, 0.98), width=1)
p22.insert_text((65, 36), "BDT LAB EXPERIMENT 6: HANDWRITTEN QUESTIONS & ACCEPTANCE CRITERIA", fontsize=8.5, fontname="helv", color=(0.01, 0.41, 0.63))
p22.insert_text((65, 48), "Student: Dhruv Sakhare  |  Roll No: 13  |  Enrollment: ADT24SOCB0369", fontsize=9.5, fontname="helv", color=(0.06, 0.09, 0.16))

p22.insert_text((50, 75), "Question 1 & 2: Database CollegeDB, Table Student, Data Insertion & Selection", fontsize=11, fontname="helv", color=(0.01, 0.35, 0.65))
q1_text = """Commands Executed:
CREATE DATABASE CollegeDB;
USE CollegeDB;
CREATE TABLE Student (RollNo INT, Name STRING, Department STRING, Marks INT)
ROW FORMAT DELIMITED FIELDS TERMINATED BY ',';
INSERT INTO TABLE Student VALUES
(1, 'Dhruv', 'IT', 92), (2, 'Alan', 'CSE', 78), (3, 'Neha', 'AI&DS', 85), (4, 'John', 'MECH', 65), (5, 'Alice', 'CSE', 70);
SELECT * FROM Student;"""
p22.insert_textbox(pymupdf.Rect(50, 85, 545, 175), q1_text, fontsize=8, fontname="helv", color=(0.1, 0.1, 0.1))

# Insert WT Screenshot 6
p22.insert_image(pymupdf.Rect(50, 180, 545, 495), filename=os.path.join(wt_base, "win_term_06_acceptance_collegedb_student.png"))

p22.insert_text((50, 510), "Question 3: Filtering and Sorting (Marks > 75 ORDER BY Marks DESC)", fontsize=11, fontname="helv", color=(0.01, 0.35, 0.65))
q3_text = """Command Executed:
SELECT * FROM Student WHERE Marks > 75 ORDER BY Marks DESC;
Result: Dhruv (92), Neha (85), Alan (78)"""
p22.insert_textbox(pymupdf.Rect(50, 520, 545, 555), q3_text, fontsize=8, fontname="helv", color=(0.1, 0.1, 0.1))

# Insert WT Screenshot 7
p22.insert_image(pymupdf.Rect(50, 560, 545, 805), filename=os.path.join(wt_base, "win_term_07_acceptance_filter_sort.png"))
p22.insert_text((70, 825), "BDT Lab: Exp 6 (Apache Hive)  |  Dhruv Sakhare  |  Roll No: 13  |  Enrollment: ADT24SOCB0369  |  Page 22", fontsize=7.5, fontname="helv", color=(0.45, 0.45, 0.45))

# Page 23: Question 4 (Metadata, Managed vs External, and Updates)
p23 = doc.new_page(width=595.32, height=841.92)
p23.draw_rect(pymupdf.Rect(50, 20, 545, 55), color=(0.01, 0.52, 0.78), fill=(0.94, 0.96, 0.98), width=1)
p23.insert_text((65, 36), "BDT LAB EXPERIMENT 6: QUESTION 4 & METADATA VERIFICATION", fontsize=8.5, fontname="helv", color=(0.01, 0.41, 0.63))
p23.insert_text((65, 48), "Student: Dhruv Sakhare  |  Roll No: 13  |  Enrollment: ADT24SOCB0369", fontsize=9.5, fontname="helv", color=(0.06, 0.09, 0.16))

p23.insert_text((50, 75), "Question 4: Managed vs External Tables & Updating Records in Hive", fontsize=11, fontname="helv", color=(0.01, 0.35, 0.65))
q4_theory = """1. Managed (Internal) Tables: Hive manages both metadata (in Derby/MySQL Metastore) and data files (in /user/hive/warehouse).
   When dropped (DROP TABLE), both the schema definition and underlying HDFS files are permanently deleted.
2. External Tables: Created with 'EXTERNAL' keyword and custom 'LOCATION'. Hive only manages metadata.
   When dropped, only metadata is deleted; underlying raw data files remain safely on HDFS.
3. Updating Records in Hive:
   a) ACID Updates (ORC format with bucketing & transaction manager enabled):
      UPDATE Student SET Marks = 95 WHERE RollNo = 1;
   b) Overwrite Query Workaround (Non-ACID tables):
      INSERT OVERWRITE TABLE Student SELECT RollNo, Name, Department, CASE WHEN RollNo = 1 THEN 95 ELSE Marks END FROM Student;"""
p23.insert_textbox(pymupdf.Rect(50, 85, 545, 205), q4_theory, fontsize=8, fontname="helv", color=(0.1, 0.1, 0.1))

p23.insert_text((50, 215), "Table Metadata Verification (DESCRIBE FORMATTED Student;)", fontsize=10.5, fontname="helv", color=(0.01, 0.35, 0.65))
p23.insert_text((50, 227), "Command: DESCRIBE FORMATTED Student;  --> Shows Owner: dhruv45, Table Type: MANAGED_TABLE, SerDe: LazySimpleSerDe", fontsize=8, fontname="helv", color=(0.2, 0.2, 0.2))

# Insert WT Screenshot 8
p23.insert_image(pymupdf.Rect(50, 235, 545, 565), filename=os.path.join(wt_base, "win_term_08_acceptance_describe_formatted.png"))

# Summary Box
p23.draw_rect(pymupdf.Rect(50, 580, 545, 805), color=(0.15, 0.68, 0.38), fill=(0.95, 0.98, 0.95), width=1)
p23.insert_text((65, 600), "ACCEPTANCE CRITERIA COMPLETION SUMMARY", fontsize=10, fontname="helv", color=(0.11, 0.54, 0.30))
summary_text = """[SUCCESS] Acceptance 1: Created Database 'CollegeDB' and Managed Table 'Student' with specified attributes.
[SUCCESS] Acceptance 2: Inserted 5 distinct student records (RollNo, Name, Department, Marks) and verified via SELECT.
[SUCCESS] Acceptance 3: Filtered Marks > 75 and sorted in descending order (Dhruv 92, Neha 85, Alan 78).
[SUCCESS] Acceptance 4: Verified metadata showing Owner 'dhruv45', MANAGED_TABLE, and explained ACID/non-ACID update strategies.
[ENVIRONMENT]: All commands executed and validated under Ubuntu 22.04 LTS (WSL2) under profile dhruv45."""
p23.insert_textbox(pymupdf.Rect(65, 615, 530, 795), summary_text, fontsize=8.5, fontname="helv", color=(0.1, 0.2, 0.1))

p23.insert_text((70, 825), "BDT Lab: Exp 6 (Apache Hive)  |  Dhruv Sakhare  |  Roll No: 13  |  Enrollment: ADT24SOCB0369  |  Page 23", fontsize=7.5, fontname="helv", color=(0.45, 0.45, 0.45))

# Save output PDFs
doc.save(out_pdf1, garbage=4, deflate=True)
doc.save(out_pdf2, garbage=4, deflate=True)
doc.close()

print(f"Generated Completed Lab Report PDF:\n1. {out_pdf1} ({os.path.getsize(out_pdf1)} bytes)\n2. {out_pdf2} ({os.path.getsize(out_pdf2)} bytes)")