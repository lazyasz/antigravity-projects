import pandas as pd

df = pd.read_csv('diabetes.txt', sep=r'\s+')

df2 = df.copy()
df2.loc[2:5, 'Pregnancies'] = None

df3 = df2.copy()
df3.dropna(inplace=True, axis=1)

print("df3.head() after dropna(axis=1):")
print(df3.head())
