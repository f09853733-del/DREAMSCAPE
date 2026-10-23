
/* DREAMSCAPE — repaired image fallback and interactions */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));


/* 1. Built-in dreamscape artwork: no external image required */

function makeDreamImage(index = 0) {
  const palettes = [
    ["#100d24", "#573c91", "#ffb6f2", "#302052"],
    ["#10203d", "#4b6ca8", "#c5d8ff", "#213354"],
    ["#241238", "#9057a8", "#ffd0e8", "#43204f"],
    ["#0b2835", "#267b83", "#b6fff1", "#164451"],
    ["#10271f", "#4c886b", "#d5ffb0", "#234b3b"],
    ["#100d35", "#7543ab", "#f5a6ff", "#2a205a"],
    ["#16213e", "#6689b8", "#fff0c4", "#263d69"],
    ["#301635", "#a65f94", "#ffd0a6", "#542a54"]
  ];

  const p = palettes[index % palettes.length];

  const stars = [
    [80, 80], [180, 140], [320, 65], [445, 160],
    [540, 75], [735, 120], [820, 65], [790, 260],
    [230, 250], [610, 220], [400, 300], [120, 330],
    [330, 210], [860, 180], [70, 260]
  ].map(([x, y], i) =>
    `<circle cx="${x}" cy="${y}" r="${i % 3 + 1}"
      fill="#fff" opacity=".85"/>`
  ).join("");

  const scenery = [
    `<path d="M0 430 L170 230 320 420 480 260
      680 450 810 300 900 400 V600 H0Z"
      fill="${p[3]}"/>
     <path d="M0 490 Q180 360 350 480
      T700 460 T900 430 V600 H0Z" fill="${p[1]}"/>
     <path d="M0 540 Q200 460 400 535
      T900 510 V600 H0Z" fill="${p[0]}"/>`,

    `<path d="M0 470 L130 350 260 460 390 330
      550 460 710 330 900 455 V600 H0Z"
      fill="${p[3]}"/>
     <path d="M360 365 V245 H410 V365
      M420 365 V210 H470 V365
      M480 365 V260 H520 V365" fill="${p[2]}"/>
     <path d="M350 250 L385 195 420 250
      M410 215 L445 150 480 215
      M470 265 L500 215 530 265" fill="${p[2]}"/>`,

    `<path d="M0 440 L130 240 260 440
      L370 280 510 455 660 220 820 445
      900 340 V600 H0Z" fill="${p[3]}"/>
     <g fill="${p[2]}">
       <path d="M90 470 L145 300 200 470Z"/>
       <path d="M210 485 L265 325 320 485Z"/>
       <path d="M680 470 L735 290 790 470Z"/>
       <path d="M770 475 L825 320 880 475Z"/>
     </g>`,

    `<path d="M0 470 Q170 400 330 470
      T650 460 T900 450 V600 H0Z" fill="${p[3]}"/>
     <g fill="${p[2]}">
       <circle cx="150" cy="450" r="18"/>
       <circle cx="220" cy="500" r="13"/>
       <circle cx="690" cy="460" r="19"/>
       <circle cx="780" cy="510" r="14"/>
       <circle cx="530" cy="480" r="12"/>
     </g>
     <g fill="#fff1fa">
       <circle cx="150" cy="450" r="6"/>
       <circle cx="220" cy="500" r="5"/>
       <circle cx="690" cy="460" r="6"/>
       <circle cx="780" cy="510" r="5"/>
     </g>`
  ];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 900 600">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="${p[0]}"/>
          <stop offset="1" stop-color="${p[1]}"/>
        </linearGradient>
        <radialGradient id="glow">
          <stop stop-color="${p[2]}" stop-opacity=".85"/>
          <stop offset="1" stop-color="${p[2]}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="900" height="600" fill="url(#sky)"/>
      <circle cx="675" cy="180" r="190" fill="url(#glow)"/>
      <circle cx="675" cy="180" r="48" fill="${p[2]}"/>
      ${stars}
      ${scenery[index % scenery.length]}
      <rect width="900" height="600" fill="none"
        stroke="#ffffff" stroke-opacity=".08" stroke-width="2"/>
    </svg>`;

  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg);
}


/* 2. Hide the opening screen */

function hideDreamLoader() {
  const loader = $("#loader");
  if (loader) loader.classList.add("done");
}

window.addEventListener("load", hideDreamLoader, { once: true });
window.setTimeout(hideDreamLoader, 1800);


/* 3. Images: original -> fallback -> built-in artwork */

$$("img").forEach((img, index) => {
  let fallbackTried = false;
  let localArtworkApplied = false;

  function showLocalArtwork() {
    if (localArtworkApplied) return;

    localArtworkApplied = true;
    img.dataset.localArtwork = "true";
    img.style.display = "block";
    img.style.visibility = "visible";
    img.style.opacity = "1";
    img.removeAttribute("srcset");
    img.src = makeDreamImage(index);

    if (img.classList.contains("hero-image")) {
      const hero = $(".hero");

      if (hero) {
        hero.style.background =
          "radial-gradient(ellipse at 65% 30%, #81559e, transparent 48%), " +
          "linear-gradient(135deg, #171c45, #38234e)";
      }
    }
  }

  function repairImage() {
    if (localArtworkApplied) return;

    const fallback = img.dataset.fallback;

    if (!fallbackTried && fallback) {
      fallbackTried = true;
      img.src = fallback;
      return;
    }

    showLocalArtwork();
  }

  img.addEventListener("error", repairImage);

  if (img.complete && img.naturalWidth === 0) {
    repairImage();
  }
});


/* 4. Gallery category filters */

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

      if (matches) count++;
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


/* 5. Favorite hearts */

$$(".favorite").forEach((button) => {
  button.addEventListener("click", () => {
    const liked = button.classList.toggle("liked");

    button.textContent = liked ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(liked));
  });
});


/* 6. Reveal sections on scroll */

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


/* 7. Highlight navigation while scrolling */

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


/* 8. Back-to-top button */

const backTop = $("#backTop");

function updateBackTop() {
  if (backTop) {
    backTop.classList.toggle("visible", window.scrollY > 450);
  }
}

window.addEventListener("scroll", updateBackTop, { passive: true });
updateBackTop();

if (backTop) {
  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


/* 9. Automatic copyright year */

const year = $("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}


/* 10. Decorative stars */

const starField = $(".stars");

if (starField && !starField.children.length) {
  for (let i = 0; i < 56; i++) {
    const star = document.createElement("span");

    star.className = "star-dot";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty(
      "--duration",
      `${2.5 + Math.random() * 4}s`
    );
    star.style.animationDelay = `${Math.random() * -5}s`;
    star.style.width = `${1 + Math.random() * 2}px`;
    star.style.height = star.style.width;

    starField.appendChild(star);
  }
}


/* 11. Cursor glow */

const cursorGlow = $(".cursor-glow");

if (cursorGlow) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });
}
