import { getFromLocalStorage } from './utils.js';

// --- API constants ---
const BASE_API_URL = 'https://v2.api.noroff.dev';
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// If user is logged out, we show this demo client feed
const DEFAULT_BLOG_NAME = 'fitwithMalene';

// If user is logged in, show THEIR feed instead (more personal)
const profileName = getFromLocalStorage('profileName');
const BLOG_NAME = profileName || DEFAULT_BLOG_NAME;

// --- DOM ---
const carouselEl = document.getElementById('carousel');
const postListEl = document.getElementById('post-list');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const dotsEl = document.getElementById('carousel-dots');

// --- Local state ---
let allPosts = [];
let carouselPosts = [];
let carouselIndex = 0;

// Helper: simple status text
function renderStatus(text) {
  if (!postListEl) return;
  postListEl.innerHTML = `<p class="status">${text}</p>`;
}

// Fetch all posts from Noroff Blog API
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

// Sort newest first using "created"
function sortNewestFirst(posts) {
  return posts.slice().sort((a, b) => {
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();
    return dateB - dateA;
  });
}

// Render carousel slide for current carouselIndex
function renderCarouselSlide() {
  if (!carouselEl) return;
  if (carouselPosts.length === 0) return;

  const post = carouselPosts[carouselIndex];

  const imgUrl =
    post?.media?.url || 'https://placehold.co/900x400?text=No+image';
  const imgAlt = post?.media?.alt || post?.title || 'Post image';

  carouselEl.innerHTML = `
    <article class="carousel__slide">
      <div class="post-card__media">
        <img class="post-card__img" src="${imgUrl}" alt="${imgAlt}">
        ${post?.tags?.[0] ? `<p class="post-card__tag-badge">${post.tags[0]}</p>` : ''}
      </div>

      <div class="carousel__content">
        <h3 class="post-card__title">${post.title || 'Untitled'}</h3>
        <!-- Post page comes later: we keep link format ready -->
        <a class="btn btn--primary" href="/post.html?id=${post.id}">Read more</a>
      </div>
    </article>
  `;

  renderDots();
}

// Render dots for 3 slides (optional)
function renderDots() {
  if (!dotsEl) return;
  if (carouselPosts.length === 0) return;

  dotsEl.innerHTML = carouselPosts
    .map((_, i) => {
      const active = i === carouselIndex ? 'carousel__dot--active' : '';
      return `<button class="carousel__dot ${active}" type="button" aria-label="Go to slide ${i + 1}" data-index="${i}"></button>`;
    })
    .join('');

  // Wire dot click
  dotsEl.querySelectorAll('button[data-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      carouselIndex = Number(btn.dataset.index);
      renderCarouselSlide();
    });
  });
}

// Carousel next/prev with looping
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

// Render 12 posts in the list (requirement)
function renderPostList(posts) {
  if (!postListEl) return;

  const listPosts = posts.slice(0, 12);

  postListEl.innerHTML = listPosts
    .map((post) => {
      const imgUrl =
        post?.media?.url || 'https://placehold.co/600x400?text=No+image';
      const imgAlt = post?.media?.alt || post?.title || 'Post image';

      return `
        <article class="post-card">
          <div class="post-card__media">
            <img class="post-card__img" src="${imgUrl}" alt="${imgAlt}">
            ${post?.tags?.[0] ? `<p class="post-card__tag-badge">${post.tags[0]}</p>` : ''}
          </div>

          <h3 class="post-card__title">${post.title || 'Untitled'}</h3>
          <a class="btn btn--ghost post-card__btn" href="/post.html?id=${post.id}">Read post</a>
        </article>
      `;
    })
    .join('');
}

// Startup
async function init() {
  try {
    renderStatus('Loading posts…');

    allPosts = await fetchPosts();
    const sorted = sortNewestFirst(allPosts);

    // Carousel needs 3 latest posts
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
