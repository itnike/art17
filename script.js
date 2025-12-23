// ===== КОНФИГУРАЦИЯ =====
const CONFIG = {
    API_URL: 'data/products.json',
    STORAGE_KEY: 'art17_applications',
    ADMIN_STORAGE_KEY: 'art17_admin_data',
    PHONE_REGEX: /^[\+]?[78]?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// ===== STATE MANAGEMENT =====
const AppState = {
    isLoading: false,
    products: [],
    services: [],
    applications: [],
    siteData: null,
    
    async init() {
        this.applications = this.loadApplications();
        await this.loadSiteData();
    },
    
    async loadSiteData() {
        try {
            // Пытаемся загрузить из админки (localStorage)
            const adminData = localStorage.getItem(CONFIG.ADMIN_STORAGE_KEY);
            if (adminData) {
                this.siteData = JSON.parse(adminData);
                console.log('Данные загружены из админки');
            } else {
                // Загружаем из файла
                const response = await fetch(CONFIG.API_URL);
                if (response.ok) {
                    this.siteData = await response.json();
                    console.log('Данные загружены из файла');
                } else {
                    console.error('Файл с данными не найден');
                    this.siteData = { services: [], products: [] };
                }
            }
            
            this.services = this.siteData.services || [];
            this.products = this.siteData.products || [];
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.siteData = { services: [], products: [] };
            this.services = [];
            this.products = [];
        }
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
            
            // Показываем уведомление
            this.showNotification('Заявка сохранена!');
            
            return true;
        } catch (error) {
            console.error('Ошибка сохранения заявки:', error);
            return false;
        }
    },
    
    showNotification(message) {
        // Создаем простое уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Добавляем стили для анимации
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }
    }
};

// ===== UI MANAGER =====
const UIManager = {
    init() {
        this.renderServices();
        this.renderProducts();
        this.renderPortfolio();
        this.setupEventListeners();
    },
    
    async renderServices() {
        const container = document.getElementById('services-container');
        if (!container) return;
        
        // Показываем загрузку
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Загрузка услуг...</p>
            </div>
        `;
        
        try {
            await AppState.init();
            const services = AppState.services;
            
            if (services.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-concierge-bell"></i>
                        <h3>Услуги временно недоступны</h3>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = services.map(service => `
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas ${service.icon || 'fa-paint-brush'}"></i>
                    </div>
                    <div class="service-info">
                        <h3>${service.name}</h3>
                        <p>${service.description}</p>
                        ${service.features?.length ? `
                            <ul class="service-features">
                                ${service.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                            </ul>
                        ` : ''}
                        <div class="service-price">${service.price}</div>
                        <button class="cta-button secondary-btn" onclick="selectService(${service.id})">
                            <i class="fas fa-calendar-check"></i>
                            Заказать услугу
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Ошибка рендеринга услуг:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Ошибка загрузки услуг</p>
                </div>
            `;
        }
    },
    
    async renderProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Загрузка товаров...</p>
            </div>
        `;
        
        try {
            const products = AppState.products;
            
            if (products.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Товары временно недоступны</h3>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = products.map(product => `
                <div class="product-card">
                    <img src="${product.image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3'}" 
                         alt="${product.name}" 
                         class="product-image"
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3'">
                    <div class="product-info">
                        <span class="product-category">${product.category || 'Оборудование'}</span>
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        ${product.specs ? `
                            <div class="product-specs">
                                ${product.specs.material ? `<p><i class="fas fa-cube"></i> ${product.specs.material}</p>` : ''}
                                ${product.specs.age ? `<p><i class="fas fa-child"></i> ${product.specs.age}</p>` : ''}
                                ${product.specs.size ? `<p><i class="fas fa-ruler"></i> ${product.specs.size}</p>` : ''}
                            </div>
                        ` : ''}
                        <div class="product-price">${product.price}</div>
                        <p><i class="fas fa-map-marker-alt"></i> ${product.location || 'В наличии'}</p>
                        <button class="cta-button primary-btn" onclick="selectProduct(${product.id})">
                            <i class="fas fa-shopping-cart"></i>
                            Заказать
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Ошибка рендеринга товаров:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Ошибка загрузки товаров</p>
                </div>
            `;
        }
    },
    
    renderPortfolio() {
        const container = document.getElementById('portfolio-container');
        if (!container) return;
        
        const products = AppState.products;
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <h3>Портфолио временно недоступно</h3>
                </div>
            `;
            return;
        }
        
        // Берем первые 6 товаров для портфолио
        const portfolioItems = products.slice(0, 6);
        
        container.innerHTML = portfolioItems.map(product => `
            <div class="portfolio-item">
                <img src="${product.image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3'}" 
                     alt="${product.name}"
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3'">
                <div class="portfolio-overlay">
                    <h3>${product.name}</h3>
                    <p>${product.category || 'Проект'}</p>
                    <p>${product.price}</p>
                </div>
            </div>
        `).join('');
    },
    
    setupEventListeners() {
        // Мобильное меню
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                mobileMenuBtn.setAttribute('aria-expanded', 
                    navLinks.classList.contains('active'));
            });
        }
        
        // Плавная прокрутка
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 80;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Закрываем мобильное меню
                    if (navLinks) navLinks.classList.remove('active');
                }
            });
        });
        
        // Форма
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleFormSubmit.bind(this));
            
            // Валидация в реальном времени
            ['name', 'phone', 'email'].forEach(field => {
                const input = document.getElementById(field);
                if (input) {
                    input.addEventListener('blur', () => this.validateField(field, input.value));
                }
            });
        }
        
        // Кнопка "Наверх"
        const scrollTopBtn = document.querySelector('.scroll-top-btn');
        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 500) {
                    scrollTopBtn.classList.add('visible');
                } else {
                    scrollTopBtn.classList.remove('visible');
                }
            });
        }
        
        // Подсветка активного раздела при скролле
        window.addEventListener('scroll', this.highlightActiveSection.bind(this));
    },
    
    validateField(field, value) {
        const errorElement = document.getElementById(`${field}-error`);
        if (!errorElement) return true;
        
        errorElement.textContent = '';
        
        switch (field) {
            case 'name':
                if (!value.trim()) {
                    errorElement.textContent = 'Введите имя';
                    return false;
                }
                if (value.length < 2) {
                    errorElement.textContent = 'Минимум 2 символа';
                    return false;
                }
                break;
                
            case 'phone':
                if (!value.trim()) {
                    errorElement.textContent = 'Введите телефон';
                    return false;
                }
                if (!CONFIG.PHONE_REGEX.test(value)) {
                    errorElement.textContent = 'Неверный формат телефона';
                    return false;
                }
                break;
                
            case 'email':
                if (!value.trim()) {
                    errorElement.textContent = 'Введите email';
                    return false;
                }
                if (!CONFIG.EMAIL_REGEX.test(value)) {
                    errorElement.textContent = 'Неверный формат email';
                    return false;
                }
                break;
        }
        
        return true;
    },
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            interest: document.getElementById('interest').value,
            message: document.getElementById('message').value.trim()
        };
        
        // Валидация
        let isValid = true;
        isValid = this.validateField('name', formData.name) && isValid;
        isValid = this.validateField('phone', formData.phone) && isValid;
        isValid = this.validateField('email', formData.email) && isValid;
        
        if (!isValid) {
            alert('Пожалуйста, исправьте ошибки в форме');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Показываем загрузку
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        try {
            // Сохраняем заявку
            const saved = AppState.saveApplication(formData);
            
            if (saved) {
                // Показываем уведомление
                AppState.showNotification('Заявка отправлена! Мы свяжемся с вами в течение часа.');
                
                // Сбрасываем форму
                form.reset();
                
                // Обновляем счетчик в админке (если открыта)
                this.updateAdminCounter();
            } else {
                throw new Error('Ошибка сохранения');
            }
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            alert('Ошибка отправки. Пожалуйста, попробуйте позже.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },
    
    updateAdminCounter() {
        // Обновляем счетчик заявок в localStorage для админки
        const applications = AppState.applications;
        const newCount = applications.filter(app => app.status === 'new').length;
        
        // Отправляем событие, если админка открыта
        if (typeof window.updateAdminDashboard === 'function') {
            window.updateAdminDashboard();
        }
    },
    
    highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
};

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
function selectService(serviceId) {
    const service = AppState.services.find(s => s.id === serviceId);
    if (service) {
        document.getElementById('interest').value = 'design';
        document.getElementById('message').value = 
            `Интересует услуга: ${service.name}\nЦена: ${service.price}\n\nДополнительная информация: `;
        
        scrollToContact();
        
        // Фокус на поле сообщения
        setTimeout(() => document.getElementById('message').focus(), 500);
    }
}

function selectProduct(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (product) {
        document.getElementById('interest').value = 'equipment';
        document.getElementById('message').value = 
            `Интересует товар: ${product.name}\nЦена: ${product.price}\nКатегория: ${product.category}\n\nДополнительная информация: `;
        
        scrollToContact();
        
        // Фокус на поле сообщения
        setTimeout(() => document.getElementById('message').focus(), 500);
    }
}

function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 80;
        window.scrollTo({
            top: contactSection.offsetTop - headerHeight,
            behavior: 'smooth'
        });
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
    
    // Проверяем, есть ли сохраненные заявки
    const savedApps = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (savedApps) {
        console.log('Сохраненных заявок:', JSON.parse(savedApps).length);
    }
    
    // Проверяем, есть ли данные админки
    const adminData = localStorage.getItem(CONFIG.ADMIN_STORAGE_KEY);
    if (adminData) {
        console.log('Данные админки загружены');
    }
});

// Экспортируем функции для глобального доступа
window.selectService = selectService;
window.selectProduct = selectProduct;
window.scrollToContact = scrollToContact;
