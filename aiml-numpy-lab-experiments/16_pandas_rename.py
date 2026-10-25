import pandas as pd

df = pd.read_csv('diabetes.txt', sep=r'\s+')

df2 = df.copy()
df2.loc[2:5, 'Pregnancies'] = None

df3 = df2.copy()
mean_value = df3['Pregnancies'].mean()
df3 = df3.fillna(mean_value)

df3.rename(
    columns={'DiabetesPedigreeFunction': 'DPF'},
    inplace=True
)

print("df3.head() after renaming columns:")
print(df3.head())
