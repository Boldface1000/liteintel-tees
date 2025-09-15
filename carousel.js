document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-arrow.prev');
  const nextBtn = document.querySelector('.carousel-arrow.next');
  let currentIndex = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active', 'prev', 'next');
      if (i === index) {
        slide.classList.add('active');
      } else if (i === (index - 1 + slides.length) % slides.length) {
        slide.classList.add('prev');
      } else if (i === (index + 1) % slides.length) {
        slide.classList.add('next');
      }
    });
  }

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  });

  // Initialize
  showSlide(currentIndex);

  // Auto-advance for mobile view
  const isMobile = window.innerWidth <= 600;
  if (isMobile) {
    setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }, 5000);
  }
});
