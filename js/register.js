// --- DOM ---
const registerForm = document.querySelector('#register-form');
const messageBox = document.querySelector('#message');

// --- API ---
const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_REGISTER_URL = `${BASE_API_URL}/auth/register`;
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// Helper: show message
function showMessage(text) {
  if (!messageBox) return;
  messageBox.textContent = text;
}

// Main: register request
async function registerUser(userDetails) {
  try {
    showMessage('Creating account…');

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
      const serverMessage =
        json?.errors?.[0]?.message || 'Failed to register your user.';
      showMessage(serverMessage);
      console.log('Register error:', json);
      return;
    }

    showMessage('Successful! You can now log in.');
    window.location.href = '/login.html';
  } catch (error) {
    console.log('Register exception:', error);
    showMessage('Network error. Try again.');
  }
}

// Event handler
function onRegisterFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);

  if (formFields.email) formFields.email = formFields.email.trim();

  if (!formFields.password || formFields.password.length < 8) {
    showMessage('Password must be at least 8 characters.');
    return;
  }

  registerUser(formFields);
}

registerForm?.addEventListener('submit', onRegisterFormSubmit);
