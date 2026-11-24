/* Shared menu viewer — fluid touch-first paging, free pan and pinch zoom */
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

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const pad = (n) => String(n).padStart(2, "0");

  let current = 0;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  const pointers = new Map();
  let gesture = null;
  let pinch = null;
  let metrics = { stage: null, w: 0, h: 0 };
  let transformRAF = 0;
  let inertiaRAF = 0;
  let suppressClick = false;
  let lastTap = { time: 0, x: 0, y: 0 };

  function preload(index) {
    if (index < 0 || index >= count) return;
    const img = new Image();
    img.src = pages[index];
  }

  function measure() {
    metrics = {
      stage: ui.lightboxStage.getBoundingClientRect(),
      w: ui.lightboxImage.offsetWidth,
      h: ui.lightboxImage.offsetHeight,
    };
  }

  /* Generous slack keeps dragging free even when the page already fits the screen. */
  function limits() {
    const { stage, w, h } = metrics;
    if (!stage) return { x: 280, y: 280 };
    const slackX = clamp(stage.width * 0.32, 140, 340);
    const slackY = clamp(stage.height * 0.32, 140, 340);
    return {
      x: Math.max(0, (w * scale - stage.width) / 2) + slackX,
      y: Math.max(0, (h * scale - stage.height) / 2) + slackY,
    };
  }

  function clampOffsets() {
    const lim = limits();
    offsetX = clamp(offsetX, -lim.x, lim.x);
    offsetY = clamp(offsetY, -lim.y, lim.y);
  }

  function focusAt(clientX, clientY) {
    const r = metrics.stage || ui.lightboxStage.getBoundingClientRect();
    return { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 };
  }

  function applyTransform() {
    transformRAF = 0;
    ui.lightboxImage.style.transform =
      `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;
    ui.zoomLevel.textContent = `${Math.round(scale * 100)}%`;
  }

  function scheduleTransform() {
    if (!transformRAF) transformRAF = requestAnimationFrame(applyTransform);
  }

  function stopInertia() {
    if (inertiaRAF) cancelAnimationFrame(inertiaRAF);
    inertiaRAF = 0;
  }

  /* Kinetic glide after the finger lifts — makes the image feel free, not sticky. */
  function startInertia(vx, vy) {
    stopInertia();
    if (Math.hypot(vx, vy) < 0.12) return;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(48, now - last);
      last = now;
      offsetX += vx * dt;
      offsetY += vy * dt;
      const decay = Math.pow(0.9, dt / 16);
      vx *= decay;
      vy *= decay;
      clampOffsets();
      scheduleTransform();
      if (Math.hypot(vx, vy) > 0.02) inertiaRAF = requestAnimationFrame(tick);
      else inertiaRAF = 0;
    };
    inertiaRAF = requestAnimationFrame(tick);
  }

  function trackVelocity(g, x, y) {
    const now = performance.now();
    const dt = now - g.lastT;
    if (dt > 0) {
      const cap = 2.5; /* px per ms — keeps fast flicks smooth, never teleporting */
      const vx = clamp((x - g.lastX) / dt, -cap, cap);
      const vy = clamp((y - g.lastY) / dt, -cap, cap);
      g.vx = g.vx * 0.55 + vx * 0.45;
      g.vy = g.vy * 0.55 + vy * 0.45;
    }
    g.lastX = x;
    g.lastY = y;
    g.lastT = now;
  }

  function newGesture(id, x, y, mode) {
    const now = performance.now();
    return {
      id, x, y, mode,
      ox: offsetX, oy: offsetY,
      startT: now,
      lastX: x, lastY: y, lastT: now,
      vx: 0, vy: 0, moved: 0,
    };
  }

  function setScale(next, focus) {
    const prev = scale;
    scale = clamp(next, MIN_SCALE, MAX_SCALE);
    if (focus && prev !== scale) {
      const ratio = scale / prev;
      offsetX = focus.x - (focus.x - offsetX) * ratio;
      offsetY = focus.y - (focus.y - offsetY) * ratio;
    }
    if (scale === 1) {
      offsetX = 0;
      offsetY = 0;
    } else {
      clampOffsets();
    }
    scheduleTransform();
  }

  function resetZoom() {
    stopInertia();
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    pointers.clear();
    gesture = null;
    pinch = null;
    ui.lightboxImage.classList.remove("is-panning");
    applyTransform();
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
    const next = clamp(index, 0, count - 1);
    if (next === current) return;
    current = next;
    render();
  }

  function step(delta) { goTo(current + delta); }

  function openLightbox() {
    ui.lightbox.hidden = false;
    ui.lightboxImage.src = pages[current];
    ui.lightboxImage.alt = ui.image.alt;
    ui.lightboxCounter.textContent = ui.counter.textContent;
    resetZoom();
    measure();
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
  ui.lightboxImage.addEventListener("load", () => {
    if (ui.lightbox.hidden) return;
    measure();
    clampOffsets();
    scheduleTransform();
  });
  window.addEventListener("resize", () => {
    if (ui.lightbox.hidden) return;
    measure();
    clampOffsets();
    scheduleTransform();
  });

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

  /* Main stage: light flick or short drag turns the page; a tap opens the zoom view. */
  const stage = document.querySelector(".stage");
  let pageGesture = null;

  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest("button, a, select, input, label")) return;
    suppressClick = false;
    pageGesture = newGesture(e.pointerId, e.clientX, e.clientY, "page");
    /* No pointer capture here: it would steal clicks from the image and arrows. */
  });

  window.addEventListener("pointermove", (e) => {
    if (!pageGesture || e.pointerId !== pageGesture.id) return;
    trackVelocity(pageGesture, e.clientX, e.clientY);
  });

  function endPageGesture(e) {
    if (!pageGesture || e.pointerId !== pageGesture.id) return;
    const g = pageGesture;
    pageGesture = null;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    const dist = Math.abs(dx);
    const vert = Math.abs(dy);
    const flick = Math.abs(g.vx) > 0.35;
    if (dist > 38 && dist > vert * 1.1 && (flick || dist > 38)) {
      step(dx > 0 ? -1 : 1);
      suppressClick = true;
    }
  }

  window.addEventListener("pointerup", endPageGesture);
  window.addEventListener("pointercancel", () => { pageGesture = null; });

  ui.stageInner.addEventListener("click", () => {
    if (suppressClick) { suppressClick = false; return; }
    openLightbox();
  });
  ui.stageInner.setAttribute("tabindex", "0");
  ui.stageInner.setAttribute("role", "button");
  ui.stageInner.setAttribute("aria-label", "فتح الصفحة مكبّرة");
  ui.stageInner.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(); }
  });

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

  /* Wheel zoom stays anchored under the cursor. */
  ui.lightboxStage.addEventListener("wheel", (e) => {
    e.preventDefault();
    measure();
    setScale(scale + (e.deltaY < 0 ? 0.15 : -0.15), focusAt(e.clientX, e.clientY));
  }, { passive: false });

  ui.lightboxStage.addEventListener("dblclick", (e) => {
    measure();
    setScale(scale > 1 ? 1 : 2.5, focusAt(e.clientX, e.clientY));
  });

  /* One finger: free pan when zoomed, quick page flick at 100%.
     Two fingers: continuous pinch zoom around the midpoint. */
  ui.lightboxStage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    stopInertia();
    ui.lightboxStage.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    measure();

    if (pointers.size === 2) {
      gesture = null;
      const [a, b] = [...pointers.values()];
      pinch = {
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        scale,
        center: focusAt((a.x + b.x) / 2, (a.y + b.y) / 2),
      };
      ui.lightboxImage.classList.remove("is-panning");
      return;
    }

    if (pointers.size === 1) {
      gesture = newGesture(e.pointerId, e.clientX, e.clientY, scale > 1 ? "pan" : "swipe");
      ui.lightboxImage.classList.toggle("is-panning", scale > 1);
    }
  });

  ui.lightboxStage.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      setScale(pinch.scale * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.dist), pinch.center);
      return;
    }

    const g = gesture;
    if (!g || g.id !== e.pointerId) return;
    trackVelocity(g, e.clientX, e.clientY);
    g.moved = Math.max(g.moved, Math.hypot(e.clientX - g.x, e.clientY - g.y));

    if (g.mode === "pan") {
      offsetX = g.ox + (e.clientX - g.x);
      offsetY = g.oy + (e.clientY - g.y);
      clampOffsets();
      scheduleTransform();
    }
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);

    if (pinch) {
      if (pointers.size >= 2) return;
      pinch = null;
      if (pointers.size === 1) {
        const [id, p] = [...pointers.entries()][0];
        gesture = newGesture(id, p.x, p.y, scale > 1 ? "pan" : "swipe");
        ui.lightboxImage.classList.toggle("is-panning", scale > 1);
      } else {
        gesture = null;
        ui.lightboxImage.classList.remove("is-panning");
      }
      return;
    }

    const g = gesture;
    if (!g || g.id !== e.pointerId) return;
    gesture = null;
    ui.lightboxImage.classList.remove("is-panning");

    if (g.mode === "pan") {
      startInertia(g.vx, g.vy);
      return;
    }

    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    const dist = Math.abs(dx);
    const vert = Math.abs(dy);
    const flick = Math.abs(g.vx) > 0.35;
    if (dist > 38 && dist > vert * 1.1 && (flick || dist > 38)) {
      step(dx > 0 ? -1 : 1);
      lastTap.time = 0;
      return;
    }

    if (e.pointerType === "touch" && g.moved < 24 && performance.now() - g.startT < 320) {
      const now = Date.now();
      if (now - lastTap.time < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 44) {
        setScale(scale > 1 ? 1 : 2.5, focusAt(e.clientX, e.clientY));
        lastTap.time = 0;
      } else {
        lastTap = { time: now, x: e.clientX, y: e.clientY };
      }
    }
  }

  ui.lightboxStage.addEventListener("pointerup", endPointer);
  ui.lightboxStage.addEventListener("pointercancel", endPointer);

  const hash = window.location.hash.match(/^#page-(\d+)$/);
  if (hash) current = clamp(Number(hash[1]) - 1, 0, count - 1);
  render();
})();
