// ============================================
// SAMPLE DATA (Will be replaced by API)
// ============================================

// Testimonials (now from API)
let testimonials = [];
const FAVORITES_STORAGE_KEY = 'vexiloFavorites';
const LIKES_STORAGE_KEY = 'vexiloDesignLikes';
const CART_VISUALS_STORAGE_KEY = 'vexiloCartVisuals';
const CREATOR_POINTS_STORAGE_KEY = 'vexiloCreatorPoints';
const FLAG_REPORTS_STORAGE_KEY = 'vexiloFlagReports';
const homeGridExpandedState = {};

// ============================================
// MODAL Y NOTIFICACIÓN FUNCTIONS
// ============================================

/**
 * Muestra el modal para guardar diseño
 */
function showSaveDesignModal(callback) {
    const modal = document.getElementById('saveDesignModal');
    const form = document.getElementById('saveDesignForm');
    const publishCheckbox = document.getElementById('publishCheckbox');
    const publishOptions = document.getElementById('publishOptions');
    const cancelBtn = document.querySelector('.modal-cancel');
    const closeBtn = document.querySelector('.modal-close');

    if (!modal || !form) return;

    // Reset form
    form.reset();
    publishOptions.hidden = true;

    // Mostrar modal
    modal.hidden = false;

    // Manejar checkbox de publicar
    publishCheckbox.addEventListener('change', () => {
        publishOptions.hidden = !publishCheckbox.checked;
        if (publishCheckbox.checked) {
            document.getElementById('publicNameInput').focus();
        }
    });

    // Manejar submit
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            publish: formData.get('publish') === 'on',
            publicName: formData.get('publicName'),
            publicDescription: formData.get('publicDescription'),
            publicTags: formData.get('publicTags')
        };
        
        modal.hidden = true;
        cleanup();
        if (callback) callback(data);
    };

    const handleCancel = () => {
        modal.hidden = true;
        cleanup();
    };

    const cleanup = () => {
        form.removeEventListener('submit', handleSubmit);
        cancelBtn.removeEventListener('click', handleCancel);
        closeBtn.removeEventListener('click', handleCancel);
        publishCheckbox.removeEventListener('change', null);
    };

    form.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);

    // Auto-fill public name with regular name
    const designNameInput = document.getElementById('designNameInput');
    const publicNameInput = document.getElementById('publicNameInput');
    designNameInput.addEventListener('input', () => {
        if (!publicNameInput.value) {
            publicNameInput.value = designNameInput.value;
        }
    });
}

/**
 * Muestra notificación de éxito
 */
function showSuccessNotification(title, message) {
    const notification = document.getElementById('successNotification');
    const titleEl = document.getElementById('successTitle');
    const messageEl = document.getElementById('successMessage');
    const closeBtn = document.querySelector('.notification-close');

    if (!notification) return;

    titleEl.textContent = title || 'Success!';
    messageEl.textContent = message || 'Your design has been saved';
    notification.hidden = false;

    const hideNotification = () => {
        notification.hidden = true;
        closeBtn.removeEventListener('click', hideNotification);
    };

    closeBtn.addEventListener('click', hideNotification);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.hidden = true;
    }, 5000);
}

// ============================================
// RENDER FUNCTIONS
// ============================================

/**
 * Render a product card in the grid
 * @param {Object} product - Product object
 * @returns {HTMLElement} - Product card element
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    const favoriteActive = isFavoriteItem(product);
    const isDesign = Boolean(product.designId || product.isDesign || product.type === 'DESIGN');
    const ownDesign = isOwnDesign(product);
    const likedActive = isLikedDesign(product);
    const imageHtml = product.image
        ? `<img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">`
        : `<div class="placeholder" style="background: linear-gradient(135deg, #e0e0e0, #f0f0f0);"><span>${product.name}</span></div>`;
    const actionHtml = isDesign && !ownDesign
        ? `
            <button type="button" class="design-action design-like-toggle ${likedActive ? 'active' : ''}" aria-label="Like design">
                <span>${likedActive ? '♥' : '♡'}</span>
            </button>
            <button type="button" class="design-action design-save-toggle ${favoriteActive ? 'active' : ''}" aria-label="Save design">
                <span>${favoriteActive ? '✓' : '+'}</span>
            </button>
        `
        : `
            <button type="button" class="favorite-toggle ${favoriteActive ? 'active' : ''}" aria-label="Add to favorites">
                <span>${favoriteActive ? '♥' : '♡'}</span>
            </button>
        `;

    card.innerHTML = `
        <div class="product-image">
            ${actionHtml}
            <button type="button" class="favorite-toggle legacy-favorite-toggle" hidden aria-label="Add to favorites">
                <span>${favoriteActive ? '♥' : '♡'}</span>
            </button>
            ${imageHtml}
        </div>
        <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-rating">
                ${'⭐'.repeat(product.rating)}
                <span class="reviews">${isDesign ? '' : `(${product.reviews || 0})`}</span>
            </div>
            <div class="product-price">${product.price}</div>
            ${isDesign ? `<div class="product-social-meta">Likes ${product.likes || 0} · Saved ${product.saves || 0}</div>` : ''}
        </div>
    `;

    // Product click event (ready for future navigation)
    card.addEventListener('click', () => {
        handleProductClick(product.id);
    });

    const favoriteButton = card.querySelector('.favorite-toggle:not(.legacy-favorite-toggle)');
    if (favoriteButton) {
        favoriteButton.addEventListener('click', async (event) => {
            event.stopPropagation();
            await toggleFavoriteButtonState(product, favoriteButton);
        });
    }
    const saveButton = card.querySelector('.design-save-toggle');
    if (saveButton) {
        saveButton.addEventListener('click', async (event) => {
            event.stopPropagation();
            const result = await toggleFavoriteItem(product);
            if (!result.changed) return;
            saveButton.classList.toggle('active', result.active);
            saveButton.querySelector('span').textContent = result.active ? '✓' : '+';
        });
    }
    const likeButton = card.querySelector('.design-like-toggle');
    if (likeButton) {
        likeButton.addEventListener('click', async (event) => {
            event.stopPropagation();
            const result = await toggleDesignLike(product);
            if (!result.changed) return;
            likeButton.classList.toggle('active', result.active);
            likeButton.querySelector('span').textContent = result.active ? '♥' : '♡';
            product.likes = result.likes ?? product.likes;
        });
    }

    return card;
}

/**
 * Render a testimonial
 * @param {Object} testimonial - Testimonial object
 * @returns {HTMLElement} - Testimonial card element
 */
function createTestimonialCard(testimonial) {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `
        <div class="testimonial-rating">
            ${'⭐'.repeat(testimonial.rating)}
        </div>
        <div class="testimonial-text">
            "${testimonial.text}"
        </div>
        <div class="testimonial-author">
            ${testimonial.author}
        </div>
    `;

    return card;
}

/**
 * Load and render "Best Sold" products
 */
function renderProductCards(products, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';

    const shouldCollapse = gridId === 'best-sold-grid' || gridId === 'favorites-grid';
    const visibleProducts = shouldCollapse && !homeGridExpandedState[gridId]
        ? products.slice(0, 8)
        : products;

    visibleProducts.forEach(product => {
        grid.appendChild(createProductCard(product));
    });

    if (shouldCollapse && products.length > visibleProducts.length) {
        const expand = document.createElement('div');
        expand.className = 'home-expand-row';
        expand.innerHTML = `<button type="button" class="catalog-expand-btn" aria-expanded="false"><span>Mostrar mas banderas</span><strong>↓</strong><small>${products.length - visibleProducts.length} mas</small></button>`;
        expand.querySelector('button').addEventListener('click', () => {
            homeGridExpandedState[gridId] = true;
            renderProductCards(products, gridId);
        });
        grid.appendChild(expand);
    }
}

async function loadBestSoldProducts() {
    const response = await api.getProducts('best-sold');
    if (response && response.success) {
        renderProductCards(response.data, 'best-sold-grid');
    } else {
        console.error('Error loading best sold products');
    }
}

/**
 * Load and render "User Favorites" products
 */
async function loadUserFavorites() {
    const response = await api.getPopularDesigns();
    const popularDesigns = response?.success && Array.isArray(response.data) ? response.data : [];
    renderProductCards(popularDesigns.length ? popularDesigns : userFavoritesProducts, 'favorites-grid');
}

/**
 * Load and render testimonials
 */
async function loadTestimonials() {
    const response = await api.getTestimonials();
    if (response && response.success) {
        testimonials = response.data;
        renderTestimonials(testimonials);
    } else {
        console.error('Error loading testimonials');
        // Fallback to mock data
        testimonials = [
            {
                id: 1,
                rating: 5,
                text: "SUPER VIBRANT AND CUSTOMIZABLE COLORS CAME OUT SUPER VIBRANT AND THE MATERIAL IS HIGH QUALITY.",
                author: "Sarah M.",
                verified: true
            },
            {
                id: 2,
                rating: 5,
                text: "SUPER VIBRANT AND CUSTOMIZABLE COLORS CAME OUT SUPER VIBRANT AND THE MATERIAL IS HIGH QUALITY. SHIPPING WAS FAST AND THE FINAL PRODUCT WAS PERFECT.",
                author: "Alex K.",
                verified: true
            },
            {
                id: 3,
                rating: 5,
                text: "I WAS IMPRESSED BY THE PRINT QUALITY AND ALL ATTENTION TO DETAIL. THE BANNER LOOKS AMAZING AND DELIVERED ON TIME.",
                author: "James L.",
                verified: true
            }
        ];
        renderTestimonials(testimonials);
    }
}

function renderTestimonials(testimonials) {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;
    grid.innerHTML = '';

    testimonials.forEach(testimonial => {
        grid.appendChild(createTestimonialCard(testimonial));
    });
}

function getSelectedProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('productId') || localStorage.getItem('selectedProductId');
}

function getSelectedDesignId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('designId') || localStorage.getItem('selectedDesignId');
}

function getFavoriteItemKey(item) {
    if (!item) return '';
    if (item.designId || item.isDesign || String(item.id).startsWith('design-')) {
        return `design:${item.designId || String(item.id).replace('design-', '')}`;
    }
    return `product:${item.productId || item.id}`;
}

function getAccountStorageSuffix() {
    const user = getLoggedInUser();
    return user?.id || user?.email || 'guest';
}

function getFavoritesStorageKey() {
    return `${FAVORITES_STORAGE_KEY}:${getAccountStorageSuffix()}`;
}

function getLikesStorageKey() {
    return `${LIKES_STORAGE_KEY}:${getAccountStorageSuffix()}`;
}

function getStoredFavorites() {
    try {
        return JSON.parse(localStorage.getItem(getFavoritesStorageKey()) || '[]');
    } catch (error) {
        console.error('Error reading favorites:', error);
        return [];
    }
}

function setStoredFavorites(favorites) {
    localStorage.setItem(getFavoritesStorageKey(), JSON.stringify(favorites));
}

function getStoredLikes() {
    try {
        return JSON.parse(localStorage.getItem(getLikesStorageKey()) || '[]');
    } catch (error) {
        console.error('Error reading likes:', error);
        return [];
    }
}

function setStoredLikes(likes) {
    localStorage.setItem(getLikesStorageKey(), JSON.stringify(likes));
}

async function refreshAccountFavorites() {
    if (!isUserLoggedIn() || !localStorage.getItem('token')) return getStoredFavorites();

    const result = await api.getFavoriteDesigns();
    if (!result?.success || !Array.isArray(result.data)) return getStoredFavorites();

    const localProductFavorites = getStoredFavorites().filter((favorite) => !favorite.isDesign);
    const serverFavorites = result.data.map(buildFavoritePayload);
    const merged = [...localProductFavorites];
    serverFavorites.forEach((favorite) => {
        if (!merged.some((item) => item.key === favorite.key)) {
            merged.push(favorite);
        }
    });
    setStoredFavorites(merged);
    return merged;
}

function getStoredCartVisuals() {
    try {
        return JSON.parse(localStorage.getItem(CART_VISUALS_STORAGE_KEY) || '{}');
    } catch (error) {
        console.error('Error reading cart visuals:', error);
        return {};
    }
}

function setStoredCartVisuals(visuals) {
    localStorage.setItem(CART_VISUALS_STORAGE_KEY, JSON.stringify(visuals));
}

function storeCartVisual(cartId, detailItem) {
    if (!cartId || !detailItem?.image) return;
    const visuals = getStoredCartVisuals();
    visuals[cartId] = {
        image: detailItem.image,
        name: detailItem.name
    };
    setStoredCartVisuals(visuals);
}

function getCartVisual(cartId) {
    return getStoredCartVisuals()[cartId] || null;
}

function buildFavoritePayload(item) {
    return {
        key: getFavoriteItemKey(item),
        id: item.id,
        productId: item.productId || item.id,
        designId: item.designId || null,
        isDesign: Boolean(item.designId || item.isDesign || String(item.id).startsWith('design-')),
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image
    };
}

function isFavoriteItem(item) {
    const key = getFavoriteItemKey(item);
    return Boolean(key) && getStoredFavorites().some((favorite) => favorite.key === key);
}

function isOwnDesign(item) {
    const user = getLoggedInUser();
    return Boolean(item?.designId && user && Number(item.ownerId) === Number(user.id));
}

function isLikedDesign(item) {
    if (!item?.designId) return false;
    return getStoredLikes().includes(Number(item.designId));
}

function isWorkerUser(user = getLoggedInUser()) {
    return user && user.rol === 'worker';
}

function addCreatorPoints(designId, points) {
    const current = JSON.parse(localStorage.getItem(CREATOR_POINTS_STORAGE_KEY) || '{}');
    current[designId] = (Number(current[designId]) || 0) + points;
    localStorage.setItem(CREATOR_POINTS_STORAGE_KEY, JSON.stringify(current));
}

function getStoredCreatorPoints() {
    try {
        return JSON.parse(localStorage.getItem(CREATOR_POINTS_STORAGE_KEY) || '{}');
    } catch (error) {
        console.error('Error reading creator points:', error);
        return {};
    }
}

function getTotalCreatorPoints() {
    return Object.values(getStoredCreatorPoints()).reduce((total, value) => total + (Number(value) || 0), 0);
}

function getCreatorDiscountRate() {
    const points = getTotalCreatorPoints();
    if (points >= 300) return 0.2;
    if (points >= 150) return 0.15;
    if (points >= 50) return 0.1;
    return 0;
}

function showReportDialog(item) {
    const modal = document.getElementById('reportFlagModal');
    const form = document.getElementById('reportFlagForm');
    const title = document.getElementById('reportFlagTitle');
    const reason = document.getElementById('reportReason');
    const comment = document.getElementById('reportComment');
    const closeButtons = modal?.querySelectorAll('[data-report-close]');

    if (!modal || !form || !reason || !comment) {
        return registerFlagReport(item, 'Contenido inapropiado', '');
    }

    if (title) title.textContent = item?.name || 'Bandera seleccionada';
    form.reset();
    modal.hidden = false;
    reason.focus();

    const cleanup = () => {
        form.removeEventListener('submit', onSubmit);
        closeButtons?.forEach((button) => button.removeEventListener('click', onCancel));
        modal.removeEventListener('click', onBackdrop);
        document.removeEventListener('keydown', onKeydown);
    };

    const close = () => {
        modal.hidden = true;
        cleanup();
    };

    const onSubmit = (event) => {
        event.preventDefault();
        registerFlagReport(item, reason.value, comment.value);
        close();
    };

    const onCancel = () => close();
    const onBackdrop = (event) => {
        if (event.target === modal) close();
    };
    const onKeydown = (event) => {
        if (event.key === 'Escape') close();
    };

    form.addEventListener('submit', onSubmit);
    closeButtons?.forEach((button) => button.addEventListener('click', onCancel));
    modal.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKeydown);
}

function registerFlagReport(item, reason, comment = '') {
    const user = getLoggedInUser();
    const cleanReason = String(reason || '').trim();
    if (!cleanReason) return false;

    const reports = JSON.parse(localStorage.getItem(FLAG_REPORTS_STORAGE_KEY) || '[]');
    const report = {
        id: Date.now(),
        title: item?.name || 'Bandera denunciada',
        user: user?.nombre_usuario || user?.email || 'usuario anonimo',
        reason: cleanReason,
        priority: 'Media',
        status: 'Pendiente',
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        comment: comment || `Denuncia enviada desde la ficha de ${item?.name || 'bandera'}.`,
        designId: item?.designId || null,
        productId: item?.productId || item?.id || null,
        history: [{ date: new Date().toLocaleDateString('es-ES'), text: 'Reporte creado desde la ficha publica.' }]
    };

    reports.unshift(report);
    localStorage.setItem(FLAG_REPORTS_STORAGE_KEY, JSON.stringify(reports));
    showSuccessNotification('Reporte enviado', 'Gracias. Lo hemos añadido al panel de reportes.');
    return true;
}

async function deleteDesignAsAdmin(item) {
    const designId = Number(item?.designId);
    if (!designId) {
        alert('Solo se pueden borrar banderas publicadas por usuarios.');
        return false;
    }

    if (!isWorkerUser()) {
        alert('Solo los admins pueden borrar banderas.');
        return false;
    }

    const confirmed = confirm(`Eliminar la bandera "${item?.name || designId}" de la web?`);
    if (!confirmed) return false;

    const result = await api.deleteDesignAsAdmin(designId);
    if (!result || !result.success) {
        alert(result?.error || 'No se pudo eliminar la bandera.');
        return false;
    }

    showSuccessNotification('Bandera eliminada', 'La bandera se ha borrado de la web.');
    setTimeout(() => {
        window.location.href = 'catalog.html';
    }, 700);
    return true;
}

function handleCanvasSave(drawingApp) {
    if (!isUserLoggedIn() || !localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }

    drawingApp.commitActiveImageLayer();

    // Mostrar modal para capturar los datos
    showSaveDesignModal((data) => {
        if (!data.name || !drawingApp?.canvas) return;

        let designData;
        try {
            designData = drawingApp.canvas.toDataURL('image/png');
        } catch (error) {
            console.warn('Canvas export failed, resetting external template before saving:', error);
            drawingApp.baseImage = null;
            drawingApp.usingCssTemplate = false;
            drawingApp.clearCanvasTemplateBackground();
            drawingApp.resetCanvasBitmap();
            drawingApp.renderBaseCanvas();
            designData = drawingApp.canvas.toDataURL('image/png');
        }
        const size = getSelectedSizeForOrder();
        const baseSize = getActiveSizeLabel();
        const activePrice = currentDetailItem?.isBlankDesign
            ? (blankDesignPrices[baseSize] ?? 20)
            : parseFloat(String(document.getElementById('product-price')?.textContent || '').replace(/[^\d.]/g, '')) || Number(currentDetailItem?.basePrice || 0);

        const payload = {
            name: data.name,
            data: designData,
            tamano: size,
            colores: drawingApp.currentColor || 'custom',
            id_producto: currentDetailItem?.isBlankDesign ? null : (currentDetailItem?.productId || currentDetailItem?.id || null),
            precio_personalizacion: activePrice,
            publicar: data.publish,
            nombre_publicacion: data.publicName,
            descripcion_publicacion: data.publicDescription,
            etiquetas: data.publicTags
        };

        api.saveDesign(payload).then((result) => {
            if (!result || !result.success || !result.data) {
                console.warn('API save failed. Saving design locally instead:', result);
                result = saveDesignLocally(payload);
            }

            const savedDesign = {
                ...result.data,
                image: designData,
                isDesign: true,
                ownerId: getLoggedInUser()?.id
            };

            currentDetailItem = savedDesign;
            localStorage.removeItem('selectedProductId');
            localStorage.setItem('selectedDesignId', String(savedDesign.designId));

            const titleEl = document.getElementById('product-title');
            const previewEl = document.getElementById('selectedItemPreview');
            const workspaceLabel = document.getElementById('workspaceItemLabel');

            if (titleEl) titleEl.textContent = savedDesign.name;
            if (previewEl) {
                previewEl.src = designData;
                previewEl.alt = savedDesign.name;
            }
            if (workspaceLabel) workspaceLabel.textContent = 'Customized design ready';

            // Mostrar notificación de éxito en la página
            showSuccessNotification('¡Diseño guardado!', `Tu bandera "${savedDesign.name}" ha sido guardada correctamente.`);
        });
    });
}

function saveDesignLocally(payload) {
    const saved = JSON.parse(localStorage.getItem('userDesigns') || '[]');
    const designId = Date.now();
    const localDesign = {
        id: `design-${designId}`,
        designId,
        productId: payload.id_producto || null,
        ownerId: getLoggedInUser()?.id || null,
        name: `Diseño: ${payload.name}`,
        description: payload.descripcion_publicacion || 'Diseño personalizado guardado localmente',
        price: `${Number(payload.precio_personalizacion || 0).toFixed(0)}€`,
        basePrice: Number(payload.precio_personalizacion || 0),
        category: 'designs',
        type: 'DESIGN',
        image: payload.data,
        publicName: payload.nombre_publicacion || payload.name,
        tags: payload.etiquetas || '',
        points: 0,
        savedAt: new Date().toISOString()
    };

    saved.unshift(localDesign);
    localStorage.setItem('userDesigns', JSON.stringify(saved));
    return { success: true, data: localDesign };
}

async function syncDesignFavorite(item, shouldSave) {
    if (!item || !item.designId || !isUserLoggedIn()) return;
    if (item.ownerId && getLoggedInUser()?.id === item.ownerId) return;

    if (shouldSave) {
        const result = await api.saveFavoriteDesign(item.designId);
        if (result?.awardedPoints) {
            addCreatorPoints(item.designId, result.awardedPoints);
        }
        return result;
    } else {
        return await api.removeFavoriteDesign(item.designId);
    }
}

async function toggleFavoriteItem(item) {
    if (!isUserLoggedIn()) {
        window.location.href = 'login.html';
        return { changed: false, active: false };
    }

    const favorites = getStoredFavorites();
    const payload = buildFavoritePayload(item);
    const index = favorites.findIndex((favorite) => favorite.key === payload.key);

    if (index >= 0) {
        favorites.splice(index, 1);
        setStoredFavorites(favorites);
        await syncDesignFavorite(item, false);
        return { changed: true, active: false };
    }

    favorites.push(payload);
    setStoredFavorites(favorites);
    await syncDesignFavorite(item, true);
    return { changed: true, active: true };
}

async function toggleDesignLike(item) {
    if (!isUserLoggedIn()) {
        window.location.href = 'login.html';
        return { changed: false, active: false };
    }
    if (!item?.designId || isOwnDesign(item)) return { changed: false, active: false };

    const likes = getStoredLikes();
    const designId = Number(item.designId);
    const index = likes.indexOf(designId);

    if (index >= 0) {
        likes.splice(index, 1);
        setStoredLikes(likes);
        const result = await api.removeDesignLike(designId);
        return { changed: true, active: false, likes: result?.likes };
    }

    likes.push(designId);
    setStoredLikes(likes);
    const result = await api.likeDesign(designId);
    if (result?.awardedPoints) {
        addCreatorPoints(designId, result.awardedPoints);
    }
    return { changed: true, active: true, likes: result?.likes };
}

async function toggleFavoriteButtonState(item, button) {
    const result = await toggleFavoriteItem(item);
    if (!result.changed || !button) return;
    button.classList.toggle('active', result.active);
    button.querySelector('span').textContent = result.active ? '♥' : '♡';
}

let currentDetailItem = null;
const blankDesignTemplate = {
    id: 'blank-design',
    productId: null,
    designId: null,
    name: 'Blank design',
    description: 'Start from a clean canvas or load a product or design from the catalog when you want a base reference.',
    price: '10-15-20-25€',
    image: 'https://via.placeholder.com/420x260?text=Blank+Canvas',
    basePrice: 10,
    isBlankDesign: true
};
const sizeMultipliers = {
    Small: 1,
    Medium: 1,
    Large: 1,
    'X-Large': 1,
    Personalizable: 1
};
const blankDesignPrices = {
    Small: 7,
    Medium: 10,
    Large: 15,
    'X-Large': 20,
    Personalizable: 20
};

async function loadProductDetailsPage() {
    const selectedDesignId = getSelectedDesignId();
    if (selectedDesignId) {
        const result = await api.getDesignById(Number(selectedDesignId));
        if (result && result.success) {
            renderProductDetails(result.data, true);
            return;
        }
    }

    const selectedId = getSelectedProductId();
    if (!selectedId) {
        renderProductDetails(blankDesignTemplate, false);
        return;
    }

    const result = await api.getProductById(Number(selectedId));
    if (!result || !result.success) {
        renderProductDetails(blankDesignTemplate, false);
        return;
    }

    renderProductDetails(result.data, false);
}

function renderProductDetails(product, isDesign = false) {
    currentDetailItem = { ...product, isDesign };
    const titleEl = document.getElementById('product-title');
    const priceEl = document.getElementById('product-price');
    const descriptionEl = document.getElementById('product-description');
    const mainImage = document.getElementById('product-main-image');
    const noteEl = document.querySelector('.customize-note');
    const addCartBtn = document.querySelector('.btn-add-cart');
    const favoriteBtn = document.getElementById('favoriteDetailBtn');
    const likeBtn = document.getElementById('likeDetailBtn');
    const reportBtn = document.getElementById('reportFlagBtn');
    const adminDeleteBtn = document.getElementById('adminDeleteFlagBtn');
    const rewardsCard = document.getElementById('creatorRewardsCard');
    const pointsValue = document.getElementById('creatorPointsValue');
    const workspaceLabel = document.getElementById('workspaceItemLabel');
    const selectedImage = document.getElementById('selectedItemPreview');

    if (titleEl) titleEl.textContent = product.name;
    updateDetailPrice();
    if (descriptionEl) descriptionEl.textContent = product.description;
    if (mainImage) mainImage.src = product.image;
    if (mainImage) mainImage.alt = product.name;
    if (selectedImage) selectedImage.src = product.image;
    if (selectedImage) selectedImage.alt = product.name;
    if (noteEl) noteEl.textContent = isDesign ? 'selected custom design' : 'create your own design';
    if (workspaceLabel) workspaceLabel.textContent = product.isBlankDesign
        ? 'Blank project'
        : (isDesign ? 'Design base selected' : 'Product base selected');
    if (window.DrawingApp) {
        if (product.isBlankDesign) {
            window.DrawingApp.loadInitialImage(null, product);
        } else {
            window.DrawingApp.loadInitialImage(product.image, product);
        }
    }

    if (favoriteBtn) {
        const user = getLoggedInUser();
        const ownDesign = isDesign && user && Number(product.ownerId) === Number(user.id);
        favoriteBtn.hidden = ownDesign;
        favoriteBtn.disabled = false;
        favoriteBtn.textContent = isFavoriteItem(currentDetailItem) ? 'Remove from favorites' : 'Add to favorites';
        favoriteBtn.onclick = async () => {
            const result = await toggleFavoriteItem(currentDetailItem);
            if (!result.changed) return;
            favoriteBtn.textContent = result.active ? 'Remove from favorites' : 'Add to favorites';
            renderCreatorRewards(currentDetailItem);
        };
    }

    if (likeBtn) {
        const ownDesign = isOwnDesign(product);
        likeBtn.hidden = !isDesign || ownDesign;
        likeBtn.disabled = false;
        likeBtn.textContent = isLikedDesign(currentDetailItem) ? 'Unlike' : 'Like';
        likeBtn.onclick = async () => {
            const result = await toggleDesignLike(currentDetailItem);
            if (!result.changed) return;
            likeBtn.textContent = result.active ? 'Unlike' : 'Like';
            currentDetailItem.likes = result.likes ?? currentDetailItem.likes;
            renderCreatorRewards(currentDetailItem);
        };
    }

    if (reportBtn) {
        reportBtn.hidden = product.isBlankDesign;
        reportBtn.onclick = () => showReportDialog(currentDetailItem);
    }

    if (adminDeleteBtn) {
        adminDeleteBtn.hidden = !isWorkerUser() || !isDesign || product.isBlankDesign;
        adminDeleteBtn.onclick = () => deleteDesignAsAdmin(currentDetailItem);
    }

    function renderCreatorRewards(item) {
        if (!rewardsCard || !pointsValue) return;
        const designPoints = item?.designId ? Number(getStoredCreatorPoints()[item.designId] || item.points || 0) : 0;
        const totalPoints = Math.max(getTotalCreatorPoints(), designPoints);
        rewardsCard.hidden = false;
        pointsValue.textContent = `${totalPoints} pts`;
    }

    renderCreatorRewards(product);
}

function getActiveSizeLabel() {
    return document.querySelector('.size-btn.active')?.textContent.trim() || 'Large';
}

function getSelectedSizeForOrder() {
    const size = getActiveSizeLabel();
    if (size !== 'Personalizable') return size;
    const width = document.getElementById('customWidth')?.value;
    const height = document.getElementById('customHeight')?.value;
    if (!width || !height) return 'Personalizable';
    return `Personalizable ${width}x${height} cm`;
}

function toggleCustomSizeFields() {
    const fields = document.getElementById('customSizeFields');
    if (!fields) return;
    fields.hidden = getActiveSizeLabel() !== 'Personalizable';
}

function updateDetailPrice() {
    const priceEl = document.getElementById('product-price');
    if (!priceEl || !currentDetailItem) return;
    const selectedSizePrice = blankDesignPrices[getActiveSizeLabel()] ?? 10;
    priceEl.textContent = `${selectedSizePrice}€`;
    return;

    const basePrice = Number(currentDetailItem.basePrice);
    if (currentDetailItem.isBlankDesign) {
        const size = getActiveSizeLabel();
        const exactPrice = blankDesignPrices[size] ?? 20;
        priceEl.textContent = `${exactPrice}€`;
        return;
    }

    if (!Number.isFinite(basePrice) || basePrice <= 0) {
        priceEl.textContent = currentDetailItem.price;
        return;
    }

    const size = getActiveSizeLabel();
    const multiplier = sizeMultipliers[size] || 1;
    priceEl.textContent = `$${(basePrice * multiplier).toFixed(2)}`;
}

// ============================================
// EVENT HANDLING
// ============================================

/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
    return localStorage.getItem('sessionActive') === 'true' || localStorage.getItem('token') !== null;
}

/**
 * Get logged in user data
 */
function getLoggedInUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

/**
 * Logout user
 */
function logoutUser() {
    localStorage.removeItem('sessionActive');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

/**
 * Handle profile button click
 */
function handleProfileClick() {
    if (isUserLoggedIn()) {
        showUserMenu();
    } else {
        window.location.href = 'login.html';
    }
}

/**
 * Show user menu
 */
function showUserMenu() {
    const user = getLoggedInUser();
    if (!user) return;

    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = `
        <div class="user-menu-header">
            <p style="margin: 0; font-weight: 600;">${user.nombre_usuario}</p>
            <p style="margin: 0; font-size: 12px; color: #666;">${user.email}</p>
        </div>
        <a href="#profile" class="user-menu-item">My Profile</a>
        <a href="#orders" class="user-menu-item">My Orders</a>
        <a href="#designs" class="user-menu-item">My Designs</a>
        <a href="#settings" class="user-menu-item">Settings</a>
        <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;">
        <button class="user-menu-item" style="width: 100%; text-align: left; background: none; border: none; padding: 10px 15px; color: #d32f2f; cursor: pointer; font-size: 14px;" onclick="logoutUser()">Logout</button>
    `;

    // Position menu
    const profileBtn = document.querySelector('.profile-btn');
    if (profileBtn) {
        const rect = profileBtn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (rect.bottom + 5) + 'px';
        menu.style.right = (window.innerWidth - rect.right) + 'px';
    }

    document.body.appendChild(menu);

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !e.target.closest('.profile-btn')) {
                menu.remove();
            }
        });
    }, 100);
}

/**
 * Update UI based on authentication state
 */
function updateAuthUI() {
    const user = getLoggedInUser();
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileDropdown) {
        const dropdownUserInfo = document.getElementById('dropdownUserInfo');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userEmailDisplay = document.getElementById('userEmailDisplay');
        const profileLink = document.getElementById('profileLink');
        const intranetLink = document.getElementById('intranetLink');
        const ordersLink = document.getElementById('ordersLink');
        const designsLink = document.getElementById('designsLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const loginLink = document.getElementById('loginLink');
        const signupLink = document.getElementById('signupLink');

        if (user) {
            // User is logged in
            if (dropdownUserInfo) dropdownUserInfo.style.display = 'block';
            if (userNameDisplay) userNameDisplay.textContent = user.nombre_usuario;
            if (userEmailDisplay) userEmailDisplay.textContent = user.email;
            if (profileLink) profileLink.style.display = 'block';
            if (intranetLink) intranetLink.style.display = isWorkerUser(user) ? 'block' : 'none';
            if (ordersLink) ordersLink.style.display = 'block';
            if (designsLink) designsLink.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (loginLink) loginLink.style.display = 'none';
            if (signupLink) signupLink.style.display = 'none';

            // Show customize link
            const customizeLink = document.querySelector('a[href="product-details.html#customization"]');
            if (customizeLink) {
                customizeLink.style.display = 'inline-block';
            }
        } else {
            // User is not logged in
            if (dropdownUserInfo) dropdownUserInfo.style.display = 'none';
            if (profileLink) profileLink.style.display = 'none';
            if (intranetLink) intranetLink.style.display = 'none';
            if (ordersLink) ordersLink.style.display = 'none';
            if (designsLink) designsLink.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (loginLink) loginLink.style.display = 'block';
            if (signupLink) signupLink.style.display = 'block';
        }
    }

    // Update other UI elements
    if (isUserLoggedIn()) {
        const customizeLink = document.querySelector('a[href="product-details.html#customization"]');
        
        if (customizeLink) {
            customizeLink.style.display = 'inline-block';
        }
    }
}

/**
 * Handle profile button click
 */
function handleProfileClick() {
    if (isUserLoggedIn()) {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    } else {
        window.location.href = 'login.html';
    }
}

/**
 * Handle logout
 */
function handleLogout(event) {
    event.preventDefault();
    logoutUser();
}


/**
 * Handle Create now button
 */
function handleCreateFlag() {
    console.log('Redirecting to customization page...');
    localStorage.removeItem('selectedProductId');
    localStorage.removeItem('selectedDesignId');
    window.location.href = 'product-details.html#customization';
}

function handleProductClick(productId) {
    const value = String(productId);
    if (value.startsWith('design-')) {
        localStorage.removeItem('selectedProductId');
        localStorage.setItem('selectedDesignId', value.replace('design-', ''));
    } else {
        localStorage.removeItem('selectedDesignId');
        localStorage.setItem('selectedProductId', productId);
    }
    window.location.href = 'product-details.html';
}

// ============================================
// CART MANAGEMENT FUNCTIONS
// ============================================

/**
 * Load and render user's cart items
 */
async function loadCartItems() {
    const user = getLoggedInUser();
    if (!user) {
        // Show empty cart message if user not logged in
        showEmptyCart();
        return;
    }

    const result = await api.getCart();
    if (result && result.success && result.data.length > 0) {
        renderCartItems(result.data);
    } else {
        showEmptyCart();
    }
}

/**
 * Render cart items in the cart page
 * @param {Array} cartItems - Cart items from API
 */
function renderCartItems(cartItems) {
    const container = document.querySelector('.cart-items-panel');
    if (!container) return;

    container.innerHTML = '';

    cartItems.forEach(cartItem => {
        const item = cartItem.item || {};
        const visualOverride = getCartVisual(cartItem.id_carrito);
        const itemDiv = document.createElement('article');
        itemDiv.className = 'cart-item';
        itemDiv.dataset.cartId = cartItem.id_carrito;
        itemDiv.dataset.price = cartItem.precio_unitario;

        const imageSrc = visualOverride?.image || item.image || 'https://via.placeholder.com/160x140/ddd/000?text=No+Image';
        const itemName = visualOverride?.name || item.name || 'Producto desconocido';
        const sizeInfo = cartItem.tamano ? `SIZE: ${cartItem.tamano}` : '';

        itemDiv.innerHTML = `
            <div class="item-image">
                <img src="${imageSrc}" alt="${itemName}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="item-details">
                <div class="item-top">
                    <h3>${itemName}</h3>
                    <button type="button" class="cart-remove" aria-label="Eliminar artículo">🗑</button>
                </div>
                <div class="item-meta">
                    ${sizeInfo ? `<span>${sizeInfo}</span>` : ''}
                </div>
                <div class="item-bottom">
                    <div class="item-quantity">
                        <button type="button" class="qty-btn qty-decrease">−</button>
                        <input type="number" class="qty-input" value="${cartItem.cantidad}" min="1">
                        <button type="button" class="qty-btn qty-increase">+</button>
                    </div>
                    <div class="cart-item-price">$${(cartItem.precio_unitario * cartItem.cantidad).toFixed(2)}</div>
                </div>
            </div>
        `;

        container.appendChild(itemDiv);
    });

    // Attach event listeners
    document.querySelectorAll('.cart-item .qty-btn').forEach(btn => {
        btn.addEventListener('click', handleCartQuantityUpdate);
    });

    document.querySelectorAll('.cart-item .cart-remove').forEach(btn => {
        btn.addEventListener('click', handleRemoveCartItem);
    });

    updateCartSummary();
}

/**
 * Show empty cart message
 */
function showEmptyCart() {
    const container = document.querySelector('.cart-items-panel');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #999;">
            <h2>Your cart is empty</h2>
            <p>Start adding products to your cart!</p>
            <a href="catalog.html" class="btn btn-primary" style="margin-top: 20px; display: inline-block;">Continue Shopping</a>
        </div>
    `;

    // Clear summary
    const subtotalEl = document.getElementById('summarySubtotal');
    const discountEl = document.getElementById('summaryDiscount');
    const deliveryEl = document.getElementById('summaryDelivery');
    const totalEl = document.getElementById('summaryTotal');

    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (discountEl) discountEl.textContent = '-$0.00';
    if (deliveryEl) deliveryEl.textContent = '$0.00';
    if (totalEl) totalEl.textContent = '$0.00';
}

/**
 * Handle cart quantity update
 * @param {Event} event - Click event
 */
async function handleCartQuantityUpdate(event) {
    const button = event.currentTarget;
    const item = button.closest('.cart-item');
    const cartId = item.dataset.cartId;
    const input = item.querySelector('.qty-input');
    let value = parseInt(input.value, 10) || 1;

    if (button.classList.contains('qty-decrease')) {
        value = Math.max(1, value - 1);
    } else if (button.classList.contains('qty-increase')) {
        value += 1;
    }

    // Update on server
    const result = await api.updateCartItem(cartId, value);
    if (result && result.success) {
        input.value = value;
        const price = parseFloat(item.dataset.price) || 0;
        item.querySelector('.cart-item-price').textContent = '$' + (price * value).toFixed(2);
        updateCartSummary();
    } else {
        alert('Error updating cart item');
        input.value = parseInt(input.value, 10);
    }
}

/**
 * Handle removing cart item
 * @param {Event} event - Click event
 */
async function handleRemoveCartItem(event) {
    const button = event.currentTarget;
    const item = button.closest('.cart-item');
    const cartId = item.dataset.cartId;

    if (!confirm('Are you sure you want to remove this item?')) {
        return;
    }

    const result = await api.removeFromCart(cartId);
    if (result && result.success) {
        item.remove();
        updateCartSummary();
        
        // Check if cart is empty
        if (document.querySelectorAll('.cart-item').length === 0) {
            showEmptyCart();
        }
    } else {
        alert('Error removing item from cart');
    }
}

/**
 * Update cart summary (subtotal, discount, delivery, total)
 */
function updateCartSummary() {
    const items = document.querySelectorAll('.cart-item');
    let subtotal = 0;

    items.forEach(item => {
        const price = parseFloat(item.dataset.price) || 0;
        const quantity = parseInt(item.querySelector('.qty-input').value, 10) || 1;
        subtotal += price * quantity;
    });

    const baseDiscount = subtotal * 0.2;
    const pointsDiscountRate = getCreatorDiscountRate();
    const pointsDiscount = subtotal * pointsDiscountRate;
    const discount = baseDiscount + pointsDiscount;
    const delivery = items.length > 0 ? 15 : 0;
    const total = subtotal - discount + delivery;

    const subtotalEl = document.getElementById('summarySubtotal');
    const discountEl = document.getElementById('summaryDiscount');
    const deliveryEl = document.getElementById('summaryDelivery');
    const totalEl = document.getElementById('summaryTotal');
    const rewardPointsEl = document.getElementById('summaryRewardPoints');

    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (discountEl) discountEl.textContent = '-$' + discount.toFixed(2);
    if (deliveryEl) deliveryEl.textContent = '$' + delivery.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
    if (rewardPointsEl) rewardPointsEl.textContent = `${getTotalCreatorPoints()} pts`;
}

function renderCheckoutSummary(cartItems) {
    const itemsContainer = document.getElementById('checkoutOrderItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const discountEl = document.getElementById('checkoutDiscount');
    const deliveryEl = document.getElementById('checkoutDelivery');
    const totalEl = document.getElementById('checkoutTotal');

    if (!itemsContainer) return;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        itemsContainer.innerHTML = `
            <div class="order-item">
                <div class="order-item-info">
                    <span>Your cart is empty</span>
                    <small>Add products before continuing to checkout</small>
                </div>
                <strong>$0.00</strong>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = '$0.00';
        if (discountEl) discountEl.textContent = '-$0.00';
        if (deliveryEl) deliveryEl.textContent = '$0.00';
        if (totalEl) totalEl.textContent = '$0.00';
        return;
    }

    let subtotal = 0;

    itemsContainer.innerHTML = cartItems.map((cartItem) => {
        const item = cartItem.item || {};
        const visualOverride = getCartVisual(cartItem.id_carrito);
        const quantity = Number(cartItem.cantidad) || 1;
        const unitPrice = Number(cartItem.precio_unitario) || 0;
        const lineTotal = unitPrice * quantity;
        subtotal += lineTotal;

        const meta = [
            cartItem.tamano ? `Size: ${cartItem.tamano}` : null,
            `Qty: ${quantity}`
        ].filter(Boolean).join(' · ');

        return `
                <div class="order-item">
                <div class="order-item-info">
                    <span>${visualOverride?.name || item.name || 'Product'}</span>
                    <small>${meta}</small>
                </div>
                <strong>$${lineTotal.toFixed(2)}</strong>
            </div>
        `;
    }).join('');

    const discount = subtotal * (0.2 + getCreatorDiscountRate());
    const delivery = cartItems.length > 0 ? 15 : 0;
    const total = subtotal - discount + delivery;

    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (discountEl) discountEl.textContent = '-$' + discount.toFixed(2);
    if (deliveryEl) deliveryEl.textContent = '$' + delivery.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

/**
 * Add product to cart with size selection
 * @param {Object} product - Product object
 * @param {string} size - Selected size
 * @param {number} quantity - Quantity to add
 */
async function addProductToCart(product, size, quantity) {
    const user = getLoggedInUser();
    if (!user) {
        alert('Please log in to add items to cart');
        window.location.href = 'login.html';
        return;
    }

    // Calculate price with size multiplier
    const sizeMultipliers = {
        'A1': 1.45,
        'A2': 1.2,
        'A3': 1,
        'A4': 0.85,
        'Small': 0.85,
        'Medium': 1,
        'Large': 1.2,
        'X-Large': 1.45
    };

    const priceSize = String(size).startsWith('Personalizable') ? 'Personalizable' : size;
    const unitPrice = product.isBlankDesign
        ? (blankDesignPrices[priceSize] ?? 20)
        : (blankDesignPrices[priceSize] ?? 10);

    const result = await api.addToCart({
        id_producto: product.isDesign ? null : (product.productId || product.id),
        id_diseno: product.isDesign ? product.designId : null,
        cantidad: quantity,
        tamano: size,
        precio_unitario: unitPrice
    });

    if (result && result.success) {
        storeCartVisual(result.data?.id_carrito, currentDetailItem);
        if (product.isDesign && product.designId && product.ownerId !== user.id) {
            api.rewardDesignUse(product.designId);
            addCreatorPoints(product.designId, 10);
        }
        alert(`${product.name} added to cart!`);
        return true;
    } else {
        alert('Error adding product to cart');
        return false;
    }
}

/**
 * Handle navigation links
 */
function handleNavigation(section) {
    console.log(`Navigating to: ${section}`);

    switch (section) {
        case 'shop':
            console.log('Abriendo tienda...');
            break;
        case 'admin':
            openAdminPanel();
            break;
        case 'customize':
            handleCreateFlag();
            break;
        default:
            break;
    }
}

function openAdminPanel() {
    const user = getLoggedInUser();

    if (!user) {
        alert('Please log in with a worker account to access the intranet.');
        window.location.href = 'login.html';
        return;
    }

    if (!isWorkerUser(user)) {
        alert('This intranet is only available for Vexilo workers.');
        window.location.href = 'profile.html';
        return;
    }

    window.location.href = 'admin.html';
}

/**
 * Handle newsletter submission
 */
async function handleNewsletterSubmit(event) {
    const input = event.target.parentElement.querySelector('.newsletter-input');
    const email = input.value;

    if (!email) {
        alert('Please enter an email address');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    const result = await api.subscribeNewsletter(email);
    if (result && result.success) {
        alert(`Thank you! You are subscribed with: ${email}`);
        input.value = '';
    } else {
        alert('Unable to subscribe at this time. Please try again.');
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Handle testimonial carousel
 */
function setupCarousel() {
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let currentIndex = 0;

    if (!prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateCarousel();
    });

    function updateCarousel() {
        const grid = document.getElementById('testimonials-grid');
        const offset = -currentIndex * 100;
        // For more advanced carousels, animation would go here
        loadTestimonials(); // For now reloads all testimonials
    }
}

/**
 * Close the promotional banner
 */
function closePromo() {
    const headerTop = document.querySelector('.header-top');
    if (headerTop) {
        headerTop.style.display = 'none';
    }
}

// ============================================
// DOM INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Application loaded');

    // Update UI based on authentication state
    updateAuthUI();
    await refreshAccountFavorites();

    // Load products and testimonials only when the relevant page content exists
    if (document.getElementById('best-sold-grid')) {
        loadBestSoldProducts();
    }
    if (document.getElementById('favorites-grid')) {
        loadUserFavorites();
    }
    if (document.getElementById('testimonials-grid')) {
        loadTestimonials();
        setupCarousel();
    }

    // Navigation event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === 'product-details.html#customization') {
                e.preventDefault();
                handleCreateFlag();
                return;
            }
            if (href && !href.startsWith('#')) {
                e.preventDefault();
                window.location.href = href;
                return;
            }
            e.preventDefault();
            const section = href.substring(1); // Quitar el #
            handleNavigation(section);
        });
    });

    // Create now button
    const createBtn = document.querySelector('[data-action="create-flag"]');
    if (createBtn) {
        createBtn.addEventListener('click', handleCreateFlag);
    }

    // Newsletter
    const newsletterBtn = document.querySelector('.newsletter-form .btn-secondary');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', handleNewsletterSubmit);
    }

    // Also allow Enter key in the newsletter input
    const newsletterInput = document.querySelector('.newsletter-input');
    if (newsletterInput) {
        newsletterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleNewsletterSubmit(e);
            }
        });
    }

    // Close promo
    const closePromoBtn = document.querySelector('.close-promo');
    if (closePromoBtn) {
        closePromoBtn.addEventListener('click', closePromo);
    }

    // Event listeners for cart and profile buttons
    const cartBtn = document.querySelector('.cart-btn');
    const profileBtn = document.querySelector('.profile-btn');

    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }

    if (profileBtn) {
        profileBtn.addEventListener('click', handleProfileClick);
    }

    // Handle logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Close profile dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const profileMenu = document.querySelector('.profile-menu');
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileMenu && !profileMenu.contains(e.target) && profileDropdown) {
            profileDropdown.style.display = 'none';
        }
    });

    const cartPage = document.querySelector('.cart-page');
    if (cartPage) {
        initCartPage();
    }

    async function initCartPage() {
        // Load cart from API
        await loadCartItems();

        const promoBtn = document.getElementById('applyPromo');
        if (promoBtn) {
            promoBtn.addEventListener('click', applyPromoCode);
        }

        const promoInput = document.getElementById('promoInput');
        if (promoInput) {
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    applyPromoCode();
                }
            });
        }
    }

    async function initCheckoutPage() {
        if (!isUserLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        const cartResult = await api.getCart();
        const cartItems = cartResult && cartResult.success ? cartResult.data : [];
        renderCheckoutSummary(cartItems);

        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                if (!cartItems.length) {
                    alert('Your cart is empty.');
                    window.location.href = 'cart.html';
                    return;
                }
                alert('Thank you for your purchase! Your order has been processed.');
                window.location.href = 'index.html';
            });
        }
    }

    const checkoutPage = document.querySelector('.checkout-page');
    if (checkoutPage) {
        initCheckoutPage();
    }

    const productPage = document.querySelector('.product-page');
    if (productPage) {
        loadProductDetailsPage();
    }

    // Old cart functions removed - using new API-based functions instead

    function applyPromoCode() {
        const promoInput = document.getElementById('promoInput');
        if (!promoInput) return;

        const code = promoInput.value.trim();
        if (!code) {
            alert('Please enter a promo code.');
            return;
        }

        alert('Promo code applied: ' + code + '. 20% discount has been included.');
        promoInput.value = '';
    }

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    if (tabButtons.length && tabContents.length) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const target = button.dataset.tab;
                tabButtons.forEach(btn => btn.classList.toggle('active', btn === button));
                tabContents.forEach(content => content.classList.toggle('active', content.id === target));
            });
        });
    }

    const thumbnails = document.querySelectorAll('.thumbnail-gallery img');
    const mainImage = document.querySelector('.main-image-large img');
    if (thumbnails.length && mainImage) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                thumbnails.forEach(img => img.classList.remove('active'));
                thumbnail.classList.add('active');
                mainImage.src = thumbnail.src.replace('100x90', '700x520');
            });
        });
    }

    // Event listeners for style cards
    document.querySelectorAll('.style-card').forEach(card => {
        card.addEventListener('click', () => {
            const style = card.querySelector('h3').textContent;
            console.log(`Filtering by style: ${style}`);
            alert(`Showing ${style} style flags`);
        });
    });

    // Event listeners for size buttons
    const sizeBtns = document.querySelectorAll('.size-btn');
    if (sizeBtns.length) {
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                toggleCustomSizeFields();
                updateDetailPrice(); // Update price when size changes
            });
        });
        toggleCustomSizeFields();
    }

    // Event listeners for quantity controls
    const qtyInput = document.getElementById('quantity');
    const qtyBtns = document.querySelectorAll('.qty-btn');
    if (qtyInput && qtyBtns.length) {
        qtyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                let val = parseInt(qtyInput.value) || 1;
                if (btn.textContent.trim() === '+') {
                    val++;
                } else if (btn.textContent.trim() === '−' || btn.textContent.trim() === '-') {
                    if (val > 1) val--;
                }
                qtyInput.value = val;
            });
        });
    }

    // Event listener for add to cart button
    const addCartBtn = document.querySelector('.btn-add-cart');
    if (addCartBtn) {
        addCartBtn.addEventListener('click', async () => {
            if (!currentDetailItem) {
                alert('Please select a product first');
                return;
            }

            const size = getSelectedSizeForOrder();
            const quantity = parseInt(document.getElementById('quantity')?.value || 1);

            const success = await addProductToCart(currentDetailItem, size, quantity);
            if (success) {
                // Reset form
                document.getElementById('quantity').value = 1;
                // Optionally redirect to cart
                // window.location.href = 'cart.html';
            }
        });
    }
});

// ============================================
// API CONNECTOR (Structure for future expansion)
// ============================================

/**
 * Object for handling backend API calls
 * Este código será expandido cuando se implemente la base de datos
 */
const api = {
    baseURL: 'http://localhost:3000/api',

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    },

    /**
     * Fetch products from the backend
     * @param {string} category - Product category
     * @returns {Promise} - Promesa de la respuesta
     */
    async getProducts(category = 'best-sold') {
        try {
            const response = await fetch(`${this.baseURL}/products?category=${category}`);
            if (!response.ok) throw new Error('Error fetching products');
            return await response.json();
        } catch (error) {
            console.error('Error in getProducts:', error);
            return null;
        }
    },

    /**
     * Fetch a specific product
     * @param {number} id - Product ID
     * @returns {Promise} - Promesa de la respuesta
     */
    async getProductById(id) {
        try {
            const response = await fetch(`${this.baseURL}/products/${id}`);
            if (!response.ok) throw new Error('Error fetching product');
            return await response.json();
        } catch (error) {
            console.error('Error in getProductById:', error);
            return null;
        }
    },

    async getDesignById(id) {
        try {
            const response = await fetch(`${this.baseURL}/designs/${id}`);
            if (!response.ok) throw new Error('Error fetching design');
            return await response.json();
        } catch (error) {
            console.error('Error in getDesignById:', error);
            return null;
        }
    },

    async deleteDesignAsAdmin(id) {
        try {
            const response = await fetch(`${this.baseURL}/designs/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error in deleteDesignAsAdmin:', error);
            return null;
        }
    },

    async getPopularDesigns() {
        try {
            const response = await fetch(`${this.baseURL}/designs/popular`);
            if (!response.ok) throw new Error('Error fetching popular designs');
            return await response.json();
        } catch (error) {
            console.error('Error in getPopularDesigns:', error);
            return null;
        }
    },

    async getProfile() {
        try {
            const response = await fetch(`${this.baseURL}/profile`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error fetching profile');
            return await response.json();
        } catch (error) {
            console.error('Error in getProfile:', error);
            return null;
        }
    },

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await fetch(`${this.baseURL}/profile/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            return await response.json();
        } catch (error) {
            console.error('Error in changePassword:', error);
            return null;
        }
    },

    async getProfileOrders() {
        try {
            const response = await fetch(`${this.baseURL}/profile/orders`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error fetching orders');
            return await response.json();
        } catch (error) {
            console.error('Error in getProfileOrders:', error);
            return null;
        }
    },

    async getProfileDesigns() {
        try {
            const response = await fetch(`${this.baseURL}/profile/designs`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error fetching designs');
            return await response.json();
        } catch (error) {
            console.error('Error in getProfileDesigns:', error);
            return null;
        }
    },

    async getFavoriteDesigns() {
        try {
            const response = await fetch(`${this.baseURL}/profile/favorites`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error fetching favorites');
            return await response.json();
        } catch (error) {
            console.error('Error in getFavoriteDesigns:', error);
            return null;
        }
    },

    async saveFavoriteDesign(designId) {
        try {
            const response = await fetch(`${this.baseURL}/profile/favorites/${designId}`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error in saveFavoriteDesign:', error);
            return null;
        }
    },

    async removeFavoriteDesign(designId) {
        try {
            const response = await fetch(`${this.baseURL}/profile/favorites/${designId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error in removeFavoriteDesign:', error);
            return null;
        }
    },

    async likeDesign(designId) {
        try {
            const response = await fetch(`${this.baseURL}/designs/${designId}/like`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error in likeDesign:', error);
            return null;
        }
    },

    async removeDesignLike(designId) {
        try {
            const response = await fetch(`${this.baseURL}/designs/${designId}/like`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error in removeDesignLike:', error);
            return null;
        }
    },

    async rewardDesignUse(designId) {
        try {
            const response = await fetch(`${this.baseURL}/designs/${designId}/reward-use`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error in rewardDesignUse:', error);
            return null;
        }
    },

    async getRewards() {
        try {
            const response = await fetch(`${this.baseURL}/profile/rewards`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error fetching rewards');
            return await response.json();
        } catch (error) {
            console.error('Error in getRewards:', error);
            return null;
        }
    },

    async saveDesign(payload) {
        try {
            const response = await fetch(`${this.baseURL}/designs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error('Error in saveDesign:', error);
            return null;
        }
    },

    /**
     * Register an email for the newsletter
     * @param {string} email - User email
     * @returns {Promise} - Promesa de la respuesta
     */
    async subscribeNewsletter(email) {
        try {
            const response = await fetch(`${this.baseURL}/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            if (!response.ok) throw new Error('Error subscribing');
            return await response.json();
        } catch (error) {
            console.error('Error in subscribeNewsletter:', error);
            return null;
        }
    },

    /**
     * Fetch testimonials
     * @returns {Promise} - Promesa de la respuesta
     */
    async getTestimonials() {
        try {
            const response = await fetch(`${this.baseURL}/testimonials`);
            if (!response.ok) throw new Error('Error fetching testimonials');
            return await response.json();
        } catch (error) {
            console.error('Error in getTestimonials:', error);
            return null;
        }
    },

    // ============================================
    // CART METHODS
    // ============================================

    /**
     * Get user's cart
     * @returns {Promise} - Cart items
     */
    async getCart() {
        try {
            const response = await fetch(`${this.baseURL}/cart`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error fetching cart');
            return await response.json();
        } catch (error) {
            console.error('Error in getCart:', error);
            return null;
        }
    },

    /**
     * Add product or design to cart
     * @param {Object} payload - Cart payload
     * @returns {Promise} - Response from server
     */
    async addToCart(payload) {
        try {
            const response = await fetch(`${this.baseURL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Error adding to cart');
            return await response.json();
        } catch (error) {
            console.error('Error in addToCart:', error);
            return null;
        }
    },

    /**
     * Update cart item quantity
     * @param {number} cartId - Cart item ID
     * @param {number} cantidad - New quantity
     * @returns {Promise} - Response from server
     */
    async updateCartItem(cartId, cantidad) {
        try {
            const response = await fetch(`${this.baseURL}/cart/${cartId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify({ cantidad })
            });
            if (!response.ok) throw new Error('Error updating cart');
            return await response.json();
        } catch (error) {
            console.error('Error in updateCartItem:', error);
            return null;
        }
    },

    /**
     * Remove item from cart
     * @param {number} cartId - Cart item ID
     * @returns {Promise} - Response from server
     */
    async removeFromCart(cartId) {
        try {
            const response = await fetch(`${this.baseURL}/cart/${cartId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error removing from cart');
            return await response.json();
        } catch (error) {
            console.error('Error in removeFromCart:', error);
            return null;
        }
    },

    /**
     * Clear entire user cart
     * @returns {Promise} - Response from server
     */
    async clearCart() {
        try {
            const response = await fetch(`${this.baseURL}/cart`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error clearing cart');
            return await response.json();
        } catch (error) {
            console.error('Error in clearCart:', error);
            return null;
        }
    }
};

// ============================================
// FLAG CANVAS - DRAWING TOOLS
// ============================================

const DrawingApp = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    currentTool: 'brush',
    currentColor: '#000000',
    brushSize: 3,
    startX: 0,
    startY: 0,
    lastImageData: null,
    history: [],
    maxHistory: 30,
    pendingInitialImage: null,
    baseImage: null,
    baseImageSrc: null,
    usingCssTemplate: false,
    activeImageLayer: null,
    imageMoveBaseData: null,
    isMovingImage: false,
    imageDragOffsetX: 0,
    imageDragOffsetY: 0,
    imageScalePercent: 100,
    fontSize: 30,
    fontStyle: 'normal',

    init() {
        this.canvas = document.getElementById('flagCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        this.renderBaseCanvas();
        this.saveToHistory();

        this.setupEventListeners();
        this.initColorWheel();
        if (this.pendingInitialImage) {
            const pending = this.pendingInitialImage;
            this.pendingInitialImage = null;
            this.loadInitialImage(pending.src, pending.item);
        }
        console.log('Canvas initialized successfully');
    },

    // ── COLOR WHEEL ────────────────────────────
    initColorWheel() {
        const wheel = document.getElementById('colorWheel');
        if (!wheel) return;
        const wCtx = wheel.getContext('2d');
        const cx = wheel.width / 2;
        const cy = wheel.height / 2;
        const radius = Math.min(cx, cy) - 4;

        // Draw color wheel
        for (let angle = 0; angle < 360; angle++) {
            const start = (angle - 1) * Math.PI / 180;
            const end = (angle + 1) * Math.PI / 180;
            wCtx.beginPath();
            wCtx.moveTo(cx, cy);
            wCtx.arc(cx, cy, radius, start, end);
            wCtx.closePath();
            const g = wCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            g.addColorStop(0, 'white');
            g.addColorStop(1, `hsl(${angle},100%,50%)`);
            wCtx.fillStyle = g;
            wCtx.fill();
        }
        // Dim the center slightly
        const dark = wCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        dark.addColorStop(0.0, 'rgba(0,0,0,0.12)');
        dark.addColorStop(0.15, 'transparent');
        wCtx.fillStyle = dark;
        wCtx.beginPath();
        wCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        wCtx.fill();

        const pickColor = (e) => {
            const rect = wheel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const dx = x - cx, dy = y - cy;
            if (Math.sqrt(dx * dx + dy * dy) > radius) return;
            const px = wCtx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
            const hex = '#' + px[0].toString(16).padStart(2, '0')
                + px[1].toString(16).padStart(2, '0')
                + px[2].toString(16).padStart(2, '0');
            this.setColor(hex);
        };
        let dragging = false;
        wheel.addEventListener('mousedown', e => { dragging = true; pickColor(e); });
        wheel.addEventListener('mousemove', e => { if (dragging) pickColor(e); });
        wheel.addEventListener('mouseup', () => { dragging = false; });
        wheel.addEventListener('mouseleave', () => { dragging = false; });
    },

    setColor(hex) {
        this.currentColor = hex;
        const preview = document.getElementById('colorPreview');
        if (preview) preview.style.background = hex;
        const hexInput = document.getElementById('hexInput');
        if (hexInput) hexInput.value = hex.toUpperCase();
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) colorPicker.value = hex;
    },

    // ── UNDO HISTORY ──────────────────────────
    saveToHistory() {
        try {
            const snap = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.history.push(snap);
            if (this.history.length > this.maxHistory) this.history.shift();
        } catch (error) {
            console.warn('Canvas history unavailable:', error);
        }
    },

    undo() {
        if (this.activeImageLayer) {
            this.activeImageLayer = null;
            this.imageMoveBaseData = null;
            this.isMovingImage = false;
            this.canvas.classList.remove('is-placing-image', 'is-moving-image');
            this.updateImageScaleControl();
            const last = this.history[this.history.length - 1];
            if (last) this.ctx.putImageData(last, 0, 0);
            return;
        }

        if (this.history.length <= 1) return;
        this.history.pop();
        this.ctx.putImageData(this.history[this.history.length - 1], 0, 0);
    },

    // ── IMAGE UPLOAD ──────────────────────────
    uploadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.commitActiveImageLayer();
                const scale = Math.min(
                    this.canvas.width / img.width,
                    this.canvas.height / img.height
                );
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (this.canvas.width - w) / 2;
                const y = (this.canvas.height - h) / 2;
                this.imageMoveBaseData = this.getCurrentCanvasImageData();
                if (!this.imageMoveBaseData) {
                    this.resetCanvasBitmap();
                    this.renderBaseCanvas();
                    this.history = [];
                    this.saveToHistory();
                    this.imageMoveBaseData = this.getCurrentCanvasImageData();
                }
                if (!this.imageMoveBaseData) return;

                this.activeImageLayer = { img, x, y, w, h, baseW: w, baseH: h };
                this.imageScalePercent = 100;
                this.updateImageScaleControl();
                this.canvas.classList.add('is-placing-image');
                this.renderActiveImageLayer();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    loadInitialImage(src, item = null) {
        if (!this.canvas || !this.ctx) {
            this.pendingInitialImage = { src, item };
            return;
        }

        this.pendingInitialImage = null;
        this.activeImageLayer = null;
        this.imageMoveBaseData = null;
        this.isMovingImage = false;
        this.canvas.classList.remove('is-placing-image', 'is-moving-image');
        this.updateImageScaleControl();

        if (!src) {
            this.baseImage = null;
            this.baseImageSrc = null;
            this.usingCssTemplate = false;
            this.clearCanvasTemplateBackground();
            this.renderBaseCanvas();
            this.history = [];
            this.saveToHistory();
            return;
        }

        this.baseImageSrc = src;
        this.setCanvasTemplateBackground(src);
        this.loadBaseImage(src, true);
    },

    loadBaseImage(src, useCors) {
        const img = new Image();
        if (useCors && !src.startsWith('data:image/')) {
            img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
            this.baseImage = img;
            this.usingCssTemplate = false;
            this.clearCanvasTemplateBackground();
            this.renderBaseCanvas();
            if (!this.getCurrentCanvasImageData()) {
                console.warn('External base image cannot be exported. Keeping it as a visual template only:', src);
                this.resetCanvasBitmap();
                this.baseImage = null;
                this.usingCssTemplate = true;
                this.setCanvasTemplateBackground(src);
                this.renderBaseCanvas();
            }
            this.history = [];
            this.saveToHistory();
        };
        img.onerror = () => {
            console.warn('Unable to draw selected item into canvas. Using it as a safe visual template:', src);
            this.baseImage = null;
            this.usingCssTemplate = true;
            this.renderBaseCanvas();
            this.history = [];
            this.saveToHistory();
        };
        img.src = src;
    },

    setCanvasTemplateBackground(src) {
        if (!this.canvas || !src) return;

        this.canvas.style.backgroundImage = `url("${src.replace(/"/g, '\\"')}")`;
        this.canvas.style.backgroundSize = 'contain';
        this.canvas.style.backgroundPosition = 'center';
        this.canvas.style.backgroundRepeat = 'no-repeat';
        this.canvas.style.backgroundColor = '#ffffff';
    },

    clearCanvasTemplateBackground() {
        if (!this.canvas) return;

        this.canvas.style.backgroundImage = '';
        this.canvas.style.backgroundSize = '';
        this.canvas.style.backgroundPosition = '';
        this.canvas.style.backgroundRepeat = '';
        this.canvas.style.backgroundColor = '';
    },

    renderBaseCanvas() {
        if (!this.canvas || !this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.usingCssTemplate) {
            return;
        }

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.baseImage) {
            return;
        }

        const scale = Math.min(
            this.canvas.width / this.baseImage.width,
            this.canvas.height / this.baseImage.height
        );
        const width = this.baseImage.width * scale;
        const height = this.baseImage.height * scale;
        const x = (this.canvas.width - width) / 2;
        const y = (this.canvas.height - height) / 2;
        this.ctx.drawImage(this.baseImage, x, y, width, height);
    },

    renderActiveImageLayer() {
        if (!this.activeImageLayer || !this.imageMoveBaseData) return;

        const layer = this.activeImageLayer;
        this.ctx.putImageData(this.imageMoveBaseData, 0, 0);
        this.ctx.drawImage(layer.img, layer.x, layer.y, layer.w, layer.h);
    },

    getCurrentCanvasImageData() {
        try {
            return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        } catch (error) {
            console.warn('Canvas pixels unavailable. Resetting editable layer:', error);
            return null;
        }
    },

    resetCanvasBitmap() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    },

    commitActiveImageLayer() {
        if (!this.activeImageLayer || !this.imageMoveBaseData) return;

        this.renderActiveImageLayer();
        this.activeImageLayer = null;
        this.imageMoveBaseData = null;
        this.isMovingImage = false;
        this.canvas.classList.remove('is-placing-image', 'is-moving-image');
        this.updateImageScaleControl();
        this.saveToHistory();
    },

    updateImageScaleControl() {
        const control = document.getElementById('imageScale');
        if (!control) return;

        control.disabled = !this.activeImageLayer;
        control.value = String(this.imageScalePercent);
    },

    resizeActiveImage(percent) {
        if (!this.activeImageLayer) return;

        this.imageScalePercent = Number(percent) || 100;
        const layer = this.activeImageLayer;
        const centerX = layer.x + layer.w / 2;
        const centerY = layer.y + layer.h / 2;
        const scale = this.imageScalePercent / 100;

        layer.w = layer.baseW * scale;
        layer.h = layer.baseH * scale;
        layer.x = centerX - layer.w / 2;
        layer.y = centerY - layer.h / 2;
        this.renderActiveImageLayer();
    },

    isInsideActiveImage(pos) {
        const layer = this.activeImageLayer;
        if (!layer) return false;

        return pos.x >= layer.x &&
            pos.x <= layer.x + layer.w &&
            pos.y >= layer.y &&
            pos.y <= layer.y + layer.h;
    },

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));

        // Tool selection
        document.querySelectorAll('.tool-icon').forEach(btn => {
            btn.addEventListener('click', () => {
                this.commitActiveImageLayer();
                document.querySelectorAll('.tool-icon').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
                
                // Mostrar/ocultar panel de texto
                const textPanel = document.getElementById('textToolPanel');
                if (textPanel) {
                    textPanel.hidden = this.currentTool !== 'text';
                }
            });
        });

        // Color picker (oculto, sincronizado)
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => this.setColor(e.target.value));
        }

        // Hex input
        const hexInput = document.getElementById('hexInput');
        if (hexInput) {
            hexInput.addEventListener('input', () => {
                let val = hexInput.value.trim();
                if (!val.startsWith('#')) val = '#' + val;
                if (/^#[0-9a-fA-F]{6}$/.test(val)) this.setColor(val);
            });
        }

        // Quick colors
        document.querySelectorAll('.quick-color').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.quick-color').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const bgColor = window.getComputedStyle(btn).backgroundColor;
                this.setColor(this.rgbToHex(bgColor));
            });
        });

        // Brush size
        const brushSize = document.getElementById('brushSize');
        if (brushSize) {
            brushSize.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
                const display = document.getElementById('sizeDisplay');
                if (display) display.textContent = this.brushSize + ' px';
            });
        }

        const imageScale = document.getElementById('imageScale');
        if (imageScale) {
            imageScale.addEventListener('input', (e) => this.resizeActiveImage(e.target.value));
        }

        // Action buttons
        const clearBtn = document.getElementById('clearCanvas');
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearCanvas());

        const downloadBtn = document.getElementById('downloadDesign');
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadDesign());

        const saveBtn = document.getElementById('saveDesign');
        if (saveBtn) saveBtn.addEventListener('click', () => handleCanvasSave(this));

        // Deshacer
        const undoBtn = document.getElementById('undoCanvas');
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
        });

        // Subir imagen
        const uploadBtn = document.getElementById('uploadImageBtn');
        const fileInput = document.getElementById('imageUpload');
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.uploadImage(e.target.files[0]);
                    fileInput.value = '';
                }
            });
        }

        // Text panel controls
        const fontSizeInput = document.getElementById('fontSize');
        const fontSizeDisplay = document.getElementById('fontSizeDisplay');
        if (fontSizeInput && fontSizeDisplay) {
            fontSizeInput.addEventListener('input', (e) => {
                this.fontSize = parseInt(e.target.value);
                fontSizeDisplay.textContent = this.fontSize + 'px';
            });
        }

        const fontStyleSelect = document.getElementById('fontStyle');
        if (fontStyleSelect) {
            fontStyleSelect.addEventListener('change', (e) => {
                this.fontStyle = e.target.value;
            });
        }
    },

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    },

    onMouseDown(e) {
        const pos = this.getMousePos(e);

        if (this.activeImageLayer) {
            if (this.isInsideActiveImage(pos)) {
                this.isMovingImage = true;
                this.isDrawing = false;
                this.imageDragOffsetX = pos.x - this.activeImageLayer.x;
                this.imageDragOffsetY = pos.y - this.activeImageLayer.y;
                this.canvas.classList.add('is-moving-image');
                return;
            }

            this.commitActiveImageLayer();
        }

        // Manejar herramienta de texto
        if (this.currentTool === 'text') {
            const textInput = document.getElementById('textInput');
            if (!textInput) return;
            
            const text = textInput.value || '';
            if (text) {
                this.saveToHistory();
                this.drawText(pos.x, pos.y, text);
                this.saveToHistory();
                textInput.value = '';
            }
            return;
        }

        this.startX = pos.x;
        this.startY = pos.y;
        this.isDrawing = true;

        // Guardar estado para preview de figuras
        if (this.currentTool === 'fill') {
            this.saveToHistory();
            this.floodFill(this.startX, this.startY);
            this.saveToHistory();
            this.isDrawing = false;
            return;
        }

        if (this.currentTool === 'line' || this.currentTool === 'rect' || this.currentTool === 'circle') {
            this.lastImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        } else if (this.currentTool === 'brush') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
        }
    },

    onMouseMove(e) {
        const pos = this.getMousePos(e);

        if (this.activeImageLayer && this.isMovingImage) {
            this.activeImageLayer.x = pos.x - this.imageDragOffsetX;
            this.activeImageLayer.y = pos.y - this.imageDragOffsetY;
            this.renderActiveImageLayer();
            return;
        }

        if (!this.isDrawing) return;

        switch (this.currentTool) {
            case 'brush':
                this.drawBrush(pos.x, pos.y);
                break;
            case 'eraser':
                this.drawEraser(pos.x, pos.y);
                break;
            case 'line':
                this.previewLine(pos.x, pos.y);
                break;
            case 'rect':
                this.previewRect(pos.x, pos.y);
                break;
            case 'circle':
                this.previewCircle(pos.x, pos.y);
                break;
            case 'fill':
                this.floodFill(pos.x, pos.y);
                break;
        }
    },

    onMouseUp(e) {
        if (this.activeImageLayer && this.isMovingImage) {
            this.isMovingImage = false;
            this.canvas.classList.remove('is-moving-image');
            this.renderActiveImageLayer();
            return;
        }

        if (!this.isDrawing) return;

        this.isDrawing = false;

        if (this.currentTool === 'brush') {
            this.ctx.closePath();
        }

        if (['brush', 'eraser', 'line', 'rect', 'circle'].includes(this.currentTool)) {
            this.saveToHistory();
        }
    },

    drawBrush(x, y) {
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    },

    drawEraser(x, y) {
        this.ctx.clearRect(
            x - this.brushSize / 2,
            y - this.brushSize / 2,
            this.brushSize,
            this.brushSize
        );
    },

    previewLine(x, y) {
        if (this.lastImageData) {
            this.ctx.putImageData(this.lastImageData, 0, 0);
        }
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    },

    previewRect(x, y) {
        if (this.lastImageData) {
            this.ctx.putImageData(this.lastImageData, 0, 0);
        }
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.strokeRect(
            this.startX,
            this.startY,
            x - this.startX,
            y - this.startY
        );
    },

    previewCircle(x, y) {
        if (this.lastImageData) {
            this.ctx.putImageData(this.lastImageData, 0, 0);
        }
        const radius = Math.sqrt(
            Math.pow(x - this.startX, 2) + Math.pow(y - this.startY, 2)
        );
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.beginPath();
        this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    },

    drawText(x, y, text) {
        const fontWeight = this.fontStyle === 'bold' ? '700' : '400';
        const fontSlant = this.fontStyle === 'italic' ? 'italic ' : '';
        this.ctx.fillStyle = this.currentColor;
        this.ctx.font = `${fontSlant}${fontWeight} ${this.fontSize}px Arial, sans-serif`;
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, x, y);
    },

    floodFill(x, y) {
        // Implementación básica del flood fill
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        const colorRgb = this.hexToRgb(this.currentColor);
        const targetColor = this.getPixelColor(data, x, y, this.canvas.width);

        if (this.colorsMatch(targetColor, colorRgb)) return;

        const queue = [[x, y]];
        const visited = new Set();

        while (queue.length > 0) {
            const [px, py] = queue.shift();
            const key = `${px},${py}`;

            if (visited.has(key) || px < 0 || px >= this.canvas.width || py < 0 || py >= this.canvas.height) continue;

            visited.add(key);
            const pixelColor = this.getPixelColor(data, px, py, this.canvas.width);

            if (this.colorsMatch(pixelColor, targetColor)) {
                this.setPixelColor(data, px, py, this.canvas.width, colorRgb);
                queue.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    },

    getPixelColor(data, x, y, width) {
        const index = (Math.floor(y) * width + Math.floor(x)) * 4;
        return {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            a: data[index + 3]
        };
    },

    setPixelColor(data, x, y, width, color) {
        const index = (Math.floor(y) * width + Math.floor(x)) * 4;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
    },

    colorsMatch(c1, c2, tolerance = 10) {
        return Math.abs(c1.r - c2.r) < tolerance &&
            Math.abs(c1.g - c2.g) < tolerance &&
            Math.abs(c1.b - c2.b) < tolerance;
    },

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },

    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        const matches = rgb.match(/\d+/g);
        if (!matches || matches.length < 3) return '#000000';
        const r = parseInt(matches[0]).toString(16).padStart(2, '0');
        const g = parseInt(matches[1]).toString(16).padStart(2, '0');
        const b = parseInt(matches[2]).toString(16).padStart(2, '0');
        return '#' + r + g + b;
    },

    clearCanvas() {
        this.activeImageLayer = null;
        this.imageMoveBaseData = null;
        this.isMovingImage = false;
        this.canvas.classList.remove('is-placing-image', 'is-moving-image');
        this.updateImageScaleControl();
        this.resetCanvasBitmap();
        this.renderBaseCanvas();
        this.history = [];
        this.saveToHistory();
    },

    downloadDesign() {
        this.commitActiveImageLayer();
        const link = document.createElement('a');
        try {
            link.href = this.canvas.toDataURL('image/png');
        } catch (error) {
            alert('The editable layer is blocked by an external image. Use Clear and try again.');
            return;
        }
        link.download = 'flag-vexilo-' + Date.now() + '.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('✓ Flag downloaded');
    },

    saveDesign() {
        this.commitActiveImageLayer();
        const name = prompt('Design name?', 'My Flag #' + Math.floor(Math.random() * 1000));
        if (!name) return;

        const designData = this.canvas.toDataURL('image/png');

        const design = {
            id: Date.now(),
            name: name,
            data: designData,
            timestamp: new Date().toISOString()
        };

        const saved = JSON.parse(localStorage.getItem('userDesigns') || '[]');
        saved.push(design);
        localStorage.setItem('userDesigns', JSON.stringify(saved));

        alert('✓ Design saved: ' + name);
    }
};

window.DrawingApp = DrawingApp;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DrawingApp.init());
} else {
    DrawingApp.init();
}
