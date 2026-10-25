import matplotlib.pyplot as plt

x = [1, 2, 3, 4, 5, 6, 7]
y = [1, 2, 4, 5, 3, 6, 9]

z = [x, y]

plt.boxplot(
    z,
    labels=['A', 'B'],
    showmeans=True
)

plt.show()
