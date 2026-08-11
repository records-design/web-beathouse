function loginPage(error = '') {
  const logoSrc = '/imagenes/Beathouse_Logo_Magenta (1).png';
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Iniciar sesión — BeatHouse Admin</title>
<link rel="stylesheet" href="/admin/assets/admin.css">
</head>
<body>
<div class="login-page">
  <div class="login-card">
    <div class="login-logo">
      <img src="${logoSrc}" alt="BeatHouse" onerror="this.style.display='none'">
      <h1>BeatHouse Admin</h1>
      <p>Panel de administración</p>
    </div>
    ${error ? `<div class="login-error">${error}</div>` : ''}
    <form method="POST" action="/admin/login">
      <div class="field">
        <label for="username">Usuario</label>
        <input type="text" id="username" name="username" placeholder="Tu usuario" autocomplete="username" required>
      </div>
      <div class="field" style="margin-top:12px">
        <label for="password">Contraseña</label>
        <input type="password" id="password" name="password" placeholder="••••••••" autocomplete="current-password" required>
      </div>
      <button type="submit" class="btn-login" style="margin-top:20px">Ingresar →</button>
    </form>
  </div>
</div>
</body>
</html>`;
}

module.exports = loginPage;
