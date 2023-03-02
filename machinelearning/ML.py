#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import numpy as np

data = pd.read_csv("project_risk_data.csv")

X = data[['requirements','project_category','requirement_category','risk_target_category','probability','magnitude_of_risk','impact','dimension_of_risk','affecting_no_of_modules','fixing_duration','fix_cost','priority']]
y = data['risk_score']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

GB = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
GB.fit(X_train, y_train)

DT = DecisionTreeRegressor(random_state=42)
DT.fit(X_train, y_train)

NN = MLPRegressor(hidden_layer_sizes=(100, 50), activation='relu',solver='adam', alpha=0.001, max_iter=500, random_state=42)
NN.fit(X_train, y_train)

NB = GaussianNB()
NB.fit(X_train, y_train)

LR = LinearRegression()
LR.fit(X_train, y_train)

# y_predGB = GB.predict(X_test)
# accGB = GB.score(X_train, y_predGB)

# y_predDT = DT.predict(X_test)
# accDT = DT.score(X_train, y_predDT)

# y_predNN = NN.predict(X_test)
# accNN = NN.score(X_train, y_predNN)

# y_predNB = NB.predict(X_test)
# accNB = NB.score(X_train, y_predNB)

# y_predLR = LR.predict(X_test)
# accLR = LR.score(X_train, y_predLR)

# print(" (GB) The accuracy of the trained data is: ", accGB)
# print(" (DT) The accuracy of the trained data is: ", accDT)
# print(" (NN) The accuracy of the trained data is: ", accNN)
# print(" (NB) The accuracy of the trained data is: ", accNB)
# print(" (LR) The accuracy of the trained data is: ", accLR)

# Predict the risk score for a new project
new_project = pd.DataFrame({
    'requirements': [300.0],
    'project_category': [2.0],
    'requirement_category': [7.0],
    'risk_target_category': [17.0],
    'probability' : [32.0],
    'magnitude_of_risk' : [2.0],
    'impact' : [0.0],
    'dimension_of_risk' : [12.0],
    'affecting_no_of_modules' : [1.0],
    'fixing_duration' : [6.0],
    'fix_cost' : [4.0],
    'priority' : [38.215385]  
})
risk_scoreGB = GB.predict(new_project)[0]
risk_scoreDT = DT.predict(new_project)[0]
risk_scoreNN = NN.predict(new_project)[0]
risk_scoreNB = NB.predict(new_project)[0]
risk_scoreLR = LR.predict(new_project)[0]

print(" (GB) The risk score for the new project is:", risk_scoreGB)
print(" (DT) The risk score for the new project is:", risk_scoreDT)
print(" (NN) The risk score for the new project is:", risk_scoreNN)
print(" (NB) The risk score for the new project is:", risk_scoreNB)
print(" (LR) The risk score for the new project is:", risk_scoreLR)

