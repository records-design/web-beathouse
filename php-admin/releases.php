<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

requireAuth();
$user  = currentUser();
$flash = getFlash();
$pdo   = getDB();

$search = trim($_GET['q'] ?? '');
$status = $_GET['status'] ?? '';
$type   = $_GET['type'] ?? '';

$where  = ["r.status != 'archived'"];
$params = [];
if ($search !== '') {
    $where[] = "(r.title LIKE ? OR a.name LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if (in_array($status, ['published','draft','hidden'])) {
    $where[] = "r.status = ?";
    $params[] = $status;
}
if (in_array($type, ['single','ep','album','mixtape','compilation'])) {
    $where[] = "r.type = ?";
    $params[] = $type;
}
$whereSql = implode(' AND ', $where);

$stmt = $pdo->prepare("
    SELECT r.*, a.name as artist_name
    FROM releases r
    JOIN artists a ON r.artist_id = a.id
    WHERE $whereSql
    ORDER BY r.featured DESC, r.sort_order ASC, r.release_date DESC
");
$stmt->execute($params);
$releases = $stmt->fetchAll();

ob_start();
?>
<div class="page-header">
  <h1 class="page-title">Lanzamientos</h1>
  <a href="/php-admin/release-edit.php?id=new" class="btn btn-primary">+ Nuevo lanzamiento</a>
</div>

<?= renderFlash($flash) ?>

<form method="GET" class="filter-bar">
  <input type="text" name="q" placeholder="Buscar título o artista..." value="<?= h($search) ?>" class="filter-input">
  <select name="status" class="filter-select">
    <option value="">Todos los estados</option>
    <option value="published" <?= $status==='published'?'selected':'' ?>>Publicado</option>
    <option value="draft" <?= $status==='draft'?'selected':'' ?>>Borrador</option>
    <option value="hidden" <?= $status==='hidden'?'selected':'' ?>>Oculto</option>
  </select>
  <select name="type" class="filter-select">
    <option value="">Todos los tipos</option>
    <?php foreach (['single','ep','album','mixtape','compilation'] as $t): ?>
    <option value="<?= $t ?>" <?= $type===$t?'selected':'' ?>><?= strtoupper($t) ?></option>
    <?php endforeach; ?>
  </select>
  <button type="submit" class="btn btn-secondary">Filtrar</button>
  <?php if ($search || $status || $type): ?>
  <a href="/php-admin/releases.php" class="btn btn-secondary">Limpiar</a>
  <?php endif; ?>
</form>

<table>
  <thead>
    <tr>
      <th style="width:50px">Cover</th>
      <th>Título</th>
      <th>Artista</th>
      <th>Tipo</th>
      <th>Estado</th>
      <th>Dest.</th>
      <th>Fecha</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
  <?php foreach ($releases as $r): ?>
    <tr>
      <td>
        <?php if ($r['cover_image']): ?>
        <img src="<?= h($r['cover_image']) ?>" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:4px;display:block;">
        <?php else: ?>
        <div style="width:40px;height:40px;border-radius:4px;background:#2e2e3e;display:flex;align-items:center;justify-content:center;font-size:18px;">&#x1F3B5;</div>
        <?php endif; ?>
      </td>
      <td><strong><?= h($r['title']) ?></strong><br><small style="color:#7070a0"><?= h($r['slug']) ?></small></td>
      <td><?= h($r['artist_name']) ?></td>
      <td><span class="badge badge-gray"><?= h(strtoupper($r['type'])) ?></span></td>
      <td><?= statusBadge($r['status']) ?></td>
      <td><?= $r['featured'] ? '<span style="color:#f59e0b;font-size:18px">&#9733;</span>' : '' ?></td>
      <td><?= $r['release_date'] ? h($r['release_date']) : '—' ?></td>
      <td class="action-cell">
        <a href="/php-admin/release-edit.php?id=<?= $r['id'] ?>" class="btn btn-secondary btn-sm">Editar</a>
        <form method="POST" action="/php-admin/release-edit.php" style="display:inline">
          <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
          <input type="hidden" name="id" value="<?= $r['id'] ?>">
          <input type="hidden" name="action" value="duplicate">
          <button type="submit" class="btn btn-secondary btn-sm">Duplicar</button>
        </form>
        <form method="POST" action="/php-admin/release-edit.php" style="display:inline" onsubmit="return confirm('¿Archivar?')">
          <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
          <input type="hidden" name="id" value="<?= $r['id'] ?>">
          <input type="hidden" name="action" value="archive">
          <button type="submit" class="btn btn-danger btn-sm">Archivar</button>
        </form>
      </td>
    </tr>
  <?php endforeach; ?>
  <?php if (!$releases): ?>
    <tr><td colspan="8" style="text-align:center;color:#7070a0;padding:40px">Sin lanzamientos que mostrar.</td></tr>
  <?php endif; ?>
  </tbody>
</table>
<?php
$content = ob_get_clean();
echo renderLayout('Lanzamientos', $content, $user);
