// Import helper,  check if user is logged in
import { getFromLocalStorage } from './utils.js';

const BASE_API_URL = 'https://v2.api.noroff.dev';
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// If not logged in, show demo blog
const DEFAULT_BLOG_NAME = 'fitwithMalene';
// If logged in, store name

const profileName = getFromLocalStorage('profileName');

//use logged in name, fallback deafault blog
const BLOG_NAME = profileName || DEFAULT_BLOG_NAME;

//DOM

const titleEl = document.getElementById('post-title');
const authorEl = document.getElementById('post-author');
const dateEl = document.getElementById('post-date');
const bannerWrapEl = document.getElementById('post-banner-wrap');
const bannerEl = document.getElementById('post-banner');
const bodyEl = document.getElementById('post-body');
const messageEl = document.getElementById('message');
const shareBtn = document.getElementById('share-btn');

function showMessage(text) {
  if (messageEl) messageEl.textContent = text;
}
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}
function formatDate(isoString) {
  const d = new Date(isoString);

  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function fetchPost(id) {
  //GET /blog/post/<name>/<id>
  const url = `${BASE_API_URL}/blog/posts/${BLOG_NAME}/${id}`;

  const res = await fetch(url, {
    headers: {
      'X-Noroff-API-Key': NOROFF_API_KEY,
    },
  });

  const json = await res.json();
  return json.data;
}

//render
function renderPost(post) {
  titleEl.textContent = post.title || 'untitled';
  authorEl.textContent = post.author?.name || 'unknown';

  if (post.created) {
    dateEl.textContent = formatDate(post.created);
    dateEl.setAttribute('datetime', post.created);
  }

  if (post.media?.url) {
    bannerEl.src = post.media.url;
    bannerEl.alt = post.media.alt || post.title || 'post image';
    bannerWrapEl.style.display = '';
  } else {
    bannerWrapEl.style.display = 'none';
  }
  bodyEl.textContent = post.body || '';

  const shareUrl = `${window.location.origin}/post/index.html?id=${post.id}`;
  //Sharable url
  shareBtn?.addEventListener('click', async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showMessage('link copied');
      }
    } catch {
      showMessage('could not share');
    }
  });
}

(async function init() {
  //Get post id from url
  const id = getIdFromUrl();
  // if no id
  if (!id) {
    showMessage('Missing id');
    return;
  }
  showMessage('Loading...');
  const post = await fetchPost(id);
  showMessage('');
  renderPost(post);
})();
