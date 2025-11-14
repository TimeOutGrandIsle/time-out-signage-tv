const SLIDES_URL = "slides.json";
const SLIDE_DURATION_MS = 8000;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // reload page every 5 minutes

let slides = [];
let currentIndex = 0;
let slideImage = document.getElementById("slide-image");

async function loadSlides() {
  try {
    const resp = await fetch(SLIDES_URL + "?t=" + Date.now(), { cache: "no-store" });
    slides = await resp.json();
    if (slides.length > 0) showSlide(0);
  } catch (err) {
    console.error(err);
    document.getElementById("headline").textContent = "Error loading slides";
    document.getElementById("subtext").textContent = "";
  }
}

function showSlide(index) {
  const slide = slides[index];
  if (!slide) return;

  // Fade out current
  slideImage.style.opacity = 0;

  setTimeout(() => {
    slideImage.src = slide.image;
    document.getElementById("headline").textContent = slide.headline;
    document.getElementById("subtext").textContent = slide.subtext;
    slideImage.style.opacity = 1;
  }, 500); // half of the transition

  currentIndex = (index + 1) % slides.length;
  setTimeout(() => showSlide(currentIndex), SLIDE_DURATION_MS);
}

// Auto-refresh every REFRESH_INTERVAL_MS
setInterval(() => location.reload(), REFRESH_INTERVAL_MS);

loadSlides();
