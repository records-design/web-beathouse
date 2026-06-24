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
      featName.textContent  = thumb.dataset.name
      featGenre.textContent = thumb.dataset.genre
      featDesc.textContent  = thumb.dataset.desc
      featImg.style.opacity = '1'
    }, 200)
  }

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () { setFeatured(thumb) })
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
