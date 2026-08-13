<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');  // Reemplazar con el nombre de la DB en Hostinger
define('DB_USER', 'your_database_user');  // Reemplazar con el usuario de la DB en Hostinger
define('DB_PASS', 'your_database_password');  // Reemplazar con la contraseña de la DB en Hostinger
define('DB_CHARSET', 'utf8mb4');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET,
                DB_USER, DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            error_log('DB Error: ' . $e->getMessage());
            die('Error de conexión a la base de datos.');
        }
    }
    return $pdo;
}
