const registerForm = document.querySelector('#register-form');

const BASE_API_URL = 'https://v2.api.noroff.dev';
const AUTH_REGISTER_URL = `${BASE_API_URL}/auth/register`;

async function registerUser(userDetails) {
  try {
    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify(userDetails),
      headers: {
        'content-Type': 'application/json',
      },
    };
    const response = await fetch(AUTH_REGISTER_URL, fetchOptions);
  } catch (error) {
    console.log(error);
  }
}
function onRegisterFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);
  registerUser(formFields);
  console.log(formFields);
}
registerForm.addEventListener('submit', onRegisterFormSubmit);
