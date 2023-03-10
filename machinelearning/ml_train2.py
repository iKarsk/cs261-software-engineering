import pandas as pd
import arff
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import pickle


# Load arff file
with open('dataset/SEERA General Information.arff') as f:
    data = arff.load(f)


a_domain = ["Banking systems", "ERP", "Mobile applications", "Financial and managerial", "Web applications","Bespoke applications"]

subset = ['Size of IT department', 'Estimated duration', 'Application Domain','\% project gain (loss) (Main)']


# Extract the data and attribute names
df_data = []
for row in data['data']:
    df_data.append(list(row))
df_columns = [x[0] for x in data['attributes']]

# Convert to a pandas dataframe
df = pd.DataFrame(df_data, columns=df_columns)
df = df[subset]

# Remove rows with missing values
df = df.dropna()

# Remove rows with 'N/A' values
df = df[~df.isin(['N/A']).any(axis=1)]

df['\% project gain (loss) (Main)'] = df['\% project gain (loss) (Main)'].str.replace('%', '')


# Add columns for each domain in a_domain
for domain in a_domain:
    df[domain] = df['Application Domain'].apply(lambda x: 1 if x == domain else 0)

# Drop the Application Domain column
df.drop(['Application Domain'], axis=1, inplace=True)

print(df)


# Define features and target variable
X = df.drop('\% project gain (loss) (Main)', axis=1)
y = df['\% project gain (loss) (Main)']

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train linear regression model
model = LinearRegression()
model.fit(X_train, y_train)



# Save the model to disk
with open('models/model2.pkl', 'wb') as f:
    pickle.dump(model, f)

with open("models/model2attr.txt", "w") as f:
    for a in ['Size of IT department', 'Estimated duration'] + a_domain:
        f.write(str(a) +"\n")
