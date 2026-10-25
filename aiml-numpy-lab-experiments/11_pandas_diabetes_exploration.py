import pandas as pd

df = pd.read_csv('diabetes.txt', sep=r'\s+')

print("df.head():")
print(df.head())
print("\ndf.tail(n=10):")
print(df.tail(n=10))
print("\ndf.describe():")
print(df.describe())
print("\ndf.describe(percentiles=[0.3, 0.5, 0.7]):")
print(df.describe(percentiles=[0.3, 0.5, 0.7]))
print("\ndf.describe(include=[int]):")
print(df.describe(include=[int]))
print("\ndf.shape:", df.shape)
print("df.shape[0]:", df.shape[0])
print("df.shape[1]:", df.shape[1])
print("df.columns:", df.columns)
