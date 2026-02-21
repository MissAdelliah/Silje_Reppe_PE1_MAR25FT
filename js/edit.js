import { getFromLocalStorage } from './utils.js';

const BASE_API_URL = 'https://v2.api.noroff.dev';
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// Auth
const accessToken = getFromLocalStorage('accessToken');
const profileName = getFromLocalStorage('profileName');

// DOM
const form = document.getElementById('edit-form');
const messageBox = document.getElementById('message');

const mediaUrlInput = document.getElementById('mediaUrl');
const mediaPreview = document.getElementById('media-preview');
const cancelBtn = document.getElementById('cancel-btn');

const profileAvatarEl = document.getElementById('create-profile-avatar');
const profileNameEl = document.getElementById('create-profile-name');
const profileSubtitleEl = document.getElementById('create-profile-subtitle');
const profileStatsEl = document.getElementById('create-profile-stats');

function showMessage(text) {
  if (!messageBox) return;
  messageBox.textContent = text;
}

function requireLogin() {
  if (!accessToken || !profileName) {
    window.location.href = '../login.html';
  }
}

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function parseTags(tagsString) {
  if (!tagsString) return [];
  return tagsString
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function tagsToString(tags) {
  if (!Array.isArray(tags)) return '';
  return tags.join(', ');
}

function updateMediaPreview(url) {
  if (!mediaPreview) return;

  if (!url) {
    mediaPreview.src = 'https://placehold.co/900x400?text=Drop+image+or+shorts';
    return;
  }
  mediaPreview.src = url;
}

//Profile card
function renderProfileCard() {
  if (!profileNameEl || !profileAvatarEl) return;

  const displayName = getFromLocalStorage('displayName');
  const avatarUrl = getFromLocalStorage('avatarUrl');
  const bio = getFromLocalStorage('profileBio');

  const safeName = (displayName || profileName || 'User').toString();
  profileNameEl.textContent = safeName.toUpperCase();

  if (profileSubtitleEl)
    profileSubtitleEl.textContent = bio || 'FITNESS INFLUENCER';
  if (profileStatsEl) profileStatsEl.textContent = '25K READERS';

  profileAvatarEl.src = avatarUrl || 'https://placehold.co/120x120?text=User';
}

profileAvatarEl?.addEventListener('error', () => {
  profileAvatarEl.src = 'https://placehold.co/120x120?text=User';
});

// Fetch + render existing post
async function fetchPost(id) {
  const url = `${BASE_API_URL}/blog/posts/${profileName}/${id}`;

  const res = await fetch(url, {
    headers: {
      'X-Noroff-API-Key': NOROFF_API_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.errors?.[0]?.message || 'Could not load post.');
  }

  return json.data;
}

function fillFormFromPost(post) {
  if (!form) return;

  form.title.value = post.title || '';
  form.body.value = post.body || '';
  form.tags.value = tagsToString(post.tags);

  const url = post.media?.url || '';
  form.mediaUrl.value = url;
  updateMediaPreview(url);
}

async function updatePost(id) {
  if (!form.title.value.trim() || !form.body.value.trim()) {
    showMessage('Title and body are required.');
    return;
  }

  const url = `${BASE_API_URL}/blog/posts/${profileName}/${id}`;

  const payload = {
    title: form.title.value.trim(),
    body: form.body.value.trim(),
    tags: parseTags(form.tags.value),
    media: form.mediaUrl.value
      ? { url: form.mediaUrl.value.trim(), alt: 'Post image' }
      : null,
  };

  showMessage('Saving…');

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Noroff-API-Key': NOROFF_API_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    showMessage(json?.errors?.[0]?.message || 'Could not save changes.');
    return;
  }

  showMessage('Saved! Redirecting…');
  window.location.href = `./index.html?id=${id}`;
}

mediaUrlInput?.addEventListener('input', (event) => {
  updateMediaPreview(event.target.value);
});

mediaPreview?.addEventListener('error', () => {
  mediaPreview.src = 'https://placehold.co/900x400?text=Invalid+image+URL';
});

cancelBtn?.addEventListener('click', () => {
  const id = getIdFromUrl();
  if (id) window.location.href = `./index.html?id=${id}`;
  else window.location.href = '../index.html';
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const id = getIdFromUrl();
  if (!id) {
    showMessage('Missing id in URL.');
    return;
  }
  updatePost(id);
});

(async function init() {
  requireLogin();
  renderProfileCard();

  const id = getIdFromUrl();
  if (!id) {
    showMessage('Missing id in URL.');
    return;
  }

  try {
    showMessage('Loading…');
    const post = await fetchPost(id);
    fillFormFromPost(post);
    showMessage('');
  } catch (err) {
    showMessage(err.message || 'Could not load post.');
  }
})();
