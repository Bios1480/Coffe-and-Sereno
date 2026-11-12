const canvas = document.getElementById('hero-background');
const ctx = canvas.getContext('2d');
const video = document.getElementById('hero-video-source');

let animationFrameId = null;


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    if (video.readyState >= 2) {
        drawVideoFrame();
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawVideoFrame() {

    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const videoRatio = video.videoWidth / video.videoHeight;
    const canvasRatio = canvas.width / canvas.height;

    let renderWidth, renderHeight, xOffset, yOffset;

    if (canvasRatio > videoRatio) {
        renderWidth = canvas.width;
        renderHeight = canvas.width / videoRatio;
        xOffset = 0;
        yOffset = (canvas.height - renderHeight) / 2;
    } else {
        renderWidth = canvas.height * videoRatio;
        renderHeight = canvas.height;
        xOffset = (canvas.width - renderWidth) / 2;
        yOffset = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(video, xOffset, yOffset, renderWidth, renderHeight);
}

function renderLoop() {
    drawVideoFrame();
    animationFrameId = requestAnimationFrame(renderLoop);
}

video.addEventListener('play', () => {
    if (!animationFrameId) {
        renderLoop();
    }
});

video.addEventListener('pause', () => {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
});


if (!video.paused) {
    renderLoop();
}

window.addEventListener('load', () => {
    resizeCanvas();
});

// header responsive
const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
const navMobile = document.getElementById("navMobile");

window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
}, { passive: true });

navToggle.addEventListener("click", () => navMobile.classList.toggle("open"));
navMobile.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navMobile.classList.remove("open")));




window.addEventListener('DOMContentLoaded', () => {
    const heroTexts = document.querySelectorAll('.reveal-text');

    setTimeout(() => {
        heroTexts.forEach(text => {
            text.classList.add('loaded');
        });
    }, 100);
});

const heroContent = document.querySelector('.hero-content');

const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            heroContent.style.opacity = "1";
            heroContent.style.transform = "translateY(0)";
        } else {
            heroContent.style.opacity = "0";
            heroContent.style.transform = "translateY(-20px)"; 
        }
    });
}, { threshold: 0.1 });

heroObserver.observe(heroContent);


const initMobileMenu = () => {
    const btnOpen = document.querySelector('#menu-open');
    const btnClose = document.querySelector('#menu-close');
    const menu = document.querySelector('#nav-menu');

    if (btnOpen && menu) {
        btnOpen.onclick = (e) => {
            e.preventDefault();
            menu.classList.add('active');
            document.body.style.overflow = 'hidden'; 
            console.log("Menú abierto correctamente");
        };
    }

    if (btnClose && menu) {
        btnClose.onclick = (e) => {
            e.preventDefault();
            menu.classList.remove('active');
            document.body.style.overflow = 'auto'; 
        };
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}

const track = document.getElementById('track');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

let index = 0;

function getCarouselStep() {
    const firstProduct = track?.querySelector('.product:not(.product-more)');
    return firstProduct ? firstProduct.offsetWidth + parseFloat(getComputedStyle(track).gap) : 0;
}

function getCarouselLimit() {
    return track ? Math.max(0, track.scrollWidth - track.parentElement.clientWidth) : 0;
}

function renderCarouselPosition() {
    if (track) track.style.transform = `translateX(${-index}px)`;
}

if (track && nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
        const maxScroll = getCarouselLimit();
        index = index >= maxScroll ? 0 : Math.min(index + getCarouselStep(), maxScroll);
        renderCarouselPosition();
    });

    prevBtn.addEventListener('click', () => {
        const maxScroll = getCarouselLimit();
        index = index <= 0 ? maxScroll : Math.max(index - getCarouselStep(), 0);
        renderCarouselPosition();
    });

    window.addEventListener('resize', () => {
        index = Math.min(index, getCarouselLimit());
        renderCarouselPosition();
    });
}

const observeSection = () => {
    const section = document.querySelector('.anatomy-section');

    const options = {
        root: null,
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, options);

    observer.observe(section);
};


observeSection();

document.querySelectorAll('.hotspot').forEach(hotspot => {
    hotspot.addEventListener('click', event => {
        event.stopPropagation();
        const shouldOpen = !hotspot.classList.contains('active');

        document.querySelectorAll('.hotspot').forEach(item => {
            item.classList.remove('active');
            item.setAttribute('aria-expanded', 'false');
        });

        hotspot.classList.toggle('active', shouldOpen);
        hotspot.setAttribute('aria-expanded', String(shouldOpen));
    });
});

document.addEventListener('click', event => {
    if (event.target.closest('.hotspot')) return;
    document.querySelectorAll('.hotspot.active').forEach(hotspot => {
        hotspot.classList.remove('active');
        hotspot.setAttribute('aria-expanded', 'false');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const loginNavBtn = document.getElementById('loginNavBtn');
    const userAccountContainer = document.getElementById('userAccountContainer');
    const accountToggleBtn = document.getElementById('accountToggleBtn');
    const accountDropdown = document.getElementById('accountDropdown');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    const accountStatusMessage = document.getElementById('accountStatusMessage');
    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
    
    const mobileLoginLink = document.getElementById('mobileLoginLink');

    const renderAccount = user => {
        if (user.email) {
            if (loginNavBtn) loginNavBtn.classList.add('hidden');
            if (accountStatusMessage) accountStatusMessage.classList.add('hidden');
            if (userAccountContainer) userAccountContainer.classList.remove('hidden');
            if (dropdownUserName) dropdownUserName.textContent = user.name;
            if (dropdownUserEmail) dropdownUserEmail.textContent = user.email;

            if (mobileLoginLink) mobileLoginLink.classList.add('hidden');
        } else {
            if (loginNavBtn) loginNavBtn.classList.remove('hidden');
            if (userAccountContainer) userAccountContainer.classList.add('hidden');
            if (mobileLoginLink) mobileLoginLink.classList.remove('hidden');
            if (sessionStorage.getItem('cafeLoggedOut') === 'true' && accountStatusMessage) {
                accountStatusMessage.classList.remove('hidden');
            }
        }
    };

    const savedUserEmail = localStorage.getItem('cafeUserEmail');
    const savedUserName = localStorage.getItem('cafeUserName') || savedUserEmail;
    renderAccount({ email: savedUserEmail, name: savedUserName });

    if (accountToggleBtn) {
        accountToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            accountDropdown.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', (e) => {
        if (accountDropdown && !accountDropdown.contains(e.target) && e.target !== accountToggleBtn) {
            accountDropdown.classList.add('hidden');
        }
    });

    const handleLogout = () => {
        localStorage.removeItem('cafeUserEmail');
        sessionStorage.setItem('cafeLoggedOut', 'true');
        window.location.reload();
    };

    if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', handleLogout);
}); 