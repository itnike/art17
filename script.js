// ===== КОНФИГУРАЦИЯ =====
const SITE_CONFIG = {
    DATA_KEY: 'art17_admin_data', // Тот же ключ, что и в админке!
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
        console.log('ℹ️ Данных нет, возвращаем пустую структуру');
        return { services: [], products: [] };
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        return { services: [], products: [] };
    }
}

// ===== РЕНДЕРИНГ УСЛУГ НА ГЛАВНОЙ =====
function renderServices() {
    const container = document.getElementById('services-container');
    if (!container) {
        console.log('ℹ️ Контейнер услуг не найден');
        return;
    }
    
    const data = loadSiteData();
    
    if (!data.services || data.services.length === 0) {
        container.innerHTML = `
            <div class="service-empty">
                <i class="fas fa-concierge-bell"></i>
                <p>Услуги временно недоступны</p>
                <small>Администратор еще не добавил услуги</small>
            </div>
        `;
        return;
    }
    
    // Ограничиваем показ 4 услугами
    const servicesToShow = data.services.slice(0, 4);
    
    container.innerHTML = servicesToShow.map(service => `
        <div class="service-card">
            <div class="service-icon">
                <i class="fas ${service.icon || 'fa-paint-brush'}"></i>
            </div>
            <h4>${service.name || 'Услуга'}</h4>
            <p>${service.description || 'Описание услуги'}</p>
            <div class="service-price">
                ${service.price || 'Цена по запросу'}
            </div>
        </div>
    `).join('');
    
    console.log(`✅ Услуги отрисованы: ${servicesToShow.length} шт`);
}

// ===== РЕНДЕРИНГ ТОВАРОВ НА ГЛАВНОЙ =====
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) {
        console.log('ℹ️ Контейнер товаров не найден');
        return;
    }
    
    const data = loadSiteData();
    
    if (!data.products || data.products.length === 0) {
        container.innerHTML = `
            <div class="products-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Товары временно недоступны</p>
                <small>Администратор еще не добавил товары</small>
            </div>
        `;
        return;
    }
    
    // Ограничиваем показ 4 товарами
    const productsToShow = data.products.slice(0, 4);
    
    container.innerHTML = productsToShow.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300x200'}" 
                     alt="${product.name || 'Товар'}"
                     onerror="this.src='https://via.placeholder.com/300x200'">
            </div>
            <div class="product-info">
                <h4>${product.name || 'Товар'}</h4>
                <p>${product.description || 'Описание товара'}</p>
                <div class="product-meta">
                    <span class="product-category">${product.category || 'Категория'}</span>
                    <span class="product-price">${product.price || 'Цена по запросу'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log(`✅ Товары отрисованы: ${productsToShow.length} шт`);
}

// ===== РЕНДЕРИНГ ПОРТФОЛИО НА ГЛАВНОЙ =====
function renderPortfolio() {
    const container = document.getElementById('portfolio-container');
    if (!container) {
        console.log('ℹ️ Контейнер портфолио не найден');
        return;
    }
    
    const data = loadSiteData();
    
    // ФИЛЬТРУЕМ только товары с showInPortfolio === true
    const portfolioItems = data.products ? 
        data.products.filter(product => product.showInPortfolio === true) : [];
    
    if (portfolioItems.length === 0) {
        container.innerHTML = `
            <div class="portfolio-empty">
                <i class="fas fa-images"></i>
                <p>Портфолио временно недоступно</p>
                <small>Администратор еще не добавил работы в портфолио</small>
            </div>
        `;
        return;
    }
    
    // Ограничиваем показ 6 работами
    const itemsToShow = portfolioItems.slice(0, 6);
    
    container.innerHTML = itemsToShow.map(product => `
        <div class="portfolio-item">
            <div class="portfolio-image">
                <img src="${product.image || 'https://via.placeholder.com/400x300'}" 
                     alt="${product.name || 'Работа'}"
                     onerror="this.src='https://via.placeholder.com/400x300'">
            </div>
            <div class="portfolio-overlay">
                <h4>${product.name || 'Работа'}</h4>
                <p>${product.category || 'Категория'}</p>
                <div class="portfolio-price">${product.price || ''}</div>
            </div>
        </div>
    `).join('');
    
    console.log(`✅ Портфолио отрисовано: ${itemsToShow.length} шт`);
}

// ===== ОТПРАВКА ЗАЯВКИ =====
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
        
        // Сохраняем заявку
        let applications = JSON.parse(localStorage.getItem(SITE_CONFIG.APPLICATIONS_KEY)) || [];
        applications.push(application);
        localStorage.setItem(SITE_CONFIG.APPLICATIONS_KEY, JSON.stringify(applications));
        
        // Показываем сообщение
        alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
        form.reset();
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ САЙТА =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Сайт Art17 загружается...');
    
    // Загружаем и рендерим данные
    renderServices();
    renderProducts();
    renderPortfolio();
    
    // Настраиваем форму заявки
    setupApplicationForm();
    
    // Мобильное меню (если есть)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    console.log('✅ Сайт Art17 готов к работе!');
    
    // Тестовая проверка данных
    setTimeout(() => {
        const data = loadSiteData();
        console.log('📋 Проверка данных:');
        console.log('- Услуг:', data.services?.length || 0);
        console.log('- Товаров:', data.products?.length || 0);
        console.log('- В портфолио:', data.products?.filter(p => p.showInPortfolio).length || 0);
    }, 500);
});
