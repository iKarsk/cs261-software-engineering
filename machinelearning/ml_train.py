import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler
import pickle
import time

# Replace the file path below with the actual path to your CSV file
file_path = "dataset/big_startup_secsees_dataset.csv"

# Read the CSV file into a pandas DataFrame, and only keep the specified columns
df = pd.read_csv(file_path, usecols=["permalink", "category_list", "funding_total_usd", "status"])

# Remove any rows where the funding_total_usd is '-'
df = df[df['funding_total_usd'] != '-']

# Remove any rows where the category_list is empty
df = df[df['category_list'].notnull()]


# Standardize funding_total_usd
scaler = StandardScaler()
df['funding_total_usd'] = scaler.fit_transform(df[['funding_total_usd']])


# Change the status column to 0 if it is closed, otherwise 1
df['status'] = df['status'].apply(lambda x: 0 if x == 'closed' else 1)

# Remove permalink column
df = df.drop('permalink', axis=1)

# Extract unique categories and append each category as a column to the DataFrame
unique_categories = set(cat for cat_list in df['category_list'].str.split('|') for cat in cat_list)
cat1 = set([category for row in df['category_list'] for category in row.split('|')])

for category in unique_categories:
    df[category] = df['category_list'].str.contains(category).astype(int)


# Count the number of times each category appears
category_counts = {}
for category in unique_categories:
    category_counts[category] = df['category_list'].str.contains(category).sum()

from collections import Counter
categories = [cat for cat_list in df['category_list'].str.split('|') for cat in cat_list]

category_counts = Counter(categories)

# Print categories in descending order of their counts
for category, count in category_counts.most_common():
    print(f"{category}: {count}")


# Remove the category_list column
df = df.drop('category_list', axis=1)

# Print the resulting DataFrame
print(df)

# Split the data into features and labels
X = df.drop(['funding_total_usd'], axis=1)
y = df['status']

model = SVC(probability=True)

# Train and evaluate multiple classification models
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.6, random_state=42)


# Train the model on the training set
start_time = time.time()
model.fit(X_train, y_train)
end_time = time.time()

# Make predictions on the testing set
y_pred = model.predict(X_test)

# Calculate the accuracy score
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy:", accuracy)
print("Training time on test set:", end_time - start_time, "seconds")


# Train a SVC model on the data
start_time = time.time()
model.fit(X, y)
end_time = time.time()
print("Training time on entire dataset:", end_time - start_time, "seconds")


# Save the model to disk
with open('models/model.pkl', 'wb') as f:
    pickle.dump(model, f)

with open("models/categories.txt", "w") as f:
    for c in list(unique_categories):
        f.write(str(c) +"\n")

