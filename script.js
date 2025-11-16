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

  // Fade out
  slideImage.style.opacity = 0;

  setTimeout(() => {
    slideImage.src = slide.image;

    // AUTO SMART CROP USING ASPECT RATIO
    const img = new Image();
    img.src = slide.image;

    img.onload = () => {
      const aspect = img.width / img.height;

      // Very wide landscape (e.g., 21:9 panoramas)
      if (aspect > 2.2) {
        slideImage.style.objectPosition = "center";
      }
      // Standard landscape 16:9 or wider → center crop is best
      else if (aspect >= 1.3) {
        slideImage.style.objectPosition = "center";
      }
      // Slightly tall images (4:5, 3:4, phone photos)
      else if (aspect >= 0.8) {
        slideImage.style.objectPosition = "center 30%"; // keep faces visible
      }
      // Very tall images (posters, portraits)
      else {
        slideImage.style.objectPosition = "center top"; // top is usually important
      }
    };

    // Update text
    document.getElementById("headline").textContent = slide.headline;
    document.getElementById("subtext").textContent = slide.subtext;

    // Fade in
    slideImage.style.opacity = 1;

  }, 500);

  // Cycle to next
  currentIndex = (index + 1) % slides.length;
  setTimeout(() => showSlide(currentIndex), SLIDE_DURATION_MS);
}

// Auto-refresh every 5 minutes
setInterval(() => location.reload(), REFRESH_INTERVAL_MS);

// Start
loadSlides();
