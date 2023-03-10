import pickle
import pandas as pd
from flask import Flask, request, jsonify
import json


app = Flask(__name__)

# Load models
with open('models/model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('models/model2.pkl', 'rb') as f:
    model2 = pickle.load(f)

with open('models/model3.pkl', 'rb') as f:
    model3 = pickle.load(f)

unique_categories = []
model2_attributes = []
model3_attributes = []

with open("models/categories.txt", "r") as f:
  for line in f:
    unique_categories.append(line.strip())

with open("models/model2attr.txt", "r") as f:
  for line in f:
    model2_attributes.append(line.strip())

with open("models/model3attr.txt", "r") as f:
  for line in f:
    model3_attributes.append(line.strip())

# Make a prediction for how much funding is needed for successful project given project categories
@app.route('/predictFunding', methods=['GET', 'POST'])
def predictFunding():
    json_str = '''
    {
        "Software": 0,
        "Distribution": 0,
        "Application Platforms": 1,
        "Real Time": 1,
        "Social Network Media": 1
    }
    '''

    json_dict = json.loads(json_str)
    # json_dict = request.get_json()


    category_df = pd.DataFrame(columns=list(unique_categories))
    category_df.loc[0] = [0] * len(unique_categories)


    for category, val in json_dict.items():
        category_df[category] = val


    prediction = model.predict(category_df)
    res = prediction[0]

    return jsonify({ 'funding_required' : "{:.2f}".format(res)} )


# Make a prediction for project financial gain (or loss)
@app.route('/predictGain', methods=['GET', 'POST'])
def predictGain():
    # json_dict = request.get_json()

    df = pd.DataFrame(columns=model2_attributes)
    df.loc[0] = [0] * len(model2_attributes)

    df["Mobile applications"][0] = 1
    df["Estimated duration"][0] = 10
    df["Size of IT department"][0] = 3


    """
    for attr, val in json_dict.items():
        df[attr] = val
    """

    prediction = model2.predict(df)
    res = prediction[0]

    department_size = df["Size of IT department"][0]
    estimated_duration = df["Estimated duration"][0]

    (suggest_size, suggest_duration, suggest_gains) = (department_size, estimated_duration, res)

    for i in range(1, 12):
        if i != department_size:
            df["Size of IT department"][0] = i

            for j in range(1, estimated_duration + 60):
                    df["Estimated duration"][0] = estimated_duration + j
                    trial = model2.predict(df)
                    print(trial[0], suggest_gains)
                    if trial[0] > suggest_gains:
                        (suggest_size, suggest_duration, suggest_gains) = (i, estimated_duration + j, trial[0])


    return jsonify({ 'project_gain' : res, 'suggest_size' : int(suggest_size), 'suggest_duration' : int(suggest_duration), 'suggest_gains' : suggest_gains })


@app.route('/predictEffort', methods=['GET', 'POST'])
def predictEffort():
    # json_dict = request.get_json()

    df = pd.DataFrame(columns=model3_attributes)
    df.loc[0] = [0] * len(model3_attributes)

    df["TeamExp"][0] = 20
    df["ManagerExp"][0] = 4
    df["Length"][0] = 12
    df["Transactions"][0] = 500
    df["Entities"][0] = 150


    """
    for attr, val in json_dict.items():
        df[attr] = val
    """

    prediction = model3.predict(df)
    res = prediction[0]

    return jsonify({ 'effort_required' : res })


if __name__ == '__main__':
    app.run(debug=True, port=3001)
