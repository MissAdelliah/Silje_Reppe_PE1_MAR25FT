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
