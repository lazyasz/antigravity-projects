import pandas as pd

df = pd.read_csv('file.csv')
print("Reading file.csv:")
print(df)

df = pd.read_csv('file.csv', header=None, nrows=5)
print("\nReading file.csv with header=None and nrows=5:")
print(df)

df.to_csv('myDataFrame.csv')
print("\nSaved myDataFrame.csv.")
