const layout = require('./layout');

function accountPage(user, error = '', message = '') {
  const body = `
    ${message ? `<div class="alert alert-success">${message}</div>` : ''}
    ${error ? `<div class="alert alert-error">${error}</div>` : ''}

    <div class="card" style="max-width:440px">
      <div class="section-header" style="margin-bottom:16px">
        <h2>Cambiar contraseña</h2>
      </div>
      <form method="POST" action="/admin/account">
        <div class="field" style="margin-bottom:12px">
          <label>Contraseña actual</label>
          <input type="password" name="current_password" required autocomplete="current-password">
        </div>
        <div class="field" style="margin-bottom:12px">
          <label>Nueva contraseña</label>
          <input type="password" name="new_password" required minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres">
        </div>
        <div class="field" style="margin-bottom:16px">
          <label>Confirmar nueva contraseña</label>
          <input type="password" name="confirm_password" required autocomplete="new-password">
        </div>
        <button type="submit" class="btn btn-primary">Guardar nueva contraseña</button>
      </form>
    </div>

    <div class="card" style="max-width:440px;margin-top:16px">
      <div class="card-title">Información de la cuenta</div>
      <table style="margin-top:8px">
        <tr><td style="color:var(--text-muted);width:100px;border:none">Usuario</td><td style="border:none;font-weight:600">${user.username}</td></tr>
        <tr><td style="color:var(--text-muted);border:none">Rol</td><td style="border:none"><span class="badge badge-${user.role}">${user.role}</span></td></tr>
      </table>
    </div>
  `;

  return layout('Mi cuenta', body, user, '/admin/account');
}

module.exports = accountPage;
