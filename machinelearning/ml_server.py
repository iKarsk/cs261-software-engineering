import pickle
import pandas as pd
import numpy as np
from flask import Flask, request, abort, jsonify
import json


app = Flask(__name__)

# Load models
with open('models/model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('models/model2.pkl', 'rb') as f:
    model2 = pickle.load(f)

with open('models/model3.pkl', 'rb') as f:
    model3 = pickle.load(f)

unique_categories = ['funding_total_usd']
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

# Make a prediction for if funding is enough for a successful project
@app.route('/api/predictFunding', methods=['POST'])
def predictFunding():

    json_dict = request.get_json()

    category_df = pd.DataFrame(columns=list(unique_categories))
    category_df.loc[0] = [0] * len(unique_categories)


    for col, val in json_dict.items():
        if (col == "funding_total_usd") or (col in unique_categories):
            category_df[col] = val


    prediction = model.predict(category_df)
    res = prediction[0]

    return jsonify({ 'enough_funding' : int(res) })


# Make a prediction for project financial gain (or loss)
@app.route('/api/predictGain', methods=['POST'])
def predictGain():
    linked = {"Banking systems" : ["Banking"], "ERP" : ["Enterprise Resource Planning"], "Mobile applications": ["Mobile Analytics", "Mobile Payments", "Mobile Security", "Mobile Search", "Mobile Enterprise", "Mobile Software Tools", "Mobile Health", "Mobile Coupons", "Mobile Social", "Mobile Games", "Mobile Commerce", "Mobile Video", "Mobile Devices", "Mobile", "Mobile Advertising", "Social + Mobile + Local", "Mobile Shopping", "Mobile Infrastructure", "Mobile Emergency&Health", "iOS", "Android"], "Financial and managerial" : ["FinTech", "Financial Services", "Financial Exchanges", "Finance Technology", "Finance", "Personal Finance", "Digital Rights Management", "Knowledge Management", "Property Management", "Lead Management", "Web Presence Management", "Vulnerability Management", "Risk Management", "Project Management", "Energy Management", "Cloud Management", "Fleet Management", "Wealth Management", "Event Management", "Waste Management", "Supply Chain Management", "Career Management", "Identity Management", "IT Management", "Document Management", "Contact Management", "Task Management", "Social Media Management", "Investment Management", "Innovation Management", "Intellectual Asset Management"], "Web applications" : ["Web CMS", "Web Presence Management", "Curated Web", "Web Browsers", "WebOS", "Web Design", "Semantic Web", "Web Tools", "Web Hosting", "Web Development"],"Bespoke applications" : []}

    size_ranges = [(1, 5), (6, 10), (11, 15), (16, 20), (21, 25), (26, 30), (31, 35), (36, 40), (41, 45), (46, 50)] 

    json_dict = request.get_json()

    df = pd.DataFrame(columns=model2_attributes)
    df.loc[0] = [0] * len(model2_attributes)


    for attr, val in json_dict.items():        
        if (attr == "Application Domain"):
            for main, secondary in linked.items(): 
                if attr in secondary:
                    df[main][0] = 1
                    break

        elif (attr == "Size of IT department"):
            for i, ran in enumerate(size_ranges):
                l = ran[0]
                m = ran[1]

                if (l <= val and val <= m):
                    df[attr][0] = val + 1
                    break

            df[attr][0] = 11

        else:
            df[attr][0] = val


    prediction = model2.predict(df)
    res = prediction[0]

    department_size = df["Size of IT department"][0]
    estimated_duration = df["Estimated duration"][0]

    suggest_size, suggest_duration, suggest_gains = department_size, estimated_duration, res
    if (department_size != 11):
        suggest_range = size_ranges[department_size-1]
    else:
        suggest_range = (50,-1)

    for i in range(1, 12):
        if (i != department_size):
            df["Size of IT department"][0] = i

            for j in range(1, estimated_duration + 60):
                    df["Estimated duration"][0] = estimated_duration + j
                    trial = model2.predict(df)
                    if (trial[0] > suggest_gains):
                        suggest_size, suggest_duration, suggest_gains = i, estimated_duration + j, trial[0]
                        if (i != 11):
                            suggest_range = size_ranges[i-1]
                        else:
                            suggest_range = (50, -1)

    return jsonify({ 'predicted_gain' : res, 'min_size' : suggest_range[0], 'suggested_duration' : int(suggest_duration), 'potential_gains' : suggest_gains, 'max_size' : suggest_range[1] })


@app.route('/api/predictEffort', methods=['POST'])
def predictEffort():
    json_dict = request.get_json()

    df = pd.DataFrame(columns=model3_attributes)
    df.loc[0] = [0] * len(model3_attributes)

    for attr, val in json_dict.items():
        df[attr][0] = val

    print(df)
    prediction = model3.predict(df)
    res = prediction[0]

    return jsonify({ 'effort_required' : res })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3001)
