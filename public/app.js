// main.js
const API = 'http://localhost:3000';

// -------------------- SWITCH TAB --------------------
export function switchTab(tab) {
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}

// -------------------- HANDLE LOGIN --------------------
export async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.message || 'Login gagal';
      return;
    }

    localStorage.setItem('token', data.token);
    alert('Login berhasil!');
  } catch (err) {
    errorEl.textContent = 'Tidak dapat terhubung ke server';
  }
}

// -------------------- HANDLE REGISTER --------------------
export async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const errorEl = document.getElementById('reg-error');
  const successEl = document.getElementById('reg-success');
  errorEl.textContent = '';
  successEl.textContent = '';

  try {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.message || 'Register gagal';
      return;
    }

    successEl.textContent = 'Register berhasil! Silakan login.';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-password').value = '';
  } catch (err) {
    errorEl.textContent = 'Tidak dapat terhubung ke server';
  }
}

// -------------------- EVENT LISTENERS --------------------
document.getElementById('tab-login').addEventListener('click', () => switchTab('login'));
document.getElementById('tab-register').addEventListener('click', () => switchTab('register'));
document.getElementById('form-login').addEventListener('submit', handleLogin);
document.getElementById('form-register').addEventListener('submit', handleRegister);