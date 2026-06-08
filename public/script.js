document.addEventListener('DOMContentLoaded', () => {
  // Global States
  let projectContent = {};
  let galleryData = [];

  // DOM Elements
  const navbar = document.getElementById('navbar');
  const themeToggle = document.getElementById('theme-toggle');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');

  // Specs Elements
  const resSpecs3bhk = document.getElementById('res-specs-3bhk');
  const resSpecs4bhk = document.getElementById('res-specs-4bhk');
  const commSpecsShops = document.getElementById('comm-specs-shops');
  const commSpecsOffices = document.getElementById('comm-specs-offices');

  // Gallery Elements
  const galleryGrid = document.getElementById('gallery-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // Lightbox Elements
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const btnModalInquire = document.getElementById('btn-modal-inquire');

  // Inquiry Form
  const inquiryForm = document.getElementById('inquiry-form');
  const btnSubmit = document.getElementById('btn-submit');

  // Toast Notifications
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastDesc = document.getElementById('toast-desc');
  const toastClose = document.getElementById('toast-close');

  let toastTimeout;

  // --- 1. Content Loader ---
  async function initContent() {
    try {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('Failed to load content');
      projectContent = await response.json();

      // Populate text nodes
      if (projectContent.projectName) {
        const pNames = document.querySelectorAll('#val-project-name');
        pNames.forEach(el => {
          el.innerHTML = `Own the Height of <span class="gold-text">${projectContent.projectName}</span>`;
        });
      }
      if (projectContent.tagline) {
        document.getElementById('val-tagline').innerText = projectContent.tagline;
      }
      if (projectContent.description) {
        document.getElementById('val-description').innerText = projectContent.description;
      }
      if (projectContent.pricing?.residential) {
        document.getElementById('val-price-res').innerText = projectContent.pricing.residential;
      }
      if (projectContent.pricing?.commercial) {
        document.getElementById('val-price-comm').innerText = projectContent.pricing.commercial;
      }
      if (projectContent.reraNumber) {
        document.getElementById('val-rera').innerText = projectContent.reraNumber;
      }
      if (projectContent.phone) {
        const phoneEl = document.getElementById('val-phone');
        phoneEl.innerText = projectContent.phone;
        phoneEl.setAttribute('href', `tel:${projectContent.phone.replace(/\s+/g, '')}`);
      }
      if (projectContent.email) {
        const emailEl = document.getElementById('val-email');
        emailEl.innerText = projectContent.email;
        emailEl.setAttribute('href', `mailto:${projectContent.email}`);
      }
      if (projectContent.address) {
        document.getElementById('val-address').innerText = projectContent.address;
      }

      // Populate Specifications List
      if (projectContent.specifications?.residential) {
        if (resSpecs3bhk) {
          resSpecs3bhk.innerHTML = '';
          projectContent.specifications.residential.forEach(spec => {
            const li = document.createElement('li');
            li.innerText = spec;
            resSpecs3bhk.appendChild(li);
          });
        }
        if (resSpecs4bhk) {
          resSpecs4bhk.innerHTML = '';
          projectContent.specifications.residential.forEach(spec => {
            const li = document.createElement('li');
            li.innerText = spec;
            resSpecs4bhk.appendChild(li);
          });
        }
      }

      if (projectContent.specifications?.commercial) {
        if (commSpecsShops) {
          commSpecsShops.innerHTML = '';
          projectContent.specifications.commercial.forEach(spec => {
            const li = document.createElement('li');
            li.innerText = spec;
            commSpecsShops.appendChild(li);
          });
        }
        if (commSpecsOffices) {
          commSpecsOffices.innerHTML = '';
          projectContent.specifications.commercial.forEach(spec => {
            const li = document.createElement('li');
            li.innerText = spec;
            commSpecsOffices.appendChild(li);
          });
        }
      }

    } catch (err) {
      console.error('Error loading content:', err);
    }
  }

  // --- 2. Gallery Loader ---
  async function initGallery() {
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) throw new Error('Failed to load gallery');
      galleryData = await response.json();
      renderGallery('all');
    } catch (err) {
      console.error('Error loading gallery:', err);
    }
  }

  function renderGallery(filter = 'all') {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    const filtered = filter === 'all' 
      ? galleryData 
      : galleryData.filter(photo => photo.category === filter);

    if (filtered.length === 0) {
      galleryGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No photos available in this category.</p>`;
      return;
    }

    filtered.forEach(photo => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <img src="${photo.url}" alt="${photo.caption}" loading="lazy">
        <div class="gallery-overlay">
          <span>${photo.category}</span>
          <h4>${photo.caption}</h4>
        </div>
      `;

      item.addEventListener('click', () => {
        openLightbox(photo);
      });

      galleryGrid.appendChild(item);
    });
  }

  // --- 3. Lightbox Modal ---
  function openLightbox(photo) {
    if (!lightboxModal) return;
    lightboxImg.src = photo.url;
    lightboxImg.alt = photo.caption;
    lightboxCategory.textContent = photo.category;
    lightboxCaption.textContent = photo.caption;

    lightboxModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  // Keyboard support for Lightbox (Esc key closes it)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Lightbox Send Inquiry Button click handler
  if (btnModalInquire) {
    btnModalInquire.addEventListener('click', () => {
      closeLightbox();
      
      const interestSelect = document.getElementById('form-interest');
      const messageTextarea = document.getElementById('form-message');
      
      const currentCategory = lightboxCategory.textContent.toLowerCase();
      if (currentCategory === 'commercial') {
        interestSelect.value = 'Commercial';
      } else {
        interestSelect.value = 'Residential';
      }

      messageTextarea.value = `Hi, I am interested in details regarding "${lightboxCaption.textContent}" (${lightboxCategory.textContent}). Please contact me.`;

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        // Set focus to name input
        setTimeout(() => {
          document.getElementById('form-name').focus();
        }, 600);
      }
    });
  }

  // --- 4. Gallery Filter Click Handlers ---
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-filter');
      renderGallery(category);
    });
  });

  // --- 5. Tab Switchers (Residences & Commercial Specifications) ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab-id');
      const container = btn.closest('.tabs-container');
      if (!container) return;

      // Deactivate all buttons & content inside this container
      const groupButtons = container.querySelectorAll('.tab-btn');
      groupButtons.forEach(b => b.classList.remove('active'));

      const contents = container.querySelectorAll('.tab-content');
      contents.forEach(c => c.classList.remove('active'));

      // Activate selected button & content
      btn.classList.add('active');
      const targetContent = container.querySelector(`#${tabId}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // --- 6. Mobile Menu ---
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close mobile menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link, .btn-nav');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // --- 7. Sticky Header scroll styling ---
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- 8. Theme Toggle Handler ---
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      document.body.classList.toggle('dark-theme');
      const activeTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      localStorage.setItem('theme', activeTheme);
    });
  }

  // --- 9. Toast Notification Handler ---
  function showToast(title, description, isSuccess = true) {
    if (!toast) return;
    toastTitle.textContent = title;
    toastDesc.textContent = description;

    const icon = toast.querySelector('.toast-icon');
    if (icon) {
      if (isSuccess) {
        icon.className = 'fa-solid fa-circle-check toast-icon';
        icon.style.color = 'var(--accent-gold)';
      } else {
        icon.className = 'fa-solid fa-triangle-exclamation toast-icon';
        icon.style.color = '#ef4444';
      }
    }

    toast.classList.remove('hidden');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      hideToast();
    }, 5000);
  }

  function hideToast() {
    if (toast) toast.classList.add('hidden');
  }

  if (toastClose) {
    toastClose.addEventListener('click', hideToast);
  }

  // --- 10. Contact Inquiry Form Submission ---
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value;
      const phone = document.getElementById('form-phone').value;
      const email = document.getElementById('form-email').value;
      const interestType = document.getElementById('form-interest').value;
      const message = document.getElementById('form-message').value;

      // Show loader
      if (btnSubmit) {
        btnSubmit.disabled = true;
        const loader = btnSubmit.querySelector('.btn-loader');
        const text = btnSubmit.querySelector('.btn-text');
        if (loader && text) {
          loader.classList.remove('hidden');
          text.classList.add('hidden');
        }
      }

      try {
        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, phone, email, interestType, message })
        });

        const data = await response.json();

        if (response.ok) {
          showToast('Inquiry Received', 'Thank you! Your request has been recorded. A sales manager will contact you shortly.', true);
          inquiryForm.reset();
        } else {
          showToast('Submission Failed', data.error || 'Please double-check your form and try again.', false);
        }
      } catch (err) {
        console.error('Inquiry submit error:', err);
        showToast('Connection Failed', 'Could not establish connection to server. Please check your network and try again.', false);
      } finally {
        // Reset loader
        if (btnSubmit) {
          btnSubmit.disabled = false;
          const loader = btnSubmit.querySelector('.btn-loader');
          const text = btnSubmit.querySelector('.btn-text');
          if (loader && text) {
            loader.classList.add('hidden');
            text.classList.remove('hidden');
          }
        }
      }
    });
  }

  // --- 11. Scroll Reveal Animations (Intersection Observer) ---
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll('.animate-on-scroll');
  animateElements.forEach(el => observer.observe(el));

  // --- 12. Global window helpers for brochure/tab CTAs ---
  window.setInterest = (propertyType, messageDetail) => {
    const interestSelect = document.getElementById('form-interest');
    const messageTextarea = document.getElementById('form-message');

    if (interestSelect) interestSelect.value = propertyType;
    if (messageTextarea) messageTextarea.value = messageDetail;
  };

  // Run Content and Gallery Fetch on page load
  initContent();
  initGallery();
});
