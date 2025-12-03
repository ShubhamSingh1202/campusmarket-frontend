// frontend/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
  if (!protectAdminPage()) return;
  updateNavbar();
  loadAdminData();
});

async function loadAdminData() {
  await Promise.all([
    loadStats(),
    loadUsers(),
    loadListings(),
    loadOrders()
  ]);
}

async function loadStats() {
  try {
    const response = await authenticatedFetch(`${API_ENDPOINTS.admin}/stats`);
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('totalUsers').textContent = data.stats.totalUsers;
      document.getElementById('totalListings').textContent = data.stats.totalListings;
      document.getElementById('totalOrders').textContent = data.stats.totalOrders;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');
  
  try {
    const response = await authenticatedFetch(`${API_ENDPOINTS.admin}/users`);
    const data = await response.json();
    
    if (data.success && data.users.length > 0) {
      tbody.innerHTML = data.users.map(user => `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.department}</td>
          <td>${user.year}</td>
          <td>${user.isAdmin ? '✅ Yes' : '❌ No'}</td>
          <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
    }
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6" class="error-message">Error loading users</td></tr>';
  }
}

async function loadListings() {
  const tbody = document.getElementById('listingsTableBody');
  
  try {
    const response = await authenticatedFetch(`${API_ENDPOINTS.admin}/listings`);
    const data = await response.json();
    
    if (data.success && data.listings.length > 0) {
      tbody.innerHTML = data.listings.map(listing => `
        <tr>
          <td><a href="listing.html?id=${listing._id}" target="_blank">${listing.title}</a></td>
          <td>${listing.seller?.name || 'Unknown'}</td>
          <td>${listing.category}</td>
          <td>₹${listing.price}</td>
          <td><span class="badge badge-${listing.status === 'available' ? 'success' : 'warning'}">${listing.status}</span></td>
          <td>
            <button class="btn-danger btn-sm" onclick="deleteListing('${listing._id}', '${listing.title}')">
              Delete
            </button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6">No listings found</td></tr>';
    }
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6" class="error-message">Error loading listings</td></tr>';
  }
}

async function loadOrders() {
  const tbody = document.getElementById('ordersTableBody');
  
  try {
    const response = await authenticatedFetch(`${API_ENDPOINTS.admin}/orders`);
    const data = await response.json();
    
    if (data.success && data.orders.length > 0) {
      tbody.innerHTML = data.orders.map(order => `
        <tr>
          <td>${order.listing?.title || 'Deleted'}</td>
          <td>${order.buyer?.name || 'Unknown'}</td>
          <td>${order.seller?.name || 'Unknown'}</td>
          <td><span class="badge badge-${getStatusColor(order.status)}">${order.status}</span></td>
          <td><span class="badge badge-${order.paymentStatus === 'paid' ? 'success' : 'warning'}">${order.paymentStatus}</span></td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6">No orders found</td></tr>';
    }
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6" class="error-message">Error loading orders</td></tr>';
  }
}

function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger',
    completed: 'primary'
  };
  return colors[status] || 'primary';
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.getElementById(tabName).classList.remove('hidden');
  document.querySelectorAll('.tab-btn')[
    tabName === 'users' ? 0 : tabName === 'listings' ? 1 : 2
  ].classList.add('active');
}

async function deleteListing(listingId, title) {
  if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
    return;
  }
  
  try {
    const response = await authenticatedFetch(
      `${API_ENDPOINTS.admin}/listings/${listingId}`,
      { method: 'DELETE' }
    );
    
    const data = await response.json();
    
    if (data.success) {
      alert('Listing deleted successfully');
      loadListings();
      loadStats();
    } else {
      alert('Failed to delete listing');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}