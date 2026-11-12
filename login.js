document.addEventListener('DOMContentLoaded', () => {
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

    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');

    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden');
        registerSection.classList.remove('hidden');
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const sessionStatusMessage = document.getElementById('sessionStatusMessage');

    const savedUser = localStorage.getItem('cafeUserEmail');
    if (savedUser) {
        mostrarBienvenida(localStorage.getItem('cafeUserName') || savedUser);
    } else if (sessionStorage.getItem('cafeLoggedOut') === 'true') {
        sessionStatusMessage.classList.remove('hidden');
    }

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        localStorage.setItem('cafeUserName', name);
        localStorage.setItem('cafeUserEmail', email);
        localStorage.setItem('cafeUserPassword', password);
        sessionStorage.removeItem('cafeLoggedOut');

        alert('¡Cuenta creada con éxito!');
        mostrarBienvenida(name);
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (email !== localStorage.getItem('cafeUserEmail') || password !== localStorage.getItem('cafeUserPassword')) {
            alert('E-mail ou senha incorretos. Verifique seus dados ou crie uma conta.');
            return;
        }

        const name = localStorage.getItem('cafeUserName') || email;
        sessionStorage.removeItem('cafeLoggedOut');
        mostrarBienvenida(name);
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('cafeUserEmail');
        sessionStorage.setItem('cafeLoggedOut', 'true');
        welcomeMessage.classList.add('hidden');
        loginSection.classList.remove('hidden');
        sessionStatusMessage.classList.remove('hidden');
        loginForm.reset();
        registerForm.reset();
    });

    function mostrarBienvenida(name) {
        loginSection.classList.add('hidden');
        registerSection.classList.add('hidden');
        sessionStatusMessage.classList.add('hidden');
        userEmailDisplay.textContent = name;
        welcomeMessage.classList.remove('hidden');
    }
});