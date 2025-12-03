// frontend/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  if (!protectPage()) return;
  updateNavbar();
  loadDashboard();
});

async function loadDashboard() {
  await Promise.all([
    loadMyListings(),
    loadBuyOrders(),
    loadSellOrders()
  ]);
  updateStats();
}

async function loadMyListings() {
  const container = document.getElementById('myListingsGrid');
  
  try {
    const response = await authenticatedFetch(API_ENDPOINTS.listings);
    const data = await response.json();
    
    const user = getUser();
    const myListings = data.listings.filter(l => l.seller._id === user.id);
    
    if (myListings.length > 0) {
      container.innerHTML = myListings.map(listing => `
        <div class="card">
          <img src="${listing.imageUrl}" alt="${listing.title}" class="card-img">
          <div class="card-body">
            <h3 class="card-title">${listing.title}</h3>
            <div class="card-price">₹${listing.price}</div>
            <div class="card-meta">
              <span class="badge badge-primary">${listing.category}</span>
              <span class="badge ${listing.status === 'available' ? 'badge-success' : 'badge-warning'}">
                ${listing.status.toUpperCase()}
              </span>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
              <a href="listing.html?id=${listing._id}" class="btn-secondary btn-sm" style="flex: 1;">View</a>
              <a href="sell.html?id=${listing._id}" class="btn-secondary btn-sm" style="flex: 1;">Edit</a>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
          <p>You haven't created any listings yet.</p>
          <a href="sell.html" class="btn-primary">Create Your First Listing</a>
        </div>
      `;
    }
    
    document.getElementById('myListingsCount').textContent = myListings.length;
  } catch (error) {
    container.innerHTML = '<p class="error-message">Error loading listings</p>';
  }
}

async function loadBuyOrders() {
  const container = document.getElementById('buyOrdersList');
  
  try {
    const response = await authenticatedFetch(`${API_ENDPOINTS.orders}?role=buyer`);
    const data = await response.json();
    
    if (data.success && data.orders.length > 0) {
      container.innerHTML = data.orders.map(order => `
        <div class="card" style="margin-bottom: 1rem;">
          <div class="card-body">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <h3 class="card-title">${order.listing?.title || 'Listing'}</h3>
                <p class="card-price">₹${order.listing?.price || 0}</p>
                <p><strong>Seller:</strong> ${order.seller?.name}</p>
                <p><strong>Status:</strong> 
                  <span class="badge badge-${getOrderStatusColor(order.status)}">${order.status.toUpperCase()}</span>
                </p>
                ${order.status === 'accepted' && order.seller?.upiId ? `
                  <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                    <p><strong>Payment Details:</strong></p>
                    <p>UPI ID: <strong>${order.seller.upiId}</strong></p>
                    <p>Amount: <strong>₹${order.listing.price}</strong></p>
                    <button class="btn-success btn-sm" onclick="markAsPaid('${order._id}')">Mark as Paid</button>
                  </div>
                ` : ''}
              </div>
              <a href="listing.html?id=${order.listing?._id}" class="btn-secondary btn-sm">View Item</a>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p>No buy requests yet.</p>';
    }
    
    document.getElementById('buyOrdersCount').textContent = data.orders?.length || 0;
  } catch (error) {
    container.innerHTML = '<p class="error-message">Error loading orders</p>';
  }
}

async function loadSellOrders() {
  const container = document.getElementById('sellOrdersList');
  
  try {
    const response = await authenticatedFetch(`${API_ENDPOINTS.orders}?role=seller`);
    const data = await response.json();
    
    if (data.success && data.orders.length > 0) {
      container.innerHTML = data.orders.map(order => `
        <div class="card" style="margin-bottom: 1rem;">
          <div class="card-body">
            <h3 class="card-title">${order.listing?.title || 'Listing'}</h3>
            <p class="card-price">₹${order.listing?.price || 0}</p>
            <p><strong>Buyer:</strong> ${order.buyer?.name} (${order.buyer?.email})</p>
            <p><strong>Department:</strong> ${order.buyer?.department}, ${order.buyer?.year}</p>
            <p><strong>Status:</strong> 
              <span class="badge badge-${getOrderStatusColor(order.status)}">${order.status.toUpperCase()}</span>
            </p>
            ${order.status === 'pending' ? `
              <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <button class="btn-success btn-sm" onclick="updateOrderStatus('${order._id}', 'accepted')">Accept</button>
                <button class="btn-danger btn-sm" onclick="updateOrderStatus('${order._id}', 'rejected')">Reject</button>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p>No sell requests yet.</p>';
    }
    
    document.getElementById('sellOrdersCount').textContent = data.orders?.length || 0;
  } catch (error) {
    container.innerHTML = '<p class="error-message">Error loading orders</p>';
  }
}

function getOrderStatusColor(status) {
  const colors = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger',
    completed: 'primary'
  };
  return colors[status] || 'primary';
}

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });
  
  // Remove active from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName).classList.remove('hidden');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

async function updateOrderStatus(orderId, status) {
  try {
    const response = await authenticatedFetch(`${API_ENDPOINTS.orders}/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(`Order ${status} successfully!`);
      loadSellOrders();
    } else {
      alert('Failed to update order');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function markAsPaid(orderId) {
  if (!confirm('Have you completed the payment via UPI?')) return;
  
  try {
    const response = await authenticatedFetch(`${API_ENDPOINTS.orders}/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ paymentStatus: 'paid', status: 'completed' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Payment marked as complete!');
      loadBuyOrders();
    } else {
      alert('Failed to update payment status');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function updateStats() {
  // Stats are updated by individual load functions
}