const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

if (registerBtn && container) {
    registerBtn.addEventListener('click', () => {
        container.classList.add('active');
    });
}

if (loginBtn && container) {
    loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
    });
}


document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.pw-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const box = btn.closest('.input-box');
      if (!box) return;
      const input = box.querySelector('input');
      if (!input) return;
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.toggle('bx-show', !isPwd);
        icon.classList.toggle('bx-hide', isPwd);
      }
    });
  });

  const regPassword = document.getElementById('reg-password');
  const strengthBar = document.querySelector('.pw-strength .bar');
  if (regPassword && strengthBar) {
    regPassword.addEventListener('input', () => {
      const v = regPassword.value || '';
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      const pct = Math.min(4, score) / 4 * 100;
      strengthBar.style.setProperty('--pw-width', pct + '%');
      strengthBar.setAttribute('aria-valuenow', String(Math.min(4, score)));
      strengthBar.style.position = 'relative';
      strengthBar.style.overflow = 'hidden';
      strengthBar.style.setProperty('background', '#e5e7eb');
      strengthBar.style.setProperty('--w', pct + '%');
      strengthBar.style.setProperty('--c', '#22c55e');
      strengthBar.style.setProperty('transition', 'width .25s ease');
      strengthBar.style.setProperty('boxShadow', 'none');
      strengthBar.style.setProperty('borderRadius', '999px');
      strengthBar.style.setProperty('height', '8px');
      if (!strengthBar.querySelector('.fill')) {
        const fill = document.createElement('div');
        fill.className = 'fill';
        fill.style.position = 'absolute';
        fill.style.left = '0';
        fill.style.top = '0';
        fill.style.bottom = '0';
        fill.style.width = pct + '%';
        fill.style.background = 'linear-gradient(90deg,#ef4444,#f59e0b,#10b981,#22c55e)';
        fill.style.transition = 'width .25s ease';
        strengthBar.appendChild(fill);
      } else {
        const fill = strengthBar.querySelector('.fill');
        fill.style.width = pct + '%';
      }
    });
  }

  const toastContainer = document.getElementById('toast-container');
  function toast(msg, type) {
    if (!toastContainer) return;
    const t = document.createElement('div');
    t.className = 'toast ' + (type || 'info');
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => { t.remove(); }, 3200);
  }

  function setLoading(btn, loading, text) {
    if (!btn) return;
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = text || 'Chargement...';
      btn.disabled = true;
      btn.style.opacity = '0.8';
      btn.style.cursor = 'wait';
    } else {
      btn.textContent = btn.dataset.originalText || btn.textContent;
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.cursor = '';
    }
  }

  function validate(form) {
    let ok = true;
    const boxes = form.querySelectorAll('.input-box');
    boxes.forEach((box) => {
      const input = box.querySelector('input');
      const error = box.querySelector('.error-message');
      if (!input || !error) return;
      error.textContent = '';
      if (!input.value.trim()) {
        error.textContent = 'Ce champ est requis';
        ok = false;
        return;
      }
      if (input.type === 'email') {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(input.value.trim())) { error.textContent = 'Adresse e-mail invalide'; ok = false; }
      }
      if (input.name === 'password') {
        const min = Number(input.getAttribute('minlength') || 6);
        if (input.value.length < min) { error.textContent = `Au moins ${min} caractères`; ok = false; }
      }
    });
    return ok;
  }

  const loginForm = document.querySelector('.form-box.login form');
  const regForm = document.querySelector('.form-box.register form');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate(loginForm)) { toast('Veuillez corriger les erreurs', 'error'); applyShake(loginForm); return; }
      const btn = loginForm.querySelector('button[type="submit"]');
      setLoading(btn, true, 'Connexion...');
      setTimeout(() => {
        setLoading(btn, false);
        toast('Connexion réussie', 'success');
        window.location.href = 'schedule_builder.html';
      }, 900);
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate(regForm)) { toast('Veuillez corriger les erreurs', 'error'); applyShake(regForm); return; }
      const btn = regForm.querySelector('button[type="submit"]');
      setLoading(btn, true, 'Création...');
      setTimeout(() => {
        setLoading(btn, false);
        toast('Compte créé ! Vous pouvez vous connecter', 'success');
        if (container) container.classList.remove('active');
      }, 1000);
    });
  }

  document.querySelectorAll('.input-box input').forEach((inp) => {
    inp.addEventListener('input', () => {
      const box = inp.closest('.input-box');
      const error = box ? box.querySelector('.error-message') : null;
      if (error) error.textContent = '';
    });
  });

  // Forgot password modal logic
  const forgotOpen = document.getElementById('forgot-open');
  const forgotModal = document.getElementById('forgot-modal');
  const forgotClose = document.getElementById('forgot-close');
  const sendOtpBtn = document.getElementById('send-otp');
  const verifyOtpBtn = document.getElementById('verify-otp');
  const forgotEmail = document.getElementById('forgot-email');
  const otpRow = document.getElementById('otp-row');
  const otpCode = document.getElementById('otp-code');

  function openModal() {
    if (!forgotModal) return;
    forgotModal.classList.add('open');
    forgotModal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    if (!forgotModal) return;
    forgotModal.classList.remove('open');
    forgotModal.setAttribute('aria-hidden', 'true');
    // reset fields
    if (forgotEmail) forgotEmail.value = '';
    if (otpCode) otpCode.value = '';
    if (otpRow) otpRow.hidden = true;
    if (verifyOtpBtn) verifyOtpBtn.hidden = true;
    if (sendOtpBtn) sendOtpBtn.hidden = false;
  }

  if (forgotOpen && forgotModal) {
    forgotOpen.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  }
  if (forgotClose) {
    forgotClose.addEventListener('click', closeModal);
  }
  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', () => {
      // validate email
      const box = forgotEmail ? forgotEmail.closest('.input-box') : null;
      const error = box ? box.querySelector('.error-message') : null;
      if (!forgotEmail || !forgotEmail.value.trim()) {
        if (error) error.textContent = 'Entrez votre e-mail';
        toast('Veuillez indiquer un e-mail', 'error');
        applyShake(forgotModal.querySelector('.modal-dialog'));
        return;
      }
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(forgotEmail.value.trim())) {
        if (error) error.textContent = 'Adresse e-mail invalide';
        toast('Adresse e-mail invalide', 'error');
        applyShake(forgotModal.querySelector('.modal-dialog'));
        return;
      }
      // simulate OTP send
      toast('Code envoyé à votre e-mail', 'success');
      if (otpRow) otpRow.hidden = false;
      if (verifyOtpBtn) verifyOtpBtn.hidden = false;
      if (sendOtpBtn) sendOtpBtn.hidden = true;
    });
  }
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', () => {
      if (!otpCode || (otpCode.value || '').trim().length < 4) {
        const box = otpCode ? otpCode.closest('.input-box') : null;
        const error = box ? box.querySelector('.error-message') : null;
        if (error) error.textContent = 'Code invalide';
        toast('Code OTP invalide', 'error');
        applyShake(forgotModal.querySelector('.modal-dialog'));
        return;
      }
      toast('Code vérifié. Vous recevrez un lien de réinitialisation.', 'success');
      closeModal();
    });
  }

  function applyShake(el) {
    if (!el) return;
    el.classList.remove('shake');
    // force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 450);
  }

  // dark mode removed per request
});
