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
  const btnPrev = lightbox ? lightbox.querySelector('.lb-prev') : null;
  const btnNext = lightbox ? lightbox.querySelector('.lb-next') : null;
  const counter = lightbox ? lightbox.querySelector('.lb-counter') : null;
  const shows = [];

  let group = [];      // imagens do carrossel (ou a imagem avulsa) em zoom
  let gIdx = 0;        // posição atual dentro do grupo
  let activeShow = null;

  function renderLightbox(){
    const img = group[gIdx];
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    const multi = group.length > 1;
    btnPrev.hidden = btnNext.hidden = !multi;
    counter.textContent = multi ? (gIdx + 1) + ' / ' + group.length : '';
  }
  function lbGo(n){
    gIdx = (n + group.length) % group.length;
    renderLightbox();
  }

  // abre o zoom: recebe a lista de imagens, a posição e (opcional) o carrossel de origem
  function openLightbox(images, index, show){
    if (!lightbox) return;
    shows.forEach(s => s.stop());
    group = images;
    gIdx = index;
    activeShow = show || null;
    renderLightbox();
    lightbox.showModal();
  }

  document.querySelectorAll('.slideshow').forEach(show => {
    const slides = [...show.querySelectorAll('.slide')];
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

    const api = { start, stop, go };

    // clique no carrossel = zoom, começando no slide visível agora
    show.addEventListener('click', e => {
      if (e.target.closest('.slide-dots')) return;
      openLightbox(slides, current, api);
    });

    shows.push(api);
    start();
  });

  // imagens avulsas dos cards (que não estão em carrossel) também abrem em zoom
  document.querySelectorAll('.nav-card-media img').forEach(img => {
    if (img.closest('.slideshow')) return;   // essas já são tratadas acima
    img.addEventListener('click', () => openLightbox([img], 0, null));
  });

  if (lightbox) {
    btnNext.addEventListener('click', () => lbGo(gIdx + 1));
    btnPrev.addEventListener('click', () => lbGo(gIdx - 1));

    // setas do teclado
    document.addEventListener('keydown', e => {
      if (!lightbox.open || group.length < 2) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); lbGo(gIdx + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); lbGo(gIdx - 1); }
    });

    // deslizar o dedo no celular
    let startX = null;
    lightbox.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      if (startX === null || group.length < 2) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) lbGo(gIdx + (dx < 0 ? 1 : -1));
      startX = null;
    });

    // ao fechar: o carrossel de trás para na imagem em que você parou e volta a rodar
    lightbox.addEventListener('close', () => {
      if (activeShow) activeShow.go(gIdx);
      activeShow = null;
      shows.forEach(s => s.start());
    });

    // clique no fundo ou no × fecha o zoom
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox || e.target.classList.contains('lb-close')) lightbox.close();
    });
  }
});