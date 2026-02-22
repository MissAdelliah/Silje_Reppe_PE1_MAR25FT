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
  closedIcon,
}) {
  const input = document.querySelector(inputSelector);
  const toggle = document.querySelector(toggleSelector);
  const icon = document.querySelector(iconSelector);

  if (!input || !toggle || !icon) return;

  toggle.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    //hide /show ps
    input.type = isHidden ? 'text' : 'password';
    //UI feedback
    icon.src = isHidden ? openIcon : closedIcon;
  });
}
export function initNavMenu() {
  const menuBtn = document.getElementById('nav-menu-btn');
  const dropdown = document.getElementById('nav-dropdown');

  if (!menuBtn || !dropdown) return;

  function isLoggedIn() {
    return !!localStorage.getItem('accessToken');
  }

  function closeMenu() {
    dropdown.setAttribute('hidden', '');
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  function buildMenu() {
    const loggedIn = isLoggedIn();

    const inSubFolder =
      window.location.pathname.includes('/post/') ||
      window.location.pathname.includes('/account/');

    const homeHref = inSubFolder ? '../index.html' : './index.html';
    const loginHref = inSubFolder
      ? '../account/login.html'
      : './account/login.html';
    const registerHref = inSubFolder
      ? '../account/register.html'
      : './account/register.html';

    const homeLink = `<a class="nav-dropdown__item" href="${homeHref}">Home</a>`;

    if (!loggedIn) {
      dropdown.innerHTML = `
      ${homeLink}
      <a class="nav-dropdown__item" href="${loginHref}">Log in</a>
      <a class="nav-dropdown__item" href="${registerHref}">Register</a>
    `;
      return;
    }

    dropdown.innerHTML = `
    ${homeLink}
    <button class="nav-dropdown__item nav-dropdown__logout" id="logout-btn" type="button">
      Log out
    </button>
  `;

    document.getElementById('logout-btn')?.addEventListener('click', () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('profileName');
      closeMenu();
      window.location.href = homeHref;
    });
  }

  function openMenu() {
    buildMenu();
    dropdown.removeAttribute('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
  }

  // Toggle on click
  menuBtn.addEventListener('click', () => {
    const isOpen = !dropdown.hasAttribute('hidden');
    if (isOpen) closeMenu();
    else openMenu();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.hasAttribute('hidden')) {
      const clickedInside =
        dropdown.contains(e.target) || menuBtn.contains(e.target);
      if (!clickedInside) closeMenu();
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}
