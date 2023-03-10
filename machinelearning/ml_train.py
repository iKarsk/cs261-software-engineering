import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score
import pickle

# Replace the file path below with the actual path to your CSV file
file_path = "dataset/big_startup_secsees_dataset.csv"

# Read the CSV file into a pandas DataFrame, and only keep the specified columns
df = pd.read_csv(file_path, usecols=["permalink", "category_list", "funding_total_usd", "status"])

# Remove any rows where the funding_total_usd is '-'
df = df[df['funding_total_usd'] != '-']

# Remove any rows where the category_list is empty
df = df[df['category_list'].notnull()]

# Change the status column to 0 if it is closed, otherwise 1
df['status'] = df['status'].apply(lambda x: 0 if x == 'closed' else 1)

# Remove permalink column
df = df.drop('permalink', axis=1)

# Extract unique categories and append each category as a column to the DataFrame
unique_categories = set(cat for cat_list in df['category_list'].str.split('|') for cat in cat_list)
cat1 = set([category for row in df['category_list'] for category in row.split('|')])

for category in unique_categories:
    df[category] = df['category_list'].str.contains(category).astype(int)

# Remove the category_list column
df = df.drop('category_list', axis=1)

# Print the resulting DataFrame
print(df)

# Split the data into features and labels
X = df.drop(['status', 'funding_total_usd'], axis=1)
y = df['funding_total_usd']

# Train a linear regression model on the data
model = LinearRegression()
model.fit(X, y)

# Save the model to disk
with open('models/model.pkl', 'wb') as f:
    pickle.dump(model, f)

with open("models/categories.txt", "w") as f:
    for c in list(unique_categories):
        f.write(str(c) +"\n")

