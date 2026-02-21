import { initPasswordToggle } from './utils.js';

const registerForm = document.querySelector('#register-form');
const messageBox = document.querySelector('#message');

const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_REGISTER_URL = `${BASE_API_URL}/auth/register`;
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// Hide / shows password
initPasswordToggle({
  inputSelector: 'input[name="password"]',
  toggleSelector: '.password-toggle',
  iconSelector: '.password-icon',
  openIcon: '../icons/openeye.png',
  ClosedIcon: '../icons/closedeye.png',
});

function showMessage(text) {
  if (messageBox) messageBox.textContent = text;
}
// Validation
function validateField(field) {
  const value = field.value.trim();
  let valid = true;

  if (field.required && !value) valid = false;

  //Email
  if (valid && field.type === 'email') {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // Password min lenght
  if (valid && field.type === 'password' && field.minLength > 0) {
    valid = value.length >= field.minLength;
  }
  // Styling
  if (field === document.activeElement) {
    field.style.border = '2px solid #b84269';
    field.style.outline = 'none';
  } else {
    if (value.length === 0) {
      field.style.border = 'none';
      field.style.outline = 'none';
    } else {
      field.style.border = valid ? '1px solid #3CFF00' : '2px solid #FF0000';
      field.style.outline = 'none';
    }
  }
  return valid;
}

function validateForm(form) {
  let ok = true;
  form.querySelectorAll('input').forEach((input) => {
    if (!validateField(input)) ok = false;
  });
  return ok;
}

function wireValidation(form) {
  if (!form) return;
  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => validateField(input));
    input.addEventListener('focus', () => validateField(input));
    input.addEventListener('blur', () => validateField(input));
  });
}

// Register
async function registerUser(userDetails) {
  try {
    showMessage('Creating account...');

    const response = await fetch(AUTH_REGISTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Noroff-API-Key': NOROFF_API_KEY,
      },
      body: JSON.stringify(userDetails),
    });

    const json = await response.json();

    if (!response.ok) {
      showMessage(json?.errors?.[0]?.message || 'Registration failed.');
      console.log('Register error:', json);
      return;
    }

    showMessage('Successful! Redirecting to login…');

    setTimeout(() => {
      window.location.href = '/login.html';
    }, 300);
  } catch (error) {
    console.log('Register exception:', error);
    showMessage('Network error. Try again.');
  }
}

function onRegisterFormSubmit(event) {
  event.preventDefault();
  if (!registerForm) return;
  const ok = validateForm(registerForm);
  if (!ok) {
    showMessage('Please fill in higlighted fields.');
  }
  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);

  if (formFields.name) formFields.name = formFields.name.trim();
  if (formFields.email) formFields.email = formFields.email.trim();

  if (!formFields.password || formFields.password.length < 8) {
    showMessage('Password must be at least 8 characters.');
    return;
  }

  registerUser(formFields);
}

wireValidation(registerForm);
registerForm?.addEventListener('submit', onRegisterFormSubmit);
