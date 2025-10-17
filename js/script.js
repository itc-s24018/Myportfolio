document.addEventListener("DOMContentLoaded", () => {
  // カーソルグロー（要素がある場合のみ）
  const cursorGlow = document.querySelector(".cursor-glow");
  if (cursorGlow) {
    document.addEventListener(
      "mousemove",
      (e) => {
        cursorGlow.style.left = e.clientX + "px";
        cursorGlow.style.top = e.clientY + "px";
      },
      { passive: true }
    );
  }

  // スムーズスクロール（hash リンクのみ）
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // ハッシュをアドレスバーに反映（必要なら）
        history.replaceState(null, "", href);
      }
    });
  });

  // スクロールアニメーション（IntersectionObserver がない場合は即表示）
  const items = document.querySelectorAll(".project-card, .skill-card");
  items.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.6s ease-out";
  });

  if ("IntersectionObserver" in window) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    items.forEach((el) => observer.observe(el));
  } else {
    // フォールバック: 即時表示
    items.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }

  // --- Fish random movement: make .shape elements swim around ---
  function initFish() {
    const shapes = Array.from(document.querySelectorAll(".shape"));
    if (!shapes.length) return;

    const fish = shapes.map((el) => {
      el.style.position = "absolute";
      // ensure transform origin center for rotation
      el.style.transformOrigin = "center";
      // random initial size factor (uses font-size from CSS)
      const fs = parseFloat(getComputedStyle(el).fontSize) || 48;
      const W = window.innerWidth;
      const H = window.innerHeight;
      // start near lower half with randomness
      let x = Math.random() * (W - fs);
      let y = H * 0.55 + Math.random() * (H * 0.35);
      // random velocity
      let vx = (Math.random() * 2 - 1) * (0.3 + Math.random() * 0.7);
      let vy = (Math.random() * 2 - 1) * (0.05 + Math.random() * 0.3);
      // random delay offset
      const delay = Math.random() * 2000;
      return { el, x, y, vx, vy, fs, delay };
    });

    let last = performance.now();
    function step(now) {
      const dt = Math.min(50, now - last) / 16.666; // ~60fps normalize
      last = now;
      const W = window.innerWidth;
      const H = window.innerHeight;
      fish.forEach((f) => {
        if (f.delay > 0) {
          f.delay -= now - last;
          return;
        }
        // small random accel to make movement lively
        f.vx += (Math.random() - 0.5) * 0.06;
        f.vy += (Math.random() - 0.5) * 0.02;
        // clamp velocities
        f.vx = Math.max(Math.min(f.vx, 1.5), -1.5);
        f.vy = Math.max(Math.min(f.vy, 1.0), -1.0);

        f.x += f.vx * dt * 2;
        f.y += f.vy * dt * 2;

        // horizontal wrap
        if (f.x < -f.fs) f.x = W + f.fs;
        if (f.x > W + f.fs) f.x = -f.fs;
        // keep fish mostly in lower half
        const minY = H * 0.5;
        const maxY = H - f.fs - 10;
        if (f.y < minY) f.y = minY + Math.random() * 20;
        if (f.y > maxY) f.y = maxY - Math.random() * 20;

        // rotation based on direction
        const rot = Math.atan2(f.vy, f.vx) * (180 / Math.PI);
        f.el.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${rot}deg)`;
      });
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // init fish after small delay so layout stabilizes
  setTimeout(initFish, 300);
});
