const registerForm = document.querySelector('#register-form');
const messageBox = document.querySelector('#message');

const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_REGISTER_URL = `${BASE_API_URL}/auth/register`;

const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

function showMessage(text) {
  if (messageBox) messageBox.textContent = text;
}

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

registerForm?.addEventListener('submit', onRegisterFormSubmit);
