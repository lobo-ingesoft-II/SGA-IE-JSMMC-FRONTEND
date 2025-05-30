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
