import { getFromLocalStorage, initNavMenu } from './utils.js';
initNavMenu();

const BASE_API_URL = 'https://v2.api.noroff.dev';
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

const DEFAULT_BLOG_NAME = 'FitwithMalene';
const params = new URLSearchParams(window.location.search);
const BLOG_NAME = params.get('blog') || DEFAULT_BLOG_NAME;

console.log('Post page BLOG_NAME:', BLOG_NAME);

const titleEl = document.getElementById('post-title');
const bannerWrapEl = document.getElementById('post-banner-wrap');
const bannerEl = document.getElementById('post-banner');
const bodyEl = document.getElementById('post-body');
const messageEl = document.getElementById('message');
const dateEl = document.getElementById('post-date');
const authorEl = document.getElementById('post-author');

const editBtn = document.getElementById('edit-btn');
const shareBtn = document.getElementById('share-btn');

function showMessage(text) {
  if (messageEl) messageEl.textContent = text;
}

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function getAuth() {
  return {
    accessToken: getFromLocalStorage('accessToken'),
    profileName: getFromLocalStorage('profileName'),
  };
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function buildShareUrl(postId) {
  const url = new URL(window.location.href);
  url.pathname = url.pathname.replace(/\/post\/.*$/, '/post/index.html');
  url.search = `?id=${postId}&blog=${encodeURIComponent(BLOG_NAME)}`;
  return url.toString();
}

async function fetchPost(id) {
  const url = `${BASE_API_URL}/blog/posts/${BLOG_NAME}/${id}`;

  const res = await fetch(url, {
    headers: { 'X-Noroff-API-Key': NOROFF_API_KEY },
  });

  const json = await res.json();

  if (!res.ok) {
    const msg = json?.errors?.[0]?.message || 'Could not load post.';
    throw new Error(msg);
  }

  return json.data;
}

function setupEditButton(post) {
  if (!editBtn) return;

  // Hide by default
  editBtn.hidden = true;

  const { accessToken, profileName } = getAuth();
  const isOwner = profileName && post?.author?.name === profileName;

  if (accessToken && profileName && isOwner) {
    editBtn.hidden = false;
    editBtn.replaceWith(editBtn.cloneNode(true));
    const freshBtn = document.getElementById('edit-btn');

    freshBtn.addEventListener('click', () => {
      window.location.href = `./edit.html?id=${post.id}`;
    });
  }
}

function setupShareButton(post) {
  if (!shareBtn) return;

  const shareUrl = buildShareUrl(post.id);

  shareBtn.replaceWith(shareBtn.cloneNode(true));
  const freshShare = document.getElementById('share-btn');

  freshShare.addEventListener('click', async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showMessage('Link copied');
      }
    } catch (err) {
      showMessage('Could not share');
      console.log(err);
    }
  });
}

function renderPost(post) {
  if (titleEl) titleEl.textContent = post.title || 'Untitled';
  if (authorEl) authorEl.textContent = post.author?.name || 'Unknown';

  if (post.created && dateEl) {
    dateEl.textContent = formatDate(post.created);
    dateEl.setAttribute('datetime', post.created);
  }

  if (bannerWrapEl && bannerEl) {
    if (post.media?.url) {
      bannerEl.src = post.media.url;
      bannerEl.alt = post.media.alt || post.title || 'Post image';
      bannerWrapEl.style.display = '';
    } else {
      bannerWrapEl.style.display = 'none';
    }
  }

  if (bodyEl) bodyEl.textContent = post.body || '';

  setupEditButton(post);
  setupShareButton(post);
}

(async function init() {
  const id = getIdFromUrl();

  if (!id) {
    showMessage('Missing id');
    return;
  }

  try {
    showMessage('Loading…');
    const post = await fetchPost(id);
    showMessage('');
    renderPost(post);
  } catch (err) {
    showMessage(err?.message || 'Something went wrong.');
    console.log(err);
  }
})();
