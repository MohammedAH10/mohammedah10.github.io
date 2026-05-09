/* =============================================
   SHARED APP JAVASCRIPT
   Mohammed Ahmed Hassan — Portfolio & Blog
   ============================================= */

(function () {

    /* ---- STARFIELD + SHOOTING STARS ---- */
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const STAR_COUNT = 320;
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x:            Math.random(),
            y:            Math.random(),
            r:            Math.random() * 1.4 + 0.2,
            alpha:        Math.random() * 0.6 + 0.2,
            twinkleSpeed: Math.random() * 0.015 + 0.003,
            twinklePhase: Math.random() * Math.PI * 2
        });
    }

    class ShootingStar {
        constructor() { this.reset(); }
        reset() {
            this.x      = Math.random() * canvas.width;
            this.y      = Math.random() * canvas.height * 0.4;
            this.len    = Math.random() * 180 + 80;
            this.speed  = Math.random() * 6 + 4;
            this.angle  = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
            this.opacity = 0;
            this.phase  = 'fade-in';
            this.delay  = Math.random() * 800;
            this.active = false;
            this._timer = 0;
        }
        update(dt) {
            if (!this.active) {
                this._timer += dt;
                if (this._timer > this.delay) { this.active = true; this._timer = 0; }
                return;
            }
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (this.phase === 'fade-in') {
                this.opacity += 0.04;
                if (this.opacity >= 1) this.phase = 'full';
            } else if (this.phase === 'full') {
                this._timer += dt;
                if (this._timer > 80) this.phase = 'fade-out';
            } else {
                this.opacity -= 0.025;
                if (this.opacity <= 0) this.reset();
            }
        }
        draw(ctx) {
            if (!this.active || this.opacity <= 0) return;
            const grad = ctx.createLinearGradient(
                this.x, this.y,
                this.x - Math.cos(this.angle) * this.len,
                this.y - Math.sin(this.angle) * this.len
            );
            grad.addColorStop(0, `rgba(220, 235, 255, ${this.opacity})`);
            grad.addColorStop(1, 'rgba(120, 160, 255, 0)');
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x - Math.cos(this.angle) * this.len,
                this.y - Math.sin(this.angle) * this.len
            );
            ctx.strokeStyle = grad;
            ctx.lineWidth   = 1.5;
            ctx.stroke();
        }
    }

    const shooters = Array.from({ length: 6 }, () => new ShootingStar());

    let last = performance.now();
    function tick(now) {
        const dt = now - last; last = now;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const t = now * 0.001;
        stars.forEach(s => {
            const alpha = s.alpha * (0.6 + 0.4 * Math.sin(t * s.twinkleSpeed * 30 + s.twinklePhase));
            ctx.beginPath();
            ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(210, 225, 255, ${alpha})`;
            ctx.fill();
        });

        shooters.forEach(s => { s.update(dt); s.draw(ctx); });
        shooters.forEach(s => {
            if (s.active && s.opacity <= 0 && Math.random() < 0.003) s.reset();
        });

        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    /* ---- SCROLL REVEAL ---- */
    const reveals  = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));

    /* ---- HAMBURGER MENU ---- */
    const hamburger    = document.getElementById('hamburger');
    const navLinks     = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-link');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('click', (e) => {
            if (
                navLinks.classList.contains('open') &&
                !navLinks.contains(e.target) &&
                !hamburger.contains(e.target)
            ) {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    /* ---- SMOOTH SCROLL (same-page anchors only) ---- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    /* ---- ACTIVE NAV LINK ---- */
    (function setActiveNav() {
        const path = window.location.pathname;
        document.querySelectorAll('.nav-links a').forEach(a => {
            const href = a.getAttribute('href');
            // match /blog.html, /blog, blog.html, blog — any variant
            const aPage = href.replace(/^\//, '').replace(/\.html$/, '') || 'index';
            const curPage = path.replace(/^\//, '').replace(/\.html$/, '') || 'index';
            if (
                aPage === curPage ||
                (aPage === 'index' && (curPage === '' || curPage === 'index'))
            ) {
                a.classList.add('active');
            }
        });
    })();

    /* ---- BLOG FILTER (only active on blog.html) ---- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const postCards  = document.querySelectorAll('.post-card[data-category]');

    if (filterBtns.length && postCards.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const selected = btn.dataset.filter;
                postCards.forEach(card => {
                    const show = selected === 'all' || card.dataset.category === selected;
                    card.style.display = show ? '' : 'none';
                });
            });
        });
    }

})();
