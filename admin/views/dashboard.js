const layout = require('./layout');

function dashboardPage(data, user) {
  const { stats, recentArtists, recentReleases } = data;

  const artistRows = recentArtists.map(a => `
    <tr>
      <td><img src="/${a.main_image || 'imagenes/foto-estudio.png'}" class="table-img" onerror="this.src='/imagenes/foto-estudio.png'" alt="${a.name}"></td>
      <td><strong>${a.name}</strong></td>
      <td><span class="badge badge-${a.status}">${a.status}</span></td>
      <td><a href="/admin/artists/${a.id}" class="btn btn-sm btn-secondary">Editar</a></td>
    </tr>`).join('');

  const releaseRows = recentReleases.map(r => `
    <tr>
      <td><img src="/${r.cover_image || 'imagenes/arte de tapa-crash.jpeg'}" class="table-img-sq" onerror="this.src='/imagenes/foto-estudio.png'" alt="${r.title}"></td>
      <td><strong>${r.title}</strong><br><small style="color:var(--text-muted)">${r.artist_name}</small></td>
      <td><span class="badge badge-${r.status}">${r.status}</span></td>
      <td><a href="/admin/releases/${r.id}" class="btn btn-sm btn-secondary">Editar</a></td>
    </tr>`).join('');

  const body = `
    <div class="stats-grid">
      <div class="card">
        <div class="card-title">Artistas publicados</div>
        <div class="card-value">${stats.publishedArtists}</div>
        <div class="card-sub">de ${stats.totalArtists} total</div>
      </div>
      <div class="card">
        <div class="card-title">Lanzamientos publicados</div>
        <div class="card-value">${stats.publishedReleases}</div>
        <div class="card-sub">de ${stats.totalReleases} total</div>
      </div>
      <div class="card">
        <div class="card-title">Borradores</div>
        <div class="card-value">${stats.draftReleases}</div>
        <div class="card-sub">lanzamientos en draft</div>
      </div>
      <div class="card">
        <div class="card-title">Destacado</div>
        <div class="card-value" style="font-size:15px">${stats.featuredRelease || '—'}</div>
        <div class="card-sub">lanzamiento featured</div>
      </div>
    </div>

    <div class="quick-actions">
      <a href="/admin/artists/new" class="btn btn-primary">+ Nuevo artista</a>
      <a href="/admin/releases/new" class="btn btn-primary">+ Nuevo lanzamiento</a>
      <a href="/" target="_blank" class="btn btn-secondary">Ver sitio →</a>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="section-header">
          <h2>Últimos artistas</h2>
          <a href="/admin/artists" class="btn btn-sm btn-secondary">Ver todos</a>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th></th><th>Nombre</th><th>Estado</th><th></th></tr></thead>
            <tbody>${artistRows || '<tr><td colspan="4" style="color:var(--text-muted);text-align:center">Sin artistas</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="section-header">
          <h2>Últimos lanzamientos</h2>
          <a href="/admin/releases" class="btn btn-sm btn-secondary">Ver todos</a>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th></th><th>Título</th><th>Estado</th><th></th></tr></thead>
            <tbody>${releaseRows || '<tr><td colspan="4" style="color:var(--text-muted);text-align:center">Sin lanzamientos</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return layout('Dashboard', body, user, '/admin/dashboard');
}

module.exports = dashboardPage;
