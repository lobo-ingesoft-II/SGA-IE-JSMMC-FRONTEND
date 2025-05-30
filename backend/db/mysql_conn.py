import mysql.connector

# Configuración de conexión a MySQL en Clever Cloud
MYSQL_CONFIG = {
    "host": "bcj9asygzv10rjmwhyss-mysql.services.clever-cloud.com",
    "user": "u3qdp6wlms7b0pdx",
    "password": "2xtwfSLG924Lt1Zt7P8v",
    "database": "bcj9asygzv10rjmwhyss",
    "port": 3306
}

def get_mysql_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

# Ejemplo de uso:
if __name__ == "__main__":
    conn = get_mysql_connection()
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES;")
    for table in cursor.fetchall():
        print(table)
    cursor.close()
    conn.close()