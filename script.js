// O NORDESTE EM NÓS — comportamento compartilhado da interface
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');

  function openSidebar(){
    sidebar.classList.add('is-open');
    backdrop.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded','true');
  }
  function closeSidebar(){
    sidebar.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded','false');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('is-open');
      isOpen ? closeSidebar() : openSidebar();
    });
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeSidebar);
  }
  // Close the mobile sidebar automatically when a navigation link is used
  document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 980) closeSidebar();
    });
  });

  // ---------- Carrossel + zoom (lightbox) ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const shows = [];

  // abre o zoom com qualquer imagem
  function openLightbox(img){
    if (!lightbox) return;
    shows.forEach(s => s.stop());
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightbox.showModal();
  }

  document.querySelectorAll('.slideshow').forEach(show => {
    const slides = show.querySelectorAll('.slide');
    const dotsBox = show.querySelector('.slide-dots');
    let current = 0;
    let timer = null;

    function go(n){
      slides[current].classList.remove('is-active');
      if (dots[current]) dots[current].classList.remove('is-active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      if (dots[current]) dots[current].classList.add('is-active');
    }
    function stop(){ clearInterval(timer); timer = null; }
    function start(){
      stop();
      if (slides.length > 1) timer = setInterval(() => go(current + 1), 4000);
    }

    // bolinhas de navegação
    const dots = [];
    if (slides.length > 1 && dotsBox) {
      slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.addEventListener('click', () => { go(i); start(); });
        dotsBox.appendChild(dot);
        dots.push(dot);
      });
      dots[0].classList.add('is-active');
    }

    // pausa com o mouse em cima
    show.addEventListener('mouseenter', stop);
    show.addEventListener('mouseleave', start);

    // clique no carrossel = zoom no slide que está visível agora
    show.addEventListener('click', e => {
      if (e.target.closest('.slide-dots')) return;
      openLightbox(slides[current]);
    });

    shows.push({ start, stop });
    start();
  });

  // imagens avulsas dos cards (uma foto só) também abrem em zoom
  document.querySelectorAll('.nav-card-media img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img));
  });

  if (lightbox) {
    // retoma os carrosséis quando o zoom é fechado
    lightbox.addEventListener('close', () => shows.forEach(s => s.start()));
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox || e.target.classList.contains('lb-close')) lightbox.close();
    });
  }
});