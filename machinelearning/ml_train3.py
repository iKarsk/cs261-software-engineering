import pandas as pd
import numpy as np
import arff
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import KFold
import pickle
import time


# Load ARFF file
with open('dataset/desharnais.arff') as f:
    data = arff.load(f)

df = pd.DataFrame(data['data'], columns=[attr[0] for attr in data['attributes']])

df = df[['TeamExp', 'ManagerExp', 'Length', 'Effort']]

df = df.dropna()

print(df)

# Define features and target variable
X = df.drop('Effort', axis=1)
y = df['Effort']


# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.5)

models = [
    ('Linear Regression', LinearRegression()),
    ('Random Forest Regression', RandomForestRegressor()),
    ('Support Vector Regression', SVR(kernel='linear')),
    ('Support Vector Regression rbf', SVR(kernel='rbf')),
    ('Polynomial Regression', PolynomialFeatures(degree=2)),
]

# define k-fold cross-validation
kfold = KFold(n_splits=5, shuffle=True, random_state=42)

# evaluate each model using k-fold cross-validation
for name, model in models:
    mse_scores = []
    r2_scores = []

    start_time = time.time()
    for train_idx, test_idx in kfold.split(X, y):
        # split the data into training and testing sets
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

        
        if name == 'Polynomial Regression':
            # transform the features for polynomial regression
            poly = PolynomialFeatures(degree=2)
            X_train = poly.fit_transform(X_train)
            X_test = poly.fit_transform(X_test)
            model = LinearRegression()
        
        # train the model
        model.fit(X_train, y_train)
        
        # evaluate the model
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        mse_scores.append(mse)
        r2_scores.append(r2)
    
    end_time = time.time()
    # print the results for each model
    print(name)
    print("MSE: {:.3f} (+/- {:.3f})".format(np.mean(mse_scores), np.std(mse_scores)))
    print("R^2: {:.3f} (+/- {:.3f})".format(np.mean(r2_scores), np.std(r2_scores)))
    print("Training time on test set:", end_time - start_time, "seconds")
    print()


model = SVR(kernel='rbf')
model.fit(X, y)


# Save the model to disk
with open('models/model3.pkl', 'wb') as f:
    pickle.dump(model, f)

with open("models/model3attr.txt", "w") as f:
    for a in ['TeamExp', 'ManagerExp', 'Length']:
        f.write(str(a) +"\n")
