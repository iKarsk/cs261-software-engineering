import pandas as pd
import arff
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import pickle


# Load ARFF file
with open('dataset/desharnais.arff') as f:
    data = arff.load(f)

df = pd.DataFrame(data['data'], columns=[attr[0] for attr in data['attributes']])

df = df[['TeamExp', 'ManagerExp', 'Length', 'Effort', 'Transactions', 'Entities']]

df = df.dropna()

print(df)

# Define features and target variable
X = df.drop('Effort', axis=1)
y = df['Effort']

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train linear regression model
model = LinearRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

# Save the model to disk
with open('models/model3.pkl', 'wb') as f:
    pickle.dump(model, f)

with open("models/model3attr.txt", "w") as f:
    for a in ['TeamExp', 'ManagerExp', 'Length', 'Transactions', 'Entities']:
        f.write(str(a) +"\n")
