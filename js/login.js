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
    const accessToken = json.accessToken;
    addToLocalStorage('accessToken', accessToken);
    console.log(json);
  } catch (error) {
    console.log(error);
  }
}
function onRegisterFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);
  console.log('Submitting:', formFields);
  loginUser(formFields);
}

loginForm.addEventListener('submit', onRegisterFormSubmit);
