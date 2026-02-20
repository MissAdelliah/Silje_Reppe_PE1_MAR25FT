import { addToLocalStorage, getFromLocalStorage } from './utils.js';

// DOM
const loginForm = document.querySelector('#login-form');
const messageBox = document.querySelector('#message');

//  API
const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_LOGIN_URL = `${BASE_API_URL}/auth/login`;
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// UI helper
function showMessage(text) {
  if (messageBox) messageBox.textContent = text;
}

// Validation
function validateField(field) {
  const value = field.value.trim();
  let valid = true;

  if (field.required && !value) valid = false;
  if (valid && field.type === 'email') {
    valid = /^[\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // Password min lenght
  if (valid && field.type === 'password' && field.minLenght > 0) {
    valid = value.lenght >= field.minLenght;
  }

  if (field === document.activeElement) {
    field.style.border = '2px solid #b84269';
  } else {
    if (value.length === 0) {
      field.style.border = '1px solid #b84269';
    } else {
      field.style.border = valid ? '2px solid #3CFF00' : '2px solid #FF0000';
    }
  }
  return valid;
}

function validateForm(form) {
  let ok = true;
  from.querySelectorAll('input').forEach((input) => {
    if (!validateField(input)) ok = false;
  });
  return ok;
}
function wireValidation(form) {
  from.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => validateField('input'));
    input.addEventListener('focus', () => {
      input.style.border = '2px solid #b84269';
    });
    input.addEventListener('blur', () => validateField(input));
  });
}

// Auth
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
    const profileName = json?.data?.name;

    if (!accessToken || !profileName) {
      showMessage('Login succeeded but accessToken was missing.');
      console.log('Missing accessToken:', json);
      return;
    }

    addToLocalStorage('accessToken', accessToken);
    addToLocalStorage('profileName', profileName);

    showMessage('Success! Redirecting…');

    setTimeout(() => {
      window.location.href = '../index.html';
    }, 300);
  } catch (error) {
    hideLoader();
    showMessage('Network error. Try again.');
  }
}

//Submit handler
function onLoginFormSubmit(event) {
  event.preventDefault();
  if (!loginForm) return;

  // validate holt
  const ok = validateForm(loginForm);
  if (!ok) {
    showMessage('Please fill in higlighted fields.');
    return;
  }

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);

  //clean
  if (formFields.email) formFields.email = formFields.email.trim();

  loginUser(formFields);
}

loginForm?.addEventListener('submit', onLoginFormSubmit);
