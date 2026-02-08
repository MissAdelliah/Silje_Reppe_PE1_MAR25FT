import { getFromLocalStorage } from './utils.js';

/* =========================================================
   API constants
   ========================================================= */

const BASE_API_URL = 'https://v2.api.noroff.dev';
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// If user is logged out, we show this demo client feed
const DEFAULT_BLOG_NAME = 'fitwithMalene';

// If user is logged in, show THEIR feed instead (more personal)
const profileName = getFromLocalStorage('profileName');
const BLOG_NAME = profileName || DEFAULT_BLOG_NAME;

/* =========================================================
   DOM
   ========================================================= */

const carouselEl = document.getElementById('carousel');
const postListEl = document.getElementById('post-list');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const dotsEl = document.getElementById('carousel-dots');

/* =========================================================
   Local state
   ========================================================= */

let allPosts = [];
let carouselPosts = [];
let carouselIndex = 0;

/* =========================================================
   Helpers
   ========================================================= */

function renderStatus(text) {
  if (!postListEl) return;
  postListEl.innerHTML = `<p class="status">${text}</p>`;
}

// Simple “time ago” formatter (published time)
function formatTimeAgo(isoString) {
  if (!isoString) return 'Unknown time';

  const now = Date.now();
  const then = new Date(isoString).getTime();

  if (Number.isNaN(then)) return 'Unknown time';

  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hours ago`;
  return `${diffDay} days ago`;
}

/* =========================================================
   Data fetching
   ========================================================= */

async function fetchPosts() {
  const url = `${BASE_API_URL}/blog/posts/${BLOG_NAME}`;

  const response = await fetch(url, {
    headers: {
      'X-Noroff-API-Key': NOROFF_API_KEY,
    },
  });

  const json = await response.json();

  if (!response.ok) {
    console.log('Fetch posts error:', json);
    throw new Error(json?.errors?.[0]?.message || 'Failed to load posts');
  }

  return json?.data || [];
}

function sortNewestFirst(posts) {
  return posts.slice().sort((a, b) => {
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();
    return dateB - dateA;
  });
}

/* =========================================================
   CAROUSEL (NEW HERO SLIDE)
   ========================================================= */

function renderCarouselSlide() {
  if (!carouselEl) return;
  if (carouselPosts.length === 0) return;

  const post = carouselPosts[carouselIndex];

  const imgUrl =
    post?.media?.url || 'https://placehold.co/900x1400?text=No+image';
  const imgAlt = post?.media?.alt || post?.title || 'Post image';

  const tag = post?.tags?.[0] || '';
  const author = post?.author?.name || 'Unknown';
  const category = tag || 'Travel';

  carouselEl.innerHTML = `
    <article class="hero" aria-label="Carousel post">
      <img class="hero__img" src="${imgUrl}" alt="${imgAlt}">
      <div class="hero__overlay" aria-hidden="true"></div>

      <p class="hero__hint" aria-hidden="true">SWIPE</p>

      <div class="hero__text">
        <p class="hero__category">${category}</p>
        <h3 class="hero__title">${post?.title || 'Untitled'}</h3>
        <p class="hero__meta">Published by: ${author}</p>
      </div>

      <a class="hero__cta" href="/post.html?id=${post.id}">Read More</a>
    </article>
  `;

  renderDots();
}

function renderDots() {
  if (!dotsEl) return;
  if (carouselPosts.length === 0) return;

  dotsEl.innerHTML = carouselPosts
    .map((_, i) => {
      const active = i === carouselIndex ? 'active' : '';
      return `<button class="carousel__dot ${active}" type="button" aria-label="Go to slide ${
        i + 1
      }" data-index="${i}"></button>`;
    })
    .join('');

  dotsEl.querySelectorAll('button[data-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      carouselIndex = Number(btn.dataset.index);
      renderCarouselSlide();
    });
  });
}

function goNext() {
  if (carouselPosts.length === 0) return;
  carouselIndex = (carouselIndex + 1) % carouselPosts.length;
  renderCarouselSlide();
}

function goPrev() {
  if (carouselPosts.length === 0) return;
  carouselIndex =
    (carouselIndex - 1 + carouselPosts.length) % carouselPosts.length;
  renderCarouselSlide();
}

/* =========================================================
   POST LIST (UPDATED AS REQUESTED)
   - Show username + publish time instead of title
   - Make image clickable -> post.html?id=...
   ========================================================= */

function renderPostList(posts) {
  if (!postListEl) return;

  const listPosts = posts.slice(0, 12);

  postListEl.innerHTML = listPosts
    .map((post) => {
      const imgUrl =
        post?.media?.url || 'https://placehold.co/600x400?text=No+image';
      const imgAlt = post?.media?.alt || post?.title || 'Post image';

      const author = post?.author?.name || 'Unknown';
      const avatar = post?.author?.avatar?.url || '/avatar-placeholder.png';
      const timeAgo = formatTimeAgo(post?.created);

      return `
        <article class="post-card">

          <a class="post-card__media" href="/post.html?id=${post.id}">
            <img class="post-card__img" src="${imgUrl}" alt="${imgAlt}">

            ${
              post?.tags?.[0]
                ? `<p class="post-card__tag-badge">${post.tags[0]}</p>`
                : ''
            }

            <!-- WHITE TRANSPARENT BAR -->
            <div class="post-card__overlay-bar">
              <img class="post-card__avatar" src="${avatar}" alt="${author}">
              <div class="post-card__meta">
                <p class="post-card__author">${author}</p>
                <p class="post-card__time">${timeAgo}</p>
              </div>
            </div>
          </a>

        </article>
      `;
    })
    .join('');
}

/* =========================================================
   Startup
   ========================================================= */

async function init() {
  try {
    renderStatus('Loading posts…');

    allPosts = await fetchPosts();
    const sorted = sortNewestFirst(allPosts);

    carouselPosts = sorted.slice(0, 3);
    carouselIndex = 0;

    renderCarouselSlide();
    renderPostList(sorted);

    prevBtn?.addEventListener('click', goPrev);
    nextBtn?.addEventListener('click', goNext);
  } catch (error) {
    console.log(error);
    renderStatus('Could not load posts. Try again.');
  }
}

init();
