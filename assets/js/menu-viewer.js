/* Shared menu viewer: page navigation, swipe, keyboard and fullscreen zoom */
(() => {
  const root = document.querySelector("[data-menu-viewer]");
  if (!root) return;

  const slug = root.dataset.slug;
  const label = root.dataset.label;
  const count = Number(root.dataset.count);
  const pages = Array.from({ length: count }, (_, i) =>
    `pages/page-${String(i + 1).padStart(2, "0")}.webp`
  );

  const $ = (id) => document.getElementById(id);
  const ui = {
    image: $("pageImage"),
    stageInner: $("stageInner"),
    counter: $("pageCounter"),
    prevTop: $("prevTop"),
    nextTop: $("nextTop"),
    prevBottom: $("prevBottom"),
    nextBottom: $("nextBottom"),
    jump: $("pageJump"),
    zoom: $("zoomBtn"),
    lightbox: $("lightbox"),
    lightboxImage: $("lightboxImage"),
    lightboxStage: $("lightboxStage"),
    lightboxCounter: $("lightboxCounter"),
    lightboxPrev: $("lightboxPrev"),
    lightboxNext: $("lightboxNext"),
    zoomIn: $("zoomIn"),
    zoomOut: $("zoomOut"),
    zoomReset: $("zoomReset"),
    zoomLevel: $("zoomLevel"),
    close: $("closeLightbox"),
    qrBtn: $("qrBtn"),
    qrOverlay: $("qrOverlay"),
    qrClose: $("qrClose"),
  };

  let current = 0;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let panning = false;
  let startX = 0;
  let startY = 0;
  let startOffsetX = 0;
  let startOffsetY = 0;
  let pinchStart = 0;
  let pinchScale = 1;

  const pad = (n) => String(n).padStart(2, "0");

  function preload(index) {
    if (index < 0 || index >= count) return;
    const img = new Image();
    img.src = pages[index];
  }

  function render() {
    const src = pages[current];
    ui.image.classList.add("is-loading");
    ui.image.src = src;
    ui.image.alt = `صفحة ${current + 1} من ${count} في منيو ${label}`;

    ui.counter.textContent = `${pad(current + 1)} / ${pad(count)}`;
    ui.jump.value = String(current + 1);
    ui.jump.max = String(count);
    const atStart = current === 0;
    const atEnd = current === count - 1;
    [ui.prevTop, ui.prevBottom, ui.lightboxPrev].forEach((el) => { el.disabled = atStart; });
    [ui.nextTop, ui.nextBottom, ui.lightboxNext].forEach((el) => { el.disabled = atEnd; });

    if (!ui.lightbox.hidden) {
      ui.lightboxImage.src = src;
      ui.lightboxImage.alt = ui.image.alt;
      ui.lightboxCounter.textContent = ui.counter.textContent;
      resetZoom();
    }

    preload(current + 1);
    preload(current - 1);
    history.replaceState(null, "", `#page-${current + 1}`);
  }

  function goTo(index) {
    const next = Math.max(0, Math.min(count - 1, index));
    if (next === current) return;
    current = next;
    render();
  }

  function step(delta) { goTo(current + delta); }

  function applyTransform() {
    ui.lightboxImage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    ui.zoomLevel.textContent = `${Math.round(scale * 100)}%`;
  }

  function clampOffsets() {
    const stage = ui.lightboxStage.getBoundingClientRect();
    const img = ui.lightboxImage.getBoundingClientRect();
    const maxX = Math.max(0, (img.width - stage.width) / 2) + 24;
    const maxY = Math.max(0, (img.height - stage.height) / 2) + 24;
    offsetX = Math.max(-maxX, Math.min(maxX, offsetX));
    offsetY = Math.max(-maxY, Math.min(maxY, offsetY));
  }

  function setScale(next) {
    scale = Math.max(1, Math.min(4, next));
    if (scale === 1) { offsetX = 0; offsetY = 0; }
    else clampOffsets();
    applyTransform();
  }

  function resetZoom() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    applyTransform();
  }

  function openLightbox() {
    ui.lightbox.hidden = false;
    ui.lightboxImage.src = pages[current];
    ui.lightboxImage.alt = ui.image.alt;
    ui.lightboxCounter.textContent = ui.counter.textContent;
    resetZoom();
    document.body.style.overflow = "hidden";
    ui.close.focus();
  }

  function closeLightbox() {
    ui.lightbox.hidden = true;
    document.body.style.overflow = "";
    resetZoom();
    ui.stageInner.focus?.();
  }

  function openQr() {
    ui.qrOverlay.hidden = false;
    ui.qrClose.focus();
  }

  function closeQr() {
    ui.qrOverlay.hidden = true;
    ui.qrBtn.focus();
  }

  ui.image.addEventListener("load", () => ui.image.classList.remove("is-loading"));
  [ui.prevTop, ui.prevBottom, ui.lightboxPrev].forEach((el) =>
    el.addEventListener("click", () => step(-1))
  );
  [ui.nextTop, ui.nextBottom, ui.lightboxNext].forEach((el) =>
    el.addEventListener("click", () => step(1))
  );

  ui.jump.addEventListener("change", () => {
    const value = Number(ui.jump.value);
    if (Number.isFinite(value)) goTo(value - 1);
    else ui.jump.value = String(current + 1);
  });

  ui.stageInner.addEventListener("click", openLightbox);
  ui.stageInner.setAttribute("tabindex", "0");
  ui.stageInner.setAttribute("role", "button");
  ui.stageInner.setAttribute("aria-label", "فتح الصفحة مكبّرة");
  ui.stageInner.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(); }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  document.querySelector(".stage").addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });
  document.querySelector(".stage").addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx > 0 ? -1 : 1);
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (document.activeElement === ui.jump) return;
    if (!ui.qrOverlay.hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeQr(); }
      return;
    }
    if (e.key === "ArrowLeft") step(1);
    else if (e.key === "ArrowRight") step(-1);
    else if (e.key === "Home") goTo(0);
    else if (e.key === "End") goTo(count - 1);
    else if (e.key === "Escape" && !ui.lightbox.hidden) closeLightbox();
    else if ((e.key === "+" || e.key === "=") && !ui.lightbox.hidden) setScale(scale + 0.25);
    else if (e.key === "-" && !ui.lightbox.hidden) setScale(scale - 0.25);
    else return;
    e.preventDefault();
  });

  ui.zoom.addEventListener("click", openLightbox);
  ui.close.addEventListener("click", closeLightbox);
  ui.qrBtn.addEventListener("click", openQr);
  ui.qrClose.addEventListener("click", closeQr);
  ui.qrOverlay.addEventListener("click", (e) => {
    if (e.target === ui.qrOverlay) closeQr();
  });
  ui.zoomIn.addEventListener("click", () => setScale(scale + 0.25));
  ui.zoomOut.addEventListener("click", () => setScale(scale - 0.25));
  ui.zoomReset.addEventListener("click", resetZoom);

  ui.lightboxStage.addEventListener("wheel", (e) => {
    e.preventDefault();
    setScale(scale + (e.deltaY < 0 ? 0.15 : -0.15));
  }, { passive: false });

  ui.lightboxStage.addEventListener("dblclick", () => setScale(scale > 1 ? 1 : 2.5));

  ui.lightboxStage.addEventListener("pointerdown", (e) => {
    if (scale <= 1 || e.pointerType === "touch") return;
    panning = true;
    startX = e.clientX;
    startY = e.clientY;
    startOffsetX = offsetX;
    startOffsetY = offsetY;
    ui.lightboxImage.classList.add("is-panning");
    ui.lightboxStage.setPointerCapture(e.pointerId);
  });
  ui.lightboxStage.addEventListener("pointermove", (e) => {
    if (!panning) return;
    offsetX = startOffsetX + (e.clientX - startX);
    offsetY = startOffsetY + (e.clientY - startY);
    clampOffsets();
    applyTransform();
  });
  const endPan = () => { panning = false; ui.lightboxImage.classList.remove("is-panning"); };
  ui.lightboxStage.addEventListener("pointerup", endPan);
  ui.lightboxStage.addEventListener("pointercancel", endPan);

  ui.lightboxStage.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      pinchStart = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchScale = scale;
    }
  }, { passive: true });
  ui.lightboxStage.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2 && pinchStart > 0) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setScale(pinchScale * (distance / pinchStart));
    }
  }, { passive: true });
  ui.lightboxStage.addEventListener("touchend", () => { pinchStart = 0; }, { passive: true });

  const hash = window.location.hash.match(/^#page-(\d+)$/);
  if (hash) current = Math.max(0, Math.min(count - 1, Number(hash[1]) - 1));
  render();
})();
