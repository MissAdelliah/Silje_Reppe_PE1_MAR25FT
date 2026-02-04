const registerForm = document.querySelecto("#register-form");
const BASE_API_URL = "https://v2.api.noroff.dev/";

const AUTH_REGISTER_URL = "${BASE_API_URL}/auth/register";
function registerUser(userDetails) {
  try {
    const response = fetch();
  } catch (error) {
  } finally {
  }
}
function onRegisterFormSubmit(event) {
  event.preventDeafault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);
}
registerForm.addEventListener("submit,onRegisterFormSubmit");
