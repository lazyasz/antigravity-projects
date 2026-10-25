from matplotlib import pyplot as plt

plt.bar(
    [0.25, 1.25, 2.25, 3.25, 4.25],
    [50, 40, 70, 80, 20],
    label="BMW",
    width=0.5
)

plt.bar(
    [0.75, 1.75, 2.75, 3.75, 4.75],
    [80, 20, 20, 50, 60],
    label="Audi",
    width=0.5
)

plt.legend()
plt.xlabel('Days')
plt.ylabel('Distance (kms)')
plt.title('Information')
plt.show()
