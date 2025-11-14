let slides = [];

async function loadSlides() {
  const resp = await fetch("slides.json?t=" + Date.now(), { cache: "no-store" });
  slides = await resp.json();
  renderSlides();
}

function renderSlides() {
  const container = document.getElementById("slides-editor");
  container.innerHTML = "";
  slides.forEach((slide, index) => {
    const div = document.createElement("div");
    div.className = "slide-editor";
    div.innerHTML = `
      <h3>Slide ${index + 1}</h3>
      <label>Headline:</label><br>
      <input type="text" value="${slide.headline}" data-index="${index}" class="headline"><br>
      <label>Subtext:</label><br>
      <input type="text" value="${slide.subtext}" data-index="${index}" class="subtext"><br>
      <label>Image URL:</label><br>
      <input type="text" value="${slide.image}" data-index="${index}" class="image"><br>
      <button onclick="deleteSlide(${index})">Delete Slide</button>
      <hr>
    `;
    container.appendChild(div);
  });

  document.querySelectorAll(".headline").forEach(el => {
    el.addEventListener("input", e => slides[e.target.dataset.index].headline = e.target.value);
  });
  document.querySelectorAll(".subtext").forEach(el => {
    el.addEventListener("input", e => slides[e.target.dataset.index].subtext = e.target.value);
  });
  document.querySelectorAll(".image").forEach(el => {
    el.addEventListener("input", e => slides[e.target.dataset.index].image = e.target.value);
  });
}

function deleteSlide(index) {
  slides.splice(index, 1);
  renderSlides();
}

document.getElementById("add-slide").addEventListener("click", () => {
  slides.push({ headline: "New Slide", subtext: "Subtext here", image: "" });
  renderSlides();
});

document.getElementById("save-slides").addEventListener("click", () => {
  const jsonStr = JSON.stringify(slides, null, 2);
  alert("Copy this JSON and update slides.json on GitHub:\n\n" + jsonStr);
});

loadSlides();
