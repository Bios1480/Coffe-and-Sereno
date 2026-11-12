
let allProducts = [];
let currentSort = 'newest';

document.addEventListener('DOMContentLoaded', () => {
    initAnimatedBackground();
    fetchAndRenderProducts();
    initProductFilters();
    initNavbar();
    initHeroText();
});

function initAnimatedBackground() {
    const canvas = document.getElementById('hero-background');
    const video = document.getElementById('hero-video-source');
    const context = canvas?.getContext('2d');
    if (!canvas || !video || !context) return;

    let animationFrameId = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawVideoFrame();
    }

    function drawVideoFrame() {
        if (!video.videoWidth || !video.videoHeight) return;

        const videoRatio = video.videoWidth / video.videoHeight;
        const canvasRatio = canvas.width / canvas.height;
        let renderWidth;
        let renderHeight;
        let xOffset;
        let yOffset;

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

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(video, xOffset, yOffset, renderWidth, renderHeight);
    }

    function renderLoop() {
        drawVideoFrame();
        animationFrameId = requestAnimationFrame(renderLoop);
    }

    video.addEventListener('play', () => {
        if (!animationFrameId) renderLoop();
    });
    video.addEventListener('pause', () => {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    });
    video.addEventListener('loadeddata', drawVideoFrame);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    if (!video.paused) renderLoop();
}

async function fetchAndRenderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    try {
        const response = await fetch('index.html');
        if (!response.ok) throw new Error('No se pudo cargar el catálogo principal.');
        const homeMarkup = await response.text();
        const homeDocument = new DOMParser().parseFromString(homeMarkup, 'text/html');
        const homeCards = [...homeDocument.querySelectorAll('#track .product:not(.product-more)')];

        allProducts = homeCards.map(card => {
            const priceText = card.querySelector('.product-content footer p')?.textContent || '';
            return {
                title: card.querySelector('.product-content h2')?.textContent.trim() || '',
                description: card.querySelector('.product-content header p')?.textContent.trim() || '',
                price: Number(priceText.replace(/[^\d.]/g, '')),
                image: card.querySelector('.product-image img')?.getAttribute('src') || '',
                category: card.dataset.category || '',
                tags: (card.dataset.tags || '').split(/\s+/).filter(Boolean),
                rating: Number(card.dataset.rating || 0)
            };
        }).filter(product => product.title && Number.isFinite(product.price));

        if (!allProducts.length) throw new Error('No se encontraron productos en index.html.');
        applyProductFilters();
    } catch (error) {
        console.error('Error al obtener productos:', error);
        container.textContent = 'No se pudieron cargar los productos en este momento.';
    }
}

function normalizeText(value) {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function initProductFilters() {
    const searchInput = document.getElementById('productSearch');
    const minInput = document.querySelector('.thumb-left');
    const maxInput = document.querySelector('.thumb-right');
    const selectedTags = document.getElementById('selectedTags');
    const availableTags = document.getElementById('availableTags');
    const showTagsButton = document.getElementById('showTagsBtn');
    const sortButtons = document.querySelectorAll('.sort-options .sort-btn');

    searchInput?.addEventListener('input', applyProductFilters);
    minInput?.addEventListener('input', () => updatePriceRange(minInput, maxInput));
    maxInput?.addEventListener('input', () => updatePriceRange(minInput, maxInput));

    document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', applyProductFilters);
    });

    selectedTags?.addEventListener('click', event => {
        if (!event.target.closest('.tag-remove')) return;
        event.target.closest('.tag').remove();
        renderAvailableTags();
        applyProductFilters();
    });

    availableTags?.addEventListener('click', event => {
        const tagButton = event.target.closest('[data-available-tag]');
        if (!tagButton) return;
        addSelectedTag(tagButton.dataset.availableTag, tagButton.textContent);
        renderAvailableTags();
        applyProductFilters();
    });

    showTagsButton?.addEventListener('click', () => {
        const isExpanded = showTagsButton.getAttribute('aria-expanded') === 'true';
        availableTags.hidden = isExpanded;
        showTagsButton.setAttribute('aria-expanded', String(!isExpanded));
    });

    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentSort = button.dataset.sort;
            sortButtons.forEach(sortButton => {
                const isActive = sortButton === button;
                sortButton.classList.toggle('active', isActive);
                sortButton.setAttribute('aria-pressed', String(isActive));
            });
            applyProductFilters();
        });
    });

    updatePriceRange(minInput, maxInput);
    renderAvailableTags();
}

function renderAvailableTags() {
    const availableTags = document.getElementById('availableTags');
    const showTagsButton = document.getElementById('showTagsBtn');
    const selectedTagIds = new Set([...document.querySelectorAll('#selectedTags .tag')]
        .map(tag => tag.dataset.tag));
    const keywords = [
        { id: 'moido', label: 'Moido' },
        { id: 'extracao', label: 'Extração' },
        { id: 'aromatico', label: 'Aromático' }
    ];
    const remainingTags = keywords.filter(keyword => !selectedTagIds.has(keyword.id));
    const wasExpanded = showTagsButton.getAttribute('aria-expanded') === 'true';

    availableTags.replaceChildren();
    remainingTags.forEach(keyword => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'available-tag';
        button.dataset.availableTag = keyword.id;
        button.textContent = keyword.label;
        availableTags.appendChild(button);
    });

    showTagsButton.hidden = remainingTags.length === 0;
    if (!remainingTags.length) {
        availableTags.hidden = true;
        showTagsButton.setAttribute('aria-expanded', 'false');
    } else {
        availableTags.hidden = !wasExpanded;
    }
}

function addSelectedTag(tagId, label) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.dataset.tag = tagId;
    tag.appendChild(document.createTextNode(label));

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'tag-remove';
    removeButton.setAttribute('aria-label', `Remover ${label}`);
    removeButton.textContent = '×';
    tag.appendChild(removeButton);
    document.getElementById('selectedTags').appendChild(tag);
}

function updatePriceRange(minInput, maxInput) {
    if (!minInput || !maxInput) return;

    let minValue = Number(minInput.value);
    let maxValue = Number(maxInput.value);
    const minGap = 5;

    if (maxValue - minValue < minGap) {
        if (document.activeElement === minInput) {
            minValue = maxValue - minGap;
            minInput.value = String(minValue);
        } else {
            maxValue = minValue + minGap;
            maxInput.value = String(maxValue);
        }
    }

    document.getElementById('price-range-label').textContent = `$${minValue}-${maxValue}`;
    const maxRange = Number(maxInput.max);
    const track = document.querySelector('.slider-track');
    track.style.left = `${(minValue / maxRange) * 100}%`;
    track.style.right = `${100 - (maxValue / maxRange) * 100}%`;
    applyProductFilters();
}

function applyProductFilters() {
    if (!allProducts.length) return;

    const searchValue = normalizeText(document.getElementById('productSearch')?.value || '');
    const selectedCategories = [...document.querySelectorAll('.checkbox-item input:checked')]
        .map(input => input.dataset.category);
    const selectedTags = [...document.querySelectorAll('.tags-container .tag')]
        .map(tag => tag.dataset.tag);
    const minPrice = Number(document.querySelector('.thumb-left')?.value || 0);
    const maxPrice = Number(document.querySelector('.thumb-right')?.value || 100);

    const filteredProducts = allProducts.filter(product => {
        const searchableText = normalizeText(`${product.title} ${product.description}`);
        const matchesSearch = searchableText.includes(searchValue);
        const matchesCategory = selectedCategories.includes(product.category);
        const matchesTag = !selectedTags.length || selectedTags.some(tag => product.tags?.includes(tag));
        return matchesSearch && matchesCategory && matchesTag && product.price >= minPrice && product.price <= maxPrice;
    });

    const sorters = {
        newest: () => 0,
        'price-asc': (first, second) => first.price - second.price,
        'price-desc': (first, second) => second.price - first.price,
        rating: (first, second) => second.rating - first.rating
    };

    filteredProducts.sort(sorters[currentSort] || sorters.newest);
    renderGrid(filteredProducts);
}

function renderGrid(productsList) {
    const targetContainer = document.getElementById('products-container');
    const resultsMessage = document.getElementById('product-results');
    const template = document.getElementById('product-card-template');
    targetContainer.replaceChildren();
    resultsMessage.textContent = `${productsList.length} produtos encontrados`;

    if (!productsList.length) {
        targetContainer.innerHTML = '<p class="empty-products">Nenhum produto encontrado.</p>';
        return;
    }

    productsList.forEach(product => {
        const cardClone = template.content.cloneNode(true);
        const image = cardClone.querySelector('.product-image img');
        const actionButton = cardClone.querySelector('.product-footer button');

        image.src = product.image;
        image.alt = product.title;
        cardClone.querySelector('.product-title').textContent = product.title;
        cardClone.querySelector('.product-description').textContent = product.description;
        cardClone.querySelector('.product-price').textContent = `$${product.price.toFixed(2)}`;
        actionButton.dataset.cartAdd = '';
        actionButton.dataset.productName = product.title;
        actionButton.dataset.productPrice = product.price;
        actionButton.dataset.productImage = product.image;
        targetContainer.appendChild(cardClone);
    });
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMobile = document.getElementById('navMobile');

    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });

    navToggle?.addEventListener('click', () => {
        const isOpen = navMobile.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMobile?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navMobile.classList.remove('open'));
    });
}

function initHeroText() {
    const heroTexts = document.querySelectorAll('.reveal-text');
    window.setTimeout(() => {
        heroTexts.forEach(text => text.classList.add('loaded'));
    }, 100);
}
