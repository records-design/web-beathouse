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

// ── ROSTER MODAL ──
(function () {
  const cards    = document.querySelectorAll('.rg-card')
  const modal    = document.getElementById('artistModal')
  const backdrop = modal && modal.querySelector('.am-backdrop')
  const closeBtn = document.getElementById('amClose')
  const amImg    = document.getElementById('amImg')
  const amName   = document.getElementById('amName')
  const amGenre  = document.getElementById('amGenre')
  const amDesc   = document.getElementById('amDesc')
  if (!cards.length || !modal) return

  function openModal(card) {
    amImg.src           = card.dataset.img
    amImg.alt           = card.dataset.name
    amName.textContent  = card.dataset.name
    amGenre.textContent = card.dataset.genre
    amDesc.textContent  = card.dataset.desc
    modal.classList.add('is-open')
    document.body.style.overflow = 'hidden'
  }

  function closeModal() {
    modal.classList.remove('is-open')
    document.body.style.overflow = ''
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () { openModal(card) })
  })

  if (backdrop) backdrop.addEventListener('click', closeModal)
  if (closeBtn) closeBtn.addEventListener('click', closeModal)

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal()
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
