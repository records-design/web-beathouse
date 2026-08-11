<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

requireAuth();
$user  = currentUser();
$flash = getFlash();
$pdo   = getDB();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    $current = $_POST['current_password'] ?? '';
    $new1    = $_POST['new_password'] ?? '';
    $new2    = $_POST['new_password2'] ?? '';

    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id=?");
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();

    if (!$row || !password_verify($current, $row['password_hash'])) {
        $errors[] = 'La contraseña actual es incorrecta.';
    } elseif (strlen($new1) < 8) {
        $errors[] = 'La nueva contraseña debe tener al menos 8 caracteres.';
    } elseif ($new1 !== $new2) {
        $errors[] = 'Las contraseñas nuevas no coinciden.';
    } else {
        $hash = password_hash($new1, PASSWORD_BCRYPT);
        $pdo->prepare("UPDATE users SET password_hash=? WHERE id=?")->execute([$hash, $user['id']]);
        setFlash('success', 'Contraseña actualizada correctamente.');
        header('Location: /php-admin/account.php');
        exit;
    }
}

ob_start();
?>
<div class="page-header">
  <h1 class="page-title">Mi cuenta</h1>
</div>

<?php if (!empty($errors)): ?>
<div class="flash flash-error"><?php foreach ($errors as $e) echo h($e).'<br>'; ?></div>
<?php endif; ?>
<?= renderFlash($flash) ?>

<div class="form-card" style="max-width:500px">
  <h2 class="section-title">Cambiar contraseña</h2>
  <p style="color:#7070a0;margin-bottom:20px">Sesión activa como: <strong><?= h($user['username']) ?></strong> (<?= h($user['role']) ?>)</p>
  <form method="POST" novalidate>
    <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
    <div class="form-group">
      <label for="current_password">Contraseña actual</label>
      <input type="password" id="current_password" name="current_password" required>
    </div>
    <div class="form-group">
      <label for="new_password">Nueva contraseña (mín. 8 chars)</label>
      <input type="password" id="new_password" name="new_password" required>
    </div>
    <div class="form-group">
      <label for="new_password2">Repetir nueva contraseña</label>
      <input type="password" id="new_password2" name="new_password2" required>
    </div>
    <button type="submit" class="btn btn-primary">Actualizar contraseña</button>
  </form>
</div>
<?php
$content = ob_get_clean();
echo renderLayout('Mi cuenta', $content, $user);
