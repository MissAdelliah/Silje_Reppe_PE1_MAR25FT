import { getFromLocalStorage } from './utils.js';

const BASE_API_URL = 'https://v2.api.noroff.dev';
const NOROFF_API_KEY = '1324424e-7f11-49f7-9eb6-68a83f0cdd43';

// Logged in show name, otherw demo blog
const DEFAULT_BLOG_NAME = 'fitwithMalene';
const profileName = getFromLocalStorage('profileName');
const BLOG_NAME = profileName || DEFAULT_BLOG_NAME;

//DOM

const titleEl = document.getElementById('post-title');
const author;
