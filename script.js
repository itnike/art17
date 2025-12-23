// ===== КОНФИГУРАЦИЯ =====
const CONFIG = {
    API_URL: 'data/products.json',
    STORAGE_KEY: 'art17_applications',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    PHONE_REGEX: /^[\+]?[78]?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    LOADING_DELAY: 300 // ms
};

// ===== STATE MANAGEMENT =====
const AppState = {
    isLoading: false,
    products: [],
    services: [],
    applications: [],
    
    init() {
        this.applications = this.loadApplications();
    },
    
    loadApplications() {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Ошибка загрузки заявок:', error);
            return [];
        }
    },
    
    saveApplication(application) {
        try {
            this.applications.push({
                ...application,
                id: Date.now(),
                date: new Date().toISOString(),
                status: 'new'
            });
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.applications));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения заявки:', error);
            return false;
        }
    }
};

// ===== DOM ELEMENTS =====
const Elements = {
    get mobileMenuBtn() {
        return document.querySelector('.mobile-menu-btn');
    },
    get navLinks() {
        return document.querySelector('.nav-links');
    },
    get contactForm() {
        return document.getElementById('contactForm');
    },
    get scrollTopBtn() {
        return document.querySelector('.scroll-top-btn');
    },
    get header() {
        return document.querySelector('.main-header');
    }
};

// ===== API SERVICE =====
const ApiService = {
    async fetchData() {
        try {
            const response = await fetch(CONFIG.API_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            throw error;
        }
    },
    
    async loadServices() {
        try {
            const data = await this.fetchData();
            return data.services || [];
        } catch (error) {
            return [];
        }
    },
    
    async loadProducts() {
        try {
            const data = await this.fetchData();
            return data.products || [];
        } catch (error) {
            return [];
        }
    }
};

// ===== UI RENDERERS =====
const UIRenderer = {
    createSpinner() {
        return `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Загрузка...</p>
            </div>
        `;
    },
    
    createError(message) {
        return `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="secondary-btn retry-btn">Повторить попытку</button>
            </div>
        `;
    },
    
    renderServices(services) {
        const container = document.getElementById('services-container');
        if (!services.length) {
            container.innerHTML = this.createError('Услуги временно недоступны');
            return;
        }
        
        container.innerHTML = services.map(service => `
            <div class="service-card" role="article">
                <div class="service-icon">
                    <i class="fas ${service.icon || 'fa-paint-brush'}"></i>
                </div>
                <div class="service-info">
                    <h3>${service.name}</h3>
                    <p>${service.description}</p>
                    <div class="service-price">${service.price}</div>
                    <button class="cta-button secondary-btn service-btn" 
                            onclick="App.selectService(${service.id})"
                            aria-label="Заказать услугу ${service.name}">
                        <i class="fas fa-calendar-check"></i>
                        <span>Заказать услугу</span>
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    renderProducts(products) {
        const container = document.getElementById('products-container');
        if (!products.length) {
            container.innerHTML = this.createError('Товары временно недоступны');
            return;
        }
        
        container.innerHTML = products.map(product => `
            <div class="product-card" role="article">
                <img src="${product.image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3'}" 
                     alt="${product.name}" 
                     class="product-image"
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3'">
                <div class="product-info">
                    <span class="product-category">${product.category || 'Оборудование'}</span>
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">${product.price}</div>
                    <p><i class="fas fa-map-marker-alt"></i> ${product.location || 'В наличии'}</p>
                    <button class="cta-button primary-btn product-btn"
                            onclick="App.selectProduct(${product.id})"
                            aria-label="Заказать товар ${product.name}">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Заказать</span>
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    renderPortfolio(products) {
        const container = document.getElementById('portfolio-container');
        if (!products.length) {
            container.innerHTML = this.createError('Портфолио временно недоступно');
            return;
        }
        
        container.innerHTML = products.map(product => `
            <div class="portfolio-item" role="article">
                <img src="${product.image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3'}" 
                     alt="${product.name}"
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3'">
                <div class="portfolio-overlay">
                    <h3>${product.name}</h3>
                    <p>${product.location || 'Реализованный проект'}</p>
                    <p>${product.price}</p>
                </div>
            </div>
        `).join('');
    }
};

// ===== FORM VALIDATION =====
const FormValidator = {
    validateField(field, value) {
        const errorElement = document.getElementById(`${field}-error`);
        
        if (!errorElement) return true;
        
        errorElement.textContent = '';
        
        switch (field) {
            case 'name':
                if (!value.trim()) {
                    errorElement.textContent = 'Пожалуйста, введите ваше имя';
                    return false;
                }
                if (value.length < 2) {
                    errorElement.textContent = 'Имя должно содержать минимум 2 символа';
                    return false;
                }
                break;
                
            case 'phone':
                if (!value.trim()) {
                    errorElement.textContent = 'Пожалуйста, введите телефон';
                    return false;
                }
                if (!CONFIG.PHONE_REGEX.test(value)) {
                    errorElement.textContent = 'Введите корректный номер телефона';
                    return false;
                }
                break;
                
            case 'email':
                if (!value.trim()) {
                    errorElement.textContent = 'Пожалуйста, введите email';
                    return false;
                }
                if (!CONFIG.EMAIL_REGEX.test(value)) {
                    errorElement.textContent = 'Введите корректный email адрес';
                    return false;
                }
                break;
                
            case 'message':
                if (value.length > 1000) {
                    errorElement.textContent = 'Сообщение не должно превышать 1000 символов';
                    return false;
                }
                break;
        }
        
        return true;
    },
    
    validateForm(formData) {
        let isValid = true;
        
        isValid = this.validateField('name', formData.name) && isValid;
        isValid = this.validateField('phone', formData.phone) && isValid;
        isValid = this.validateField('email', formData.email) && isValid;
        isValid = this.validateField('message', formData.message) && isValid;
        
        return isValid;
    }
};

// ===== EVENT HANDLERS =====
const EventHandlers = {
    init() {
        // Мобильное меню
        if (Elements.mobileMenuBtn) {
            Elements.mobileMenuBtn.addEventListener('click', this.toggleMobileMenu);
        }
        
        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (Elements.navLinks.classList.contains('active')) {
                    this.toggleMobileMenu();
                }
            });
        });
        
        // Плавная прокрутка
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleSmoothScroll);
        });
        
        // Форма
        if (Elements.contactForm) {
            Elements.contactForm.addEventListener('submit', this.handleFormSubmit);
            
            // Валидация в реальном времени
            ['name', 'phone', 'email', 'message'].forEach(field => {
                const input = document.getElementById(field);
                if (input) {
                    input.addEventListener('blur', (e) => {
                        FormValidator.validateField(field, e.target.value);
                    });
                }
            });
        }
        
        // Кнопка "Наверх"
        if (Elements.scrollTopBtn) {
            Elements.scrollTopBtn.addEventListener('click', this.scrollToTop);
        }
        
        // Отслеживание скролла
        window.addEventListener('scroll', this.handleScroll);
        
        // Клик вне меню
        document.addEventListener('click', this.handleOutsideClick);
        
        // Клавиша Escape
        document.addEventListener('keydown', this.handleEscapeKey);
    },
    
    toggleMobileMenu() {
        const btn = Elements.mobileMenuBtn;
        const menu = Elements.navLinks;
        
        btn.classList.toggle('active');
        menu.classList.toggle('active');
        btn.setAttribute('aria-expanded', btn.classList.contains('active'));
        
        // Блокировка скролла
        document.body.style.overflow = btn.classList.contains('active') ? 'hidden' : '';
    },
    
    handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = Elements.header?.offsetHeight || 80;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Обновление активной ссылки
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        }
    },
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            interest: document.getElementById('interest').value,
            message: document.getElementById('message').value.trim()
        };
        
        if (!FormValidator.validateForm(formData)) {
            this.showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }
        
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        // Показ состояния загрузки
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Отправка...</span>';
        submitBtn.disabled = true;
        
        try {
            // Имитация отправки на сервер
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const saved = AppState.saveApplication(formData);
            
            if (saved) {
                this.showNotification('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в течение часа.', 'success');
                this.reset();
                
                // Обновление счетчика заявок (если есть)
                this.updateApplicationsCounter();
            } else {
                throw new Error('Ошибка сохранения');
            }
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            this.showNotification('Произошла ошибка при отправке. Пожалуйста, попробуйте позже.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },
    
    handleScroll() {
        // Показ/скрытие кнопки "Наверх"
        if (Elements.scrollTopBtn) {
            if (window.scrollY > 500) {
                Elements.scrollTopBtn.classList.add('visible');
            } else {
                Elements.scrollTopBtn.classList.remove('visible');
            }
        }
        
        // Добавление класса при скролле для header
        if (Elements.header) {
            if (window.scrollY > 100) {
                Elements.header.classList.add('scrolled');
            } else {
                Elements.header.classList.remove('scrolled');
            }
        }
        
        // Подсветка активного раздела
        this.highlightActiveSection();
    },
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },
    
    handleOutsideClick(e) {
        if (!Elements.navLinks || !Elements.mobileMenuBtn) return;
        
        const isClickInsideMenu = Elements.navLinks.contains(e.target);
        const isClickOnButton = Elements.mobileMenuBtn.contains(e.target);
        
        if (!isClickInsideMenu && !isClickOnButton && Elements.navLinks.classList.contains('active')) {
            this.toggleMobileMenu();
        }
    },
    
    handleEscapeKey(e) {
        if (e.key === 'Escape' && Elements.navLinks?.classList.contains('active')) {
            this.toggleMobileMenu();
        }
    },
    
    highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    },
    
    showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="Закрыть уведомление">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Закрытие по клику
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    },
    
    updateApplicationsCounter() {
        const counter = document.querySelector('.applications-counter');
        if (counter) {
            counter.textContent = AppState.applications.length;
        }
    }
};

// ===== MAIN APPLICATION =====
const App = {
    async init() {
        // Инициализация состояния
        AppState.init();
        
        // Инициализация обработчиков событий
        EventHandlers.init();
        
        // Загрузка данных
        await this.loadData();
        
        // Обновление счетчика заявок
        EventHandlers.updateApplicationsCounter();
        
        console.log('Приложение инициализировано');
    },
    
    async loadData() {
        try {
            // Показ спиннеров
            this.showLoaders();
            
            // Параллельная загрузка данных
            const [services, products] = await Promise.all([
                ApiService.loadServices(),
                ApiService.loadProducts()
            ]);
            
            AppState.services = services;
            AppState.products = products;
            
            // Рендеринг данных
            UIRenderer.renderServices(services);
            UIRenderer.renderProducts(products);
            UIRenderer.renderPortfolio(products);
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.showDataErrors();
        } finally {
            this.hideLoaders();
        }
    },
    
    showLoaders() {
        ['services', 'products', 'portfolio'].forEach(type => {
            const container = document.getElementById(`${type}-container`);
            if (container) {
                container.innerHTML = UIRenderer.createSpinner();
            }
        });
    },
    
    hideLoaders() {
        ['services', 'products', 'portfolio'].forEach(type => {
            const loadingEl = document.getElementById(`${type}-loading`);
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
        });
    },
    
    showDataErrors() {
        ['services', 'products', 'portfolio'].forEach(type => {
            const container = document.getElementById(`${type}-container`);
            if (container) {
                container.innerHTML = UIRenderer.createError('Данные временно недоступны. Пожалуйста, попробуйте позже.');
                
                // Добавляем обработчик для кнопки повтора
                const retryBtn = container.querySelector('.retry-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => this.loadData());
                }
            }
        });
    },
    
    selectService(serviceId) {
        const service = AppState.services.find(s => s.id === serviceId);
        if (service) {
            document.getElementById('interest').value = 'service';
            document.getElementById('message').value = 
                `Интересует услуга: ${service.name}\n${service.price}\n\nДополнительная информация: `;
            
            // Прокрутка к форме
            window.scrollTo({
                top: document.getElementById('contact').offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Фокус на поле сообщения
            setTimeout(() => document.getElementById('message').focus(), 500);
        }
    },
    
    selectProduct(productId) {
        const product = AppState.products.find(p => p.id === productId);
        if (product) {
            document.getElementById('interest').value = 'product';
            document.getElementById('message').value = 
                `Интересует товар: ${product.name}\nЦена: ${product.price}\nЛокация: ${product.location}\n\nДополнительная информация: `;
            
            // Прокрутка к форме
            window.scrollTo({
                top: document.getElementById('contact').offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Фокус на поле сообщения
            setTimeout(() => document.getElementById('message').focus(), 500);
        }
    }
};

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ HTML =====
window.scrollToContact = function() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        window.scrollTo({
            top: contactSection.offsetTop - 80,
            behavior: 'smooth'
        });
    }
};

// Экспортируем App для доступа из HTML
window.App = App;

// ===== СТИЛИ ДЛЯ УВЕДОМЛЕНИЙ =====
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        max-width: 400px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 9999;
        border-left: 4px solid #3182CE;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        border-left-color: #38A169;
    }
    
    .notification.error {
        border-left-color: #E53E3E;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #2D3748;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .notification.success .notification-content i {
        color: #38A169;
    }
    
    .notification.error .notification-content i {
        color: #E53E3E;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: #A0AEC0;
        cursor: pointer;
        padding: 0.25rem;
        font-size: 0.875rem;
        transition: color 0.2s;
    }
    
    .notification-close:hover {
        color: #718096;
    }
`;

document.head.appendChild(notificationStyles);
