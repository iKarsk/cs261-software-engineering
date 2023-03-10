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
@app.route('/api/predictFunding', methods=['GET', 'POST'])
def predictFunding():

    json_dict = json.loads(json_str)
    json_dict = request.get_json()


    category_df = pd.DataFrame(columns=list(unique_categories))
    category_df.loc[0] = [0] * len(unique_categories)


    for category, val in json_dict.items():
        if category in unique_categories:
            category_df[category] = val


    prediction = model.predict(category_df)
    res = prediction[0]

    return jsonify({ 'funding_required' : "{:.2f}".format(res)} )


# Make a prediction for project financial gain (or loss)
@app.route('/api/predictGain', methods=['GET', 'POST'])
def predictGain():
    linked = {"Banking systems" : ["Banking"], "ERP" : ["Enterprise Resource Planning"], "Mobile applications": ["Mobile Analytics", "Mobile Payments", "Mobile Security", "Mobile Search", "Mobile Enterprise", "Mobile Software Tools", "Mobile Health", "Mobile Coupons", "Mobile Social", "Mobile Games", "Mobile Commerce", "Mobile Video", "Mobile Devices", "Mobile", "Mobile Advertising", "Social + Mobile + Local", "Mobile Shopping", "Mobile Infrastructure", "Mobile Emergency&Health", "iOS", "Android"], "Financial and managerial" : ["Financial Services", "Financial Exchanges", "Finance Technology", "Finance", "Personal Finance", "Digital Rights Management", "Knowledge Management", "Property Management", "Lead Management", "Web Presence Management", "Vulnerability Management", "Risk Management", "Project Management", "Energy Management", "Cloud Management", "Fleet Management", "Wealth Management", "Event Management", "Waste Management", "Supply Chain Management", "Career Management", "Identity Management", "IT Management", "Document Management", "Contact Management", "Task Management", "Social Media Management", "Investment Management", "Innovation Management", "Intellectual Asset Management"], "Web applications" : ["Web CMS", "Web Presence Management", "Curated Web", "Web Browsers", "WebOS", "Web Design", "Semantic Web", "Web Tools", "Web Hosting", "Web Development"],"Bespoke applications" : []}

    # json_dict = request.get_json()

    df = pd.DataFrame(columns=model2_attributes)
    df.loc[0] = [0] * len(model2_attributes)

    df["Mobile applications"][0] = 1
    df["Estimated duration"][0] = 10
    df["Size of IT department"][0] = 3


    """
    for attr, val in json_dict.items():
        if attr not in ["Estimated duration", "Size of IT department"]:
            for main, secondary in linked.items(): 
                if attr in secondary:
                    df[main][0] = 1

            else:
                df[attr][0] = val
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


@app.route('/api/predictEffort', methods=['GET', 'POST'])
def predictEffort():
    # json_dict = request.get_json()

    df = pd.DataFrame(columns=model3_attributes)
    df.loc[0] = [0] * len(model3_attributes)

    df["TeamExp"][0] = 20
    df["ManagerExp"][0] = 4
    df["Length"][0] = 12


    """
    for attr, val in json_dict.items():
        df[attr][0] = val
    """

    prediction = model3.predict(df)
    res = prediction[0]

    return jsonify({ 'effort_required' : res })


if __name__ == '__main__':
    app.run(debug=True, port=3001)
