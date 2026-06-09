document.addEventListener('DOMContentLoaded', () => {
  // Global States
  let projectContent = {};
  let galleryData = [];

  // Static Fallback Data (For GitHub Pages / Static Hosting)
  const fallbackContent = {
    projectName: "Emerald Heights",
    tagline: "Superlative 3BHK Residences. Designed to Elevate Lifestyles.",
    description: "Welcome to a landmark residential development featuring premium 3BHK configurations (240 to 265 Sq. Yd.) situated on a prominent 12 MT wide T.P.S. road. Architecturally composed of Towers A, B, C, and D, this sanctuary offers 26 lifestyle amenities, generous internal access loops, and expansive structural boundary margins of 5 MT, 6 MT, and 8 MT.",
    phone: "+91 98765 43210",
    email: "sales@emeraldheights.in",
    address: "Emerald Heights, Gota, Near Vandematram Circle, Ahmedabad, Gujarat 382481",
    reraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD/Others/RAA99999/090626",
    pricing: {
      residential: "Starts from ₹95 Lakhs",
      commercial: "Towers A, B, C, D Exclusive Residential"
    },
    specifications: {
      residential: [
        "Earthquake resistant RCC frame structure designed by structural engineers",
        "Vitrified Italian marble-finish tiles in living, dining, and passage areas",
        "Premium laminated wooden flooring in the master suite bedroom",
        "Top-tier sanitary ware and chrome bathroom fittings (Kohler/Jaquar)",
        "Durable UPVC sliding window frames with integrated mosquito meshes",
        "Advanced video door phone and multi-tier security lobby integration"
      ],
      commercial: []
    }
  };

  const fallbackGallery = [
    { id: "1", url: "assets/images/hero_render.png", caption: "Emerald Heights Premium Architecture Elevation", category: "exterior" },
    { id: "2", url: "assets/images/lobby_render.png", caption: "Luxurious Double-Height Main Entrance Foyer", category: "interior" },
    { id: "3", url: "assets/images/pool_render.png", caption: "Wellness Rooftop Infinity Swimming Pool & Splash Deck", category: "amenity" },
    { id: "4", url: "assets/images/plan_type1.png", caption: "3BHK Type 1 Floor Plan Layout (240 Sq. Yd. - Towers A & B)", category: "floorplan" },
    { id: "5", url: "assets/images/plan_type2.png", caption: "3BHK Type 2 Floor Plan Layout (240 Sq. Yd. - Towers A & B)", category: "floorplan" },
    { id: "6", url: "assets/images/plan_type3.png", caption: "3BHK Type 3 Floor Plan Layout (245 Sq. Yd. - Towers A & B)", category: "floorplan" },
    { id: "7", url: "assets/images/plan_type4.png", caption: "3BHK Type 4 Floor Plan Layout (250 Sq. Yd. - Tower D)", category: "floorplan" },
    { id: "8", url: "assets/images/plan_type5.png", caption: "3BHK Type 5 Floor Plan Layout (265 Sq. Yd. - Tower C)", category: "floorplan" }
  ];

  // DOM Elements
  const navbar = document.getElementById('navbar');
  const themeToggle = document.getElementById('theme-toggle');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');

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

  // --- Helper to resolve relative pathing on GitHub pages ---
  function resolveAssetUrl(url) {
    if (!url) return '';
    if (url.startsWith('/') && window.location.hostname.includes('github.io')) {
      return url.substring(1);
    }
    return url;
  }

  // --- 1. Content Loader ---
  async function initContent() {
    try {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('API offline');
      projectContent = await response.json();
      applyContent(projectContent);
    } catch (err) {
      console.warn('Running in static mode: Loading local content configuration.');
      projectContent = fallbackContent;
      applyContent(projectContent);
    }
  }

  function applyContent(data) {
    if (data.projectName) {
      const pNames = document.querySelectorAll('#val-project-name');
      pNames.forEach(el => {
        el.innerHTML = `Own the Height of <span class="green-text">${data.projectName}</span>`;
      });
    }
    if (data.tagline) {
      document.getElementById('val-tagline').innerText = data.tagline;
    }
    if (data.description) {
      document.getElementById('val-description').innerText = data.description;
    }
    if (data.pricing?.residential) {
      document.getElementById('val-price-res').innerText = data.pricing.residential;
    }
    if (data.pricing?.commercial) {
      document.getElementById('val-price-comm').innerText = data.pricing.commercial;
    }
    if (data.reraNumber) {
      document.getElementById('val-rera').innerText = data.reraNumber;
    }
    if (data.phone) {
      const phoneEl = document.getElementById('val-phone');
      phoneEl.innerText = data.phone;
      phoneEl.setAttribute('href', `tel:${data.phone.replace(/\s+/g, '')}`);
    }
    if (data.email) {
      const emailEl = document.getElementById('val-email');
      emailEl.innerText = data.email;
      emailEl.setAttribute('href', `mailto:${data.email}`);
    }
    if (data.address) {
      document.getElementById('val-address').innerText = data.address;
    }
  }

  // --- 2. Gallery Loader ---
  async function initGallery() {
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) throw new Error('API offline');
      galleryData = await response.json();
      renderGallery('all');
    } catch (err) {
      console.warn('Running in static mode: Loading pre-seeded gallery metadata.');
      galleryData = fallbackGallery;
      renderGallery('all');
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
      const imgUrl = resolveAssetUrl(photo.url);

      item.innerHTML = `
        <img src="${imgUrl}" alt="${photo.caption}" loading="lazy">
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
    lightboxImg.src = resolveAssetUrl(photo.url);
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
      if (currentCategory === 'floorplan' || currentCategory === 'exterior' || currentCategory === 'interior') {
        interestSelect.value = 'Residential';
      } else {
        interestSelect.value = 'Brochure';
      }

      messageTextarea.value = `Hi, I am interested in details regarding "${lightboxCaption.textContent}" (${lightboxCategory.textContent}). Please contact me.`;

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
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

  // --- 5. Tab Switchers (Overview & Residences) ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab-id');
      const container = btn.closest('.tabs-container');
      if (!container) return;

      const groupButtons = container.querySelectorAll('.tab-btn');
      groupButtons.forEach(b => b.classList.remove('active'));

      const contents = container.querySelectorAll('.tab-content');
      contents.forEach(c => c.classList.remove('active'));

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
        icon.style.color = 'var(--accent-green)';
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
          showToast('Request Submitted', 'Thank you! Your request has been recorded. A sales representative will contact you shortly.', true);
          inquiryForm.reset();
        } else {
          showToast('Submission Failed', data.error || 'Please double-check your form and try again.', false);
        }
      } catch (err) {
        console.warn('Backend server offline. Storing request inside browser LocalStorage.');
        
        const localInquiries = JSON.parse(localStorage.getItem('beverly_inquiries') || '[]');
        localInquiries.push({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          name, phone, email, interestType, message
        });
        localStorage.setItem('beverly_inquiries', JSON.stringify(localInquiries));

        showToast('Request Saved (Demo)', 'Thank you! The server is offline, so your inquiry was saved locally inside your browser cache.', true);
        inquiryForm.reset();
      } finally {
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

    if (interestSelect) {
      if (propertyType.includes('Brochure') || propertyType.includes('PDF')) {
        interestSelect.value = 'Brochure';
      } else {
        interestSelect.value = 'Residential';
      }
    }
    if (messageTextarea) messageTextarea.value = messageDetail;
  };

  // Run Content and Gallery Fetch on page load
  initContent();
  initGallery();
});
