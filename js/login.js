/* import { addToLocalStorage } from './utils';
const loginForm = document.querySelector('#login-form');

const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_REGISTER_URL = `${BASE_API_URL}/auth/login`;

function addToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

function getFromLocalStorage(key) {
  return localStorage.getItem(key);
}

async function loginUser(userDetails) {
  try {
    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify(userDetails),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(AUTH_REGISTER_URL, fetchOptions);
    const json = await response.json();

    // handle login errors (401 etc.)
    if (!response.ok) {
      console.log('Login failed:', json.errors?.[0]?.message || json);
      return;
    }

    //Noroff v2 token is usually here:
    const accessToken = json.data?.accessToken ?? json.accessToken;

    // stop if token missing
    if (!accessToken) {
      return;
    }

    addToLocalStorage('accessToken', accessToken);
  } catch (error) {}
}

function onRegisterFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);

  //prevent invisible spaces
  if (formFields.email) formFields.email = formFields.email.trim();

  loginUser(formFields);
}

loginForm.addEventListener('submit', onRegisterFormSubmit);
*/ // login.js
// Handles logging in and saving the access token in localStorage

import { addToLocalStorage } from './utils.js';

const loginForm = document.querySelector('#login-form');
const messageBox = document.querySelector('#message'); // optional (add <p id="message"></p> in HTML)

const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_LOGIN_URL = `${BASE_API_URL}/auth/login`;
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// Helper to show messages to the user
function showMessage(text) {
  if (!messageBox) return;
  messageBox.textContent = text;
}

async function loginUser(userDetails) {
  try {
    showMessage('Logging in…');

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Noroff-API-Key': NOROFF_API_KEY,
      },
      body: JSON.stringify(userDetails),
    };

    const response = await fetch(AUTH_LOGIN_URL, fetchOptions);
    const json = await response.json();

    // If login fails, show server error
    if (!response.ok) {
      const serverMessage = json?.errors?.[0]?.message || 'Login failed.';
      showMessage(serverMessage);
      console.log('Login error:', json);
      return;
    }

    // Token is usually in json.data.accessToken
    const accessToken = json?.data?.accessToken ?? json?.accessToken;

    if (!accessToken) {
      showMessage('Login succeeded but token was missing.');
      console.log('Missing token:', json);
      return;
    }

    // Save token so other pages can use it
    addToLocalStorage('accessToken', accessToken);

    showMessage('Success! Redirecting…');

    // Redirect user to the home page after login
    window.location.href = '/index.html';
  } catch (error) {
    console.log('Login exception:', error);
    showMessage('Network error. Try again.');
  }
}

function onLoginFormSubmit(event) {
  event.preventDefault();

  // FormData reads the inputs by "name" attributes
  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);

  // Trim email to avoid invisible spaces causing login failure
  if (formFields.email) formFields.email = formFields.email.trim();

  loginUser(formFields);
}

loginForm?.addEventListener('submit', onLoginFormSubmit);
