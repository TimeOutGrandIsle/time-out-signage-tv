const SLIDES_URL = "slides.json";
const DEFAULT_SLIDE_DURATION_MS = 9000;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
let slides = [];
let currentIndex = 0;
let slideTimer = null;
const slideImage = document.getElementById("slide-image");
const headline = document.getElementById("headline");
const subtext = document.getElementById("subtext");
const progress = document.getElementById("slide-progress");
async function loadSlides() {
  try {
    const resp = await fetch(SLIDES_URL + "?t=" + Date.now(), { cache: "no-store" });
    if (!resp.ok) throw new Error("Could not load slides: " + resp.status);
    const data = await resp.json();
    slides = Array.isArray(data) ? data.filter(slide => slide.image || slide.headline || slide.subtext) : [];
    if (slides.length === 0) throw new Error("No slides found");
    showSlide(0);
  } catch (err) {
    console.error(err);
    headline.textContent = "Time Out Grand Isle";
    subtext.textContent = "Slides are unavailable right now.";
    slideImage.classList.remove("is-visible");
  }
}
function setSmartCrop(imagePath) {
  const img = new Image();
  img.onload = () => {
    const aspect = img.width / img.height;
    if (aspect >= 1.3) slideImage.style.objectPosition = "center";
    else if (aspect >= 0.8) slideImage.style.objectPosition = "center 32%";
    else slideImage.style.objectPosition = "center top";
  };
  img.src = imagePath;
}
function restartProgress(duration) {
  progress.style.setProperty("--slide-duration", duration + "ms");
  progress.classList.remove("is-running");
  void progress.offsetWidth;
  progress.classList.add("is-running");
}
function showSlide(index) {
  const slide = slides[index];
  if (!slide) return;
  clearTimeout(slideTimer);
  const duration = Number(slide.durationMs) || DEFAULT_SLIDE_DURATION_MS;
  slideImage.classList.remove("is-visible");
  setTimeout(() => {
    slideImage.src = slide.image || "images/image1.jpg";
    slideImage.alt = slide.headline || "Time Out slide";
    setSmartCrop(slideImage.src);
    headline.textContent = slide.headline || "Time Out Grand Isle";
    subtext.textContent = slide.subtext || "";
    slideImage.classList.add("is-visible");
    restartProgress(duration);
  }, 350);
  currentIndex = (index + 1) % slides.length;
  slideTimer = setTimeout(() => showSlide(currentIndex), duration);
}
setInterval(() => location.reload(), REFRESH_INTERVAL_MS);
loadSlides();
