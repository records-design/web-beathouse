// ── NAVBAR HIDE ON SCROLL ──
(function () {
  const nav = document.querySelector('.navbar')
  if (!nav) return
  let lastY = 0
  let ticking = false

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        const currentY = window.scrollY
        if (currentY > lastY && currentY > 120) {
          nav.classList.add('navbar--hidden')
        } else {
          nav.classList.remove('navbar--hidden')
        }
        lastY = currentY
        ticking = false
      })
      ticking = true
    }
  }, { passive: true })
})();

// ── ROSTER FEATURED ──
(function () {
  const thumbs   = document.querySelectorAll('.roster-thumb')
  const featImg  = document.getElementById('featImg')
  const featName = document.getElementById('featName')
  const featGenre= document.getElementById('featGenre')
  const featDesc = document.getElementById('featDesc')
  if (!thumbs.length || !featImg) return

  function setFeatured(thumb) {
    thumbs.forEach(t => t.classList.remove('active'))
    thumb.classList.add('active')
    featImg.style.opacity = '0'
    setTimeout(function () {
      featImg.src = thumb.dataset.img
      featImg.style.objectPosition = thumb.dataset.pos || 'top'
      featName.textContent  = thumb.dataset.name
      featGenre.textContent = thumb.dataset.genre
      featDesc.textContent  = thumb.dataset.desc
      featImg.style.opacity = '1'
    }, 200)
  }

  const thumbsContainer = document.getElementById('rosterThumbs')

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      setFeatured(thumb)
      if (thumbsContainer) thumbsContainer.classList.add('interacted')
    })
  })
})();

// ── ROSTER THUMB 3D TILT ──
(function () {
  const thumbs = document.querySelectorAll('.roster-thumb')
  if (!thumbs.length) return

  thumbs.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const cx = rect.width / 2
      const cy = rect.height / 2
      const rotateY =  ((x - cx) / cx) * 10
      const rotateX = -((y - cy) / cy) * 8
      card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.04)'
      card.style.transition = 'border-color .25s, box-shadow .25s, transform .08s ease-out'
      const pctX = ((x / rect.width) * 100).toFixed(1) + '%'
      const pctY = ((y / rect.height) * 100).toFixed(1) + '%'
      card.style.setProperty('--mx', pctX)
      card.style.setProperty('--my', pctY)
    })

    card.addEventListener('mouseleave', function () {
      card.style.transition = 'border-color .25s, box-shadow .25s, transform .4s ease-out'
      card.style.transform = ''
    })
  })
})();

// ── PANEL ANIMADO ──
(function () {
  const rows = document.querySelectorAll('.dif-panel-row')
  if (!rows.length) return

  let triggered = false

  function animateCount(el) {
    const target   = parseFloat(el.dataset.target)
    const divisor  = parseFloat(el.dataset.divisor  || 1)
    const decimals = parseInt(el.dataset.decimals   || 0)
    const prefix   = el.dataset.prefix || ''
    const suffix   = el.dataset.suffix || ''
    const duration = 1400
    const start    = performance.now()

    function step(now) {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      const val  = (target / divisor) * ease
      el.textContent = prefix + val.toFixed(decimals) + suffix
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  function runPanel() {
    if (triggered) return
    triggered = true
    rows.forEach(function (row, i) {
      setTimeout(function () {
        row.classList.add('is-visible')
        const counter = row.querySelector('.dif-count')
        if (counter) animateCount(counter)
      }, i * 120)
    })
  }

  const observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) runPanel()
  }, { threshold: 0.3 })

  const panel = document.querySelector('.dif-panel-mock')
  if (panel) observer.observe(panel)
})();

// ── PRESAVE FORM ──
(function () {
  const form = document.getElementById('dropForm')
  const success = document.getElementById('formSuccess')
  if (!form) return
  form.addEventListener('submit', function (e) {
    e.preventDefault()
    form.style.display = 'none'
    success.style.display = 'block'
  })
})();

// ── FORM MODAL ──
(function () {
  var modal = document.getElementById('formModal');
  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.getElementById('openFormModal')?.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  document.querySelectorAll('.open-form-modal').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  });
  document.getElementById('closeFormModal')?.addEventListener('click', closeModal);
  document.getElementById('formModalBackdrop')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  // Wizard
  var panels = document.querySelectorAll('.wizard-panel');
  var steps  = document.querySelectorAll('.wizard-step');

  function showPanel(n) {
    panels.forEach(function (p) { p.classList.toggle('active', +p.dataset.panel === n); });
    steps.forEach(function (s) {
      var sn = +s.dataset.step;
      s.classList.toggle('active', sn === n);
      s.classList.toggle('done', sn < n);
    });
  }

  document.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var from = +btn.closest('[data-panel]')?.dataset.panel;
      if (from === 1) {
        var nombre = document.querySelector('#formWizard [name="nombre"]');
        var email  = document.querySelector('#formWizard [name="email"]');
        var ok = true;
        [nombre, email].forEach(function (field) {
          var empty = !field.value.trim();
          var badEmail = field === email && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
          field.closest('.form-field').classList.toggle('field-error', empty || badEmail);
          if (empty || badEmail) ok = false;
        });
        if (!ok) return;
      }
      showPanel(+btn.dataset.next);
    });
  });
  document.querySelectorAll('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () { showPanel(+btn.dataset.back); });
  });
  document.querySelectorAll('#formWizard [name="nombre"], #formWizard [name="email"]').forEach(function (f) {
    f.addEventListener('input', function () { f.closest('.form-field').classList.remove('field-error'); });
  });

  // Category dropdown
  var trigger = document.getElementById('categoryTrigger');
  var menu    = document.getElementById('categoryMenu');
  trigger?.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.form-select-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      document.getElementById('categoryValue').textContent = opt.textContent;
      document.getElementById('categoriaInput').value = opt.dataset.value;
      trigger.classList.add('has-value');
      menu.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', function (e) {
    if (menu && !menu.contains(e.target) && e.target !== trigger) {
      menu.classList.remove('open');
    }
  });

  // File upload via Uploadcare + VirusTotal scan
  (function () {
    var UPLOADCARE_PK = 'd95f11db670abc7ce278'; // mismo key que babidibu — reemplazá si tenés uno propio
    var VT_WORKER = 'https://vt-proxy-beathouse.babidibu-records.workers.dev';
    var MAX_MB = 100;
    var ALLOWED = ['mp3', 'wav', 'mp4', 'pdf', 'zip'];
    var zone     = document.getElementById('ucUploadZone');
    var inner    = document.getElementById('ucUploadInner');
    var progress = document.getElementById('ucProgress');
    var fill     = document.getElementById('ucProgressFill');
    var label    = document.getElementById('ucProgressLabel');
    var hint     = document.getElementById('ucProgressHint');
    var fileList = document.getElementById('ucFileList');
    if (!zone) return;
    var files = [], uploading = false;

    function updateFilesData() {
      document.getElementById('ucFilesData').value = files.map(function (f) {
        return f.name + ': ' + f.url + ' [' + f.vt + ']';
      }).join(' | ');
    }

    function renderFileList() {
      fileList.innerHTML = '';
      files.forEach(function (f, i) {
        var row  = document.createElement('div'); row.className = 'uc-upload-done';
        var icon = document.createElement('span'); icon.className = 'uc-done-icon';
        icon.textContent = (f.vt.indexOf('No permitido') > -1 || f.vt.indexOf('Sospechoso') > -1) ? '⚠️' : '✓';
        var name = document.createElement('span'); name.className = 'uc-done-name';
        name.textContent = f.name + (f.vt ? ' — ' + f.vt : '');
        var btn  = document.createElement('button'); btn.type = 'button'; btn.className = 'uc-remove-btn'; btn.textContent = '✕';
        btn.addEventListener('click', function () { files.splice(i, 1); renderFileList(); updateFilesData(); });
        row.appendChild(icon); row.appendChild(name); row.appendChild(btn);
        fileList.appendChild(row);
      });
    }

    function finishScan(url, name, vtResult) {
      files.push({ url: url, name: name, vt: vtResult });
      renderFileList(); updateFilesData();
      uploading = false;
      hint.textContent = '';
      progress.style.display = 'none';
      inner.style.display = '';
      fill.style.width = '0%';
    }

    function pollVT(id, url, name, attempts) {
      if (attempts > 60) { finishScan(url, name, '✓ Check'); return; }
      fetch(VT_WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'result', id: id })
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var status = data.data && data.data.attributes && data.data.attributes.status;
        if (status === 'completed') {
          var stats = data.data.attributes.stats;
          var malicious  = stats.malicious  || 0;
          var total = (stats.harmless || 0) + malicious + (stats.suspicious || 0) + (stats.undetected || 0);
          var result = malicious >= 3
            ? '✕ No permitido: ' + malicious + '/' + total + ' motores detectaron amenazas'
            : '✓ Check';
          finishScan(url, name, result);
        } else {
          setTimeout(function () { pollVT(id, url, name, attempts + 1); }, 4000);
        }
      })
      .catch(function () { finishScan(url, name, 'Error al obtener resultado'); });
    }

    function scanWithVT(url, name) {
      fetch(VT_WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan', url: url })
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var id = data.data && data.data.id;
        if (!id) { finishScan(url, name, 'No se pudo escanear'); return; }
        pollVT(id, url, name, 0);
      })
      .catch(function () { finishScan(url, name, 'Error de conexión'); });
    }

    function uploadFile(file) {
      if (uploading) { alert('Esperá que termine el archivo actual.'); return; }
      var ext = file.name.split('.').pop().toLowerCase();
      if (!ALLOWED.includes(ext)) { alert('Formato no permitido. Usá MP3, WAV, MP4, PDF o ZIP.'); return; }
      if (file.size > MAX_MB * 1024 * 1024) { alert('El archivo supera los 100 MB.'); return; }
      uploading = true;
      inner.style.display = 'none'; progress.style.display = '';
      fill.style.width = '0%'; label.textContent = 'Subiendo...';
      var fd = new FormData();
      fd.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PK);
      fd.append('UPLOADCARE_STORE', 'auto');
      fd.append('file', file);
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://upload.uploadcare.com/base/');
      xhr.upload.addEventListener('progress', function (ev) {
        if (ev.lengthComputable) {
          var pct = Math.round(ev.loaded / ev.total * 100);
          fill.style.width = pct + '%'; label.textContent = pct + '%';
        }
      });
      xhr.addEventListener('load', function () {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          var url = 'https://ucarecdn.com/' + data.file + '/';
          fill.style.width = '100%';
          label.textContent = 'Escaneando archivo...';
          hint.textContent = 'Esto puede demorar unos segundos.';
          scanWithVT(url, file.name);
        } else {
          uploading = false; inner.style.display = ''; progress.style.display = 'none';
          alert('Error al subir el archivo. Intentá de nuevo.');
        }
      });
      xhr.addEventListener('error', function () {
        uploading = false; inner.style.display = ''; progress.style.display = 'none';
        alert('Error de red. Intentá de nuevo.');
      });
      xhr.send(fd);
    }

    zone.addEventListener('click', function () {
      if (uploading) return;
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.mp3,.wav,.mp4,.pdf,.zip';
      inp.addEventListener('change', function () { if (this.files[0]) uploadFile(this.files[0]); });
      inp.click();
    });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault(); zone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
    });
  })();

  // Form submit
  document.getElementById('formWizard')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    var emailVal = this.querySelector('[name="email"]')?.value;
    if (emailVal) document.getElementById('replyToField').value = emailVal;
    var btn = document.getElementById('btnSubmit');
    btn.textContent = 'Enviando...'; btn.disabled = true;
    try {
      var res = await fetch(this.action, { method: 'POST', body: new FormData(this), headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        this.style.display = 'none';
        document.getElementById('formHeader').style.display = 'none';
        document.getElementById('formModalSuccess').style.display = 'flex';
        document.querySelector('.form-modal-card').classList.add('success-state');
      } else {
        btn.textContent = 'Error. Intentá de nuevo.'; btn.disabled = false;
      }
    } catch (err) {
      btn.textContent = 'Error. Intentá de nuevo.'; btn.disabled = false;
    }
  });

  document.getElementById('formSuccessReset')?.addEventListener('click', function () {
    document.getElementById('formModalSuccess').style.display = 'none';
    document.getElementById('formHeader').style.display = 'block';
    var form = document.getElementById('formWizard');
    form.style.display = 'block'; form.reset();
    document.querySelector('.form-modal-card').classList.remove('success-state');
    document.getElementById('btnSubmit').textContent = 'Enviar proyecto →';
    document.getElementById('btnSubmit').disabled = false;
    document.getElementById('categoryValue').textContent = 'Seleccioná una categoría';
    document.getElementById('categoriaInput').value = '';
    document.getElementById('categoryTrigger').classList.remove('has-value');
    showPanel(1);
  });
})();

// ── LOGIN MODAL ──
(function () {
  var loginModal = document.getElementById('loginModal');
  if (!loginModal) return;

  function openLoginModal() {
    loginModal.classList.add('open');
    loginModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  function closeLoginModal() {
    loginModal.classList.remove('open');
    loginModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.getElementById('openLoginModal')?.addEventListener('click', function (e) {
    e.preventDefault(); openLoginModal();
  });
  document.getElementById('closeLoginModal')?.addEventListener('click', closeLoginModal);
  document.getElementById('loginModalBackdrop')?.addEventListener('click', closeLoginModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLoginModal();
  });

  // Link "Envianos tu material" → abre form modal
  document.getElementById('loginContactLink')?.addEventListener('click', function (e) {
    e.preventDefault();
    closeLoginModal();
    setTimeout(function () {
      document.getElementById('formModal')?.classList.add('open');
      document.getElementById('formModal')?.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }, 300);
  });

  // Login form submit (placeholder — conectar con backend real)
  document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    var usuario = this.querySelector('[name="usuario"]').value.trim();
    var password = this.querySelector('[name="password"]').value.trim();
    if (!usuario || !password) return;
    // TODO: conectar con sistema de auth real
    alert('Dashboard próximamente disponible.');
  });
})();

// ── COUNTDOWN ──
(function () {
  const target = new Date('2026-06-26T00:00:00-03:00').getTime()
  const days  = document.getElementById('cd-days')
  const hours = document.getElementById('cd-hours')
  const mins  = document.getElementById('cd-mins')
  const secs  = document.getElementById('cd-secs')

  if (!days) return

  function pad(n) { return String(n).padStart(2, '0') }

  function tick() {
    const diff = target - Date.now()
    if (diff <= 0) {
      days.textContent = hours.textContent = mins.textContent = secs.textContent = '00'
      return
    }
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    days.textContent  = pad(d)
    hours.textContent = pad(h)
    mins.textContent  = pad(m)
    secs.textContent  = pad(s)
  }

  tick()
  setInterval(tick, 1000)
})();
