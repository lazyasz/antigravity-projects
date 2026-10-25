import pandas as pd

df = pd.read_excel('file.xlsx')
print("Reading file.xlsx:")
print(df)

df.to_excel('myDataFrame.xlsx', sheet_name='Sheet1')
print("\nSaved myDataFrame.xlsx.")

xlsx = pd.ExcelFile('file.xlsx')
df = pd.read_excel(xlsx, 'Sheet1')

print("\nReading Sheet1 from ExcelFile:")
print(df)
