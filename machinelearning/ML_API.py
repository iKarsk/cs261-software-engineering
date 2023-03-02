from flask import Flask, jsonify, request
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

app = Flask(__name__)

data = pd.read_csv("project_risk_data.csv")

X = data[['requirements', 'project_category', 'requirement_category', 'risk_target_category', 'probability', 'magnitude_of_risk', 'impact', 'dimension_of_risk', 'affecting_no_of_modules', 'fixing_duration', 'fix_cost', 'priority']]
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

@app.route('/predict', methods=['POST'])
def predict_risk_score():
    data = request.get_json()

    new_project = pd.DataFrame({
        'requirements': [data['requirements']],
        'project_category': [data['project_category']],
        'requirement_category': [data['requirement_category']],
        'risk_target_category': [data['risk_target_category']],
        'probability': [data['probability']],
        'magnitude_of_risk': [data['magnitude_of_risk']],
        'impact': [data['impact']],
        'dimension_of_risk': [data['dimension_of_risk']],
        'affecting_no_of_modules': [data['affecting_no_of_modules']],
        'fixing_duration': [data['fixing_duration']],
        'fix_cost': [data['fix_cost']],
        'priority': [data['priority']]
    })

    risk_score_GB = GB.predict(new_project)[0]
    risk_score_DT = DT.predict(new_project)[0]
    risk_score_NN = NN.predict(new_project)[0]
    risk_score_NB = NB.predict(new_project)[0]
    risk_score_LR = LR.predict(new_project)[0]

    response = {
        'GB': float(risk_score_GB),
        'DT': float(risk_score_DT),
        'NN': float(risk_score_NN),
        'NB': float(risk_score_NB),
        'LR': float(risk_score_LR)
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
