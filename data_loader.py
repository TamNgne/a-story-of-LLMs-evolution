import os
import json
from pymongo import MongoClient
from bson.json_util import loads

def import_json_to_mongodb(uri, db_name, json_folder="mongo_exports", drop_existing=False):
    # Connect to MongoDB
    client = MongoClient(uri)
    db = client[db_name]

    # Get all json files
    json_files = [f for f in os.listdir(json_folder) if f.endswith(".json")]

    print(f"Found {len(json_files)} JSON files in folder '{json_folder}'")

    for json_file in json_files:
        collection_name = os.path.splitext(json_file)[0]
        file_path = os.path.join(json_folder, json_file)

        print(f"\nImporting '{json_file}' → collection '{collection_name}'")

        # Load JSON array from file
        with open(file_path, "r", encoding="utf-8") as f:
            data = loads(f.read())   

        # Optionally drop existing collection
        if drop_existing:
            print(f"Dropping existing collection '{collection_name}'...")
            db[collection_name].drop()

        # Insert documents
        if isinstance(data, list):
            if data:
                db[collection_name].insert_many(data)
                print(f"Inserted {len(data)} documents.")
            else:
                print("File contains an empty list. Skipped.")
        else:
            # If the file contains a single object instead of a list
            db[collection_name].insert_one(data)
            print("Inserted 1 document.")

    print("\n🎉 Import completed successfully!")



if __name__ == "__main__":
   
    MONGO_URI = "mongodb://localhost:27017"          
    DATABASE_NAME = "your_database_name" #Adjust

    # Set drop_existing=True if you want to replace old data
    import_json_to_mongodb(
        uri=MONGO_URI,
        db_name=DATABASE_NAME,
        json_folder="mongo_exports",
        drop_existing=False
    )
