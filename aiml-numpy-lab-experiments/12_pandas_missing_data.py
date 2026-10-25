import pandas as pd

df = pd.read_csv('diabetes.txt', sep=r'\s+')

df2 = df.copy()
df2.loc[2:5, 'Pregnancies'] = None

print("df2.head(7) with injected None values:")
print(df2.head(7))
print("\ndf2.isnull().head(7):")
print(df2.isnull().head(7))
print("\ndf2.isnull().sum():")
print(df2.isnull().sum())
print("\ndf2.loc[1]:")
print(df2.loc[1])
print("\ndf2.iloc[1]:")
print(df2.iloc[1])
