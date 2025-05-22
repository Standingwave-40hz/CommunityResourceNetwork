// Check login and handle form visibility
const isLoggedIn = window.isLoggedIn ?? document.cookie.includes('token=');
const toolForm = document.getElementById('toolForm');
const loginMessage = document.getElementById('loginMessage');

if (!isLoggedIn) {
  if (toolForm) toolForm.style.display = 'none';
  if (loginMessage) loginMessage.innerHTML = `
    <p><strong>You must <a href="login.html">log in</a> to post a tool.</strong></p>
  `;
}

function getCurrentUsername() {
  const match = document.cookie.split('; ').find(row => row.startsWith('username='));
  return match ? decodeURIComponent(match.split('=')[1]) : '';
}

function getCurrentUserId() {
  const match = document.cookie.split('; ').find(row => row.startsWith('userid='));
  return match ? decodeURIComponent(match.split('=')[1]) : '';
}

function logout() {
  document.cookie = "token=; Max-Age=0; path=/";
  document.cookie = "username=; Max-Age=0; path=/";
  document.cookie = "userid=; Max-Age=0; path=/";
  location.reload();
}

if (isLoggedIn) {
  fetch('/api/auth/me')
    .then(res => res.json())
    .then(data => {
      const banner = document.getElementById('welcomeBanner');
      if (data.username && banner) {
        banner.innerText = `Welcome, ${data.username}`;
      }
      if (document.getElementById('contact')) {
        document.getElementById('contact').value = data.contact || '';
      }
    });
}

if (toolForm) {
  toolForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const listing = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      category: "Tool",
      contact: document.getElementById('contact').value
    };

    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing)
    });

    await res.json();
    loadTools();
    this.reset();
  });
}

document.getElementById('searchMain')?.addEventListener('input', loadTools);

async function viewHistory(toolId, ownerId) {
  const res = await fetch(`/api/borrow/history/${toolId}`);
  const history = await res.json();

  const container = document.createElement('div');
  container.style.padding = '10px';
  container.style.borderTop = '1px solid #ccc';

  const currentUserId = getCurrentUserId();

  if (!Array.isArray(history) || history.length === 0) {
    container.innerHTML = '<em>No borrow history.</em>';
  } else {
    history.forEach(record => {
      const entry = document.createElement('div');
      entry.innerHTML = `
        <strong>${record.borrower}</strong> borrowed on ${new Date(record.borrowedAt).toLocaleString()}<br>
        Returned: ${record.returnedAt ? new Date(record.returnedAt).toLocaleString() : 'Not yet'}<br>
        Comment: <span>${record.comment || '<em>None</em>'}</span>
      `;

      if (isLoggedIn && currentUserId === ownerId && !record.comment) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Add comment';
        input.style.marginTop = '5px';

        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Submit';
        submitBtn.onclick = () => submitComment(record._id, input);

        entry.appendChild(document.createElement('br'));
        entry.appendChild(input);
        entry.appendChild(submitBtn);
      }

      entry.appendChild(document.createElement('hr'));
      container.appendChild(entry);
    });
  }

  const button = document.getElementById(`history-${toolId}`);
  button.insertAdjacentElement('afterend', container);
  button.disabled = true;
}

async function ownerMarkBorrowed(toolId) {
  const input = document.getElementById(`borrowerInput-${toolId}`);
  const comment = input?.value.trim();
  if (!comment) return alert("Please enter a borrower name.");

  const res = await fetch(`/api/borrow/${toolId}/owner-mark-borrowed`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment })
  });

  if (res.ok) {
    alert("Tool marked as borrowed.");
    loadTools();
  } else {
    const data = await res.json();
    alert(`Failed: ${data.message || "Unknown error"}`);
  }
}

async function ownerReturnTool(toolId) {
  const input = document.getElementById(`returnComment-${toolId}`);
  const comment = input?.value.trim() || '';

  const confirmed = confirm("Are you sure you want to mark this tool as returned?");
  if (!confirmed) return;

  const res = await fetch(`/api/borrow/${toolId}/owner-return`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment })
  });

  if (res.ok) {
    alert("Tool marked as returned.");
    loadTools();
  } else {
    const data = await res.json();
    alert(`Failed to return: ${data.message || "Unknown error"}`);
  }
}

async function loadTools() {
  const res = await fetch('/api/listings');
  let listings = [];

  try {
    listings = await res.json();
  } catch (err) {
    console.error("❌ Failed to parse listings response:", err);
    return;
  }

  if (!Array.isArray(listings)) {
    console.error("❌ Expected array from /api/listings, got:", listings);
    listings = [];
  }

  const container = document.getElementById('toolListings');
  if (!container) {
    console.error("❌ Missing #toolListings element in HTML");
    return;
  }
  const searchInput = document.getElementById('searchMain');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  container.innerHTML = '';

  const currentUserId = getCurrentUserId();

  const filtered = listings.filter(l =>
    l.category?.toLowerCase() === 'tool' &&
    (l.title.toLowerCase().includes(searchTerm) || l.description.toLowerCase().includes(searchTerm))
  );

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (filtered.length === 0) {
    container.innerHTML = '<p><em>No tools found matching your search.</em></p>';
    return;
  }

  filtered.forEach(tool => {
    let actionButton = '';

    if (!tool.available && tool.borrowerComment) {
      actionButton = `<span style="color: gray;">Marked by owner: ${tool.borrowerComment}</span>`;
    }

    if (tool.ownerId === currentUserId && tool.available) {
      actionButton = `
        <input type="text" id="borrowerInput-${tool._id}" placeholder="Borrower's name" />
        <button onclick="ownerMarkBorrowed('${tool._id}')">Mark as Borrowed</button>
      `;
    } else if (tool.ownerId === currentUserId && !tool.available) {
      actionButton = `
        <input type="text" id="returnComment-${tool._id}" placeholder="Return comment" />
        <button onclick="ownerReturnTool('${tool._id}')">Mark as Returned</button>
      `;
    } else if (tool.available && isLoggedIn) {
      actionButton = `<span style="color: gray;">Waiting for owner to mark as borrowed</span>`;
    } else if (!tool.available && !tool.borrowerComment) {
      actionButton = `<span style="color: gray;">Unavailable</span>`;
    }

    const historyButton = isLoggedIn
      ? `<button id="history-${tool._id}" onclick="viewHistory('${tool._id}', '${tool.ownerId}')">View History</button>`
      : '';

    container.innerHTML += `<div class="tool-card">
      <strong>${tool.title}</strong><br>
      <em>${tool.description}</em><br>
      Contact: ${isLoggedIn ? tool.contact : '[Login to view]'}<br>
      ${actionButton}
      ${historyButton}
    </div>`;
  });
}

// Register globally
window.ownerMarkBorrowed = ownerMarkBorrowed;
window.loadTools = loadTools;
window.ownerReturnTool = ownerReturnTool;
window.viewHistory = viewHistory;

loadTools();