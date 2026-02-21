import { getFromLocalStorage } from './utils.js';

const BASE_API_URL = 'https://v2.api.noroff.dev';
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

const DEFAULT_BLOG_NAME = 'fitwithMalene';
const profileName = getFromLocalStorage('profileName');
const BLOG_NAME = profileName || DEFAULT_BLOG_NAME;
const isLoggedIn = !!getFromLocalStorage('accessToken');
const isLoggedOut = !isLoggedIn;

console.log('Logged in:', isLoggedIn);
console.log('Logged out:', isLoggedOut);
/**** DOM ****/

const carouselEl = document.getElementById('carousel');
const postListEl = document.getElementById('post-list');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const dotsEl = document.getElementById('carousel-dots');
const tagNavEl = document.getElementById('tag-nav');

let allPosts = [];
let carouselPosts = [];
let carouselIndex = 0;
let activeTag = '';

function renderStatus(text) {
  if (!postListEl) return;
  postListEl.innerHTML = `<p class="status">${text}</p>`;
}

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

function sortNewestFirst(posts) {
  return posts.slice().sort((a, b) => {
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();
    return dateB - dateA;
  });
}

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

/***** TAG FILTER NAV ****/

function buildTagNav(posts) {
  if (!tagNavEl) return;

  const tagSet = new Set();
  posts.forEach((post) => {
    (post?.tags || []).forEach((t) => {
      const tag = String(t || '').trim();
      if (tag) tagSet.add(tag);
    });
  });

  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  tagNavEl.innerHTML = '';

  function addTagButton(label, value) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.textContent = label;
    btn.dataset.tag = value;

    if (value === activeTag) btn.classList.add('filter-btn--active');

    btn.addEventListener('click', () => {
      activeTag = btn.dataset.tag || '';

      tagNavEl.querySelectorAll('.filter-btn').forEach((b) => {
        b.classList.remove('filter-btn--active');
      });
      btn.classList.add('filter-btn--active');

      renderFilteredPostList();
    });

    tagNavEl.appendChild(btn);
  }

  if (activeTag === null || activeTag === undefined) activeTag = '';
  addTagButton('All', '');

  tags.forEach((tag) => addTagButton(tag, tag));

  if (!tagNavEl.querySelector('.filter-btn--active')) {
    const first = tagNavEl.querySelector('.filter-btn');
    first?.classList.add('filter-btn--active');
    activeTag = '';
  }
}

function getFilteredPostsSorted() {
  const sorted = sortNewestFirst(allPosts);

  if (!activeTag) return sorted;

  return sorted.filter((post) => (post?.tags || []).includes(activeTag));
}

/***** CAROUSEL *****/

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

    <div class="hero__text">
      <div class="hero__card">
        <p class="hero__category">${category}</p>
        <h3 class="hero__title">${post?.title || 'Untitled'}</h3>
        <p class="hero__meta">Published by: ${author}</p>
      </div>
    </div>

    <a class="btn--primary hero__cta" href="post/index.html?id=${post.id}">
      Read More
    </a>
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

/****** POST LIST ******/

function renderPostList(posts) {
  if (!postListEl) return;

  const listPosts = posts.slice(0, 12);

  if (listPosts.length === 0) {
    postListEl.innerHTML = `<p class="status">No posts found for this filter.</p>`;
    return;
  }

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
          <a class="post-card__media" href="post/index.html?id=${post.id}">
            <img class="post-card__img" src="${imgUrl}" alt="${imgAlt}">

            ${
              post?.tags?.[0]
                ? `<p class="post-card__tag-badge">${post.tags[0]}</p>`
                : ''
            }

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

function renderFilteredPostList() {
  const filteredSorted = getFilteredPostsSorted();
  renderPostList(filteredSorted);
}

async function init() {
  try {
    renderStatus('Loading posts…');

    allPosts = await fetchPosts();

    // “latest 3”
    const sorted = sortNewestFirst(allPosts);
    carouselPosts = sorted.slice(0, 3);
    carouselIndex = 0;

    activeTag = '';
    buildTagNav(allPosts);

    renderCarouselSlide();
    renderFilteredPostList();

    prevBtn?.addEventListener('click', goPrev);
    nextBtn?.addEventListener('click', goNext);
  } catch (error) {
    renderStatus('Could not load posts. Try again.');
  }
}

init();
