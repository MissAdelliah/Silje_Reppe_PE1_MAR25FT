import {
  getFromLocalStorage,
  addToLocalStorage,
  initNavMenu,
} from './utils.js';
initNavMenu();

// DOM
const form = document.getElementById('create-form');
const messageBox = document.getElementById('message');
const mediaUrlInput = document.getElementById('mediaUrl');
const mediaPreview = document.getElementById('media-preview');
const draftBtn = document.getElementById('draft-btn');

// DOM: profile card elements
const profileAvatarEl = document.getElementById('create-profile-avatar');
const profileNameEl = document.getElementById('create-profile-name');
const profileSubtitleEl = document.getElementById('create-profile-subtitle');
const profileStatsEl = document.getElementById('create-profile-stats');

// API
const BASE_API_URL = 'https://v2.api.noroff.dev';
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

const accessToken = getFromLocalStorage('accessToken');
const profileName = getFromLocalStorage('profileName');
const DRAFT_KEY = 'createPostDraft';

function showMessage(text) {
  if (!messageBox) return;
  messageBox.textContent = text;
}

// Protect page: if logged out, user should not reach create page
function requireLogin() {
  if (!accessToken || !profileName) {
    window.location.href = '/account/login.html';
  }
}
console.log('avatarUrl key:', getFromLocalStorage('avatarUrl'));
console.log('avatar key:', getFromLocalStorage('avatar'));

function parseTags(tagsString) {
  if (!tagsString) return [];
  return tagsString
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// Preview image from pasted URL
function updateMediaPreview(url) {
  if (!mediaPreview) return;

  if (!url) {
    mediaPreview.src = 'https://placehold.co/900x400?text=emty';
    return;
  }

  mediaPreview.src = url;
}

// Fallback if user pastes a broken image URL
mediaPreview?.addEventListener('error', () => {
  mediaPreview.src = 'https://placehold.co/900x400?text=Invalid+image+URL';
});

// Render profile card from localStorage so every user sees THEIR own info
function renderProfileCard() {
  if (!profileNameEl || !profileAvatarEl) return;

  const displayName = getFromLocalStorage('displayName');
  const avatarUrl = getFromLocalStorage('avatarUrl');

  const safeName = (displayName || profileName || 'User').toString();
  profileNameEl.textContent = safeName.toUpperCase();

  // BIO (instead of niche/type)
  const bio = getFromLocalStorage('profileBio');

  if (profileSubtitleEl) {
    profileSubtitleEl.textContent = bio || 'FITNESS INFLUENCER';
  }
  if (profileStatsEl) profileStatsEl.textContent = '25K READERS';

  // Avatar from localStorage, placeholder
  profileAvatarEl.src = avatarUrl || 'https://placehold.co/120x120?text=User';
}

// if link is broken
profileAvatarEl?.addEventListener('error', () => {
  profileAvatarEl.src = 'https://placehold.co/120x120?text=User';
});

function loadDraft() {
  const draftString = getFromLocalStorage(DRAFT_KEY);
  if (!draftString) return;

  try {
    const draft = JSON.parse(draftString);

    if (draft.mediaUrl) form.mediaUrl.value = draft.mediaUrl;
    if (draft.title) form.title.value = draft.title;
    if (draft.body) form.body.value = draft.body;
    if (draft.tags) form.tags.value = draft.tags;

    if (draft.plannedTime) form.plannedTime.value = draft.plannedTime;
    if (draft.plannedDate) form.plannedDate.value = draft.plannedDate;

    updateMediaPreview(draft.mediaUrl || '');
    showMessage('Saved to drafts');
  } catch (error) {
    console.log('Draft parse error:', error);
  }
}

// Save draft to localStorage
function saveDraft() {
  const draft = {
    mediaUrl: form.mediaUrl.value,
    title: form.title.value,
    body: form.body.value,
    tags: form.tags.value,
    plannedTime: form.plannedTime.value,
    plannedDate: form.plannedDate.value,
  };

  addToLocalStorage(DRAFT_KEY, JSON.stringify(draft));
  showMessage('Saved to drafts');
}

// Publish post to Noroff API
async function publishPost() {
  if (!form.title.value.trim() || !form.body.value.trim()) {
    showMessage('Title and body are required.');
    return;
  }

  const CREATE_POST_URL = `${BASE_API_URL}/blog/posts/${profileName}`;
  const payload = {
    title: form.title.value.trim(),
    body: form.body.value.trim(),
    tags: parseTags(form.tags.value),
    media: form.mediaUrl.value
      ? { url: form.mediaUrl.value.trim(), alt: 'Post image' }
      : null,
  };

  try {
    showMessage('Publishing…');

    const response = await fetch(CREATE_POST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Noroff-API-Key': NOROFF_API_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok) {
      console.log('Publish error:', json);
      showMessage(json?.errors?.[0]?.message || 'Could not publish post.');
      return;
    }

    localStorage.removeItem(DRAFT_KEY);

    showMessage('Published! Redirecting…');
    window.location.href = 'index.html';
  } catch (error) {
    console.log('Publish exception:', error);
    showMessage('Network error. Try again.');
  }
}

mediaUrlInput?.addEventListener('input', (event) => {
  updateMediaPreview(event.target.value);
});

draftBtn?.addEventListener('click', () => {
  saveDraft();
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  publishPost();
});

requireLogin();
renderProfileCard();
loadDraft();
