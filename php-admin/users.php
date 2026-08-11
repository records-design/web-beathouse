<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

requireAdmin();
$user  = currentUser();
$flash = getFlash();
$pdo   = getDB();
$me    = $user['id'];

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';
        $role     = in_array($_POST['role'] ?? '', ['admin','editor']) ? $_POST['role'] : 'editor';
        $errors   = [];
        if ($username === '') $errors[] = 'El usuario es obligatorio.';
        if (strlen($password) < 8) $errors[] = 'La contraseña debe tener al menos 8 caracteres.';
        if (!$errors) {
            $check = $pdo->prepare("SELECT id FROM users WHERE username=?");
            $check->execute([$username]);
            if ($check->fetch()) {
                $errors[] = 'El nombre de usuario ya existe.';
            } else {
                $hash = password_hash($password, PASSWORD_BCRYPT);
                $pdo->prepare("INSERT INTO users (username, password_hash, role) VALUES (?,?,?)")->execute([$username,$hash,$role]);
                setFlash('success', 'Usuario "'.$username.'" creado.');
                header('Location: /php-admin/users.php');
                exit;
            }
        }
        // Show errors below
    }

    if ($action === 'update_role') {
        $uid  = (int)($_POST['uid'] ?? 0);
        $role = in_array($_POST['role'] ?? '', ['admin','editor']) ? $_POST['role'] : 'editor';
        if ($uid && $uid !== (int)$me) {
            $pdo->prepare("UPDATE users SET role=? WHERE id=?")->execute([$role, $uid]);
            setFlash('success', 'Rol actualizado.');
        }
        header('Location: /php-admin/users.php');
        exit;
    }

    if ($action === 'toggle_active') {
        $uid = (int)($_POST['uid'] ?? 0);
        if ($uid && $uid !== (int)$me) {
            $pdo->prepare("UPDATE users SET active = NOT active WHERE id=?")->execute([$uid]);
            setFlash('success', 'Estado de usuario cambiado.');
        }
        header('Location: /php-admin/users.php');
        exit;
    }

    if ($action === 'delete') {
        $uid = (int)($_POST['uid'] ?? 0);
        if ($uid && $uid !== (int)$me) {
            $pdo->prepare("DELETE FROM users WHERE id=?")->execute([$uid]);
            setFlash('success', 'Usuario eliminado.');
        }
        header('Location: /php-admin/users.php');
        exit;
    }
}

$users  = $pdo->query("SELECT * FROM users ORDER BY role ASC, username ASC")->fetchAll();
$errors = $errors ?? [];

ob_start();
?>
<div class="page-header">
  <h1 class="page-title">Usuarios</h1>
</div>

<?php if (!empty($errors)): ?>
<div class="flash flash-error"><?php foreach ($errors as $e) echo h($e).'<br>'; ?></div>
<?php endif; ?>
<?= renderFlash($flash) ?>

<div class="form-card">
  <h2 class="section-title">Nuevo usuario</h2>
  <form method="POST" novalidate>
    <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
    <input type="hidden" name="action" value="create">
    <div class="form-row">
      <div class="form-group" style="flex:2">
        <label for="new_username">Usuario</label>
        <input type="text" id="new_username" name="username" required value="<?= h($_POST['username'] ?? '') ?>">
      </div>
      <div class="form-group" style="flex:2">
        <label for="new_password">Contraseña (mín. 8 chars)</label>
        <input type="password" id="new_password" name="password" required>
      </div>
      <div class="form-group" style="flex:1">
        <label for="new_role">Rol</label>
        <select id="new_role" name="role">
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div class="form-group" style="display:flex;align-items:flex-end">
        <button type="submit" class="btn btn-primary">Crear</button>
      </div>
    </div>
  </form>
</div>

<h2 class="section-title" style="margin-top:32px">Usuarios existentes</h2>
<table>
  <thead>
    <tr><th>Usuario</th><th>Rol</th><th>Activo</th><th>Creado</th><th>Acciones</th></tr>
  </thead>
  <tbody>
  <?php foreach ($users as $u): ?>
    <tr>
      <td><?= h($u['username']) ?> <?= $u['id'] == $me ? '<span class="badge badge-gray">(vos)</span>' : '' ?></td>
      <td><?= roleBadge($u['role']) ?></td>
      <td><?= $u['active'] ? '<span class="check-yes">Activo</span>' : '<span class="check-no">Inactivo</span>' ?></td>
      <td><?= h(substr($u['created_at'], 0, 10)) ?></td>
      <td class="action-cell">
        <?php if ($u['id'] != $me): ?>
        <form method="POST" style="display:inline">
          <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
          <input type="hidden" name="action" value="update_role">
          <input type="hidden" name="uid" value="<?= $u['id'] ?>">
          <select name="role" style="background:#22222e;color:#e8e8f0;border:1px solid #2e2e3e;border-radius:4px;padding:4px">
            <option value="editor" <?= $u['role']==='editor'?'selected':'' ?>>Editor</option>
            <option value="admin"  <?= $u['role']==='admin'?'selected':'' ?>>Admin</option>
          </select>
          <button type="submit" class="btn btn-secondary btn-sm">Cambiar rol</button>
        </form>
        <form method="POST" style="display:inline">
          <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
          <input type="hidden" name="action" value="toggle_active">
          <input type="hidden" name="uid" value="<?= $u['id'] ?>">
          <button type="submit" class="btn btn-secondary btn-sm"><?= $u['active'] ? 'Desactivar' : 'Activar' ?></button>
        </form>
        <form method="POST" style="display:inline" onsubmit="return confirm('¿Eliminar usuario <?= h($u['username']) ?>?')">
          <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
          <input type="hidden" name="action" value="delete">
          <input type="hidden" name="uid" value="<?= $u['id'] ?>">
          <button type="submit" class="btn btn-danger btn-sm">Eliminar</button>
        </form>
        <?php else: ?>
        <span style="color:#7070a0">—</span>
        <?php endif; ?>
      </td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
<?php
$content = ob_get_clean();
echo renderLayout('Usuarios', $content, $user);
