document.addEventListener('DOMContentLoaded', () => {
  // Authentication State
  let jwtToken = localStorage.getItem('adminToken');

  // DOM Containers
  const loginContainer = document.getElementById('login-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  
  // Auth Elements
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const btnLoginSubmit = document.getElementById('btn-login-submit');
  const loginBtnText = btnLoginSubmit.querySelector('.btn-text');
  const loginBtnLoader = btnLoginSubmit.querySelector('.btn-loader');
  const btnLogout = document.getElementById('btn-logout');

  // Sidebar Tabs
  const sideNavButtons = document.querySelectorAll('.side-nav-btn');
  const panels = document.querySelectorAll('.panel-content');
  const pageTitle = document.getElementById('page-title');
  const inquiryBadge = document.getElementById('inquiry-badge');

  // Edit Content Form
  const contentForm = document.getElementById('content-edit-form');
  const btnSaveContent = document.getElementById('btn-save-content');

  // Gallery Manager Elements
  const galleryUploadForm = document.getElementById('gallery-upload-form');
  const uploadImageInput = document.getElementById('upload-image');
  const dropzone = document.getElementById('file-dropzone');
  const selectedFilename = document.getElementById('selected-filename');
  const adminGalleryGrid = document.getElementById('admin-gallery-grid');
  const btnUploadSubmit = document.getElementById('btn-upload-submit');

  // Inquiries Elements
  const inquiriesBody = document.getElementById('inquiries-body');
  const btnRefreshInquiries = document.getElementById('btn-refresh-inquiries');

  // Toast
  const adminToast = document.getElementById('admin-toast');
  const adminToastMessage = document.getElementById('admin-toast-message');

  // --- 1. Authentication Gate Check ---
  async function checkAuth() {
    if (!jwtToken) {
      showLogin();
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        document.getElementById('admin-name').innerText = data.username + ' (Manager)';
        showDashboard();
      } else {
        // Token expired or invalid
        localStorage.removeItem('adminToken');
        jwtToken = null;
        showLogin();
      }
    } catch (err) {
      console.error('Auth check error:', err);
      showLogin();
    }
  }

  function showLogin() {
    loginContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
  }

  function showDashboard() {
    loginContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    
    // Load default tab content
    loadPanel('overview');
  }

  // Login Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    
    // Toggle loader
    btnLoginSubmit.disabled = true;
    loginBtnText.innerText = 'Verifying...';
    loginBtnLoader.classList.remove('hidden');

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        jwtToken = data.token;
        localStorage.setItem('adminToken', jwtToken);
        document.getElementById('admin-name').innerText = data.username + ' (Manager)';
        loginForm.reset();
        showDashboard();
      } else {
        // Show error message
        loginError.innerText = data.error || 'Access Denied';
        loginError.classList.remove('hidden');
      }

    } catch (err) {
      console.error('Login error:', err);
      loginError.innerText = 'Server connection failed';
      loginError.classList.remove('hidden');
    } finally {
      // Reset button
      btnLoginSubmit.disabled = false;
      loginBtnText.innerText = 'Authenticate';
      loginBtnLoader.classList.add('hidden');
    }
  });

  // Logout Button
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    jwtToken = null;
    showLogin();
  });

  // --- 2. Panel Tab Navigation ---
  sideNavButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sideNavButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tabId = btn.getAttribute('data-tab');
      loadPanel(tabId);
    });
  });

  function loadPanel(tabId) {
    // Hide all panels
    panels.forEach(p => p.classList.remove('active'));
    
    // Show selected panel
    const activePanel = document.getElementById(`panel-${tabId}`);
    if (activePanel) activePanel.classList.add('active');

    // Update Topbar Title and fetch correct panel data
    switch (tabId) {
      case 'overview':
        pageTitle.innerText = 'Dashboard Overview';
        loadOverview();
        break;
      case 'content-edit':
        pageTitle.innerText = 'Edit Website Content';
        loadContentEditor();
        break;
      case 'gallery-manage':
        pageTitle.innerText = 'Manage Photo Gallery';
        loadGalleryManager();
        break;
      case 'inquiries':
        pageTitle.innerText = 'Inquiries Received';
        loadInquiriesManager();
        break;
    }
  }

  // --- 3. Panel Data Loaders ---

  // Loader 1: Overview Dashboard
  async function loadOverview() {
    try {
      const [inquiriesRes, galleryRes] = await Promise.all([
        fetch('/api/inquiries', { headers: { 'Authorization': `Bearer ${jwtToken}` } }),
        fetch('/api/gallery')
      ]);

      if (!inquiriesRes.ok || !galleryRes.ok) throw new Error('Data fetch failed');

      const inquiries = await inquiriesRes.json();
      const gallery = await galleryRes.json();

      // Update counters
      document.getElementById('stat-inquiries-count').innerText = inquiries.length;
      document.getElementById('stat-gallery-count').innerText = gallery.length;

      // Update badge
      const newInquiriesCount = inquiries.filter(i => i.status === 'New').length;
      if (newInquiriesCount > 0) {
        inquiryBadge.innerText = newInquiriesCount;
        inquiryBadge.classList.remove('hidden');
      } else {
        inquiryBadge.classList.add('hidden');
      }

      // Populate recent table (limit 5)
      const recentBody = document.getElementById('recent-inquiries-body');
      recentBody.innerHTML = '';
      
      const recent = inquiries.slice(-5).reverse(); // latest 5
      
      if (recent.length === 0) {
        recentBody.innerHTML = `<tr><td colspan="6" class="no-data">No inquiries received yet.</td></tr>`;
        return;
      }

      recent.forEach(item => {
        const row = document.createElement('tr');
        const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        
        row.innerHTML = `
          <td>${formattedDate}</td>
          <td><strong>${item.name}</strong></td>
          <td>${item.phone}</td>
          <td>${item.interestType}</td>
          <td title="${item.message}">${item.message || '-'}</td>
          <td><span class="badge-status new">${item.status}</span></td>
        `;
        recentBody.appendChild(row);
      });

    } catch (err) {
      console.error('Error loading overview stats:', err);
    }
  }

  // Loader 2: Website Content Form
  async function loadContentEditor() {
    try {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();

      // Set input values
      document.getElementById('edit-project-name').value = data.projectName || '';
      document.getElementById('edit-tagline').value = data.tagline || '';
      document.getElementById('edit-description').value = data.description || '';
      document.getElementById('edit-price-res').value = data.pricing?.residential || '';
      document.getElementById('edit-price-comm').value = data.pricing?.commercial || '';
      document.getElementById('edit-phone').value = data.phone || '';
      document.getElementById('edit-email').value = data.email || '';
      document.getElementById('edit-address').value = data.address || '';
      document.getElementById('edit-rera').value = data.reraNumber || '';
      document.getElementById('edit-launch').value = data.launchDate || '';

    } catch (err) {
      console.error('Error loading content data:', err);
    }
  }

  // Loader 3: Gallery Manager Grid
  async function loadGalleryManager() {
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) throw new Error('Failed to fetch gallery');
      const gallery = await response.json();

      adminGalleryGrid.innerHTML = '';
      if (gallery.length === 0) {
        adminGalleryGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No gallery assets available.</div>`;
        return;
      }

      gallery.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'admin-photo-card';
        card.innerHTML = `
          <img src="${photo.url}" alt="${photo.caption}">
          <span class="category-badge">${photo.category}</span>
          <div class="photo-card-info">
            <h4 title="${photo.caption}">${photo.caption}</h4>
            <button class="btn-photo-delete" data-id="${photo.id}" title="Delete Photo">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;
        adminGalleryGrid.appendChild(card);
      });

      // Wire delete buttons
      adminGalleryGrid.querySelectorAll('.btn-photo-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          const photoId = btn.getAttribute('data-id');
          if (confirm('Are you sure you want to delete this gallery photo?')) {
            await deletePhoto(photoId);
          }
        });
      });

    } catch (err) {
      console.error('Error loading gallery manager:', err);
    }
  }

  // Loader 4: Full Inquiries Panel
  async function loadInquiriesManager() {
    try {
      inquiriesBody.innerHTML = `<tr><td colspan="7" class="no-data">Loading inquiries...</td></tr>`;

      const response = await fetch('/api/inquiries', {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });

      if (!response.ok) throw new Error('Failed to fetch inquiries');
      const inquiries = await response.json();

      inquiriesBody.innerHTML = '';

      if (inquiries.length === 0) {
        inquiriesBody.innerHTML = `<tr><td colspan="7" class="no-data">No inquiries received yet.</td></tr>`;
        return;
      }

      // Sort inquiries latest first
      inquiries.reverse().forEach(item => {
        const row = document.createElement('tr');
        const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        row.innerHTML = `
          <td>${formattedDate}</td>
          <td><strong>${item.name}</strong></td>
          <td><a href="tel:${item.phone.replace(/\s+/g, '')}" style="color: var(--accent-gold);">${item.phone}</a></td>
          <td>${item.email ? `<a href="mailto:${item.email}" style="text-decoration: underline;">${item.email}</a>` : '-'}</td>
          <td><span class="badge-status new">${item.interestType}</span></td>
          <td style="white-space: normal; min-width: 250px;">${item.message || '-'}</td>
          <td>
            <button class="btn-inquiry-delete" data-id="${item.id}">Delete</button>
          </td>
        `;
        inquiriesBody.appendChild(row);
      });

      // Wire inquiry delete buttons
      inquiriesBody.querySelectorAll('.btn-inquiry-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          const inquiryId = btn.getAttribute('data-id');
          if (confirm('Are you sure you want to delete this customer inquiry?')) {
            await deleteInquiry(inquiryId);
          }
        });
      });

    } catch (err) {
      console.error('Error loading inquiries manager:', err);
      inquiriesBody.innerHTML = `<tr><td colspan="7" class="no-data" style="color: var(--accent-red);">Failed to connect. verify your credentials.</td></tr>`;
    }
  }

  // --- 4. Content Form Submit ---
  contentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    btnSaveContent.disabled = true;
    const saveBtnText = btnSaveContent.querySelector('.btn-text');
    const saveBtnLoader = btnSaveContent.querySelector('.btn-loader');
    saveBtnText.innerText = 'Saving...';
    saveBtnLoader.classList.remove('hidden');

    const updatedPayload = {
      projectName: document.getElementById('edit-project-name').value,
      tagline: document.getElementById('edit-tagline').value,
      description: document.getElementById('edit-description').value,
      phone: document.getElementById('edit-phone').value,
      email: document.getElementById('edit-email').value,
      address: document.getElementById('edit-address').value,
      reraNumber: document.getElementById('edit-rera').value,
      launchDate: document.getElementById('edit-launch').value,
      pricing: {
        residential: document.getElementById('edit-price-res').value,
        commercial: document.getElementById('edit-price-comm').value
      }
    };

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(updatedPayload)
      });

      if (response.ok) {
        showToast('Settings Saved', 'Landing page content updated successfully.');
      } else {
        const errorData = await response.json();
        showToast('Save Failed', errorData.error || 'Server error.');
      }

    } catch (err) {
      console.error('Save content error:', err);
      showToast('Connection Error', 'Failed to reach server.');
    } finally {
      btnSaveContent.disabled = false;
      saveBtnText.innerText = 'Save Changes';
      saveBtnLoader.classList.add('hidden');
    }
  });

  // --- 5. File Upload Interactions ---
  uploadImageInput.addEventListener('change', () => {
    if (uploadImageInput.files && uploadImageInput.files.length > 0) {
      selectedFilename.innerText = uploadImageInput.files[0].name;
      selectedFilename.classList.remove('hidden');
      dropzone.style.borderColor = 'var(--accent-green)';
    } else {
      selectedFilename.classList.add('hidden');
      dropzone.style.borderColor = 'rgba(197, 160, 89, 0.3)';
    }
  });

  // Drag & drop support
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      uploadImageInput.files = files;
      // trigger change manually
      const event = new Event('change');
      uploadImageInput.dispatchEvent(event);
    }
  });

  // Gallery Upload form submit
  galleryUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!uploadImageInput.files || uploadImageInput.files.length === 0) {
      alert('Please select an image file first.');
      return;
    }

    btnUploadSubmit.disabled = true;
    const uploadBtnText = btnUploadSubmit.querySelector('.btn-text');
    const uploadBtnLoader = btnUploadSubmit.querySelector('.btn-loader');
    uploadBtnText.innerText = 'Uploading...';
    uploadBtnLoader.classList.remove('hidden');

    const file = uploadImageInput.files[0];
    const caption = document.getElementById('upload-caption').value;
    const category = document.getElementById('upload-category').value;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', caption);
    formData.append('category', category);

    try {
      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        },
        body: formData
      });

      if (response.ok) {
        showToast('Photo Uploaded', 'New photo successfully added to gallery.');
        galleryUploadForm.reset();
        selectedFilename.classList.add('hidden');
        dropzone.style.borderColor = 'rgba(197, 160, 89, 0.3)';
        
        // Reload gallery list
        loadGalleryManager();
      } else {
        const errorData = await response.json();
        showToast('Upload Failed', errorData.error || 'Server error.');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      showToast('Connection Error', 'Failed to connect to server.');
    } finally {
      btnUploadSubmit.disabled = false;
      uploadBtnText.innerText = 'Upload Photo';
      uploadBtnLoader.classList.add('hidden');
    }
  });

  // --- 6. Deletion API Callers ---
  async function deletePhoto(photoId) {
    try {
      const response = await fetch(`/api/gallery/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (response.ok) {
        showToast('Photo Deleted', 'Gallery asset removed.');
        loadGalleryManager();
      } else {
        const data = await response.json();
        showToast('Delete Failed', data.error || 'Failed to delete photo.');
      }
    } catch (err) {
      console.error('Delete photo error:', err);
      showToast('Connection Error', 'Server error.');
    }
  }

  async function deleteInquiry(inquiryId) {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (response.ok) {
        showToast('Inquiry Deleted', 'Inquiry record removed from database.');
        loadInquiriesManager();
      } else {
        const data = await response.json();
        showToast('Delete Failed', data.error || 'Failed to delete record.');
      }
    } catch (err) {
      console.error('Delete inquiry error:', err);
      showToast('Connection Error', 'Server error.');
    }
  }

  // --- 7. Inquiries Refresh ---
  btnRefreshInquiries.addEventListener('click', () => {
    loadInquiriesManager();
  });

  // --- 8. Admin Toast Notification Helper ---
  function showToast(title, desc) {
    if (!adminToast) return;
    adminToastMessage.innerHTML = `<strong>${title}:</strong> ${desc}`;
    adminToast.classList.remove('hidden');
    
    setTimeout(() => {
      adminToast.classList.add('hidden');
    }, 4000);
  }

  // Run initial Auth check
  checkAuth();
});
