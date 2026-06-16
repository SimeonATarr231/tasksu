/* THEME SWITCHING SYSTEM */
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.querySelector('#theme-toggle i');
  if (!icon) return;
  if (theme === 'light') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
};

const initTheme = () => {
  const saved = localStorage.getItem('TasksU-theme') || 'dark';
  applyTheme(saved);
};

const toggleBtn = document.getElementById('theme-toggle');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const current = localStorage.getItem('TasksU-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('TasksU-theme', next);
    applyTheme(next);
  });
}

initTheme();

/* Tab switching */
const tabBtns = document.querySelectorAll('.tab-btn');
const formPanels = document.querySelectorAll('.form-panel');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        formPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(target).classList.add('active');
    });
});

/* Password Toggler */
document.querySelectorAll('.eye-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    const eyeIcon = btn.querySelector('.eye-icon');
    const eyeOffIcon = btn.querySelector('.eye-off-icon');

    if (input.type === 'password') {
      input.type = 'text';
      eyeIcon.style.display = 'none';
      eyeOffIcon.style.display = 'block';
    } else {
      input.type = 'password';
      eyeIcon.style.display = 'block';
      eyeOffIcon.style.display = 'none';
    }
  });
});

/* Tab Switching */
const tabBtns = document.querySelectorAll('.tab-btn');
const formPanels = document.querySelectorAll('.form-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    formPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});

/* Helper */
const showMessage = (elementId, text, type) => {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.className = `message ${type}`;
};

/* Login */
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');

  if (!email || !password) {
    return showMessage('login-message', 'Please fill in all fields', 'error');
  }

  btn.disabled = true;
  btn.textContent = 'Logging in...';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage('login-message', data.error, 'error');
    } else {
      showMessage('login-message', 'Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 800);
    }

  } catch (error) {
    showMessage('login-message', 'Could not connect to server', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
});

/* Register */
document.getElementById('register-btn').addEventListener('click', async () => {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const btn = document.getElementById('register-btn');

  if (!username || !email || !password) {
    return showMessage('register-message', 'Please fill in all fields', 'error');
  }

  btn.disabled = true;
  btn.textContent = 'Creating account...';

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage('register-message', data.error, 'error');
    } else {
      showMessage('register-message', 'Account created! Redirecting...', 'success');
      setTimeout() => {
        window.location.href = '/dashboard.html';
      }, 800
    }

  } catch (error) {
    showMessage('register-message', 'Could not connect to server', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
});

/* Check Auth */
const checkAuth = async () => {
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    if (data.loggedIn) {
      window.location.href = '/dashboard.html';
    }
  } catch (error) {
    // stay on login page
  }
};

checkAuth();