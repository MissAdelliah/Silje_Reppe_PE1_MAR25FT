import { addToLocalStorage } from './utils.js';

// ---------- DOM ----------
const loginForm = document.querySelector('#login-form');
const messageBox = document.querySelector('#message');

// ---------- API ----------
const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_LOGIN_URL = `${BASE_API_URL}/auth/login`;

// Teacher requirement: include API key in login/register
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// ---------- UI helper ----------
function showMessage(text) {
  if (messageBox) messageBox.textContent = text;
}

// ---------- Main login ----------
async function loginUser(userDetails) {
  try {
    showMessage('Logging in…');

    const response = await fetch(AUTH_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Noroff-API-Key': NOROFF_API_KEY,
      },
      body: JSON.stringify(userDetails),
    });

    const json = await response.json();

    if (!response.ok) {
      showMessage(json?.errors?.[0]?.message || 'Login failed.');
      console.log('Login error:', json);
      return;
    }

    const accessToken = json?.data?.accessToken;
    if (!accessToken) {
      showMessage('Login succeeded but accessToken was missing.');
      console.log('Missing accessToken:', json);
      return;
    }

    addToLocalStorage('accessToken', accessToken);

    const profileName = json?.data?.name;
    if (profileName) addToLocalStorage('profileName', profileName);

    showMessage('Success! Redirecting…');

    setTimeout(() => {
      window.location.href = '/index.html';
    }, 300);
  } catch (error) {
    showMessage('Network error. Try again.');
  }
}

//Submit handler
function onLoginFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);

  if (formFields.email) formFields.email = formFields.email.trim();

  loginUser(formFields);
}

loginForm?.addEventListener('submit', onLoginFormSubmit);
