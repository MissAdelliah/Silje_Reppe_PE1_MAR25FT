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
