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


# Load arff file
with open('dataset/SEERA General Information.arff') as f:
    data = arff.load(f)


a_domain = ["Banking systems", "ERP", "Mobile applications", "Financial and managerial", "Web applications","Bespoke applications"]

subset = ['Size of IT department', 'Estimated duration', 'Application Domain','\% project gain (loss) (Main)']

total_start = time.time()

# Extract the data and attribute names
df_data = []
for row in data['data']:
    df_data.append(list(row))
df_columns = [x[0] for x in data['attributes']]

# Convert to a pandas dataframe
df = pd.DataFrame(df_data, columns=df_columns)
print(df['Application Domain'])
df = df[subset]

# Remove rows with missing values
df = df.dropna()

# Remove rows with 'N/A' values
df = df[~df.isin(['N/A']).any(axis=1)]

df['\% project gain (loss) (Main)'] = df['\% project gain (loss) (Main)'].str.replace('%', '')

# create binary indicator columns using get_dummies()
dummies = pd.get_dummies(df['Application Domain'])

# concatenate the original dataframe with the binary indicator columns
df = pd.concat([df, dummies], axis=1)

# Drop the Application Domain column
df.drop(['Application Domain'], axis=1, inplace=True)


domain_dict = { '1' : "Banking systems", '2' : "ERP", '3' : "Mobile applications", '5' : "Financial and managerial", '6' : "Web applications", '7' : "Bespoke applications" }

# rename columns using the dictionary
df = df.rename(columns=domain_dict)

print(df)


# Define features and target variable
X = df.drop('\% project gain (loss) (Main)', axis=1)
y = df['\% project gain (loss) (Main)']


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
total_end = time.time()
print("Total time taken:", total_end - total_start)

# Save the model to disk
with open('models/model2.pkl', 'wb') as f:
    pickle.dump(model, f)

with open("models/model2attr.txt", "w") as f:
    for a in ['Size of IT department', 'Estimated duration'] + a_domain:
        f.write(str(a) +"\n")
