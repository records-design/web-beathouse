<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/image.php';

requireAuth();
$user = currentUser();
$pdo  = getDB();

$id = $_GET['id'] ?? ($_POST['id'] ?? 'new');
$isNew = ($id === 'new');

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    $action = $_POST['action'] ?? 'save';

    if ($action === 'archive' && !$isNew) {
        $pdo->prepare("UPDATE artists SET status='archived' WHERE id=?")->execute([$id]);
        setFlash('success', 'Artista archivado.');
        header('Location: /php-admin/artists.php');
        exit;
    }

    if ($action === 'delete' && !$isNew && ($_POST['confirm'] ?? '') === '1') {
        $pdo->prepare("DELETE FROM artists WHERE id=?")->execute([$id]);
        setFlash('success', 'Artista eliminado.');
        header('Location: /php-admin/artists.php');
        exit;
    }

    // Save / create
    $name     = trim($_POST['name'] ?? '');
    $errors   = [];
    if ($name === '') $errors[] = 'El nombre es obligatorio.';

    $slug = trim($_POST['slug'] ?? '');
    if ($slug === '') $slug = slugify($name);
    else $slug = slugify($slug);

    if ($slug === '') $errors[] = 'No se pudo generar un slug válido.';

    // Check slug uniqueness
    if ($slug !== '') {
        $q = $pdo->prepare("SELECT id FROM artists WHERE slug=? AND id != ?");
        $q->execute([$slug, $isNew ? 0 : $id]);
        if ($q->fetch()) {
            $errors[] = 'El slug "'.$slug.'" ya está en uso por otro artista.';
        }
    }

    // Image upload
    $mainImage     = $_POST['existing_main_image'] ?? '';
    $carouselImage = $_POST['existing_carousel_image'] ?? '';

    if (!empty($_FILES['main_image']['name'])) {
        $err = validateImageUpload($_FILES['main_image']);
        if ($err) {
            $errors[] = $err;
        } else {
            $destDir = __DIR__ . '/../uploads/artists/' . $slug . '/main';
            $result  = processImage($_FILES['main_image']['tmp_name'], $destDir, $slug, 'artist');
            if (isset($result['error'])) {
                $errors[] = $result['error'];
            } else {
                $mainImage = '/uploads/artists/' . $slug . '/main/large.jpg';
            }
        }
    }

    if (!empty($_FILES['carousel_image']['name'])) {
        $err = validateImageUpload($_FILES['carousel_image']);
        if ($err) {
            $errors[] = $err;
        } else {
            $destDir = __DIR__ . '/../uploads/artists/' . $slug . '/carousel';
            $result  = processImage($_FILES['carousel_image']['tmp_name'], $destDir, $slug, 'artist');
            if (isset($result['error'])) {
                $errors[] = $result['error'];
            } else {
                $carouselImage = '/uploads/artists/' . $slug . '/carousel/large.jpg';
            }
        }
    }

    if (!$errors) {
        $fields = [
            'name'               => $name,
            'slug'               => $slug,
            'bio'                => trim($_POST['bio'] ?? ''),
            'genre'              => trim($_POST['genre'] ?? ''),
            'status'             => in_array($_POST['status']??'', ['published','draft','hidden','archived']) ? $_POST['status'] : 'draft',
            'main_image'         => $mainImage,
            'carousel_image'     => $carouselImage,
            'main_focal_x'       => (int)($_POST['main_focal_x'] ?? 50),
            'main_focal_y'       => (int)($_POST['main_focal_y'] ?? 20),
            'carousel_focal_x'   => (int)($_POST['carousel_focal_x'] ?? 50),
            'carousel_focal_y'   => (int)($_POST['carousel_focal_y'] ?? 30),
            'show_in_roster'     => isset($_POST['show_in_roster'])   ? 1 : 0,
            'show_in_carousel'   => isset($_POST['show_in_carousel']) ? 1 : 0,
            'show_in_ticker'     => isset($_POST['show_in_ticker'])   ? 1 : 0,
            'roster_order'       => (int)($_POST['roster_order'] ?? 0),
            'carousel_order'     => (int)($_POST['carousel_order'] ?? 0),
            'ticker_order'       => (int)($_POST['ticker_order'] ?? 0),
            'spotify_url'        => trim($_POST['spotify_url'] ?? ''),
            'instagram_url'      => trim($_POST['instagram_url'] ?? ''),
            'youtube_url'        => trim($_POST['youtube_url'] ?? ''),
            'tiktok_url'         => trim($_POST['tiktok_url'] ?? ''),
            'soundcloud_url'     => trim($_POST['soundcloud_url'] ?? ''),
            'apple_music_url'    => trim($_POST['apple_music_url'] ?? ''),
        ];

        if ($isNew) {
            $cols = implode(', ', array_keys($fields));
            $vals = implode(', ', array_fill(0, count($fields), '?'));
            $pdo->prepare("INSERT INTO artists ($cols) VALUES ($vals)")->execute(array_values($fields));
            $newId = $pdo->lastInsertId();
            setFlash('success', 'Artista "'.$name.'" creado.');
            header("Location: /php-admin/artist-edit.php?id=$newId");
            exit;
        } else {
            $sets = implode(', ', array_map(fn($k) => "$k=?", array_keys($fields)));
            $vals = array_values($fields);
            $vals[] = $id;
            $pdo->prepare("UPDATE artists SET $sets WHERE id=?")->execute($vals);
            setFlash('success', 'Artista guardado.');
            header("Location: /php-admin/artist-edit.php?id=$id");
            exit;
        }
    }
    // Fall through with errors — show form with $_POST values
    $artist = array_merge(['id'=>$id,'main_image'=>$mainImage,'carousel_image'=>$carouselImage], $_POST);
} else {
    if ($isNew) {
        $artist = [
            'id'=>'new','name'=>'','slug'=>'','bio'=>'','genre'=>'','status'=>'draft',
            'main_image'=>'','carousel_image'=>'','main_focal_x'=>50,'main_focal_y'=>20,
            'carousel_focal_x'=>50,'carousel_focal_y'=>30,
            'show_in_roster'=>1,'show_in_carousel'=>0,'show_in_ticker'=>0,
            'roster_order'=>0,'carousel_order'=>0,'ticker_order'=>0,
            'spotify_url'=>'','instagram_url'=>'','youtube_url'=>'',
            'tiktok_url'=>'','soundcloud_url'=>'','apple_music_url'=>'',
        ];
        $errors = [];
    } else {
        $stmt = $pdo->prepare("SELECT * FROM artists WHERE id=?");
        $stmt->execute([$id]);
        $artist = $stmt->fetch();
        if (!$artist) { setFlash('error', 'Artista no encontrado.'); header('Location: /php-admin/artists.php'); exit; }
        $errors = [];
    }
}

$pageTitle = $isNew ? 'Nuevo artista' : 'Editar: '.($artist['name'] ?? '');

ob_start();
?>
<div class="page-header">
  <h1 class="page-title"><?= h($pageTitle) ?></h1>
  <a href="/php-admin/artists.php" class="btn btn-secondary">&larr; Volver</a>
</div>

<?php if (!empty($errors)): ?>
<div class="flash flash-error">
  <?php foreach ($errors as $e): ?><div><?= h($e) ?></div><?php endforeach; ?>
</div>
<?php endif; ?>

<?= renderFlash(getFlash()) ?>

<form method="POST" action="/php-admin/artist-edit.php" enctype="multipart/form-data" novalidate>
  <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
  <input type="hidden" name="id" value="<?= h((string)$id) ?>">
  <input type="hidden" name="action" value="save">
  <input type="hidden" name="existing_main_image" value="<?= h($artist['main_image'] ?? '') ?>">
  <input type="hidden" name="existing_carousel_image" value="<?= h($artist['carousel_image'] ?? '') ?>">

  <div class="form-row">
    <div class="form-group" style="flex:2">
      <label for="name">Nombre <span class="req">*</span></label>
      <input type="text" id="name" name="name" required value="<?= h($artist['name'] ?? '') ?>" oninput="autoSlug()">
    </div>
    <div class="form-group" style="flex:1">
      <label for="slug">Slug (URL)</label>
      <input type="text" id="slug" name="slug" value="<?= h($artist['slug'] ?? '') ?>">
    </div>
  </div>

  <div class="form-row">
    <div class="form-group" style="flex:1">
      <label for="genre">Género musical</label>
      <input type="text" id="genre" name="genre" value="<?= h($artist['genre'] ?? '') ?>">
    </div>
    <div class="form-group" style="flex:1">
      <label for="status">Estado</label>
      <select id="status" name="status">
        <?php foreach (['published'=>'Publicado','draft'=>'Borrador','hidden'=>'Oculto','archived'=>'Archivado'] as $v=>$l): ?>
        <option value="<?= $v ?>" <?= ($artist['status']??'')===$v?'selected':'' ?>><?= $l ?></option>
        <?php endforeach; ?>
      </select>
    </div>
  </div>

  <div class="form-group">
    <label for="bio">Biografía</label>
    <textarea id="bio" name="bio" rows="5"><?= h($artist['bio'] ?? '') ?></textarea>
  </div>

  <div class="form-section-title">Imágenes</div>
  <div class="form-row">
    <div class="form-group" style="flex:1">
      <label>Imagen principal (roster)</label>
      <?php if (!empty($artist['main_image'])): ?>
        <div class="img-preview-wrap">
          <img src="<?= h($artist['main_image']) ?>" id="mainPreview" class="img-preview" alt="">
          <div class="focal-picker" id="mainFocalPicker" data-field="main">
            <div class="focal-dot" id="mainFocalDot"></div>
          </div>
        </div>
        <p class="field-hint">Punto focal actual: <?= (int)($artist['main_focal_x']??50) ?>% / <?= (int)($artist['main_focal_y']??20) ?>%</p>
      <?php endif; ?>
      <input type="file" name="main_image" accept="image/jpeg,image/png,image/webp" onchange="previewImg(this,'mainPreview','mainFocalPicker')">
      <input type="hidden" name="main_focal_x" id="main_focal_x" value="<?= (int)($artist['main_focal_x']??50) ?>">
      <input type="hidden" name="main_focal_y" id="main_focal_y" value="<?= (int)($artist['main_focal_y']??20) ?>">
      <p class="field-hint">Mín. recomendado: 800×1000px. JPG, PNG o WebP, máx. 15MB.</p>
    </div>
    <div class="form-group" style="flex:1">
      <label>Imagen carousel</label>
      <?php if (!empty($artist['carousel_image'])): ?>
        <div class="img-preview-wrap">
          <img src="<?= h($artist['carousel_image']) ?>" id="carouselPreview" class="img-preview" alt="">
          <div class="focal-picker" id="carouselFocalPicker" data-field="carousel">
            <div class="focal-dot" id="carouselFocalDot"></div>
          </div>
        </div>
      <?php endif; ?>
      <input type="file" name="carousel_image" accept="image/jpeg,image/png,image/webp" onchange="previewImg(this,'carouselPreview','carouselFocalPicker')">
      <input type="hidden" name="carousel_focal_x" id="carousel_focal_x" value="<?= (int)($artist['carousel_focal_x']??50) ?>">
      <input type="hidden" name="carousel_focal_y" id="carousel_focal_y" value="<?= (int)($artist['carousel_focal_y']??30) ?>">
      <p class="field-hint">Mín. recomendado: 1200×800px. JPG, PNG o WebP, máx. 15MB.</p>
    </div>
  </div>

  <div class="form-section-title">Visibilidad en la web</div>
  <div class="form-row checkbox-row">
    <label class="checkbox-label">
      <input type="checkbox" name="show_in_roster" value="1" <?= !empty($artist['show_in_roster'])?'checked':'' ?>>
      Mostrar en roster
    </label>
    <label class="checkbox-label">
      <input type="checkbox" name="show_in_carousel" value="1" <?= !empty($artist['show_in_carousel'])?'checked':'' ?>>
      Mostrar en carousel
    </label>
    <label class="checkbox-label">
      <input type="checkbox" name="show_in_ticker" value="1" <?= !empty($artist['show_in_ticker'])?'checked':'' ?>>
      Mostrar en ticker
    </label>
  </div>
  <div class="form-row">
    <div class="form-group">
      <label for="roster_order">Orden roster</label>
      <input type="number" id="roster_order" name="roster_order" value="<?= (int)($artist['roster_order']??0) ?>" min="0" style="width:100px">
    </div>
    <div class="form-group">
      <label for="carousel_order">Orden carousel</label>
      <input type="number" id="carousel_order" name="carousel_order" value="<?= (int)($artist['carousel_order']??0) ?>" min="0" style="width:100px">
    </div>
    <div class="form-group">
      <label for="ticker_order">Orden ticker</label>
      <input type="number" id="ticker_order" name="ticker_order" value="<?= (int)($artist['ticker_order']??0) ?>" min="0" style="width:100px">
    </div>
  </div>

  <div class="form-section-title">Redes sociales y streaming</div>
  <?php
  $socials = [
    'spotify_url' => 'Spotify URL',
    'instagram_url' => 'Instagram URL',
    'youtube_url' => 'YouTube URL',
    'tiktok_url' => 'TikTok URL',
    'soundcloud_url' => 'SoundCloud URL',
    'apple_music_url' => 'Apple Music URL',
  ];
  foreach ($socials as $field => $label): ?>
  <div class="form-group">
    <label for="<?= $field ?>"><?= $label ?></label>
    <input type="url" id="<?= $field ?>" name="<?= $field ?>" value="<?= h($artist[$field] ?? '') ?>" placeholder="https://...">
  </div>
  <?php endforeach; ?>

  <div class="form-actions">
    <button type="submit" class="btn btn-primary">Guardar artista</button>
    <?php if (!$isNew): ?>
    <a href="/php-admin/artists.php" class="btn btn-secondary">Cancelar</a>
    <button type="submit" form="deleteForm" class="btn btn-danger" onclick="return confirm('¿Eliminar artista permanentemente? Esta acción no se puede deshacer.')">Eliminar</button>
    <?php endif; ?>
  </div>
</form>

<?php if (!$isNew): ?>
<form id="deleteForm" method="POST" action="/php-admin/artist-edit.php" style="display:none">
  <input type="hidden" name="csrf_token" value="<?= h(csrfToken()) ?>">
  <input type="hidden" name="id" value="<?= h((string)$id) ?>">
  <input type="hidden" name="action" value="delete">
  <input type="hidden" name="confirm" value="1">
</form>
<?php endif; ?>

<script>
function autoSlug() {
  var name = document.getElementById('name').value;
  var slug = name.toLowerCase()
    .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i')
    .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')
    .replace(/[^a-z0-9\s-]/g,'').replace(/[\s]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
  document.getElementById('slug').value = slug;
}

function previewImg(input, previewId, pickerId) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = document.getElementById(previewId);
    if (!img) {
      img = document.createElement('img');
      img.id = previewId;
      img.className = 'img-preview';
      input.parentNode.insertBefore(img, input);
    }
    img.src = e.target.result;
    var picker = document.getElementById(pickerId);
    if (!picker) {
      picker = document.createElement('div');
      picker.id = pickerId;
      picker.className = 'focal-picker';
      picker.dataset.field = pickerId.replace('FocalPicker','').toLowerCase();
      var dot = document.createElement('div');
      dot.className = 'focal-dot';
      picker.appendChild(dot);
      img.parentNode.insertBefore(picker, img.nextSibling);
    }
    picker.style.display = 'block';
    setupFocal(picker, pickerId);

    // Dimension warning
    var tempImg = new Image();
    tempImg.onload = function() {
      var field = picker.dataset.field;
      var minW = field === 'main' ? 800 : 1200;
      var minH = field === 'main' ? 1000 : 800;
      if (tempImg.width < minW || tempImg.height < minH) {
        alert('Advertencia: la imagen es de ' + tempImg.width + 'x' + tempImg.height + 'px. Se recomienda mínimo ' + minW + 'x' + minH + 'px para buena calidad.');
      }
    };
    tempImg.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function setupFocal(picker, pickerId) {
  var field = picker.dataset.field;
  var dot   = picker.querySelector('.focal-dot');
  var xIn   = document.getElementById(field + '_focal_x');
  var yIn   = document.getElementById(field + '_focal_y');

  function setDot(x, y) {
    dot.style.left = x + '%';
    dot.style.top  = y + '%';
    xIn.value = Math.round(x);
    yIn.value = Math.round(y);
  }
  setDot(xIn ? xIn.value : 50, yIn ? yIn.value : 50);

  picker.addEventListener('click', function(e) {
    var rect = picker.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width) * 100;
    var y = ((e.clientY - rect.top)  / rect.height) * 100;
    setDot(x, y);
  });
}

// Init focal pickers for existing images
document.querySelectorAll('.focal-picker').forEach(function(picker) {
  var pickerId = picker.id;
  setupFocal(picker, pickerId);
});
</script>
<?php
$content = ob_get_clean();
echo renderLayout($pageTitle, $content, $user);
