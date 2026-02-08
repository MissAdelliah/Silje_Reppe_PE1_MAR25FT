import { addToLocalStorage } from './utils.js';

// --- DOM ---
const loginForm = document.querySelector('#login-form');
const messageBox = document.querySelector('#message');

// --- API ---
const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_LOGIN_URL = `${BASE_API_URL}/auth/login`;
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// Helper: show message
function showMessage(text) {
  if (!messageBox) return;
  messageBox.textContent = text;
}

// Main: login request
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
      const serverMessage = json?.errors?.[0]?.message || 'Login failed.';
      showMessage(serverMessage);
      console.log('Login error:', json);
      return;
    }

    const accessToken = json?.data?.accessToken ?? json?.accessToken;
    if (!accessToken) {
      showMessage('Login succeeded but token was missing.');
      console.log('Missing token:', json);
      return;
    }

    // Save accessToken so create/edit can do POST/PUT/DELETE
    addToLocalStorage('accessToken', accessToken);

    // Save profileName because it is used in endpoints: /blog/posts/<name>
    const profileName = json?.data?.name;
    if (profileName) addToLocalStorage('profileName', profileName);

    // Optional UI values
    const displayName = json?.data?.displayName;
    if (displayName) addToLocalStorage('displayName', displayName);

    const avatarUrl = json?.data?.avatar?.url;
    if (avatarUrl) addToLocalStorage('avatarUrl', avatarUrl);

    showMessage('Success! Redirecting…');
    window.location.href = '/index.html';
  } catch (error) {
    console.log('Login exception:', error);
    showMessage('Network error. Try again.');
  }
}

// Event handler
function onLoginFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);

  if (formFields.email) formFields.email = formFields.email.trim();

  loginUser(formFields);
}

loginForm?.addEventListener('submit', onLoginFormSubmit);
