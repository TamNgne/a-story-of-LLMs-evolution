import os
import json
from pymongo import MongoClient
from bson.json_util import loads
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, "server", ".env")
load_dotenv(ENV_PATH)

def import_json_to_mongodb(uri, db_name, json_folder="mongo_data", drop_existing=False):
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



def merge_and_calculate_scores(uri, db_name): 
    """
    Merges Organization and Provider data, calculates average benchmark scores,
    and saves to a new collection.
    """
    print(f"\n--- Starting Merge & Benchmark Calculation for DB: {db_name} ---")
    
    client = MongoClient(uri)
    db = client[db_name]

    # Define Collections
    org_coll = db["LLMs in Organizations"]
    prov_coll = db["LLMs in Providers"]
    perf_coll = db["LLM Performance"]
    merged_coll = db["LLMs Merged Organization and Provider"]

    # Step 1: Left join Organization -> Provider
    print("Step 1: Merging Organizations with Providers...")
    pipeline_org = [
        {
            "$lookup": {
                "from": "LLMs in Providers",
                "localField": "model_id",
                "foreignField": "model_id",
                "as": "provider_data"
            }
        },
        {
            "$addFields": {
                "provider_id": {"$arrayElemAt": ["$provider_data.provider_id", 0]}
            }
        },
        {
            "$project": {"provider_data": 0}  # remove temp array
        }
    ]
    
    org_docs = list(org_coll.aggregate(pipeline_org))
    print(f" > Loaded {len(org_docs)} documents from Organizations.")

    # Step 2: Get provider-only model_ids 
    print("Step 2: Identifying Provider-only models...")
    org_model_ids = org_coll.distinct("model_id")
    prov_only_docs = list(prov_coll.find({"model_id": {"$nin": org_model_ids}}))
    print(f" > Found {len(prov_only_docs)} models exclusive to Providers.")

    # Step 3: Merge provider-only docs
    org_sample_fields = org_coll.find_one() or {}
    org_field_keys = [k for k in org_sample_fields.keys() if k != "_id"]

    for doc in prov_only_docs:
        merged_doc = {
            **{k: None for k in org_field_keys},  # fill missing org fields with None
            **doc  # overwrite model_id and provider_id from provider data
        }
        org_docs.append(merged_doc)

    print(f" > Total merged documents before scoring: {len(org_docs)}")

    # Step 4: Compute avg_benchmark_score for each doc
    print("Step 4: Calculating Average Benchmark Scores")
    for doc in org_docs:
   
        scores = list(perf_coll.find({"model_id": doc["model_id"]}, {"normalized_score": 1, "_id": 0}))
        
        if scores:
            avg_score = sum(s["normalized_score"] for s in scores) / len(scores)
            doc["avg_benchmark_score"] = avg_score
        else:
            doc["avg_benchmark_score"] = None 

    # Step 5: Insert/update merged collection
    print("Step 5: Saving to 'LLM Merged Organization and Provider'")

    # Optional: Clear old merged data to avoid duplicates if re-running
    # merged_coll.drop() 
    
    count = 0
    for doc in org_docs:
        merged_coll.update_one(
            {"model_id": doc["model_id"]},
            {"$set": doc},
            upsert=True
        )
        count += 1

    print(f"🎉 Merging completed! {count} documents upserted into collection: '{merged_coll.name}'")

if __name__ == "__main__":
    MONGO_URI = os.getenv("MONGODB_URI")
    DATABASE_NAME = os.getenv("DATABASE_NAME")

    # Set drop_existing=True if you want to replace old data

    import_json_to_mongodb(
        uri=MONGO_URI,
        db_name=DATABASE_NAME,
        json_folder="mongo_data",
        drop_existing=False
    )

    merge_and_calculate_scores(
        uri=MONGO_URI, 
        db_name=DATABASE_NAME
    )
