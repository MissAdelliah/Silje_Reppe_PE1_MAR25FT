/*
import { getFromLocalStorage } from './utils.js';
const displayContainer = document.getElementById('display-container');
console.log(displayContainer);

const BASE_API_URL = 'https://v2.api.noroff.dev';
const BLOG_POSTS_URL = `${BASE_API_URL}/blog/posts/FitwithMalene`;
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';
async function fetchPosts() {
  try {
    const accessToken = getFromLocalStorage('accessToken');
    console.log(accessToken);
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Noroff-API-Key': NOROFF_API_KEY,
      },
    };
    const response = await fetch(BLOG_POSTS_URL, fetchOptions);
    const json = await response.json();
    const posts = json.data;
    console.log('Posts:', posts);
  } catch (error) {
    console.log(error);
  }
}

function main() {
  fetchPosts();
}

main();
*/
// index.js
// Blog Feed Page logic: fetch posts, render carousel (3 latest), render list (12+)

import { getFromLocalStorage } from './utils.js';

// --- DOM references (must exist in your HTML) ---
const displayContainer = document.getElementById('display-container'); // list container
const carouselContainer = document.getElementById('carousel'); // carousel area (single slide rendered at a time)
const carouselPrevBtn = document.getElementById('carousel-prev');
const carouselNextBtn = document.getElementById('carousel-next');
const carouselDots = document.getElementById('carousel-dots');

// --- API constants ---
const BASE_API_URL = 'https://v2.api.noroff.dev';
const BLOG_NAME = 'FitwithMalene'; // IMPORTANT: replace with your blog profile name if different
const BLOG_POSTS_URL = `${BASE_API_URL}/blog/posts/${BLOG_NAME}`;
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// --- State (data stored in memory while the page is open) ---
let allPosts = []; // all posts from API
let carouselPosts = []; // top 3 latest posts
let carouselIndex = 0; // current slide index

// Builds request headers.
// We always send X-Noroff-API-Key.
// We only send Authorization IF the user has a token (so public users can still read posts).
function buildHeaders() {
  const accessToken = getFromLocalStorage('accessToken');

  const headers = {
    'X-Noroff-API-Key': NOROFF_API_KEY,
  };

  // Only attach Authorization when logged in
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

// Fetches posts from the Noroff API
async function fetchPosts() {
  try {
    // show a loading message in the list container
    if (displayContainer) displayContainer.innerHTML = `<p>Loading posts…</p>`;

    const response = await fetch(BLOG_POSTS_URL, { headers: buildHeaders() });
    const json = await response.json();

    // If something fails, show message + log details for debugging
    if (!response.ok) {
      console.log('Fetch posts error:', json);
      if (displayContainer)
        displayContainer.innerHTML = `<p>Could not load posts.</p>`;
      return [];
    }

    // Noroff v2 usually returns data inside json.data
    return json.data ?? [];
  } catch (error) {
    console.log('Fetch posts exception:', error);
    if (displayContainer)
      displayContainer.innerHTML = `<p>Network error. Try again.</p>`;
    return [];
  }
}

// Safely extract an image url (posts might not have media)
function getPostImage(post) {
  // Noroff posts often have post.media.url
  const url = post?.media?.url;

  // Return a placeholder if missing
  return url || 'https://placehold.co/800x450?text=No+image';
}

// Safely extract tag
function getPostTag(post) {
  // tags is often an array
  const tag = post?.tags?.[0];
  return tag || 'Blog';
}

// Sort posts by newest first (based on updated or created)
function sortNewestFirst(posts) {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a?.updated || a?.created || 0).getTime();
    const dateB = new Date(b?.updated || b?.created || 0).getTime();
    return dateB - dateA;
  });
}

// Renders the list of posts (at least 12)
function renderPostsList(posts) {
  if (!displayContainer) return;

  // Take at least 12 posts for the list requirement
  const listPosts = posts.slice(0, 12);

  // Build HTML string for performance
  const html = listPosts
    .map((post) => {
      const imageUrl = getPostImage(post);
      const tag = getPostTag(post);
      const title = post?.title || 'Untitled post';
      const id = post?.id;

      return `
        <article class="post-card">
          <img class="post-card__img" src="${imageUrl}" alt="${title}" />
          <div class="post-card__content">
            <p class="post-card__tag">${tag}</p>
            <h2 class="post-card__title">${title}</h2>
            <button class="readmore__button" data-id="${id}">
              Read More
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  // Put the cards into the container
  displayContainer.innerHTML = html;

  // Event delegation: one click listener for all Read More buttons
  displayContainer.addEventListener('click', (event) => {
    const button = event.target.closest('.readmore__button');
    if (!button) return;

    const id = button.dataset.id;
    if (!id) return;

    // Navigate to a post page with query param
    // Create post.html later (or whatever your post page is called)
    window.location.href = `/post.html?id=${id}`;
  });
}

// Build the top 3 latest posts for the carousel
function buildCarouselPosts(posts) {
  const newest = sortNewestFirst(posts);
  return newest.slice(0, 3);
}

// Render one carousel slide by index
function renderCarousel() {
  if (!carouselContainer) return;

  if (carouselPosts.length === 0) {
    carouselContainer.innerHTML = `<p>No posts</p>`;
    return;
  }

  // Keep index inside bounds
  if (carouselIndex < 0) carouselIndex = carouselPosts.length - 1;
  if (carouselIndex >= carouselPosts.length) carouselIndex = 0;

  const post = carouselPosts[carouselIndex];
  const imageUrl = getPostImage(post);
  const title = post?.title || 'Untitled post';
  const tag = getPostTag(post);
  const id = post?.id;

  // Single slide layout (you can style with CSS)
  carouselContainer.innerHTML = `
    <div class="carousel-slide">
      <img class="carousel-slide__img" src="${imageUrl}" alt="${title}" />
      <div class="carousel-slide__overlay">
        <p class="carousel-slide__tag">${tag}</p>
        <h2 class="carousel-slide__title">${title}</h2>
        <button class="readmore__button" data-id="${id}">
          Read More
        </button>
      </div>
    </div>
  `;

  // Update dots if they exist
  renderDots();

  // Make Read More work on the carousel too
  const btn = carouselContainer.querySelector('.readmore__button');
  btn?.addEventListener('click', () => {
    window.location.href = `/post.html?id=${id}`;
  });
}

// Render dots to show what slide is active
function renderDots() {
  if (!carouselDots) return;

  // Create one dot per slide
  carouselDots.innerHTML = carouselPosts
    .map((_, i) => {
      const activeClass = i === carouselIndex ? 'dot dot--active' : 'dot';
      return `<button class="${activeClass}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`;
    })
    .join('');

  // Clicking a dot jumps to that slide
  carouselDots.addEventListener('click', (event) => {
    const dot = event.target.closest('.dot');
    if (!dot) return;

    const index = Number(dot.dataset.index);
    if (Number.isNaN(index)) return;

    carouselIndex = index;
    renderCarousel();
  });
}

// Setup carousel button listeners (prev/next)
function setupCarouselControls() {
  carouselPrevBtn?.addEventListener('click', () => {
    // move left and wrap
    carouselIndex -= 1;
    renderCarousel();
  });

  carouselNextBtn?.addEventListener('click', () => {
    // move right and wrap
    carouselIndex += 1;
    renderCarousel();
  });
}

// Main app start
async function main() {
  allPosts = await fetchPosts();

  // Render list (12 posts)
  renderPostsList(sortNewestFirst(allPosts));

  // Setup carousel (3 latest)
  carouselPosts = buildCarouselPosts(allPosts);
  setupCarouselControls();
  renderCarousel();
}

main();
