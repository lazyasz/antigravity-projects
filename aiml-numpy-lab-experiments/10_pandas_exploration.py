import pandas as pd

df = pd.read_csv('file.csv')

print("df.head():")
print(df.head())
print("\ndf.head(10):")
print(df.head(10))
print("\ndf.tail():")
print(df.tail())
print("\ndf.info():")
df.info()
print("\ndf.describe():")
print(df.describe())
print("\ndf.shape:", df.shape)
