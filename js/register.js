/* 
const registerForm = document.querySelector('#register-form');

const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_REGISTER_URL = `${BASE_API_URL}/auth/register`;

async function registerUser(userDetails) {
  try {
    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify(userDetails),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(AUTH_REGISTER_URL, fetchOptions);
  } catch (error) {}
}
function onRegisterFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);
  registerUser(formFields);
}
registerForm.addEventListener('submit', onRegisterFormSubmit);
*/
// register.js
// Handles registering a new account

const registerForm = document.querySelector('#register-form');
const messageBox = document.querySelector('#message'); // optional (add <p id="message"></p> in HTML)

const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_REGISTER_URL = `${BASE_API_URL}/auth/register`;
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// Helper to show messages to the user
function showMessage(text) {
  if (!messageBox) return;
  messageBox.textContent = text;
}

async function registerUser(userDetails) {
  try {
    showMessage('Creating account…');

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Noroff-API-Key': NOROFF_API_KEY,
      },
      body: JSON.stringify(userDetails),
    };

    const response = await fetch(AUTH_REGISTER_URL, fetchOptions);
    const json = await response.json();

    // Handle server validation errors
    if (!response.ok) {
      const serverMessage =
        json?.errors?.[0]?.message || 'Failed to registrate your user.';
      showMessage(serverMessage);
      console.log('Register error:', json);
      return;
    }

    showMessage('Successful! You can now log in');

    // REMOVE THIS LATER
    window.location.href = '/login.html';
  } catch (error) {
    console.log('Register exception:', error);
    showMessage('Network error. Try again.');
  }
}

function onRegisterFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);

  // Removes accidental spaces before or after the email
  if (formFields.email) {
    formFields.email = formFields.email.trim();
  }

  // Checks if password exist and least 8 characters
  if (!formFields.password || formFields.password.length < 8) {
    showMessage('Password must be at least 8 characters.');
    return; //
  }

  registerUser(formFields);
}

registerForm?.addEventListener('submit', onRegisterFormSubmit);
