import matplotlib.pyplot as plt

slices = [7, 2, 2, 13]
activities = ['sleeping', 'eating', 'working', 'playing']

plt.pie(
    slices,
    labels=activities,
    startangle=90,
    shadow=True,
    explode=(0, 0.1, 0, 0),
    autopct='%1.1f%%'
)

plt.title('Pie Plot')
plt.show()
