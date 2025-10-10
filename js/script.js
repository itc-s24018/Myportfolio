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
});
