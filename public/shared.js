// shared.js

function injectHeader() {
  document.addEventListener("DOMContentLoaded", () => {
    const headerHTML = `
      <div id="appTitle" style="text-align:center; padding-top:10px;">
        <h1>CommShare</h1>
      </div>
      <header>
        <nav>
          <a href="index.html">Home</a> |
          <a href="toolshare.html">Tool Share</a> |
          <a href="mylistings.html">My Listings</a> |
          <a href="profile.html">Profile</a> |
          <a href="about.html">About</a> |
          <span id="adminLink"></span> <span id="authLinks"></span>
        </nav>
        <div id="welcomeBanner" style="margin-top: 10px; font-weight: bold;"></div>
      </header>
    `;

    const body = document.querySelector('body');
    if (body && !document.getElementById('appTitle')) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = headerHTML.trim();
      body.insertBefore(wrapper, body.firstChild);
    }

    updateAuthUI();
  });
}

function updateAuthUI() {
  const adminLink = document.getElementById('adminLink');
  const authLinks = document.getElementById('authLinks');
  const welcomeBanner = document.getElementById('welcomeBanner');
  const isLoggedIn = document.cookie.includes('token=');

  if (authLinks) {
    authLinks.innerHTML = isLoggedIn
      ? `<a href="#" onclick="logout()">Logout</a>`
      : `<a href="login.html">Login</a>`;
  }

  if (isLoggedIn) {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.username && welcomeBanner) {
          welcomeBanner.innerText = `Welcome, ${data.username}`;
        }
        if (data.isAdmin && adminLink) {
          adminLink.innerHTML = '<a href="admin.html">Admin Panel</a> |';
        }
      });
  }
}

function logout() {
  document.cookie = "token=; Max-Age=0; path=/";
  document.cookie = "username=; Max-Age=0; path=/";
  document.cookie = "userid=; Max-Age=0; path=/";
  location.reload();
}

injectHeader();
