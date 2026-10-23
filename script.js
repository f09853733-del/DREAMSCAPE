
const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

// 1. Loading screen
const loader = $("#loader");

function hideLoader() {
  loader?.classList.add("done");
}

window.addEventListener("load", hideLoader);
setTimeout(hideLoader, 2200);

// 2. Animated background stars
const starField = $(".stars");

if (starField) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 75; i++) {
    const star = document.createElement("span");
    star.className = "star-dot";

    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;

    const size = Math.random() * 2.5 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.setProperty(
      "--duration",
      `${2 + Math.random() * 5}s`
    );
    star.style.animationDelay = `${Math.random() * -6}s`;

    fragment.appendChild(star);
  }

  starField.appendChild(fragment);
}

// 3. Cursor glow (desktop only)
const cursorGlow = $(".cursor-glow");

if (cursorGlow && window.matchMedia(
  "(hover: hover) and (pointer: fine)"
).matches) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
}

// 4. Reliable image fallback
$$("img[data-fallback]").forEach((img) => {
  let triedFallback = false;

  img.addEventListener("error", () => {
    if (!triedFallback) {
      triedFallback = true;

      const fallback = img.dataset.fallback;

      if (fallback && img.src !== fallback) {
        img.src = fallback;
        return;
      }
    }

    // Both image URLs failed: keep the card attractive.
    img.style.display = "none";

    const wrap = img.closest(".image-wrap");

    if (wrap) {
      wrap.style.background =
        "radial-gradient(ellipse at 50% 20%, #7754a0, transparent 65%), " +
        "linear-gradient(145deg, #171c45, #38234e)";
    }

    if (img.classList.contains("hero-image")) {
      img.style.display = "block";
      img.style.opacity = "0";

      const hero = $(".hero");

      if (hero) {
        hero.style.background =
          "radial-gradient(ellipse at 65% 30%, #81559e, transparent 45%), " +
          "linear-gradient(135deg, #171c45, #38234e)";
      }
    }
  });

  // Also check images that failed before this listener was attached.
  if (img.complete && img.naturalWidth === 0 && img.src) {
    img.dispatchEvent(new Event("error"));
  }
});

// 5. Gallery category filters
const filterButtons = $$(".filter");
const dreamCards = $$(".dream-card");
const emptyMessage = $(".empty-message");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    let count = 0;

    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    dreamCards.forEach((card) => {
      const matches =
        category === "all" ||
        card.dataset.category === category;

      card.classList.toggle("hidden", !matches);

      if (matches) {
        count++;
      }
    });

    if (emptyMessage) {
      emptyMessage.hidden = count > 0;
    }
  });

  button.setAttribute(
    "aria-pressed",
    String(button.classList.contains("active"))
  );
});

// 6. Favorite hearts
$$(".favorite").forEach((button) => {
  button.addEventListener("click", () => {
    const liked = button.classList.toggle("liked");

    button.textContent = liked ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(liked));
  });
});

// 7. Reveal sections on scroll
const revealElements = $$(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}

// 8. Highlight navigation as sections enter view
const navLinks = $$(".nav-link");
const pageSections = $$("main section[id]");

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          const active =
            link.getAttribute("href") === `#${entry.target.id}`;

          link.classList.toggle("active", active);
        });
      });
    },
    { rootMargin: "-20% 0px -65% 0px" }
  );

  pageSections.forEach((section) => {
    navObserver.observe(section);
  });
}

// 9. Back-to-top button
const backTop = $("#backTop");

function updateBackTop() {
  backTop?.classList.toggle("visible", window.scrollY > 450);
}

window.addEventListener("scroll", updateBackTop, { passive: true });
updateBackTop();

backTop?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

// 10. Automatic copyright year
const year = $("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

document.querySelectorAll("img[data-fallback]").forEach((img) => {
  let fallbackTried = false;

  img.addEventListener("error", () => {
    if (!fallbackTried) {
      fallbackTried = true;
      img.src = img.dataset.fallback;
    } else {
      img.style.visibility = "hidden";

      const container = img.closest(".image-wrap") || img.parentElement;

      if (container) {
        container.style.background =
          "linear-gradient(135deg, #15152f, #704b91, #d18db8)";
      }
    }
  });

  if (img.complete && img.naturalWidth === 0) {
    img.dispatchEvent(new Event("error"));
  }
});

function makeDreamImage(index = 0) {
  const palettes = [
    ["#160f35", "#8055b5", "#f5b5e8"],
    ["#102d45", "#477c9d", "#b7e6ed"],
    ["#20143f", "#a35d91", "#ffc6a6"],
    ["#102e36", "#398477", "#d1e9b0"]
  ];

  const colors = palettes[index % palettes.length];

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 900 600">
    <defs>
      <linearGradient id="sky" x2="0" y2="1">
        <stop stop-color="${colors[0]}"/>
        <stop offset="1" stop-color="${colors[1]}"/>
      </linearGradient>
      <radialGradient id="glow">
        <stop stop-color="${colors[2]}" stop-opacity=".9"/>
        <stop offset="1" stop-color="${colors[2]}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="900" height="600" fill="url(#sky)"/>
    <circle cx="650" cy="180" r="170" fill="url(#glow)"/>
    <circle cx="650" cy="180" r="48"
            fill="${colors[2]}" opacity=".9"/>
    <g fill="#fff5ff" opacity=".85">
      <circle cx="100" cy="90" r="3"/>
      <circle cx="240" cy="180" r="2"/>
      <circle cx="400" cy="80" r="3"/>
      <circle cx="790" cy="90" r="2"/>
      <circle cx="530" cy="250" r="2"/>
      <circle cx="170" cy="300" r="2"/>
      <circle cx="760" cy="350" r="3"/>
    </g>
    <path d="M0 430 L170 230 320 420 480 260
             680 450 810 300 900 400 V600 H0Z"
          fill="${colors[0]}" opacity=".85"/>
    <path d="M0 490 Q180 360 350 480
             T700 460 T900 430 V600 H0Z"
          fill="${colors[1]}"/>
    <path d="M0 540 Q200 460 400 535
             T900 510 V600 H0Z"
          fill="${colors[0]}" opacity=".75"/>
  </svg>`;

  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg);
}

document.querySelectorAll(".hero-image, .image-wrap img")
  .forEach((img, index) => {
    img.addEventListener("error", () => {
      if (img.dataset.dreamFallback) return;

      img.dataset.dreamFallback = "true";
      img.src = makeDreamImage(index);
    });

    if (img.complete && img.naturalWidth === 0) {
      img.src = makeDreamImage(index);
      img.dataset.dreamFallback = "true";
    }
  });


