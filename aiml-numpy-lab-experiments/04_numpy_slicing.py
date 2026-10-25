import numpy as np

a = np.array([1, 2, 3])
b = np.array([(1.5, 2, 3), (4, 5, 6)], dtype=float)
c = np.array([[(1.5, 2, 3), (4, 5, 6)], [(3, 2, 1), (4, 5, 6)]], dtype=float)

print("a[0:2]:", a[0:2])
print("b[0:2, 1]:", b[0:2, 1])
print("b[:1]:")
print(b[:1])
print("c[1, ...]:")
print(c[1, ...])
print("a[::-1]:", a[::-1])
