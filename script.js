// ===== КОНФИГУРАЦИЯ =====
const SITE_CONFIG = {
    DATA_KEY: 'art17_admin_data',
    APPLICATIONS_KEY: 'art17_applications'
};

// ===== ЗАГРУЗКА ДАННЫХ =====
function loadSiteData() {
    try {
        const stored = localStorage.getItem(SITE_CONFIG.DATA_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            console.log('📊 Данные для сайта загружены:', data);
            return data;
        }
        console.log('ℹ️ Данных нет');
        return { services: [], products: [] };
    } catch (error) {
        console.error('❌ Ошибка:', error);
        return { services: [], products: [] };
    }
}

// ===== РЕНДЕРИНГ УСЛУГ =====
function renderServices() {
    const container = document.getElementById('services-container');
    if (!container) return;
    
    const data = loadSiteData();
    
    if (!data.services || data.services.length === 0) {
        container.innerHTML = `
            <div class="service-empty">
                <i class="fas fa-concierge-bell"></i>
                <p>Услуги временно недоступны</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.services.slice(0, 4).map(service => `
        <div class="service-card">
            <div class="service-icon">
                <i class="fas ${service.icon || 'fa-paint-brush'}"></i>
            </div>
            <h4>${service.name || 'Услуга'}</h4>
            <p>${service.description || 'Описание'}</p>
            <div class="service-price">
                ${service.price || 'Цена по запросу'}
            </div>
        </div>
    `).join('');
}

// ===== РЕНДЕРИНГ ТОВАРОВ =====
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    const data = loadSiteData();
    
    if (!data.products || data.products.length === 0) {
        container.innerHTML = `
            <div class="products-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Товары временно недоступны</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.products.slice(0, 4).map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300x200'}" 
                     alt="${product.name || 'Товар'}"
                     onerror="this.src='https://via.placeholder.com/300x200'">
            </div>
            <div class="product-info">
                <h4>${product.name || 'Товар'}</h4>
                <p>${product.description || 'Описание'}</p>
                <div class="product-meta">
                    <span class="product-category">${product.category || 'Категория'}</span>
                    <span class="product-price">${product.price || 'Цена по запросу'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== РЕНДЕРИНГ ПОРТФОЛИО =====
function renderPortfolio() {
    const container = document.getElementById('portfolio-container');
    if (!container) return;
    
    const data = loadSiteData();
    
    const portfolioItems = data.products ? 
        data.products.filter(product => product.showInPortfolio === true) : [];
    
    if (portfolioItems.length === 0) {
        container.innerHTML = `
            <div class="portfolio-empty">
                <i class="fas fa-images"></i>
                <p>Портфолио временно недоступно</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = portfolioItems.slice(0, 6).map(product => `
        <div class="portfolio-item">
            <img src="${product.image || 'https://via.placeholder.com/400x300'}" 
                 alt="${product.name || 'Работа'}"
                 onerror="this.src='https://via.placeholder.com/400x300'">
            <div class="portfolio-overlay">
                <h4>${product.name || 'Работа'}</h4>
                <p>${product.category || ''}</p>
            </div>
        </div>
    `).join('');
}

// ===== ФОРМА ЗАЯВКИ =====
function setupApplicationForm() {
    const form = document.getElementById('applicationForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const application = {
            id: Date.now(),
            date: new Date().toISOString(),
            name: document.getElementById('applicantName').value,
            phone: document.getElementById('applicantPhone').value,
            email: document.getElementById('applicantEmail').value,
            category: document.getElementById('applicantCategory').value,
            message: document.getElementById('applicantMessage').value,
            status: 'new'
        };
        
        let applications = JSON.parse(localStorage.getItem(SITE_CONFIG.APPLICATIONS_KEY)) || [];
        applications.push(application);
        localStorage.setItem(SITE_CONFIG.APPLICATIONS_KEY, JSON.stringify(applications));
        
        alert('Спасибо! Ваша заявка отправлена.');
        form.reset();
    });
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружается...');
    
    renderServices();
    renderProducts();
    renderPortfolio();
    setupApplicationForm();
    
    console.log('Сайт готов!');
});
