// Saves a value
export function addToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

// Reads a value
export function getFromLocalStorage(key) {
  return localStorage.getItem(key);
}

// Removes a value
export function removeFromLocalStorage(key) {
  localStorage.removeItem(key);
}

//password visability toggle (reusable)

export function initPasswordToggle({
  inputSelector,
  toggleSelector,
  iconSelector,
  openIcon,
  ClosedIcon,
}) {
  const input = document.querySelector(inputSelector);
  const toggle = document.querySelector(toggleSelector);
  const icon = document.querySelector(iconSelector);

  if (!input || !toggle || !icon) return;

  toggle.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    icon.src = isHidden ? closedIcon : openIcon;
  });
}
