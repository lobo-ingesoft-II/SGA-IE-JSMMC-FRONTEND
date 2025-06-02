from pymongo import MongoClient

# Configuración de conexión a mongoDB

MONGO_URI = "mongodb+srv://LoboTeam:Jbp1ouyPewOyqFnA@nosqljosuemanrique.om5b7lb.mongodb.net/?retryWrites=true&w=majority&appName=NOSQLjosuemanrique"

client = MongoClient(MONGO_URI)

db = client["prematricula_db"]
prematriculas = db["prematriculas"]