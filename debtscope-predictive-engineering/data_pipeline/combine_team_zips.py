"""
Group Project Zip Combiner Script
---------------------------------
This utility automatically extracts and combines the 4 individual member zip files into a single
unified group project structure ready for final submission.

Expected Input Files in current directory:
- Member1_Data_Pipeline.zip      (Data Engineering & PySpark Pipeline)
- Member2_ML_Analytics.zip        (ML Predictive Modeling & Defect Risk)
- Member3_Debt_Prioritization.zip (Business Impact & Debt Scoring)
- Member4_UI_Dashboard.zip        (Frontend Web Dashboard)

Usage:
  python combine_team_zips.py
"""

import os
import zipfile
import shutil

MEMBER_ZIPS = {
    "Member1_Data_Pipeline.zip": "modules/member_1_data_pipeline",
    "Member2_ML_Analytics.zip": "modules/member_2_ml_analytics",
    "Member3_Debt_Prioritization.zip": "modules/member_3_debt_prioritization",
    "Member4_UI_Dashboard.zip": "modules/member_4_ui_dashboard"
}

OUTPUT_DIR = "Group_Project_Combined"
OUTPUT_ZIP = "Predictive_Engineering_Platform_Group_Submission.zip"

def combine():
    print("=" * 60)
    print("      GROUP PROJECT ZIP COMBINER - 4 MEMBERS COMBINER      ")
    print("=" * 60)

    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    extracted_count = 0
    for zip_name, dest_subfolder in MEMBER_ZIPS.items():
        if os.path.exists(zip_name):
            target_path = os.path.join(OUTPUT_DIR, dest_subfolder)
            print(f"[+] Extracting '{zip_name}' -> '{target_path}'...")
            with zipfile.ZipFile(zip_name, 'r') as zf:
                zf.extractall(target_path)
            extracted_count += 1
        else:
            print(f"[!] Warning: '{zip_name}' not found in current directory. Skipping.")

    if extracted_count == 0:
        print("\n[X] Error: No member zip files were found. Please place at least one zip file in this directory.")
        return

    # Create root README in combined directory
    readme_content = f"""# Predictive Engineering Intelligence Platform - Group Submission

## Team Modules Overview

1. **Member 1 (Data Pipeline)**: Located in `modules/member_1_data_pipeline`
2. **Member 2 (ML Analytics)**: Located in `modules/member_2_ml_analytics`
3. **Member 3 (Debt Prioritization)**: Located in `modules/member_3_debt_prioritization`
4. **Member 4 (UI Dashboard)**: Located in `modules/member_4_ui_dashboard`

## Running the Complete System
- Member 1 Output Contract: `modules/member_1_data_pipeline/data/features/engineering_features.json`
- Member 2 & 3 consume the dataset contract from Member 1.
"""
    with open(os.path.join(OUTPUT_DIR, "GROUP_SUBMISSION_README.md"), "w") as f:
        f.write(readme_content)

    # Zip the combined folder
    print(f"\n[+] Creating final submission zip '{OUTPUT_ZIP}'...")
    shutil.make_archive(OUTPUT_ZIP.replace(".zip", ""), 'zip', OUTPUT_DIR)

    print(f"\n[✓] Successfully created '{OUTPUT_ZIP}' containing {extracted_count} member module(s)!")
    print("=" * 60)

if __name__ == "__main__":
    combine()
