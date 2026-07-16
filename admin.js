let slides = [];
const editor = document.getElementById("slides-editor");
const statusMessage = document.getElementById("status-message");
async function loadSlides() {
  try {
    const resp = await fetch("slides.json?t=" + Date.now(), { cache: "no-store" });
    if (!resp.ok) throw new Error("Could not load slides: " + resp.status);
    slides = await resp.json();
    renderSlides();
    setStatus("Slides loaded.");
  } catch (err) {
    console.error(err);
    setStatus("Could not load slides.json. You can still add slides manually.", true);
    slides = [];
    renderSlides();
  }
}
function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#aa4b3e" : "#0b6577";
}
function escapeHtml(value = "") {
  const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
  return String(value).replace(/[&<>'"]/g, char => replacements[char]);
}
function renderSlides() {
  editor.innerHTML = "";
  slides.forEach((slide, index) => {
    const card = document.createElement("article");
    card.className = "slide-editor";
    const title = escapeHtml(slide.headline || "Slide " + (index + 1));
    const sub = escapeHtml(slide.subtext || "");
    const image = escapeHtml(slide.image || "");
    card.innerHTML = '<div class="slide-preview" style="background-image: url(&quot;' + image + '&quot;)"><div class="slide-preview-text"><strong>' + title + '</strong><span>' + sub + '</span></div></div>' +
      '<div class="slide-form">' +
      '<label for="headline-' + index + '">Headline</label><input id="headline-' + index + '" type="text" value="' + title + '" data-index="' + index + '" data-field="headline">' +
      '<label for="subtext-' + index + '">Subtext</label><textarea id="subtext-' + index + '" data-index="' + index + '" data-field="subtext">' + sub + '</textarea>' +
      '<label for="image-' + index + '">Image path or URL</label><input id="image-' + index + '" type="text" value="' + image + '" data-index="' + index + '" data-field="image">' +
      '<div class="slide-actions"><button class="secondary" type="button" data-action="up" data-index="' + index + '">Move Up</button><button class="secondary" type="button" data-action="down" data-index="' + index + '">Move Down</button><button class="delete" type="button" data-action="delete" data-index="' + index + '">Delete</button></div></div>';
    editor.appendChild(card);
  });
}
editor.addEventListener("change", event => {
  const field = event.target.dataset.field;
  const index = Number(event.target.dataset.index);
  if (!field || Number.isNaN(index)) return;
  slides[index][field] = event.target.value;
  renderSlides();
  setStatus("Slide updated.");
});
editor.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const index = Number(button.dataset.index);
  const action = button.dataset.action;
  if (action === "delete") slides.splice(index, 1);
  if (action === "up" && index > 0) [slides[index - 1], slides[index]] = [slides[index], slides[index - 1]];
  if (action === "down" && index < slides.length - 1) [slides[index + 1], slides[index]] = [slides[index], slides[index + 1]];
  renderSlides();
  setStatus("Slide order updated.");
});
document.getElementById("add-slide").addEventListener("click", () => {
  slides.push({ headline: "New Time Out Slide", subtext: "Beachfront Grand Isle getaway", image: "images/image1.jpg" });
  renderSlides();
  setStatus("Slide added.");
});
document.getElementById("copy-slides").addEventListener("click", async () => {
  const json = JSON.stringify(slides, null, 2);
  try {
    await navigator.clipboard.writeText(json);
    setStatus("slides.json copied to your clipboard.");
  } catch {
    window.prompt("Copy this JSON and update slides.json:", json);
  }
});
document.getElementById("download-slides").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(slides, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "slides.json";
  link.click();
  URL.revokeObjectURL(url);
  setStatus("slides.json downloaded.");
});
loadSlides();
