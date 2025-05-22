async function loadMyListings() {
  const container = document.getElementById('myListings');
  container.innerHTML = '';

  const token = document.cookie.split('; ').find(row => row.startsWith('token='));
  if (!token) {
    container.innerHTML = '<p>You must be logged in to view your listings.</p>';
    return;
  }

  const myRes = await fetch('/api/listings/my');
  if (!myRes.ok) {
    container.innerHTML = '<p>Authentication required. Please log in.</p>';
    return;
  }

  const myListings = await myRes.json();
  const searchTerm = document.getElementById('searchMyListings')?.value.toLowerCase() || '';
  const filtered = myListings.filter(item =>
    item.title.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm)
  );

  if (filtered.length === 0) {
    container.innerHTML = '<p>No matching listings found.</p>';
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.innerHTML = `
      <strong>${item.title}</strong> (${item.category})<br>
      <em>${item.description}</em><br>
      Contact: ${item.contact}<br>
      <span>Status: ${item.available ? "Available" : "Unavailable"}</span><br>
      <button onclick="toggleAvailability('${item._id}')">
        Mark as ${item.available ? "Unavailable" : "Available"}
      </button>
      <button onclick="deleteListing('${item._id}')">Delete</button>
    `;
    container.appendChild(card);
  });
}

// ✅ Availability toggle
async function toggleAvailability(id) {
  const res = await fetch(`/api/listings/${id}/availability`, {
    method: 'PUT'
  });

  if (res.ok) {
    loadMyListings();
  } else {
    alert("Failed to update availability.");
  }
}

// ✅ DELETE handler
async function deleteListing(id) {
  const confirmed = confirm("Are you sure you want to delete this listing?");
  if (!confirmed) return;

  const res = await fetch(`/api/listings/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    loadMyListings();
  } else {
    alert("Failed to delete listing.");
  }
}

// ✅ Login/logout UI (moved to shared.js, remove local redeclaration if shared.js is present)
// const authLinks = document.getElementById('authLinks');
// const isLoggedIn = document.cookie.includes('token=');
// if (authLinks) {
//   authLinks.innerHTML = isLoggedIn
//     ? `<a href="#" onclick="logout()">Logout</a>`
//     : `<a href="login.html">Login</a>`;
// }

function logout() {
  document.cookie = "token=; Max-Age=0; path=/";
  document.cookie = "username=; Max-Age=0; path=/";
  document.cookie = "userid=; Max-Age=0; path=/";
  location.reload();
}

document.getElementById('searchMyListings')?.addEventListener('input', loadMyListings);
loadMyListings();
