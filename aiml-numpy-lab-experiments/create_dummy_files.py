import pandas as pd
import numpy as np

print("Generating dummy files...")

# 1. Create file.csv
csv_data = {
    'Country': ['Belgium', 'India', 'Brazil', 'Germany', 'France', 'Canada', 'Japan', 'USA', 'UK', 'Australia'],
    'Capital': ['Brussels', 'New Delhi', 'Brasília', 'Berlin', 'Paris', 'Ottawa', 'Tokyo', 'Washington D.C.', 'London', 'Canberra'],
    'Population': [11190846, 1303171035, 207847528, 83020000, 67060000, 37590000, 126300000, 328200000, 66650000, 25360000]
}
df_csv = pd.DataFrame(csv_data)
df_csv.to_csv('file.csv', index=False)
print("Created file.csv")

# 2. Create diabetes.txt (whitespace separated)
diabetes_data = {
    'Pregnancies': [6, 1, 8, 1, 0, 5, 3, 10, 2, 8, 4, 7, 10, 1, 5],
    'Glucose': [148, 85, 183, 89, 137, 116, 78, 115, 197, 125, 110, 139, 122, 189, 166],
    'BloodPressure': [72, 66, 64, 66, 40, 74, 50, 0, 70, 96, 92, 80, 78, 60, 72],
    'SkinThickness': [35, 29, 0, 23, 35, 0, 32, 0, 45, 0, 0, 19, 31, 23, 19],
    'Insulin': [0, 0, 0, 94, 168, 0, 88, 0, 543, 0, 0, 180, 0, 846, 175],
    'BMI': [33.6, 26.6, 23.3, 28.1, 43.1, 25.6, 31.0, 35.3, 30.5, 0.0, 37.6, 27.1, 27.6, 30.1, 25.8],
    'DiabetesPedigreeFunction': [0.627, 0.351, 0.672, 0.167, 2.288, 0.201, 0.248, 0.134, 0.158, 0.232, 0.191, 1.441, 1.224, 0.398, 0.587],
    'Age': [50, 31, 32, 21, 33, 30, 26, 29, 53, 54, 30, 33, 45, 59, 51],
    'Outcome': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1]
}
df_diabetes = pd.DataFrame(diabetes_data)
df_diabetes.to_csv('diabetes.txt', sep=' ', index=False)
print("Created diabetes.txt")

# 3. Create file.xlsx
try:
    df_csv.to_excel('file.xlsx', sheet_name='Sheet1', index=False)
    print("Created file.xlsx")
except Exception as e:
    print(f"Could not write file.xlsx: {e} (make sure 'openpyxl' or 'xlsxwriter' is installed)")
