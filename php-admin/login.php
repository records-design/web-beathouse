<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

startSecureSession();

if (!empty($_SESSION['user_id'])) {
    header('Location: /php-admin/dashboard.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        $error = 'Token de seguridad inválido. Recargá la página.';
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        if ($username === '' || $password === '') {
            $error = 'Completá usuario y contraseña.';
        } else {
            $pdo = getDB();
            $stmt = $pdo->prepare("SELECT id, username, password_hash, role, active FROM users WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && $user['active'] && password_verify($password, $user['password_hash'])) {
                session_regenerate_id(true);
                $_SESSION['user_id']  = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role']     = $user['role'];
                header('Location: /php-admin/dashboard.php');
                exit;
            } else {
                $error = 'Usuario o contraseña incorrectos.';
            }
        }
    }
}

$csrf = csrfToken();
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Iniciar sesión &mdash; BeatHouse Admin</title>
<link rel="stylesheet" href="/php-admin/assets/admin.css">
</head>
<body class="login-body">
<div class="login-wrap">
  <div class="login-brand">
    <div class="login-logo"><h1>BeatHouse</h1><p>Panel de administración</p></div>
  </div>
  <?php if ($error): ?>
  <div class="flash flash-error"><?= h($error) ?></div>
  <?php endif; ?>
  <form method="POST" class="login-form" autocomplete="off" novalidate>
    <input type="hidden" name="csrf_token" value="<?= h($csrf) ?>">
    <div class="form-group">
      <label for="username">Usuario</label>
      <input type="text" id="username" name="username" required autofocus
             value="<?= h(htmlspecialchars($_POST['username'] ?? '', ENT_QUOTES)) ?>">
    </div>
    <div class="form-group">
      <label for="password">Contraseña</label>
      <input type="password" id="password" name="password" required>
    </div>
    <button type="submit" class="btn btn-primary" style="width:100%">Entrar</button>
  </form>
</div>
</body>
</html>
