const layout = require('./layout');

function artistFormPage(artist = {}, user, error = '') {
  const isEdit = !!artist.id;
  const title = isEdit ? `Editar: ${artist.name}` : 'Nuevo artista';
  const action = isEdit ? `/admin/artists/${artist.id}` : '/admin/artists/new';

  const v = (field, def = '') => artist[field] !== undefined && artist[field] !== null ? String(artist[field]) : def;
  const checked = (field) => Number(artist[field]) === 1 ? 'checked' : '';
  const sel = (field, val) => v(field) === val ? 'selected' : '';

  const statuses = ['published','draft','hidden','archived'];

  const body = `
    <div class="breadcrumb">
      <a href="/admin/artists">Artistas</a>
      <span class="sep">/</span>
      <span class="current">${isEdit ? artist.name : 'Nuevo'}</span>
    </div>

    ${error ? `<div class="alert alert-error">${error}</div>` : ''}
    ${isEdit ? `<div class="alert alert-warning" style="margin-bottom:16px;font-size:12px">ID: ${artist.id} · Creado: ${artist.created_at || '—'}</div>` : ''}

    <form method="POST" action="${action}" enctype="multipart/form-data">

      <!-- INFORMACIÓN BÁSICA -->
      <div class="form-section">
        <div class="form-section-header">INFORMACIÓN BÁSICA <span class="fs-toggle"></span></div>
        <div class="form-section-body">
          <div class="form-grid">
            <div class="field">
              <label for="name">Nombre *</label>
              <input type="text" id="name" name="name" value="${v('name')}" required placeholder="Ej: Tomas Gimenez">
            </div>
            <div class="field">
              <label for="slug">Slug *</label>
              <input type="text" id="slug" name="slug" value="${v('slug')}" required placeholder="ej: tomas-gimenez">
              <span class="field-hint">URL amigable. Se genera automáticamente del nombre.</span>
            </div>
            <div class="field">
              <label for="genre">Género</label>
              <input type="text" id="genre" name="genre" value="${v('genre')}" placeholder="Ej: Pop, Folklore, R&B">
            </div>
            <div class="field">
              <label for="stat_label">Estadística/Label</label>
              <input type="text" id="stat_label" name="stat_label" value="${v('stat_label')}" placeholder="Ej: La Voz Argentina">
            </div>
            <div class="field full">
              <label for="short_bio">Bio corta</label>
              <textarea id="short_bio" name="short_bio" rows="2" placeholder="Máximo 2 líneas para el card del roster...">${v('short_bio')}</textarea>
            </div>
            <div class="field full">
              <label for="bio">Bio larga</label>
              <textarea id="bio" name="bio" rows="4" placeholder="Descripción completa del artista...">${v('bio')}</textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- IMÁGENES -->
      <div class="form-section">
        <div class="form-section-header">IMÁGENES <span class="fs-toggle"></span></div>
        <div class="form-section-body">
          <div class="form-grid">
            <div class="field">
              <label>Imagen principal (Roster)</label>
              <div class="upload-area" id="mainImgArea" onclick="document.getElementById('main_image_file').click()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32" style="margin:0 auto;display:block;opacity:0.4"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p>Click para subir imagen<br>JPG, PNG, WEBP · Máx 15MB · Recomendado: 1200×1500px</p>
                <input type="file" id="main_image_file" name="main_image_file" accept="image/jpeg,image/png,image/webp">
              </div>
              <div class="img-warning" id="mainImgWarning">⚠ Esta imagen tiene resolución inferior a la recomendada (mínimo 1200×1500 px) y puede perder calidad.</div>
              ${v('main_image') ? `
              <div class="upload-preview" id="mainImgPreviewWrap">
                <p style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Imagen actual:</p>
                <div class="focal-picker-wrap" id="mainFocalWrap">
                  <img src="/${v('main_image')}" class="focal-picker-img" id="mainFocalImg" onerror="this.closest('.focal-picker-wrap').style.display='none'" alt="Preview">
                  <div class="focal-crosshair" id="mainCrosshair" style="left:${v('main_focal_x','50')}%;top:${v('main_focal_y','20')}%;display:block"></div>
                </div>
                <div class="focal-info" id="mainFocalInfo">Punto focal: ${v('main_focal_x','50')}%, ${v('main_focal_y','20')}% — Click en la imagen para ajustar</div>
              </div>` : `<div id="mainImgPreviewWrap" style="display:none"><div class="focal-picker-wrap" id="mainFocalWrap"><img id="mainFocalImg" class="focal-picker-img" alt="Preview"><div class="focal-crosshair" id="mainCrosshair"></div></div><div class="focal-info" id="mainFocalInfo"></div></div>`}
              <input type="hidden" name="main_focal_x" id="mainFocalX" value="${v('main_focal_x','50')}">
              <input type="hidden" name="main_focal_y" id="mainFocalY" value="${v('main_focal_y','20')}">
            </div>

            <div class="field">
              <label>Imagen carrusel (Hero)</label>
              <div class="upload-area" id="carouselImgArea" onclick="document.getElementById('carousel_image_file').click()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32" style="margin:0 auto;display:block;opacity:0.4"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p>Click para subir imagen del carrusel<br>Si está vacío, se usa la imagen principal</p>
                <input type="file" id="carousel_image_file" name="carousel_image_file" accept="image/jpeg,image/png,image/webp">
              </div>
              ${v('carousel_image') ? `
              <div class="upload-preview" style="margin-top:8px">
                <p style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Imagen actual:</p>
                <img src="/${v('carousel_image')}" style="max-width:160px;border-radius:6px" onerror="this.style.display='none'" alt="Carousel preview">
              </div>` : ''}
              <input type="hidden" name="carousel_focal_x" id="carouselFocalX" value="${v('carousel_focal_x','50')}">
              <input type="hidden" name="carousel_focal_y" id="carouselFocalY" value="${v('carousel_focal_y','20')}">
            </div>
          </div>
        </div>
      </div>

      <!-- REDES SOCIALES -->
      <div class="form-section">
        <div class="form-section-header">REDES SOCIALES <span class="fs-toggle"></span></div>
        <div class="form-section-body">
          <div class="form-grid">
            <div class="field">
              <label for="spotify_url">Spotify</label>
              <input type="url" id="spotify_url" name="spotify_url" value="${v('spotify_url')}" placeholder="https://open.spotify.com/artist/...">
            </div>
            <div class="field">
              <label for="instagram_url">Instagram</label>
              <input type="url" id="instagram_url" name="instagram_url" value="${v('instagram_url')}" placeholder="https://instagram.com/...">
            </div>
            <div class="field">
              <label for="youtube_url">YouTube</label>
              <input type="url" id="youtube_url" name="youtube_url" value="${v('youtube_url')}" placeholder="https://youtube.com/@...">
            </div>
            <div class="field">
              <label for="tiktok_url">TikTok</label>
              <input type="url" id="tiktok_url" name="tiktok_url" value="${v('tiktok_url')}" placeholder="https://tiktok.com/@...">
            </div>
            <div class="field">
              <label for="apple_music_url">Apple Music</label>
              <input type="url" id="apple_music_url" name="apple_music_url" value="${v('apple_music_url')}" placeholder="https://music.apple.com/...">
            </div>
            <div class="field">
              <label for="website_url">Sitio web</label>
              <input type="url" id="website_url" name="website_url" value="${v('website_url')}" placeholder="https://...">
            </div>
          </div>
        </div>
      </div>

      <!-- VISIBILIDAD -->
      <div class="form-section">
        <div class="form-section-header">VISIBILIDAD <span class="fs-toggle"></span></div>
        <div class="form-section-body">
          <div class="form-grid">
            <div class="field">
              <label for="status">Estado</label>
              <select id="status" name="status">
                ${statuses.map(s => `<option value="${s}" ${sel('status', s) || (s === 'published' && !artist.id ? 'selected' : '')}>${s}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="margin-top:14px;display:flex;flex-direction:column;gap:10px">
            <label class="checkbox-row"><input type="checkbox" name="show_in_roster" value="1" ${checked('show_in_roster') || (!artist.id ? 'checked' : '')}> Mostrar en Roster</label>
            <label class="checkbox-row"><input type="checkbox" name="show_in_carousel" value="1" ${checked('show_in_carousel') || (!artist.id ? 'checked' : '')}> Mostrar en Carrusel (hero)</label>
            <label class="checkbox-row"><input type="checkbox" name="show_in_ticker" value="1" ${checked('show_in_ticker') || (!artist.id ? 'checked' : '')}> Mostrar en Ticker</label>
          </div>
        </div>
      </div>

      <!-- ORDEN -->
      <div class="form-section">
        <div class="form-section-header">ORDEN <span class="fs-toggle"></span></div>
        <div class="form-section-body">
          <div class="form-grid form-grid-3">
            <div class="field">
              <label for="roster_order">Orden en Roster</label>
              <input type="number" id="roster_order" name="roster_order" value="${v('roster_order','0')}" min="0">
            </div>
            <div class="field">
              <label for="carousel_order">Orden en Carrusel</label>
              <input type="number" id="carousel_order" name="carousel_order" value="${v('carousel_order','0')}" min="0">
            </div>
            <div class="field">
              <label for="ticker_order">Orden en Ticker</label>
              <input type="number" id="ticker_order" name="ticker_order" value="${v('ticker_order','0')}" min="0">
            </div>
          </div>
        </div>
      </div>

      <!-- SEO (collapsed) -->
      <div class="form-section collapsed">
        <div class="form-section-header">SEO <span class="fs-toggle"></span></div>
        <div class="form-section-body">
          <div class="form-grid form-grid-1">
            <div class="field">
              <label for="seo_title">SEO Title</label>
              <input type="text" id="seo_title" name="seo_title" value="${v('seo_title')}" placeholder="Título para buscadores (60 chars aprox)">
            </div>
            <div class="field">
              <label for="seo_description">SEO Description</label>
              <textarea id="seo_description" name="seo_description" rows="2" placeholder="Descripción para buscadores (160 chars aprox)">${v('seo_description')}</textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Guardar artista</button>
        <a href="/admin/artists" class="btn btn-secondary">Cancelar</a>
        ${isEdit ? `
        <div style="margin-left:auto;display:flex;gap:6px">
          <form method="POST" action="/admin/artists/${artist.id}/delete" onsubmit="return confirm('¿ELIMINAR permanentemente a ${artist.name}? Esta acción no se puede deshacer.')">
            <button type="submit" class="btn btn-danger btn-sm">Eliminar definitivamente</button>
          </form>
        </div>` : ''}
      </div>
    </form>

    <script>
    // Slug auto-generation
    const nameInput = document.getElementById('name');
    const slugInput = document.getElementById('slug');
    let slugEdited = ${isEdit ? 'true' : 'false'};
    function toSlug(str) {
      return str.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\\s-]/g, '')
        .trim().replace(/\\s+/g, '-').replace(/-+/g, '-');
    }
    nameInput.addEventListener('input', () => {
      if (!slugEdited) slugInput.value = toSlug(nameInput.value);
    });
    slugInput.addEventListener('input', () => { slugEdited = true; });

    // Focal point picker for main image
    function initFocalPicker(imgEl, crosshairEl, xInput, yInput, infoEl) {
      if (!imgEl) return;
      imgEl.addEventListener('click', function(e) {
        const rect = imgEl.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        xInput.value = x;
        yInput.value = y;
        crosshairEl.style.left = x + '%';
        crosshairEl.style.top = y + '%';
        crosshairEl.style.display = 'block';
        if (infoEl) infoEl.textContent = 'Punto focal: ' + x + '%, ' + y + '% — Click para ajustar';
      });
    }
    initFocalPicker(
      document.getElementById('mainFocalImg'),
      document.getElementById('mainCrosshair'),
      document.getElementById('mainFocalX'),
      document.getElementById('mainFocalY'),
      document.getElementById('mainFocalInfo')
    );

    // Preview + dimension check for main image file
    document.getElementById('main_image_file').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        const img = new Image();
        img.onload = function() {
          // Show warning if low res
          const warn = document.getElementById('mainImgWarning');
          warn.style.display = (img.width < 1200 || img.height < 1500) ? 'block' : 'none';
          // Show preview
          const previewWrap = document.getElementById('mainImgPreviewWrap');
          const previewImg = document.getElementById('mainFocalImg');
          previewImg.src = ev.target.result;
          previewWrap.style.display = 'block';
          document.getElementById('mainCrosshair').style.display = 'none';
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    </script>
  `;

  return layout(title, body, user, '/admin/artists');
}

module.exports = artistFormPage;
