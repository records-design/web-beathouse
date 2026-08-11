<?php
require_once __DIR__ . '/includes/auth.php';
startSecureSession();
if (!empty($_SESSION['user_id'])) {
    header('Location: /php-admin/dashboard.php');
} else {
    header('Location: /php-admin/login.php');
}
exit;
