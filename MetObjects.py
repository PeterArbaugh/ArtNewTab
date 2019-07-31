import pandas as pd

# Quick script to get the master list of Met objects, select for public domain, and add in JSON format.

def get_objects():

    url = "https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv"
    obj_df = pd.read_csv(url)

    df = obj_df[['Object ID', 'Department', 'Object Name', 'Classification', 'Tags']].loc[obj_df['Is Public Domain'] == True]

    df.to_json('MetTab_Chrome_Extension/MetObjects.json')