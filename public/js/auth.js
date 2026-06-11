/* THEME SWITCHING SYSTEM */
const applyTheme = (theme) => {
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
};

const initTheme = () => {
  const saved = localStorage.getItem('taskfree-theme') || 'dark';
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === saved);
  });

  applyTheme(saved);
};

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;

    localStorage.setItem('taskfree-theme', theme);

    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    applyTheme(theme);
  });
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (localStorage.getItem('taskfree-theme') === 'system') {
    applyTheme('system');
  }
});

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

/* Help show message */
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

      // Show resend verification option if account is unverified
      if (data.requiresVerification) {
        document.getElementById('resend-section').style.display = 'block';
        // Store email for resend button
        document.getElementById('resend-btn').dataset.email = email;
      }
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

/* Resend Verification */
document.getElementById('resend-btn').addEventListener('click', async () => {
  const email = document.getElementById('resend-btn').dataset.email;
  const btn = document.getElementById('resend-btn');

  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    showMessage('login-message', data.message || 'Verification email sent!', 'success');
    document.getElementById('resend-section').style.display = 'none';

  } catch (error) {
    showMessage('login-message', 'Could not send email. Try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Resend Verification Email';
  }
});


/* Check for URL Params */
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('verified') === 'true') {
  showMessage('login-message', 'Email verified successfully! You can now log in.', 'success');
}

if (urlParams.get('error') === 'invalid_token') {
  showMessage('login-message', 'Invalid verification link. Please request a new one.', 'error');
}

if (urlParams.get('error') === 'token_expired') {
  showMessage('login-message', 'Verification link expired. Please request a new one.', 'error');
}


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
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 800);
        }

    } catch (error) {
        showMessage('register-message', 'Could not connect to server', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Create Account';
    }
});

/* PASSWORD TOGGLE AND VISIBILITY */
document.querySelectorAll('.eye-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    const eyeIcon = btn.querySelector('.eye-icon');
    const eyeOffIcon = btn.querySelector('.eye-off-icon');

    // Toggle between password and text type
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

/* This Logic check if user is already logged in */
const checkAuth = async () => {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.loggedIn) {
        window.location.href = '/dashboard.html';
        }
    } catch (error) {
        // Server unreachable — stay on login page
    }
};

checkAuth();