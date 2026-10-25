import matplotlib.pyplot as plt

x = [5, 7, 8, 7, 2, 17, 2, 9]
y = [99, 86, 87, 88, 111, 86, 103, 87]

x1 = [4, 11, 12, 9, 6]
y1 = [94, 78, 77, 85, 86]

plt.scatter(x, y, label='high income low saving')
plt.scatter(x1, y1, label='low income high savings')

plt.xlabel('saving*100')
plt.ylabel('income*1000')
plt.title('Scatter Plot')
plt.legend()
plt.show()
