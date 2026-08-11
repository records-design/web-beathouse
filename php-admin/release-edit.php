<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/image.php';

requireAuth();
$user = currentUser();
$pdo  = getDB();

$id    = $_GET['id'] ?? ($_POST['id'] ?? 'new');
$isNew = ($id === 'new');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    $action = $_POST['action'] ?? 'save';

    if ($action === 'archive' && !$isNew) {
        $pdo->prepare("UPDATE releases SET status='archived' WHERE id=?")->execute([$id]);
        setFlash('success', 'Lanzamiento archivado.');
        header('Location: /php-admin/releases.php');
        exit;
    }

    if ($action === 'delete' && !$isNew && ($_POST['confirm'] ?? '') === '1') {
        $pdo->prepare("DELETE FROM releases WHERE id=?")->execute([$id]);
        setFlash('success', 'Lanzamiento eliminado.');
        header('Location: /php-admin/releases.php');
        exit;
    }

    if ($action === 'duplicate' && !$isNew) {
        $orig = $pdo->prepare("SELECT * FROM releases WHERE id=?");
        $orig->execute([$id]);
        $src = $orig->fetch();
        if ($src) {
            $newTitle = 'Copia de ' . $src['title'];
            $newSlug  = slugify($newTitle) . '-' . time();
            $pdo->prepare("INSERT INTO releases (artist_id,title,slug,type,status,cover_image,description,release_date,publish_at,featured,sort_order,spotify_url,apple_music_url,youtube_url,soundcloud_url,bandcamp_url)
                           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
                ->execute([$src['artist_id'],$newTitle,$newSlug,$src['type'],'draft',$src['cover_image'],$src['description'],$src['release_date'],$src['publish_at'],$src['featured'],$src['sort_order'],$src['spotify_url'],$src['apple_music_url'],$src['youtube_url'],$src['soundcloud_url'],$src['bandcamp_url']]);
            $newId = $pdo->lastInsertId();
            setFlash('success', 'Lanzamiento duplicado como borrador.');
            header("Location: /php-admin/release-edit.php?id=$newId");
            exit;
        }
    }

    // Save
    $title    = trim($_POST['title'] ?? '');
    $errors   = [];
    if ($title === '') $errors[] = 'El título es obligatorio.';
    $artistId = (int)($_POST['artist_id'] ?? 0);
    if (!$artistId) $errors[] = 'Seleccioná un artista.';

    $slug = trim($_POST['slug'] ?? '');
    if ($slug === '') $slug = slugify($title);
    else $slug = slugify($slug);
    if ($slug === '') $errors[] = 'No se pudo generar un slug válido.';

    if ($slug !== '') {
        $q = $pdo->prepare("SELECT id FROM releases WHERE slug=? AND id != ?");
        $q->execute([$slug, $isNew ? 0 : $id]);
        if ($q->fetch()) $errors[] = 'El slug "'.$slug.'" ya está en uso.';
    }

    $coverImage = $_POST['existing_cover_image'] ?? '';
    if (!empty($_FILES['cover_image']['name'])) {
        $err = validateImageUpload($_FILES['cover_image']);
        if ($err) {
            $errors[] = $err;
        } else {
            $destDir = __DIR__ . '/../uploads/releases/' . $slug;
            $result  = processImage($_FILES['cover_image']['tmp_name'], $destDir, $slug, 'release');
            if (isset($result['error'])) {
                $errors[] = $result['error'];
            } else {
                $coverImage = '/uploads/releases/' . $slug . '/large.jpg';
                // Square warning check (width vs height)
                if (isset($result['width'], $result['height'])) {
                    $ratio = $result['width'] / max($result['height'], 1);
                    if ($ratio < 0.8 || $ratio > 1.25) {
                        setFlash('warning', 'La imagen de cover no es cuadrada (' . $result['width'] . 'x' . $result['height'] . 'px). Se recomienda 1:1 para covers.');
                    }
                }
            }
        }
    }

    if (!$errors) {
        $fields = [
            'artist_id'       => $artistId,
            'title'           => $title,
            'slug'            => $slug,
            'type'            => in_array($_POST['type']??'', ['single','ep','album','mixtape','compilation']) ? $_POST['type'] : 'single',
            'status'          => in_array($_POST['status']??'', ['published','draft','hidden','archived']) ? $_POST['status'] : 'draft',
            'cover_image'     => $coverImage,
            'description'     => trim($_POST['description'] ?? ''),
            'release_date'    => $_POST['release_date'] ?: null,
            'publish_at'      => $_POST['publish_at'] ?: null,
            'featured'        => isset($_POST['featured']) ? 1 : 0,
            'sort_order'      => (int)($_POST['sort_order'] ?? 0),
            'spotify_url'     => trim($_POST['spotify_url'] ?? ''),
            'apple_music_url' => trim($_POST['apple_music_url'] ?? ''),
            'youtube_url'     => trim($_POST['youtube_url'] ?? ''),
            'soundcloud_url'  => trim($_POST['soundcloud_url'] ?? ''),
            'bandcamp_url'    => trim($_POST['bandcamp_url'] ?? ''),
        ];

        if ($isNew) {
            $cols = implode(', ', array_keys($fields));
            $vals = implode(', ', array_fill(0, count($fields), '?'));
            $pdo->prepare("INSERT INTO releases ($cols) VALUES ($vals)")->execute(array_values($fields));
            $newId = $pdo->lastInsertId();
            setFlash('success', 'Lanzamiento "'.$title.'" creado.');
            header("Location: /php-admin/release-edit.php?id=$newId");
            exit;
        } else {
            $sets = implode(', ', array_map(fn($k) => "$k=?", array_keys($fields)));
            $vals = array_values($fields);
            $vals[] = $id;
            $pdo->prepare("UPDATE releases SET $sets WHERE id=?")->execute($vals);
            setFlash('success', 'Lanzamiento guardado.');
            header("Location: /php-admin/release-edit.php?id=$id");
            exit;
        }
    }
    $release = array_merge(['id'=>$id,'cover_image'=>$coverImage], $_POST);
} else {
    if ($isNew) {
        $release = [
            'id'=>'new','artist_id'=>'','title'=>'','slug'=>'','type'=>'single','status'=>'draft',
            'cover_image'=>'','description'=>'','release_date'=>'','publish_at'=>'',
            'featured'=>0,'sort_order'=>0,'spotify_url'=>'','apple_music_url'=>'',
            'youtube_url'=>'','soundcloud_url'=>'','bandcamp_url'=>'',
        ];
        $errors = [];
    } else {
        $stmt = $pdo->prepare("SELECT * FROM releases WHERE id=?");
        $stmt->execute([$id]);
        $release = $stmt->fetch();
        if (!$release) { setFlash('error','Lanzamiento no encontrado.'); header('Location: /php-admin/releases.php'); exit; }
        $errors = [];
    }
}

$artistsList = $pdo->query("SELECT id, name FROM artists WHERE status != 'archived' ORDER BY name ASC")->fetchAll();
$pageTitle = $isNew ? 'Nuevo lanzamiento' : 'Editar: '.($release['title'] ?? '');

ob_start();
?>
<div class="page-header">
  <h1 class="page-title"><?= h($pageTitle) ?></h1>
  <a href="/php-admin/releases.php" class="btn btn-secondary">&larr; Volver</a>
</div>

<?php if (!empty($errors)): ?>
<div class="flash flash-error">
  <?php foreach ($errors as $e): ?><div><?= h($e) ?></div><?php endforeach; ?>
</div>
<?php endif; ?>
<?= renderFlash(getFlash()) ?>

<form method="POST" action="/php-admin/release-edit.php" enctype="multipart/form-data" novalidate>
  <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
  <input type="hidden" name="id" value="<?= h((string)$id) ?>">
  <input type="hidden" name="action" value="save">
  <input type="hidden" name="existing_cover_image" value="<?= h($release['cover_image'] ?? '') ?>">

  <div class="form-row">
    <div class="form-group" style="flex:2">
      <label for="title">Título <span class="req">*</span></label>
      <input type="text" id="title" name="title" required value="<?= h($release['title'] ?? '') ?>" oninput="autoSlugRelease()">
    </div>
    <div class="form-group" style="flex:1">
      <label for="slug">Slug</label>
      <input type="text" id="slug" name="slug" value="<?= h($release['slug'] ?? '') ?>">
    </div>
  </div>

  <div class="form-row">
    <div class="form-group" style="flex:2">
      <label for="artist_id">Artista <span class="req">*</span></label>
      <select id="artist_id" name="artist_id" required>
        <option value="">— Seleccioná artista —</option>
        <?php foreach ($artistsList as $a): ?>
        <option value="<?= $a['id'] ?>" <?= ($release['artist_id'] ?? '') == $a['id'] ? 'selected' : '' ?>><?= h($a['name']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="form-group" style="flex:1">
      <label for="type">Tipo</label>
      <select id="type" name="type">
        <?php foreach (['single'=>'Single','ep'=>'EP','album'=>'Álbum','mixtape'=>'Mixtape','compilation'=>'Compilación'] as $v=>$l): ?>
        <option value="<?= $v ?>" <?= ($release['type']??'')===$v?'selected':'' ?>><?= $l ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="form-group" style="flex:1">
      <label for="status">Estado</label>
      <select id="status" name="status">
        <?php foreach (['published'=>'Publicado','draft'=>'Borrador','hidden'=>'Oculto','archived'=>'Archivado'] as $v=>$l): ?>
        <option value="<?= $v ?>" <?= ($release['status']??'')===$v?'selected':'' ?>><?= $l ?></option>
        <?php endforeach; ?>
      </select>
    </div>
  </div>

  <div class="form-group">
    <label for="description">Descripción</label>
    <textarea id="description" name="description" rows="4"><?= h($release['description'] ?? '') ?></textarea>
  </div>

  <div class="form-section-title">Cover</div>
  <div class="form-group">
    <?php if (!empty($release['cover_image'])): ?>
    <img src="<?= h($release['cover_image']) ?>" alt="" id="coverPreview" class="img-preview" style="max-width:200px">
    <?php endif; ?>
    <input type="file" name="cover_image" accept="image/jpeg,image/png,image/webp" onchange="previewCover(this)">
    <p class="field-hint">Mín. recomendado: 1200×1200px cuadrado. JPG, PNG o WebP, máx. 15MB.</p>
  </div>

  <div class="form-section-title">Fechas y orden</div>
  <div class="form-row">
    <div class="form-group">
      <label for="release_date">Fecha de lanzamiento</label>
      <input type="date" id="release_date" name="release_date" value="<?= h($release['release_date'] ?? '') ?>">
    </div>
    <div class="form-group">
      <label for="publish_at">Publicar automáticamente el</label>
      <input type="datetime-local" id="publish_at" name="publish_at" value="<?= h($release['publish_at'] ?? '') ?>">
    </div>
    <div class="form-group">
      <label for="sort_order">Orden</label>
      <input type="number" id="sort_order" name="sort_order" value="<?= (int)($release['sort_order'] ?? 0) ?>" min="0" style="width:100px">
    </div>
  </div>
  <div class="form-row checkbox-row">
    <label class="checkbox-label">
      <input type="checkbox" name="featured" value="1" <?= !empty($release['featured'])?'checked':'' ?>>
      Lanzamiento destacado (aparece primero)
    </label>
  </div>

  <div class="form-section-title">Links de streaming</div>
  <?php
  $links = ['spotify_url'=>'Spotify','apple_music_url'=>'Apple Music','youtube_url'=>'YouTube','soundcloud_url'=>'SoundCloud','bandcamp_url'=>'Bandcamp'];
  foreach ($links as $field => $label): ?>
  <div class="form-group">
    <label for="<?= $field ?>"><?= $label ?></label>
    <input type="url" id="<?= $field ?>" name="<?= $field ?>" value="<?= h($release[$field] ?? '') ?>" placeholder="https://...">
  </div>
  <?php endforeach; ?>

  <div class="form-actions">
    <button type="submit" class="btn btn-primary">Guardar lanzamiento</button>
    <?php if (!$isNew): ?>
    <a href="/php-admin/releases.php" class="btn btn-secondary">Cancelar</a>
    <button type="submit" form="deleteReleaseForm" class="btn btn-danger" onclick="return confirm('¿Eliminar este lanzamiento? No se puede deshacer.')">Eliminar</button>
    <?php endif; ?>
  </div>
</form>

<?php if (!$isNew): ?>
<form id="deleteReleaseForm" method="POST" action="/php-admin/release-edit.php" style="display:none">
  <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
  <input type="hidden" name="id" value="<?= h((string)$id) ?>">
  <input type="hidden" name="action" value="delete">
  <input type="hidden" name="confirm" value="1">
</form>
<?php endif; ?>

<script>
function autoSlugRelease() {
  var t = document.getElementById('title').value;
  var s = t.toLowerCase()
    .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i')
    .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
  document.getElementById('slug').value = s;
}
function previewCover(input) {
  if (!input.files || !input.files[0]) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = document.getElementById('coverPreview');
    if (!img) {
      img = document.createElement('img');
      img.id = 'coverPreview';
      img.className = 'img-preview';
      img.style.maxWidth = '200px';
      input.parentNode.insertBefore(img, input);
    }
    img.src = e.target.result;
    var tmp = new Image();
    tmp.onload = function() {
      var ratio = tmp.width / Math.max(tmp.height, 1);
      if (ratio < 0.8 || ratio > 1.25) {
        alert('Advertencia: el cover no es cuadrado (' + tmp.width + 'x' + tmp.height + 'px). Se recomienda 1:1 para covers.');
      }
    };
    tmp.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}
</script>
<?php
$content = ob_get_clean();
echo renderLayout($pageTitle, $content, $user);
