const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuBtn");
const typingEl = document.getElementById("typing");
const yearEl = document.getElementById("year");
const themeToggleBtn = document.getElementById("themeToggle");
const themeKey = "portfolio-theme";

if (menuBtn && nav) {
	menuBtn.addEventListener("click", () => {
		const isOpen = nav.classList.toggle("nav-open");
		menuBtn.setAttribute("aria-expanded", String(isOpen));
	});

	nav.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", () => {
			nav.classList.remove("nav-open");
			menuBtn.setAttribute("aria-expanded", "false");
		});
	});
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener("click", (event) => {
		const targetId = anchor.getAttribute("href");
		if (!targetId || targetId === "#") {
			return;
		}

		const target = document.querySelector(targetId);
		if (!target) {
			return;
		}

		event.preventDefault();
		target.scrollIntoView({ behavior: "smooth", block: "start" });
		history.replaceState(null, "", targetId);
	});
});

if (yearEl) {
	yearEl.textContent = new Date().getFullYear();
}

function applyTheme(mode) {
	const isLight = mode === "light";
	document.body.classList.toggle("light-mode", isLight);
	if (themeToggleBtn) {
		themeToggleBtn.setAttribute("aria-pressed", String(isLight));
		themeToggleBtn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
	}
}

const savedTheme = localStorage.getItem(themeKey) || "dark";
applyTheme(savedTheme);

if (themeToggleBtn) {
	themeToggleBtn.addEventListener("click", () => {
		const nextTheme = document.body.classList.contains("light-mode") ? "dark" : "light";
		applyTheme(nextTheme);
		localStorage.setItem(themeKey, nextTheme);
	});
}

const heroTitles = ["I am a CSE Student at AIUB", "I am a Competitive Programmer", "I am an AI/ML Engineer", "I am an Aspiring Software Engineer"];

const certGrid = document.querySelector("#certifications .cert-grid");
const certLightbox = document.getElementById("certLightbox");
const certLightboxImage = document.getElementById("certLightboxImage");
const certLightboxCaption = document.getElementById("certLightboxCaption");

if (certGrid) {
	const certificateAssets = [
		...Array.from({ length: 34 }, (_, i) => ({ number: i + 1, path: `../images/Certificate/${i + 1}.png` })),
		{ number: 36, path: "../images/Certificate/36.png" },
		{ number: 37, path: "../images/Certificate/37.png" },
		{ number: 38, path: "../images/Certificate/38.png" },
		{ number: 39, path: "../images/Certificate/39.jpg" },
		{ number: 40, path: "../images/Certificate/40.jpg" },
		{ number: 41, path: "../images/Certificate/41.png" }
	];

	const commonCertificateTitle = "Professional Certificate";

	const sortedCertificates = certificateAssets
		.map((item) => {
			return {
				...item,
				title: commonCertificateTitle,
				priority: item.number
			};
		})
		.sort((a, b) => {
			if (a.priority !== b.priority) {
				return a.priority - b.priority;
			}
			return a.number - b.number;
		});

	certGrid.innerHTML = sortedCertificates
		.map((item, index) => {
			const serial = String(index + 1).padStart(2, "0");
			const displayName = item.path.split("/").pop() || "course-file";
			const escapedTitle = item.title.replace(/"/g, "&quot;");
			return `
			<article class="cert-card">
				<div class="cert-card-top">
					<div class="cert-title-block">
						<h3 class="cert-course-title">${item.title}</h3>
					</div>
					<span class="cert-year">#${serial}</span>
				</div>
				<a class="cert-preview" href="${item.path}" data-cert-title="${escapedTitle}">
					<img src="${item.path}" alt="${item.title} preview (${displayName})">
				</a>
				<a class="cert-link" href="${item.path}" data-cert-title="${escapedTitle}">View</a>
			</article>`;
		})
		.join("");

	if (certLightbox && certLightboxImage && certLightboxCaption) {
		const closeCertificatePreview = () => {
			certLightbox.hidden = true;
			certLightbox.setAttribute("aria-hidden", "true");
			document.body.classList.remove("cert-modal-open");
			certLightboxImage.removeAttribute("src");
		};

		const openCertificatePreview = (imagePath, title) => {
			certLightboxImage.src = imagePath;
			certLightboxImage.alt = `${title} certificate preview`;
			certLightboxCaption.textContent = title;
			certLightbox.hidden = false;
			certLightbox.setAttribute("aria-hidden", "false");
			document.body.classList.add("cert-modal-open");
		};

		certGrid.addEventListener("click", (event) => {
			const trigger = event.target.closest(".cert-preview, .cert-link");
			if (!trigger) return;

			event.preventDefault();
			const imagePath = trigger.getAttribute("href");
			const title = trigger.getAttribute("data-cert-title") || "Certificate";

			if (imagePath) {
				openCertificatePreview(imagePath, title);
			}
		});

		certLightbox.addEventListener("click", (event) => {
			if (event.target.closest("[data-cert-close]")) {
				closeCertificatePreview();
			}
		});

		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && !certLightbox.hidden) {
				closeCertificatePreview();
			}
		});
	}
}

const revealTargets = document.querySelectorAll("section .project, section .toolkit-card, section .research-card, section .experience-card, section .about-stats article, section .award-card, section .cert-card");

if ("IntersectionObserver" in window) {
	const revealObserver = new IntersectionObserver(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("in-view");
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.15 }
	);

	revealTargets.forEach((target) => {
		target.classList.add("reveal");
		revealObserver.observe(target);
	});
}

const hero = document.querySelector(".hero");
const heroMedia = document.querySelector(".hero-media");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function startHeroTitleRotation() {
	if (!typingEl || !heroTitles.length) return;

	if (prefersReducedMotion) {
		typingEl.textContent = heroTitles[0];
		return;
	}

	let titleIndex = 0;
	let charIndex = 0;
	let isDeleting = false;

	const tick = () => {
		const currentTitle = heroTitles[titleIndex];
		typingEl.textContent = currentTitle.slice(0, charIndex);

		if (!isDeleting && charIndex < currentTitle.length) {
			charIndex += 1;
			setTimeout(tick, 65);
			return;
		}

		if (!isDeleting && charIndex === currentTitle.length) {
			isDeleting = true;
			setTimeout(tick, 1100);
			return;
		}

		if (isDeleting && charIndex > 0) {
			charIndex -= 1;
			setTimeout(tick, 35);
			return;
		}

		isDeleting = false;
		titleIndex = (titleIndex + 1) % heroTitles.length;
		setTimeout(tick, 180);
	};

	tick();
}

startHeroTitleRotation();

if (hero && heroMedia && !prefersReducedMotion) {
	hero.addEventListener("mousemove", (event) => {
		const rect = hero.getBoundingClientRect();
		const px = (event.clientX - rect.left) / rect.width - 0.5;
		const py = (event.clientY - rect.top) / rect.height - 0.5;
		heroMedia.style.transform = `translate(${px * 10}px, ${py * 10}px)`;
	});

	hero.addEventListener("mouseleave", () => {
		heroMedia.style.transform = "translate(0, 0)";
	});
}

const skillFilterButtons = document.querySelectorAll(".skill-filter-btn");
const toolkitCards = document.querySelectorAll(".toolkit-card");
const publicationCards = document.querySelectorAll(".research-card");

if (toolkitCards.length) {
	toolkitCards.forEach((card, cardIndex) => {
		card.style.setProperty("--skill-index", String(cardIndex));
		const logos = card.querySelectorAll(".skill-logo-item");
		logos.forEach((logo, logoIndex) => {
			logo.style.setProperty("--logo-index", String(logoIndex));
		});
	});
}

if (skillFilterButtons.length && toolkitCards.length) {
	skillFilterButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const filter = button.dataset.skillFilter;

			skillFilterButtons.forEach((btn) => btn.classList.remove("active"));
			button.classList.add("active");

			toolkitCards.forEach((card) => {
				const group = card.dataset.skillGroup;
				const isMatch = filter === "all" || group === filter;
				card.classList.toggle("is-muted", !isMatch);
			});
		});
	});
}

if (!prefersReducedMotion) {
	toolkitCards.forEach((card) => {
		card.addEventListener("mousemove", (event) => {
			const rect = card.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width - 0.5;
			const y = (event.clientY - rect.top) / rect.height - 0.5;
			card.style.transform = `perspective(700px) rotateX(${y * -5}deg) rotateY(${x * 6}deg)`;
		});

		card.addEventListener("mouseleave", () => {
			card.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg)";
		});
	});
}

if (!prefersReducedMotion) {
	publicationCards.forEach((card) => {
		card.addEventListener("mousemove", (event) => {
			const rect = card.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width - 0.5;
			const y = (event.clientY - rect.top) / rect.height - 0.5;
			card.style.transform = `perspective(700px) rotateX(${y * -4}deg) rotateY(${x * 5}deg)`;
		});

		card.addEventListener("mouseleave", () => {
			card.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg)";
		});
	});
}

const awardCards = document.querySelectorAll(".award-card");

if (!prefersReducedMotion) {
	awardCards.forEach((card) => {
		card.addEventListener("mousemove", (event) => {
			const rect = card.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width - 0.5;
			const y = (event.clientY - rect.top) / rect.height - 0.5;
			card.style.transform = `perspective(700px) rotateX(${y * -4}deg) rotateY(${x * 5}deg) translateY(-5px)`;
		});

		card.addEventListener("mouseleave", () => {
			card.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0)";
		});
	});
}

const energyCanvas = document.querySelector(".energy-canvas");

if (energyCanvas) {
	const ctx = energyCanvas.getContext("2d");
	const motes = [];
	const comets = [];
	const pulseRings = [];
	const moteCount = prefersReducedMotion ? 24 : 62;
	const cometCount = prefersReducedMotion ? 3 : 7;
	const ringCount = 3;

	const resizeEnergyCanvas = () => {
		const rect = energyCanvas.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		energyCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
		energyCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	};

	const makeMote = () => ({
		angle: Math.random() * Math.PI * 2,
		radius: 86 + Math.random() * 156,
		speed: 0.0008 + Math.random() * 0.0024,
		size: 0.9 + Math.random() * 2.5,
		alpha: 0.18 + Math.random() * 0.55,
		phase: Math.random() * Math.PI * 2,
		phaseSpeed: 0.01 + Math.random() * 0.02,
		tone: Math.random() > 0.45 ? "130, 235, 255" : "102, 162, 255"
	});

	const makeComet = () => ({
		angle: Math.random() * Math.PI * 2,
		radius: 112 + Math.random() * 118,
		speed: 0.006 + Math.random() * 0.007,
		tail: 12 + Math.floor(Math.random() * 16),
		size: 1.2 + Math.random() * 1.6,
		tone: Math.random() > 0.5 ? "164, 240, 255" : "125, 186, 255"
	});

	for (let i = 0; i < moteCount; i += 1) motes.push(makeMote());
	for (let i = 0; i < cometCount; i += 1) comets.push(makeComet());
	for (let i = 0; i < ringCount; i += 1) {
		pulseRings.push({
			radius: 94 + i * 24,
			phase: Math.random() * Math.PI * 2,
			speed: 0.015 + i * 0.004
		});
	}

	let time = 0;

	const drawEnergy = () => {
		const w = energyCanvas.clientWidth;
		const h = energyCanvas.clientHeight;
		if (!w || !h) {
			window.requestAnimationFrame(drawEnergy);
			return;
		}

		time += 0.014;
		const cx = w / 2;
		const cy = h / 2;
		ctx.clearRect(0, 0, w, h);

		const bgGlow = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.max(w, h) * 0.48);
		bgGlow.addColorStop(0, "rgba(96, 186, 255, 0.16)");
		bgGlow.addColorStop(0.55, "rgba(38, 109, 218, 0.09)");
		bgGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
		ctx.fillStyle = bgGlow;
		ctx.fillRect(0, 0, w, h);

		for (const ring of pulseRings) {
			ring.phase += ring.speed;
			const wobble = Math.sin(ring.phase + time * 1.8) * 8;
			const radius = ring.radius + wobble;
			const alpha = 0.08 + (Math.sin(ring.phase * 1.4) + 1) * 0.06;
			ctx.beginPath();
			ctx.strokeStyle = `rgba(112, 205, 255, ${alpha.toFixed(3)})`;
			ctx.lineWidth = 1.1;
			ctx.setLineDash([5, 7]);
			ctx.lineDashOffset = -ring.phase * 40;
			ctx.arc(cx, cy, radius, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.setLineDash([]);

		for (const mote of motes) {
			mote.angle += mote.speed;
			mote.phase += mote.phaseSpeed;
			const drift = Math.sin(mote.phase + time) * 18;
			const x = cx + Math.cos(mote.angle) * (mote.radius + drift);
			const y = cy + Math.sin(mote.angle) * (mote.radius * 0.76 + drift);
			const alpha = mote.alpha * (0.75 + (Math.sin(mote.phase + time * 2) + 1) * 0.2);

			ctx.beginPath();
			ctx.fillStyle = `rgba(${mote.tone}, ${alpha.toFixed(3)})`;
			ctx.shadowBlur = 14;
			ctx.shadowColor = `rgba(${mote.tone}, 0.7)`;
			ctx.arc(x, y, mote.size, 0, Math.PI * 2);
			ctx.fill();
		}

		for (const comet of comets) {
			comet.angle += comet.speed;
			const baseX = cx + Math.cos(comet.angle) * comet.radius;
			const baseY = cy + Math.sin(comet.angle) * (comet.radius * 0.72);

			for (let i = comet.tail; i >= 0; i -= 1) {
				const t = i / comet.tail;
				const tx = baseX - Math.cos(comet.angle) * i * 4.2;
				const ty = baseY - Math.sin(comet.angle) * i * 3.1;
				ctx.beginPath();
				ctx.fillStyle = `rgba(${comet.tone}, ${(0.08 + t * 0.6).toFixed(3)})`;
				ctx.shadowBlur = 10;
				ctx.shadowColor = `rgba(${comet.tone}, 0.75)`;
				ctx.arc(tx, ty, comet.size * t + 0.35, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		ctx.shadowBlur = 0;
		window.requestAnimationFrame(drawEnergy);
	};

	resizeEnergyCanvas();
	window.addEventListener("resize", resizeEnergyCanvas);
	drawEnergy();
}

const contactBtns = document.querySelectorAll(".contact-btn");

contactBtns.forEach((btn) => {
	const wrap = btn.querySelector(".contact-icon-wrap");
	if (!wrap) return;
	btn.addEventListener("click", () => {
		const ripple = document.createElement("span");
		ripple.classList.add("contact-ripple");
		wrap.appendChild(ripple);
		setTimeout(() => ripple.remove(), 520);
	});
});