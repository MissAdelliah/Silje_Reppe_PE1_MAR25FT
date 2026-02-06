const loginForm = document.querySelector('#login-form');

const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_REGISTER_URL = `${BASE_API_URL}/auth/login`;

function addToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

function getFromLocalStorage(key) {
  return localDtorage.getItem(key);
}

async function loginUser(userDetails) {
  try {
    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify(userDetails),
      headers: {
        'content-Type': 'application/json',
      },
    };
    const response = await fetch(AUTH_REGISTER_URL, fetchOptions);
    const json = await response.json();
    const accessToken = json.accessToken;
    addToLocalStorage('accessToken', accessToken);
  } catch (error) {
    console.log(error);
  }
}
function onRegisterFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);
  loginUser(formFields);
  console.log(formFields);
}
loginForm.addEventListener('submit', onRegisterFormSubmit);
