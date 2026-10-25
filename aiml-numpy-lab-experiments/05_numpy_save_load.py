import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

np.save('my_array', a)
np.savez('array.npz', a, b)

print("np.load('my_array.npy'):")
print(np.load('my_array.npy'))
