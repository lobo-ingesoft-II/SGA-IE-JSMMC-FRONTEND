from pymongo import MongoClient

# Usa tus credenciales reales en la URI
MONGO_URI = "mongodb+srv://LoboTeam:Jbp1ouyPewOyqFnA@nosqljosuemanrique.om5b7lb.mongodb.net/?retryWrites=true&w=majority&appName=NOSQLjosuemanrique"

# Crear el cliente de MongoDB
client = MongoClient(MONGO_URI)

# Selecciona la base de datos
db = client["prematricula_db"]

# Selecciona la colección (puedes llamarla 'prematriculas')
prematriculas = db["prematriculas"]

# Documento de prueba para prematrícula
nuevo_doc = {
    "apellidos": "Pérez Gómez",
    "nombres": "Juan Carlos",
    "tipoDocumento": "Tarjeta de Identidad",
    "numeroDocumento": "1234567890",
    "fechaNacimiento": "2010-05-15",
    "paisNacimiento": "COLOMBIA",
    "departamentoNacimiento": "CUNDINAMARCA",
    "municipioNacimiento": "Yopal",
    "categoriaSisben": "A",
    "subcategoriaSisben": "A2",
    "direccionResidencia": "Calle 10 #5-20",
    "telefono": "3201234567",
    "rutaEscolar": "Ruta 1",
    "seguroMedico": "Nueva EPS",
    "discapacidad": "NO",
    "detalleDiscapacidad": "",
    "poblacionDesplazada": "NO",
    "fechaDesplazamiento": "",
    "paisResidencia": "COLOMBIA",
    "departamentoResidencia": "CUNDINAMARCA",
    "municipioResidencia": "Yopal",
    "gradoIngreso": "6",
    "institucionAnterior": "Colegio ABC",
    "municipioAnterior": "Yopal",
    "sede": "INSTITUCIÓN EDUCATIVA DEPARTAMENTAL JOSUÉ MANRIQUE",
    "acudiente1Parentesco": "Padre",
    "acudiente1Apellidos": "Pérez Rodríguez",
    "acudiente1Nombres": "Carlos Alberto",
    "acudiente1CC": "987654321",
    "acudiente1Celular": "3109876543",
    "acudiente1Ocupacion": "Ingeniero",
    "acudiente2Parentesco": "Madre",
    "acudiente2Apellidos": "Gómez Ruiz",
    "acudiente2Nombres": "María Fernanda",
    "acudiente2CC": "1122334455",
    "acudiente2Celular": "3112233445",
    "acudiente2Ocupacion": "Docente"
}

# Inserta el documento de prueba
resultado = prematriculas.insert_one(nuevo_doc)
print("Documento insertado con ID:", resultado.inserted_id)

# Prueba de consulta
for doc in prematriculas.find():
    print(doc)