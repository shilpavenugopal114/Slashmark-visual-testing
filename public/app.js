const API_BASE = '/api';
let authToken = localStorage.getItem('authtoken') || '';
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

document.addEventListener('DOMContentLoaded', () => {
  if (authToken && currentUser) {
    showFeedUI();
    fetchFeed();
  }

  document.getElementById('logout-btn').addEventListener('click', handleLogout);
});

// Tab Switcher
function switchAuthTab(tab) {
  const loginTab = document.getElementById('tab-login');
  const regTab = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');

  if (tab === 'login') {
    loginTab.classList.add('active');
    regTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
  } else {
    regTab.classList.add('active');
    loginTab.classList.remove('active');
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
}

// Notifications
function notify(message, type = 'success') {
  const banner = document.getElementById('notification-banner');
  banner.textContent = message;
  banner.className = `notification ${type}`;
  banner.classList.remove('hidden');

  setTimeout(() => {
    banner.classList.add('hidden');
  }, 4000);
}

// Login
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE}/authenticate/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok && data.token) {
      authToken = data.token;
      currentUser = { email };
      localStorage.setItem('authtoken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      notify('Logged in successfully!', 'success');
      showFeedUI();
      fetchFeed();
    } else {
      notify(data.error || 'Login failed. Please check credentials.', 'error');
    }
  } catch (err) {
    notify('Network error during login.', 'error');
  }
}

// Register
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch(`${API_BASE}/authenticate/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      notify('Registration successful! You can now log in.', 'success');
      switchAuthTab('login');
      document.getElementById('login-email').value = email;
      document.getElementById('login-password').value = password;
    } else {
      notify(data.error || (data.errors && data.errors[0]?.msg) || 'Registration failed.', 'error');
    }
  } catch (err) {
    notify('Network error during registration.', 'error');
  }
}

// Logout
function handleLogout() {
  authToken = '';
  currentUser = null;
  localStorage.removeItem('authtoken');
  localStorage.removeItem('currentUser');

  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('feed-section').classList.add('hidden');
  document.getElementById('user-nav').classList.add('hidden');
  notify('Logged out successfully.', 'success');
}

function showFeedUI() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('feed-section').classList.remove('hidden');
  document.getElementById('user-nav').classList.remove('hidden');
  document.getElementById('user-badge').textContent = `👤 ${currentUser?.email || 'User'}`;
}

// Fetch Feed
async function fetchFeed() {
  const container = document.getElementById('posts-container');
  container.innerHTML = '<p class="subtitle">Loading dynamic feed...</p>';

  try {
    const res = await fetch(`${API_BASE}/all_posts`, {
      headers: { authtoken: authToken }
    });

    const data = await res.json();
    if (res.ok && data.posts) {
      renderPosts(data.posts);
    } else {
      container.innerHTML = '<p class="subtitle">No posts found. Create your first post above!</p>';
    }
  } catch (err) {
    container.innerHTML = '<p class="subtitle">Failed to load posts.</p>';
  }
}

// Render Posts
function renderPosts(posts) {
  const container = document.getElementById('posts-container');
  if (!posts.length) {
    container.innerHTML = '<p class="subtitle">No posts yet. Publish one above!</p>';
    return;
  }

  container.innerHTML = posts.map(post => `
    <article class="post-card" id="post-${post._id}" data-id="${post._id}">
      <div class="post-card-header">
        <h4 class="post-card-title">${escapeHTML(post.title)}</h4>
        <span class="post-time">${new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      <p class="post-card-body">${escapeHTML(post.description)}</p>
      
      <div class="post-actions">
        <button class="like-btn" onclick="handleLike('${post._id}')" id="like-btn-${post._id}">
          ❤️ <span class="like-count" id="like-count-${post._id}">${post.likes || 0}</span> Likes
        </button>
      </div>

      <div class="comments-section">
        <ul class="comments-list" id="comments-list-${post._id}">
          ${(post.comments || []).map(c => `<li class="comment-item">💬 ${escapeHTML(c)}</li>`).join('')}
        </ul>
        <form class="comment-form" onsubmit="event.preventDefault(); return false;">
          <input type="text" placeholder="Write a comment..." id="comment-input-${post._id}" />
          <button type="button" class="btn btn-secondary btn-sm" id="comment-btn-${post._id}" onclick="handleComment(event, '${post._id}')">Reply</button>
        </form>
      </div>
    </article>
  `).join('');
}

// Create Post
async function handleCreatePost(e) {
  e.preventDefault();
  const title = document.getElementById('post-title').value.trim();
  const description = document.getElementById('post-desc').value.trim();

  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authtoken: authToken
      },
      body: JSON.stringify({ title, description })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      notify('Post published successfully!', 'success');
      document.getElementById('create-post-form').reset();
      fetchFeed(); // Refresh dynamic feed
    } else {
      notify('Failed to create post.', 'error');
    }
  } catch (err) {
    notify('Error creating post.', 'error');
  }
}

// Like Post
async function handleLike(postId) {
  try {
    const res = await fetch(`${API_BASE}/like/${postId}`, {
      method: 'POST',
      headers: { authtoken: authToken }
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const countEl = document.getElementById(`like-count-${postId}`);
      if (countEl) {
        countEl.textContent = parseInt(countEl.textContent || '0', 10) + 1;
      }
      notify('Liked post!', 'success');
    } else {
      notify('Could not like post.', 'error');
    }
  } catch (err) {
    notify('Error liking post.', 'error');
  }
}

// Comment on Post
async function handleComment(e, postId) {
  e.preventDefault();
  const input = document.getElementById(`comment-input-${postId}`);
  const comment = input.value.trim();
  if (!comment) return;

  try {
    const res = await fetch(`${API_BASE}/comment/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authtoken: authToken
      },
      body: JSON.stringify({ comment })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const listEl = document.getElementById(`comments-list-${postId}`);
      if (listEl) {
        const li = document.createElement('li');
        li.className = 'comment-item';
        li.textContent = `💬 ${comment}`;
        listEl.appendChild(li);
      }
      input.value = '';
      notify('Comment posted successfully!', 'success');
    } else {
      notify('Could not post comment.', 'error');
    }
  } catch (err) {
    notify('Error posting comment.', 'error');
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

