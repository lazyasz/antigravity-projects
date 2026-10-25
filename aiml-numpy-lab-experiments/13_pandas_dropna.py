import pandas as pd

df = pd.read_csv('diabetes.txt', sep=r'\s+')

df2 = df.copy()
df2.loc[2:5, 'Pregnancies'] = None

df3 = df2.copy()
df3 = df3.dropna()

print("Shape after dropna():")
print(df3.shape)
