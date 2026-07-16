let slides = [];
const STORAGE_KEY = "timeOutSignageSlides";
const SETTINGS_KEY = "timeOutGithubSettings";
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
  }
];

const editor = document.getElementById("slides-editor");
const statusMessage = document.getElementById("status-message");
const ownerInput = document.getElementById("github-owner");
const repoInput = document.getElementById("github-repo");
const branchInput = document.getElementById("github-branch");
const pathInput = document.getElementById("github-path");
const tokenInput = document.getElementById("github-token");

function normalizeSlides(data) {
  const source = Array.isArray(data) ? data : DEFAULT_SLIDES;
  return source.map((slide, index) => ({ ...slide, type: index === 0 ? "welcome" : (slide.type || "standard") }));
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#aa4b3e" : "#0b6577";
}

function escapeHtml(value = "") {
  const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
  return String(value).replace(/[&<>'"]/g, char => replacements[char]);
}

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSettings() {
  const settings = {
    owner: ownerInput.value.trim(),
    repo: repoInput.value.trim(),
    branch: branchInput.value.trim() || "main",
    path: pathInput.value.trim() || "slides.json",
    token: tokenInput.value.trim()
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return settings;
}

function loadSettings() {
  const settings = getSettings();
  ownerInput.value = settings.owner || "";
  repoInput.value = settings.repo || "";
  branchInput.value = settings.branch || "main";
  pathInput.value = settings.path || "slides.json";
  tokenInput.value = settings.token || "";
}

function getSavedSlides() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.warn("Saved slides could not be read", err);
    return null;
  }
}

function saveSlidesToBrowser() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSlides(slides)));
  setStatus("Preview saved in this browser. Publish to GitHub when you are ready.");
}

async function loadSlides() {
  loadSettings();
  try {
    const savedSlides = getSavedSlides();
    if (savedSlides) {
      slides = normalizeSlides(savedSlides);
      renderSlides();
      setStatus("Loaded saved preview changes from this browser.");
      return;
    }
    const resp = await fetch("slides.json?t=" + Date.now(), { cache: "no-store" });
    if (!resp.ok) throw new Error("Could not load slides: " + resp.status);
    slides = normalizeSlides(await resp.json());
    renderSlides();
    setStatus("Published slides loaded.");
  } catch (err) {
    console.error(err);
    slides = normalizeSlides(DEFAULT_SLIDES);
    renderSlides();
    setStatus("Using built-in sample slides. Publish when ready.", true);
  }
}

function renderSlides() {
  editor.innerHTML = "";
  slides.forEach((slide, index) => {
    const card = document.createElement("article");
    card.className = "slide-editor";
    const title = escapeHtml(slide.headline || "Slide " + (index + 1));
    const sub = escapeHtml(slide.subtext || "");
    const image = escapeHtml(slide.image || "");
    const guestName = escapeHtml(slide.guestName || "");
    const type = escapeHtml(slide.type || "standard");
    const fit = escapeHtml(slide.fit || "cover");
    const guestNameField = (slide.type === "welcome" || index === 0)
      ? '<label for="guest-' + index + '">Customer / Guest name</label><input id="guest-' + index + '" type="text" value="' + guestName + '" data-index="' + index + '" data-field="guestName" placeholder="The Smith Family">'
      : '';

    card.innerHTML = '<div class="slide-preview" style="background-image: url(&quot;' + image + '&quot;)"><div class="slide-preview-text"><strong>' + title + '</strong><span>' + (guestName || sub) + '</span></div></div>' +
      '<div class="slide-form">' +
      '<input type="hidden" value="' + type + '" data-index="' + index + '" data-field="type">' +
      '<label for="headline-' + index + '">Headline</label><input id="headline-' + index + '" type="text" value="' + title + '" data-index="' + index + '" data-field="headline">' +
      guestNameField +
      '<label for="subtext-' + index + '">Message</label><textarea id="subtext-' + index + '" data-index="' + index + '" data-field="subtext">' + sub + '</textarea>' +
      '<label for="image-' + index + '">Image path or URL</label><input id="image-' + index + '" type="text" value="' + image + '" data-index="' + index + '" data-field="image">' +
      '<label for="fit-' + index + '">Image fit</label><select id="fit-' + index + '" data-index="' + index + '" data-field="fit"><option value="cover"' + (fit === "cover" ? " selected" : "") + '>Fill screen / crop</option><option value="contain"' + (fit === "contain" ? " selected" : "") + '>Show whole photo</option></select>' +
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
  setStatus("Slide updated. Click Publish to GitHub when you are ready.");
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
  setStatus("Slide order updated. Click Publish to GitHub when you are ready.");
});

async function publishToGitHub() {
  const settings = saveSettings();
  if (!settings.owner || !settings.repo || !settings.branch || !settings.path || !settings.token) {
    setStatus("Enter GitHub owner, repo, branch, file path, and token before publishing.", true);
    return;
  }

  const button = document.getElementById("publish-github");
  button.disabled = true;
  button.textContent = "Publishing...";
  setStatus("Publishing slides.json to GitHub...");

  try {
    const apiPath = encodeURIComponent(settings.path).replace(/%2F/g, "/");
    const url = "https://api.github.com/repos/" + settings.owner + "/" + settings.repo + "/contents/" + apiPath;
    const headers = {
      "Authorization": "Bearer " + settings.token,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
    const currentResp = await fetch(url + "?ref=" + encodeURIComponent(settings.branch), { headers });
    if (!currentResp.ok) throw new Error("Could not read current slides.json from GitHub. Check repo settings and token access.");
    const currentFile = await currentResp.json();
    const json = JSON.stringify(normalizeSlides(slides), null, 2) + "\n";
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const updateResp = await fetch(url, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Update TV signage slides",
        content: encoded,
        sha: currentFile.sha,
        branch: settings.branch
      })
    });
    if (!updateResp.ok) {
      const detail = await updateResp.text();
      throw new Error("GitHub publish failed: " + detail);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSlides(slides)));
    setStatus("Published to GitHub. GitHub Pages may take a minute or two to refresh.");
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Could not publish to GitHub.", true);
  } finally {
    button.disabled = false;
    button.textContent = "Publish to GitHub";
  }
}

document.getElementById("add-slide").addEventListener("click", () => {
  slides.push({ type: "standard", headline: "New Guest Note", subtext: "A warm message for your guests", image: "images/image1.jpg", fit: "contain" });
  renderSlides();
  setStatus("Slide added. Click Publish to GitHub when you are ready.");
});

document.getElementById("save-local").addEventListener("click", () => {
  saveSettings();
  saveSlidesToBrowser();
});

document.getElementById("publish-github").addEventListener("click", publishToGitHub);

document.getElementById("clear-local").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  setStatus("Saved preview changes cleared. Reloading published slides...");
  loadSlides();
});

document.getElementById("copy-slides").addEventListener("click", async () => {
  const json = JSON.stringify(normalizeSlides(slides), null, 2);
  try {
    await navigator.clipboard.writeText(json);
    setStatus("slides.json copied to your clipboard.");
  } catch {
    window.prompt("Copy this JSON and update slides.json:", json);
  }
});

document.getElementById("download-slides").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(normalizeSlides(slides), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "slides.json";
  link.click();
  URL.revokeObjectURL(url);
  setStatus("slides.json downloaded.");
});

[ownerInput, repoInput, branchInput, pathInput, tokenInput].forEach(input => {
  input.addEventListener("change", saveSettings);
});

loadSlides();
