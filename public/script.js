document.addEventListener('DOMContentLoaded', () => {
  // Global States
  let projectContent = {};
  let galleryData = [];

  // Static Fallback Data (For GitHub Pages / Static Hosting)
  const fallbackContent = {
    projectName: "Beverly Heights",
    tagline: "Own the Height of Luxury. Elegant Design | Grand Elevation",
    description: "Experience premium living and corporate prominence in Gota, Ahmedabad. Beverly Heights blends modern 3 BHK & 4 BHK luxury residences with state-of-the-art ground-floor showrooms and corporate offices. Designed for those who appreciate high elevations, grand design, and a prestigious address.",
    phone: "+91 98765 43210",
    email: "sales@beverlyheights.in",
    address: "Beverly Heights, near Vandematram Circle, Gota, Ahmedabad, Gujarat 382481",
    reraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD/Others/RAA99999/080626",
    pricing: {
      residential: "Starts from ₹85 Lakhs",
      commercial: "Starts from ₹1.2 Crores"
    },
    specifications: {
      residential: [
        "Earthquake resistant RCC frame structure",
        "Vitrified Italian marble-finish tiles in living/dining room",
        "Laminated wooden flooring in master bedroom",
        "Premium sanitary ware & fittings (Kohler/Jaquar)",
        "UPVC sliding window frames with mosquito nets",
        "Video door phone security system"
      ],
      commercial: [
        "Double-height ceiling showrooms for maximum visibility",
        "Separate dedicated elevators for corporate floors",
        "Ample multi-level basement parking for staff & visitors",
        "24/7 security with CCTV surveillance in common areas",
        "High-speed fiber internet connection readiness",
        "Power backup for all common services"
      ]
    }
  };

  const fallbackGallery = [
    { id: "1", url: "assets/images/hero_bg.png", caption: "Beverly Heights Grand Elevation", category: "exterior" },
    { id: "2", url: "assets/images/lobby.png", caption: "Luxurious Double-Height Entrance Lobby", category: "interior" },
    { id: "3", url: "assets/images/residential.png", caption: "Elegant 3BHK/4BHK Penthouse Living Space", category: "interior" },
    { id: "4", url: "assets/images/commercial.png", caption: "Premium Ground-Floor Retail Showrooms", category: "commercial" },
    { id: "5", url: "assets/images/amenities_pool.png", caption: "Sunset Rooftop Infinity Swimming Pool", category: "amenity" },
    { id: "6", url: "assets/images/floor_plan_3bhk.png", caption: "3 BHK Premium Floor Plan Layout", category: "floorplan" },
    { id: "7", url: "assets/images/floor_plan_4bhk.png", caption: "4 BHK Luxury Penthouse Floor Plan Layout", category: "floorplan" },
    { id: "8", url: "assets/images/floor_plan_office.png", caption: "Corporate Office Floor Plan Layout", category: "floorplan" }
  ];

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

  // --- Helper to resolve relative pathing on GitHub pages ---
  function resolveAssetUrl(url) {
    if (!url) return '';
    // Strip leading slash if deployed on github.io to prevent root path routing issues
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
        el.innerHTML = `Own the Height of <span class="gold-text">${data.projectName}</span>`;
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

    // Populate Specifications List
    if (data.specifications?.residential) {
      if (resSpecs3bhk) {
        resSpecs3bhk.innerHTML = '';
        data.specifications.residential.forEach(spec => {
          const li = document.createElement('li');
          li.innerText = spec;
          resSpecs3bhk.appendChild(li);
        });
      }
      if (resSpecs4bhk) {
        resSpecs4bhk.innerHTML = '';
        data.specifications.residential.forEach(spec => {
          const li = document.createElement('li');
          li.innerText = spec;
          resSpecs4bhk.appendChild(li);
        });
      }
    }

    if (data.specifications?.commercial) {
      if (commSpecsShops) {
        commSpecsShops.innerHTML = '';
        data.specifications.commercial.forEach(spec => {
          const li = document.createElement('li');
          li.innerText = spec;
          commSpecsShops.appendChild(li);
        });
      }
      if (commSpecsOffices) {
        commSpecsOffices.innerHTML = '';
        data.specifications.commercial.forEach(spec => {
          const li = document.createElement('li');
          li.innerText = spec;
          commSpecsOffices.appendChild(li);
        });
      }
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
      if (currentCategory === 'commercial') {
        interestSelect.value = 'Commercial';
      } else {
        interestSelect.value = 'Residential';
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

  // --- 5. Tab Switchers (Residences & Commercial Specifications) ---
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
        console.warn('Backend server offline. Storing inquiry inside browser LocalStorage.');
        
        // Push inquiry into local storage for dynamic demo review
        const localInquiries = JSON.parse(localStorage.getItem('beverly_inquiries') || '[]');
        localInquiries.push({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          name, phone, email, interestType, message
        });
        localStorage.setItem('beverly_inquiries', JSON.stringify(localInquiries));

        showToast('Inquiry Submitted (Demo)', 'Thank you! The server is offline, so your inquiry was saved locally inside your browser cache.', true);
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

    if (interestSelect) interestSelect.value = propertyType;
    if (messageTextarea) messageTextarea.value = messageDetail;
  };

  // Run Content and Gallery Fetch on page load
  initContent();
  initGallery();
});
