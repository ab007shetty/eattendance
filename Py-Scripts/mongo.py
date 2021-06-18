from pymongo import MongoClient 
  
def store_db(name, owner,data):  
    try: 
        conn = MongoClient() 
        print("Connected successfully!!!") 
    except:   
        print("Could not connect to MongoDB") 
  
    # database 
    db = conn.eattendance 

    collection = db.attendance
    rec_id1 = collection.insert_one({"AttendanceRecord": name, "owner": owner,"data": data})   
    print("Data inserted with record ids",rec_id1)



