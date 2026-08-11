const layout = require('./layout');

function releaseFormPage(release = {}, artists = [], user, error = '') {
  const isEdit = !!release.id;
  const title = isEdit ? `Editar: ${release.title}` : 'Nuevo lanzamiento';
  const action = isEdit ? `/admin/releases/${release.id}` : '/admin/releases/new';

  const v = (field, def = '') => release[field] !== undefined && release[field] !== null ? String(release[field]) : def;
  const checked = (field, def = true) => {
    if (release[field] !== undefined) return Number(release[field]) === 1 ? 'checked' : '';
    return def ? 'checked' : '';
  };
  const sel = (field, val) => v(field) === val ? 'selected' : '';

  const artistOptions = artists.map(a =>
    `<option value="${a.id}" ${String(release.artist_id) === String(a.id) ? 'selected' : ''}>${a.name}</option>`
  ).join('');

  const types = ['single','ep','album','other'];
  const statuses = ['draft','published','hidden','archived'];

  const socialLinks = [
    { key: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/...' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
    { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
    { key: 'apple_music', label: 'Apple Music', placeholder: 'https://music.apple.com/...' },
  ];

  const socialFields = socialLinks.map(s => `
    <div class="toggle-field">
      <div style="flex:1">
        <div class="toggle-label">${s.label}</div>
        <input type="url" name="${s.key}_url" value="${v(s.key + '_url')}" placeholder="${s.placeholder}" style="margin-top:4px">
      </div>
      <label class="checkbox-row" style="flex-shrink:0;margin-left:12px">
        <input type="checkbox" name="show_${s.key}" value="1" ${checked('show_' + s.key)}>
        <small>Mostrar</small>
      </label>
    </div>`).join('');

  const body = `
    <div class="breadcrumb">
      <a href="/admin/releases">Lanzamientos</a>
      <span class="sep">/</span>
      <span class="current">${isEdit ? release.title : 'Nuevo'}</span>
    </div>

    ${error ? `<div class="alert alert-error">${error}</div>` : ''}

    <form method="POST" action="${action}" enctype="multipart/form-data">

      <!-- PUBLICACIÓN -->
      <div class="form-section">
        <div class="form-section-header">PUBLICACIÓN <span class="fs-toggle"></span></div>
        <div class="form-section-body">
          <div class="form-grid">
            <div class="field">
              <label for="status">Estado</label>
              <select id="status" name="status">
                ${statuses.map(s => `<option value="${s}" ${sel('status', s) || (s === 'draft' && !release.id ? 'selected' : '')}>${s}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="sort_order">Orden</label>
              <input type="number" id="sort_order" name="sort_order" value="${v('sort_order','0')}" min="0">
            </div>
            <div class="field">
              <label for="release_date">Fecha de lanzamiento</label>
              <input type="date" id="release_date" name="release_date" value="${v('release_date')}">
            </div>
            <div class="field">
              <label for="publish_at">Publicar a partir de</label>
              <input type="date" id="publish_at" name="publish_at" value="${v('publish_at')}">
              <span class="field-hint">Deja vacío para publicar de inmediato</span>
            </div>
          </div>
          <div style="margin-top:10px">
            <label class="checkbox-row"><input type="checkbox" name="featured" value="1" ${checked('featured', false)}> ★ Lanzamiento destacado (aparece primero en la web)</label>
          </div>
        </div>
      </div>

      <!-- CONTENIDO -->
      <div class="form-section">
        <div class="form-section-header">CONTENIDO <span class="fs-toggle"></span></div>
        <div class="form-section-body">
          <div class="form-grid">
            <div class="field">
              <label for="title">Título *</label>
              <input type="text" id="title" name="title" value="${v('title')}" required placeholder="Ej: Heart Roto">
            </div>
            <div class="field">
              <label for="slug">Slug *</label>
              <input type="text" id="slug" name="slug" value="${v('slug')}" required placeholder="ej: heart-roto">
            </div>
            <div class="field">
              <label for="artist_id">Artista *</label>
              <select id="artist_id" name="artist_id" required>
                <option value="">— Seleccioná un artista —</option>
                ${artistOptions}
              </select>
            </div>
            <div class="field">
              <label for="type">Tipo</label>
              <select id="type" name="type">
                ${types.map(t => `<option value="${t}" ${sel('type', t) || (t === 'single' && !release.id ? 'selected' : '')}>${t}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="genre">Género</label>
              <input type="text" id="genre" name="genre" value="${v('genre')}" placeholder="Ej: Pop">
            </div>
            <div class="field full">
              <label for="description">Descripción</label>
              <textarea id="description" name="description" rows="3" placeholder="Descripción del lanzamiento...">${v('description')}</textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- PORTADA -->
      <div class="form-section">
        <div class="form-section-header">PORTADA <span class="fs-toggle"></span></div>
        <div class="form-section-body">
          <div class="upload-area" onclick="document.getElementById('cover_image_file').click()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32" style="margin:0 auto;display:block;opacity:0.4"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p>Click para subir portada<br>JPG, PNG, WEBP · Máx 15MB · Recomendado: 1200×1200px cuadrado</p>
            <input type="file" id="cover_image_file" name="cover_image_file" accept="image/jpeg,image/png,image/webp">
          </div>
          <div class="img-warning" id="coverImgWarning"></div>
          ${v('cover_image') ? `
          <div style="margin-top:12px">
            <p style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Portada actual:</p>
            <img id="coverPreviewImg" src="/${v('cover_image')}" style="max-width:160px;height:160px;object-fit:cover;border-radius:6px" onerror="this.style.display='none'" alt="Cover">
          </div>` : `<div id="coverPreviewWrap" style="display:none;margin-top:12px"><img id="coverPreviewImg" style="max-width:160px;height:160px;object-fit:cover;border-radius:6px" alt="Cover"></div>`}
        </div>
      </div>

      <!-- LINKS -->
      <div class="form-section">
        <div class="form-section-header">LINKS / PLATAFORMAS <span class="fs-toggle"></span></div>
        <div class="form-section-body">
          ${socialFields}
        </div>
      </div>

      <!-- SEO -->
      <div class="form-section collapsed">
        <div class="form-section-header">SEO <span class="fs-toggle"></span></div>
        <div class="form-section-body">
          <div class="form-grid form-grid-1">
            <div class="field">
              <label for="seo_title">SEO Title</label>
              <input type="text" id="seo_title" name="seo_title" value="${v('seo_title')}">
            </div>
            <div class="field">
              <label for="seo_description">SEO Description</label>
              <textarea id="seo_description" name="seo_description" rows="2">${v('seo_description')}</textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Guardar lanzamiento</button>
        <a href="/admin/releases" class="btn btn-secondary">Cancelar</a>
        ${isEdit ? `
        <div style="margin-left:auto;display:flex;gap:6px">
          <form method="POST" action="/admin/releases/${release.id}/delete" onsubmit="return confirm('¿ELIMINAR permanentemente ${release.title}?')">
            <button type="submit" class="btn btn-danger btn-sm">Eliminar definitivamente</button>
          </form>
        </div>` : ''}
      </div>
    </form>

    <script>
    // Slug auto-generation
    const titleInput = document.getElementById('title');
    const slugInput = document.getElementById('slug');
    let slugEdited = ${isEdit ? 'true' : 'false'};
    function toSlug(str) {
      return str.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\\s-]/g, '')
        .trim().replace(/\\s+/g, '-').replace(/-+/g, '-');
    }
    titleInput.addEventListener('input', () => {
      if (!slugEdited) slugInput.value = toSlug(titleInput.value);
    });
    slugInput.addEventListener('input', () => { slugEdited = true; });

    // Cover image dimension check
    document.getElementById('cover_image_file').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        const img = new Image();
        img.onload = function() {
          const warn = document.getElementById('coverImgWarning');
          warn.style.display = 'none';
          let msg = '';
          if (img.width !== img.height) {
            msg = '⚠ La portada debería ser cuadrada (1:1). La imagen actual es ' + img.width + '×' + img.height + 'px.';
          } else if (img.width < 1200) {
            msg = '⚠ Se recomienda una portada de al menos 1200×1200px.';
          }
          if (msg) { warn.textContent = msg; warn.style.display = 'block'; }
          // Show preview
          const previewImg = document.getElementById('coverPreviewImg');
          if (previewImg) {
            previewImg.src = ev.target.result;
            previewImg.style.display = 'block';
            const wrap = document.getElementById('coverPreviewWrap');
            if (wrap) wrap.style.display = 'block';
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    </script>
  `;

  return layout(title, body, user, '/admin/releases');
}

module.exports = releaseFormPage;
