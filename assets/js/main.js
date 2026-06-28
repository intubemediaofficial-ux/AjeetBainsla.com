/* ==========================================================================
   AJEET BAINSLA — Main JavaScript (Dynamic CMS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('preloader').classList.add('loaded');
    }, 1200);
  });

  /* ---------- AOS Init ---------- */
  AOS.init({
    once: true,
    duration: 800,
    offset: 80,
  });

  /* ---------- Navbar Scroll ---------- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    backToTop.classList.toggle('visible', y > 500);
  });

  /* ---------- Active Nav Link ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observerOptions = { rootMargin: '-30% 0px -70% 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);
  sections.forEach(s => observer.observe(s));

  /* ---------- Mobile Menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinksEl.classList.toggle('open');
  });

  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinksEl.classList.remove('open');
    });
  });

  /* ---------- Stat Counter Animation ---------- */
  const counters = document.querySelectorAll('.stat-number');
  let counted = false;

  function animateCounters() {
    if (counted) return;
    const trigger = document.querySelector('.hero-stats');
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      counted = true;
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        const duration = 2000;
        const start = performance.now();

        function step(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.floor(eased * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }
  }
  window.addEventListener('scroll', animateCounters);
  animateCounters();

  /* ---------- Particles ---------- */
  const particleContainer = document.getElementById('particles');
  if (particleContainer) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.classList.add('hero-particle');
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 6 + 's';
      p.style.animationDuration = 4 + Math.random() * 4 + 's';
      p.style.width = 1 + Math.random() * 3 + 'px';
      p.style.height = p.style.width;
      particleContainer.appendChild(p);
    }
  }

  /* ---------- Hero Background Slider ---------- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 1) {
    let currentSlide = 0;
    setInterval(() => {
      heroSlides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
    }, 6000);
  }

  /* ---------- Smooth Scroll for anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Load Dynamic Content from CMS ---------- */
  loadSiteData();

});

/* ======= CMS Dynamic Content Loader ======= */
async function loadSiteData() {
  try {
    const res = await fetch('site-data.json?t=' + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    applyData(data);
  } catch (e) {
    // site-data.json not found or invalid — use static HTML
  }
}

function applyData(d) {
  // Hero
  if (d.hero) {
    const h = d.hero;
    const subtitle = document.querySelector('.hero-subtitle');
    const title = document.querySelector('.hero-title');
    const tagline = document.querySelector('.hero-tagline');
    if (subtitle && h.subtitle) subtitle.textContent = h.subtitle;
    if (title && h.title) {
      const parts = h.title.split(' ');
      if (parts.length >= 2) {
        title.innerHTML = parts[0] + ' <span class="gold">' + parts.slice(1).join(' ') + '</span>';
      }
    }
    if (tagline && h.tagline) tagline.textContent = h.tagline;
    if (h.stats && h.stats.length >= 3) {
      const statEls = document.querySelectorAll('.stat');
      h.stats.forEach((s, i) => {
        if (statEls[i]) {
          const numEl = statEls[i].querySelector('.stat-number');
          const plusEl = statEls[i].querySelector('.stat-plus');
          const lblEl = statEls[i].querySelector('.stat-label');
          if (numEl) numEl.setAttribute('data-target', parseInt(s.number) || 0);
          if (plusEl) plusEl.textContent = s.suffix || '+';
          if (lblEl) lblEl.textContent = s.label || '';
        }
      });
    }
    if (h.youtube_url) {
      const ytBtn = document.querySelector('.hero-cta .btn-outline');
      if (ytBtn) ytBtn.href = h.youtube_url;
    }
    // Dynamic slider images
    if (h.slider_images && h.slider_images.length > 0) {
      const sliderContainer = document.querySelector('.hero-slider');
      if (sliderContainer) {
        sliderContainer.innerHTML = '';
        h.slider_images.forEach((src, i) => {
          const slide = document.createElement('div');
          slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
          slide.style.backgroundImage = "url('" + src + "')";
          sliderContainer.appendChild(slide);
        });
        // Restart slider
        if (h.slider_images.length > 1) {
          let cur = 0;
          const slides = sliderContainer.querySelectorAll('.hero-slide');
          setInterval(() => {
            slides[cur].classList.remove('active');
            cur = (cur + 1) % slides.length;
            slides[cur].classList.add('active');
          }, 6000);
        }
      }
    }
  }

  // About
  if (d.about) {
    const a = d.about;
    const aboutTitle = document.querySelector('.about-content .section-title');
    if (aboutTitle && a.title) aboutTitle.innerHTML = a.title;
    if (a.paragraphs) {
      const aboutTexts = document.querySelectorAll('.about-text');
      a.paragraphs.forEach((p, i) => {
        if (aboutTexts[i] && p) aboutTexts[i].innerHTML = p;
      });
    }
    if (a.profile_image) {
      const profileImg = document.querySelector('.about-image img');
      if (profileImg) profileImg.src = a.profile_image;
    }
  }

  // Music
  if (d.music) {
    const m = d.music;
    if (m.featured_video_id) {
      const iframe = document.querySelector('.video-wrapper iframe');
      if (iframe) iframe.src = 'https://www.youtube.com/embed/' + m.featured_video_id;
    }
    if (m.youtube_channel_url) {
      const ytCard = document.querySelector('.music-card:first-child .btn');
      if (ytCard) ytCard.href = m.youtube_channel_url;
    }
    if (m.youtube_channel_name) {
      const ytName = document.querySelector('.music-card:first-child .btn');
      if (ytName) ytName.textContent = m.youtube_channel_name;
    }
    if (m.genres && m.genres.length > 0) {
      const genreList = document.querySelector('.genre-list');
      if (genreList) {
        genreList.innerHTML = m.genres.map(g =>
          '<li><i class="' + g.icon + '"></i> ' + g.name + '</li>'
        ).join('');
      }
    }
  }

  // Contact
  if (d.contact) {
    const c = d.contact;
    if (c.whatsapp) {
      const waCard = document.querySelector('.contact-card.whatsapp');
      if (waCard) {
        waCard.href = 'https://wa.me/' + c.whatsapp.replace(/[^0-9]/g, '');
        const waP = waCard.querySelector('p');
        if (waP) waP.textContent = c.whatsapp;
      }
    }
  }

  // Instagram post embeds
  if (d.instagram_posts && d.instagram_posts.length > 0) {
    renderInstagramPosts(d.instagram_posts, d.instagram);
  }

  // Gallery photos from CMS
  if (d.gallery && d.gallery.length > 0) {
    renderGallerySection(d.gallery);
  }
}

/* ======= Instagram Post Embeds ======= */
function renderInstagramPosts(posts, igSettings) {
  const section = document.getElementById('gallery');
  if (!section) return;

  const container = section.querySelector('.container');
  if (!container) return;

  // Build Instagram posts grid
  const existingEmbed = container.querySelector('.instagram-embed');
  const existingCta = container.querySelector('.instagram-cta');

  // Create posts grid HTML
  let postsHtml = '<div class="instagram-posts-grid" data-aos="fade-up" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-bottom:24px;">';
  posts.forEach(url => {
    // Extract the clean URL for embedding
    const cleanUrl = url.replace(/\?.*$/, '').replace(/\/$/, '') + '/';
    postsHtml += '<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="' + cleanUrl + '" data-instgrm-version="14" style="background:#FFF;border:0;border-radius:3px;box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15);margin:1px;max-width:540px;min-width:280px;padding:0;width:100%;"><a href="' + cleanUrl + '" target="_blank">View on Instagram</a></blockquote>';
  });
  postsHtml += '</div>';

  // Replace existing embed with posts grid
  if (existingEmbed) {
    existingEmbed.outerHTML = postsHtml;
  }

  // Re-process Instagram embeds
  if (window.instgrm) {
    window.instgrm.Embeds.process();
  }
}

/* ======= Gallery Section ======= */
function renderGallerySection(images) {
  // Add gallery photos section if we have CMS gallery images
  const gallerySection = document.getElementById('gallery');
  if (!gallerySection) return;

  const container = gallerySection.querySelector('.container');
  if (!container) return;

  // Check if gallery grid already exists
  let galleryGrid = container.querySelector('.cms-gallery-grid');
  if (!galleryGrid) {
    galleryGrid = document.createElement('div');
    galleryGrid.className = 'cms-gallery-grid';
    galleryGrid.setAttribute('data-aos', 'fade-up');
    galleryGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:24px;';
    // Insert after section header
    const header = container.querySelector('.section-header');
    if (header) header.after(galleryGrid);
  }

  galleryGrid.innerHTML = images.map(src =>
    '<div style="border-radius:10px;overflow:hidden;aspect-ratio:1;"><img src="' + src + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy"></div>'
  ).join('');
}
