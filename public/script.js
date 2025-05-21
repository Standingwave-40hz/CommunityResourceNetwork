document.getElementById('listingForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const listing = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        contact: document.getElementById('contact').value
    };

    const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing)
    });

    await res.json();
    loadMainListings();
    this.reset();
});

async function loadMainListings() {
    const res = await fetch('/api/listings');
    const listings = await res.json();

    const container = document.getElementById('mainListings');
    const searchTerm = document.getElementById('searchMain').value.toLowerCase();

    container.innerHTML = '';

    const isLoggedIn = document.cookie.includes('token=');

    const filtered = listings.filter(l =>
        l.category !== 'Tool' && (
            l.title.toLowerCase().includes(searchTerm) ||
            l.description.toLowerCase().includes(searchTerm)
        )
    );

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    filtered.forEach(item => {
        container.innerHTML += `<div class="tool-card">
            <strong>${item.title}</strong> (${item.category})<br>
            <em>${item.description}</em><br>
            Contact: ${isLoggedIn ? item.contact : '[Login to view]'}<br>
        </div>`;
    });

    // Lock the form if not logged in
    if (!isLoggedIn) {
        document.getElementById('listingForm').innerHTML = `
            <p><strong>You must <a href="login.html">log in</a> to post a listing.</strong></p>
        `;
    }
}


document.getElementById('searchMain').addEventListener('input', loadMainListings);
loadMainListings();
// Show login or logout link based on cookie
const authLinks = document.getElementById('authLinks');
const isLoggedIn = document.cookie.includes('token=');

if (isLoggedIn) {
  authLinks.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;
} else {
  authLinks.innerHTML = `<a href="login.html">Login</a>`;
}

// Logout function clears the cookie and reloads
function logout() {
  document.cookie = "token=; Max-Age=0; path=/";
  location.reload();
}
