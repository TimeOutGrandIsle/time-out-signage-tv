const SLIDES_URL = "slides.json";
const STORAGE_KEY = "timeOutSignageSlides";
const DEFAULT_SLIDE_DURATION_MS = 9000;
const DEFAULT_SLIDES = [
  {
    type: "welcome",
    headline: "Welcome to Time Out",
    guestName: "The Smith Family",
    subtext: "We are so glad you are here. Settle in, enjoy the view, and make yourself at home.",
    image: "images/image1.jpg"
  },
  {
    type: "standard",
    headline: "You Are on Island Time",
    subtext: "Kick off your shoes, breathe in the Gulf air, and let the day slow down.",
    image: "images/image2.jpg"
  },
  {
    type: "standard",
    headline: "Need Anything?",
    subtext: "Call or text 601-209-0231. We want your stay to feel easy.",
    image: "images/image3.jpg"
  },
  {
    type: "standard",
    headline: "Make Yourself at Home",
    subtext: "Coffee, porch time, beach walks, and good meals are strongly encouraged.",
    image: "images/image1.jpg"
  },
  {
    type: "standard",
    headline: "A Grand Isle Story",
    subtext: "Time Out has been part of our family memories for generations.",
    image: "images/TimeOutLate60s.jpg"
  },
  {
    type: "standard",
    headline: "Thank You for Staying",
    subtext: "We hope Time Out becomes part of your favorite beach memories too.",
    image: "images/TimeOut1999.jpg"
  }
];
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
let slides = [];
let currentIndex = 0;
let slideTimer = null;
const slideImage = document.getElementById("slide-image");
const headline = document.getElementById("headline");
const subtext = document.getElementById("subtext");
const progress = document.getElementById("slide-progress");
const slideText = document.getElementById("slide-text");
function getSavedSlides() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.warn("Saved slides could not be read", err);
    return null;
  }
}

async function loadSlides() {
  try {
    const savedSlides = getSavedSlides();
    if (savedSlides) {
      slides = normalizeSlides(savedSlides);
      showSlide(0);
      return;
    }
    const resp = await fetch(SLIDES_URL + "?t=" + Date.now(), { cache: "no-store" });
    if (!resp.ok) throw new Error("Could not load slides: " + resp.status);
    const data = await resp.json();
    slides = normalizeSlides(data);
    if (slides.length === 0) throw new Error("No slides found");
    showSlide(0);
  } catch (err) {
    console.error(err);
    slides = normalizeSlides(DEFAULT_SLIDES);
    showSlide(0);
  }
}
function normalizeSlides(data) {
  const source = Array.isArray(data) ? data : DEFAULT_SLIDES;
  return source
    .filter(slide => slide.image || slide.headline || slide.subtext || slide.guestName)
    .map((slide, index) => ({ ...slide, type: index === 0 ? "welcome" : (slide.type || "standard") }));
}

function escapeHtml(value = "") {
  const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
  return String(value).replace(/[&<>'"]/g, char => replacements[char]);
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
    slideText.classList.toggle("welcome-slide", slide.type === "welcome");
    headline.textContent = slide.headline || "Time Out Grand Isle";
    if (slide.type === "welcome" && slide.guestName) {
      subtext.innerHTML = '<span class="guest-name">' + escapeHtml(slide.guestName) + '</span><span class="welcome-note">' + escapeHtml(slide.subtext || "We are so glad you are here.") + '</span>';
    } else {
      subtext.textContent = slide.subtext || "";
    }
    slideImage.classList.add("is-visible");
    restartProgress(duration);
  }, 350);
  currentIndex = (index + 1) % slides.length;
  slideTimer = setTimeout(() => showSlide(currentIndex), duration);
}
setInterval(() => location.reload(), REFRESH_INTERVAL_MS);
loadSlides();
