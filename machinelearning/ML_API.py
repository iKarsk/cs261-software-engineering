from flask import Flask, jsonify, request

import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = pd.read_csv("project_risk_data.csv")
    data = data.drop(columns=['priority'])

    new_project = request.get_json()
    new_project = pd.DataFrame(new_project)

    data = pd.concat([data, new_project])

    encoded = pd.get_dummies(data, columns=["requirements",'project_category','requirement_category','risk_target_category','magnitude_of_risk','impact','dimension_of_risk'])

    y = encoded['risk_score'][:-1]
    X = encoded.iloc[:-1,:]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)

    GB = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
    GB.fit(X_train, y_train)

    #print(GB.score(X_train, y_train))
    #print(GB.score(X_test, y_test))

    test = encoded.iloc[-1:,:]
    risk_score = GB.predict(test)[0]

    response = {
        'risk_score': float(risk_score)
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)

'''
#Test API

import requests

new_project = {
    'requirements': 300.0,
    'project_category': 2.0,
    'requirement_category': 7.0,
    'risk_target_category': 17.0,
    'probability' : 11.6,
    'magnitude_of_risk' : 2.0,
    'impact' : 0.0,
    'dimension_of_risk' : 12.0,
    'affecting_no_of_modules' : 1.0,
    'fixing_duration' : 6.0,
    'fix_cost' : 4.0
}

response = requests.post('http://localhost:5000/predict', json=new_project)
print(response.json())

'''
