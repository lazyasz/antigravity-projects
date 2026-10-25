import numpy as np

a = np.array([1, 2, 3])
b = np.array([(1.5, 2, 3), (4, 5, 6)], dtype=float)
e = np.full((2, 2), 7)

print("a.shape:", a.shape)
print("len(a):", len(a))
print("b.ndim:", b.ndim)
print("e.size:", e.size)
print("b.dtype:", b.dtype)
print("b.dtype.name:", b.dtype.name)
print("b.astype(int):")
print(b.astype(int))
