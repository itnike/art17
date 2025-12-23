// ===== КОНФИГУРАЦИЯ =====
const ADMIN_CONFIG = {
    STORAGE_KEY: 'art17_admin_data',
    APPLICATIONS_KEY: 'art17_applications',
    IMAGES_KEY: 'art17_images',
    SETTINGS_KEY: 'art17_settings',
    DEFAULT_IMAGES: [
        'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f',
        'https://images.unsplash.com/photo-1511882150382-421056c89033',
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1',
        'https://images.unsplash.com/photo-1575367439053-8cac10c2355e',
        'https://images.unsplash.com/photo-1536922246289-88c42f957773',
        'https://images.unsplash.com/photo-1543554296-8f77334c4d11'
    ]
};

// ===== STATE MANAGEMENT =====
class AdminState {
    constructor() {
        this.data = this.loadData();
        this.images = this.loadImages();
        this.settings = this.loadSettings();
        this.applications = JSON.parse(localStorage.getItem(ADMIN_CONFIG.APPLICATIONS_KEY)) || [];
        this.currentSection = 'dashboard';
        this.selectedImage = null;
        console.log('AdminState инициализирован:', this.data);
    }

    loadData() {
        try {
            const stored = localStorage.getItem(ADMIN_CONFIG.STORAGE_KEY);
            if (stored) {
                console.log('Данные загружены из localStorage');
                return JSON.parse(stored);
            }
            console.log('Локальных данных нет, загружаем дефолтные');
            return { services: [], products: [] };
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return { services: [], products: [] };
        }
    }

    loadImages() {
        try {
            const stored = localStorage.getItem(ADMIN_CONFIG.IMAGES_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
            return ADMIN_CONFIG.DEFAULT_IMAGES.map((url, index) => ({
                id: index + 1,
                url: `${url}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
                name: `Изображение ${index + 1}`,
                uploadedAt: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Ошибка загрузки изображений:', error);
            return [];
        }
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem(ADMIN_CONFIG.SETTINGS_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
            return {
                companyName: 'Арт 17',
                companyPhone: '8 (499) 688-63-54',
                companyEmail: 'sales@pandaplay.ru',
                companyAddress: 'Калуга, Аэропортовский переулок 11',
                companyHours: 'Пн-Пт: 8:00 - 17:00\nСб: 8:00 - 16:00\nВс: выходной',
                seoDescription: 'Профессиональный дизайн интерьеров от студии "Арт 17". Создаем уникальные пространства для игр на открытом воздухе.',
                seoKeywords: 'дизайн интерьеров, игровые площадки, детские площадки, оборудование, монтаж'
            };
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
            return {};
        }
    }

    saveData() {
        try {
            localStorage.setItem(ADMIN_CONFIG.STORAGE_KEY, JSON.stringify(this.data));
            console.log('Данные сохранены:', this.data);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
            this.showNotification('Ошибка сохранения данных', 'error');
            return false;
        }
    }

    saveImages() {
        try {
            localStorage.setItem(ADMIN_CONFIG.IMAGES_KEY, JSON.stringify(this.images));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения изображений:', error);
            return false;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(ADMIN_CONFIG.SETTINGS_KEY, JSON.stringify(this.settings));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
            return false;
        }
    }

    addService(service) {
        try {
            const newService = {
                ...service,
                id: Date.now(),
                features: service.features ? service.features.split('\n').filter(f => f.trim()) : []
            };
            this.data.services.push(newService);
            this.saveData();
            this.logActivity(`Добавлена услуга: ${service.name}`);
            console.log('Услуга добавлена:', newService);
            return newService;
        } catch (error) {
            console.error('Ошибка добавления услуги:', error);
            this.showNotification('Ошибка добавления услуги', 'error');
            return null;
        }
    }

    updateService(id, updates) {
        try {
            const index = this.data.services.findIndex(s => s.id === parseInt(id));
            if (index !== -1) {
                this.data.services[index] = {
                    ...this.data.services[index],
                    ...updates,
                    features: updates.features ? updates.features.split('\n').filter(f => f.trim()) : this.data.services[index].features
                };
                this.saveData();
                this.logActivity(`Обновлена услуга: ${updates.name}`);
                console.log('Услуга обновлена:', this.data.services[index]);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка обновления услуги:', error);
            this.showNotification('Ошибка обновления услуги', 'error');
            return false;
        }
    }

    deleteService(id) {
        try {
            const index = this.data.services.findIndex(s => s.id === id);
            if (index !== -1) {
                const service = this.data.services[index];
                this.data.services.splice(index, 1);
                this.saveData();
                this.logActivity(`Удалена услуга: ${service.name}`);
                console.log('Услуга удалена:', service);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка удаления услуги:', error);
            this.showNotification('Ошибка удаления услуги', 'error');
            return false;
        }
    }

    addProduct(product) {
        try {
            const newProduct = {
                ...product,
                id: Date.now(),
                specs: {
                    material: product.material || '',
                    age: product.age || '',
                    warranty: product.warranty || '',
                    size: product.size || ''
                }
            };
            this.data.products.push(newProduct);
            this.saveData();
            this.logActivity(`Добавлен товар: ${product.name}`);
            console.log('Товар добавлен:', newProduct);
            return newProduct;
        } catch (error) {
            console.error('Ошибка добавления товара:', error);
            this.showNotification('Ошибка добавления товара', 'error');
            return null;
        }
    }

    updateProduct(id, updates) {
        try {
            const index = this.data.products.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                this.data.products[index] = {
                    ...this.data.products[index],
                    ...updates,
                    specs: {
                        material: updates.material || this.data.products[index].specs.material,
                        age: updates.age || this.data.products[index].specs.age,
                        warranty: updates.warranty || this.data.products[index].specs.warranty,
                        size: updates.size || this.data.products[index].specs.size
                    }
                };
                this.saveData();
                this.logActivity(`Обновлен товар: ${updates.name}`);
                console.log('Товар обновлен:', this.data.products[index]);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка обновления товара:', error);
            this.showNotification('Ошибка обновления товара', 'error');
            return false;
        }
    }

    deleteProduct(id) {
        try {
            const index = this.data.products.findIndex(p => p.id === id);
            if (index !== -1) {
                const product = this.data.products[index];
                this.data.products.splice(index, 1);
                this.saveData();
                this.logActivity(`Удален товар: ${product.name}`);
                console.log('Товар удален:', product);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка удаления товара:', error);
            this.showNotification('Ошибка удаления товара', 'error');
            return false;
        }
    }

    addImage(url, name) {
        try {
            const newImage = {
                id: Date.now(),
                url,
                name: name || `Изображение ${this.images.length + 1}`,
                uploadedAt: new Date().toISOString()
            };
            this.images.unshift(newImage);
            this.saveImages();
            return newImage;
        } catch (error) {
            console.error('Ошибка добавления изображения:', error);
            return null;
        }
    }

    deleteImage(id) {
        try {
            const index = this.images.findIndex(img => img.id === id);
            if (index !== -1) {
                this.images.splice(index, 1);
                this.saveImages();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка удаления изображения:', error);
            return false;
        }
    }

    logActivity(message) {
        const activity = {
            id: Date.now(),
            message,
            timestamp: new Date().toISOString(),
            icon: 'fa-history'
        };

        let activities = JSON.parse(localStorage.getItem('art17_activities')) || [];
        activities.unshift(activity);
        activities = activities.slice(0, 10);
        localStorage.setItem('art17_activities', JSON.stringify(activities));
    }

    getActivities() {
        return JSON.parse(localStorage.getItem('art17_activities')) || [];
    }

    getStats() {
        return {
            services: this.data.services.length,
            products: this.data.products.length,
            portfolio: this.data.products.filter(p => p.showInPortfolio).length,
            applications: this.applications.filter(app => app.status === 'new').length,
            totalApplications: this.applications.length
        };
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// ===== UI MANAGER =====
class UIManager {
    constructor(state) {
        this.state = state;
        this.initElements();
    }

    initElements() {
        this.elements = {
            // Навигация
            navLinks: document.querySelectorAll('.nav-link'),
            menuToggle: document.getElementById('menuToggle'),
            sidebar: document.querySelector('.sidebar'),
            pageTitle: document.getElementById('pageTitle'),

            // Кнопки
            saveAllBtn: document.getElementById('saveAll'),
            exportBtn: document.getElementById('exportData'),
            addServiceBtn: document.getElementById('addServiceBtn'),
            addProductBtn: document.getElementById('addProductBtn'),

            // Секции
            contentSections: document.querySelectorAll('.content-section'),

            // Модальные окна
            modals: document.querySelectorAll('.modal'),
            modalCloseBtns: document.querySelectorAll('.modal-close'),

            // Формы
            serviceForm: document.getElementById('serviceForm'),
            productForm: document.getElementById('productForm'),

            // Другие элементы
            servicesList: document.getElementById('servicesList'),
            productsList: document.getElementById('productsList'),
            imageGallery: document.getElementById('imageGallery'),
            applicationsTable: document.getElementById('applicationsTable'),
            uploadArea: document.getElementById('uploadArea'),
            imageUpload: document.getElementById('imageUpload'),
            browseBtn: document.getElementById('browseBtn')
        };
    }

    // Обновление дашборда
    updateDashboard() {
        const stats = this.state.getStats();

        document.getElementById('services-count').textContent = stats.services;
        document.getElementById('products-count').textContent = stats.products;
        document.getElementById('portfolio-count').textContent = stats.portfolio;
        document.getElementById('applications-count').textContent = stats.applications;
        document.getElementById('app-count').textContent = stats.applications;

        this.updateActivityList();
    }

    updateActivityList() {
        const activities = this.state.getActivities();
        const container = document.getElementById('activityList');
        if (!container) return;

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${activity.icon || 'fa-history'}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-message">${activity.message}</p>
                    <small class="activity-time">${new Date(activity.timestamp).toLocaleString()}</small>
                </div>
            </div>
        `).join('') || '<p class="text-center">Активности пока нет</p>';
    }

    // Рендеринг услуг
    renderServices() {
        const container = this.elements.servicesList;
        if (!container) return;
        
        const services = this.state.data.services;

        if (services.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-concierge-bell fa-3x"></i>
                    <h3>Услуг пока нет</h3>
                    <p>Добавьте вашу первую услугу</p>
                    <button class="btn btn-primary" id="addFirstService">
                        <i class="fas fa-plus"></i> Добавить услугу
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = services.map(service => `
            <div class="service-item" data-id="${service.id}">
                <div class="service-icon-small">
                    <i class="fas ${service.icon || 'fa-paint-brush'}"></i>
                </div>
                <div class="item-content">
                    <h4>${service.name}</h4>
                    <p>${service.description}</p>
                    <div class="item-meta">
                        <span class="price">${service.price}</span>
                        <span class="features">${service.features?.length || 0} особенностей</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small edit-service" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger delete-service" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Рендеринг товаров
    renderProducts() {
        const container = this.elements.productsList;
        if (!container) return;
        
        const products = this.state.data.products;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart fa-3x"></i>
                    <h3>Товаров пока нет</h3>
                    <p>Добавьте ваш первый товар</p>
                    <button class="btn btn-primary" id="addFirstProduct">
                        <i class="fas fa-plus"></i> Добавить товар
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-item" data-id="${product.id}">
                <div class="product-image-small">
                    <img src="${product.image || 'https://via.placeholder.com/200'}" 
                         alt="${product.name}" 
                         onerror="this.src='https://via.placeholder.com/200'">
                </div>
                <div class="item-content">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <div class="item-meta">
                        <span class="price">${product.price}</span>
                        <span class="category">${product.category}</span>
                        <span class="location">${product.location}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small edit-product" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger delete-product" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Рендеринг изображений
    renderImages() {
        const container = this.elements.imageGallery;
        if (!container) return;
        
        const images = this.state.images;

        if (images.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images fa-3x"></i>
                    <h3>Изображений пока нет</h3>
                    <p>Загрузите ваше первое изображение</p>
                </div>
            `;
            return;
        }

        container.innerHTML = images.map(image => `
            <div class="image-item" data-id="${image.id}">
                <img src="${image.url}" alt="${image.name}">
                <div class="image-actions">
                    <button class="btn btn-small use-image" title="Использовать">
                        <i class="fas fa-link"></i>
                    </button>
                    <button class="btn btn-small btn-danger delete-image" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="image-info">
                    <p class="image-name">${image.name}</p>
                    <small class="image-date">${new Date(image.uploadedAt).toLocaleDateString()}</small>
                </div>
            </div>
        `).join('');
    }

    // Рендеринг заявок
    renderApplications() {
        const container = this.elements.applicationsTable;
        if (!container) return;
        
        const applications = this.state.applications;

        if (applications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox fa-3x"></i>
                    <h3>Заявок пока нет</h3>
                    <p>Все новые заявки будут появляться здесь</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-header">
                <div>Дата</div>
                <div>Имя</div>
                <div>Сообщение</div>
                <div>Статус</div>
                <div>Действия</div>
            </div>
            ${applications.map(app => `
                <div class="table-row" data-id="${app.id}">
                    <div>${new Date(app.date).toLocaleString()}</div>
                    <div>${app.name}</div>
                    <div class="truncate">${app.message || 'Без сообщения'}</div>
                    <div>
                        <span class="status-badge status-${app.status || 'new'}">
                            ${this.getStatusText(app.status)}
                        </span>
                    </div>
                    <div class="table-actions">
                        <button class="btn btn-small view-application" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-small change-status" title="Изменить статус">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        `;
    }

    getStatusText(status) {
        const statusMap = {
            new: 'Новая',
            processed: 'В работе',
            completed: 'Завершена'
        };
        return statusMap[status] || 'Новая';
    }

    // Показать уведомление
    showNotification(message, type = 'success') {
        this.state.showNotification(message, type);
    }

    // Переключение секций
    switchSection(sectionId) {
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

        this.elements.contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });

        const titles = {
            dashboard: 'Дашборд',
            services: 'Управление услугами',
            products: 'Управление товарами',
            portfolio: 'Управление портфолио',
            images: 'Менеджер картинок',
            applications: 'Заявки с сайта',
            settings: 'Настройки сайта'
        };
        this.elements.pageTitle.textContent = titles[sectionId] || sectionId;

        this.state.currentSection = sectionId;
    }

    // Открыть модальное окно
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Закрыть модальное окно
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Заполнить форму услуги
    fillServiceForm(service = null) {
        const form = this.elements.serviceForm;
        if (!form) return;

        if (service) {
            document.getElementById('serviceId').value = service.id;
            document.getElementById('serviceName').value = service.name;
            document.getElementById('serviceDescription').value = service.description;
            document.getElementById('servicePrice').value = service.price;
            document.getElementById('serviceIcon').value = service.icon || '';
            document.getElementById('serviceFeatures').value = service.features?.join('\n') || '';
            
            document.getElementById('deleteServiceBtn').style.display = 'inline-block';
        } else {
            form.reset();
            document.getElementById('serviceId').value = '';
            document.getElementById('deleteServiceBtn').style.display = 'none';
        }
    }

    // Заполнить форму товара
    fillProductForm(product = null) {
        const form = this.elements.productForm;
        if (!form) return;

        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productImage').value = product.image;
            document.getElementById('productLocation').value = product.location || 'В наличии';
            document.getElementById('productMaterial').value = product.specs?.material || '';
            document.getElementById('productAge').value = product.specs?.age || '';
            document.getElementById('productWarranty').value = product.specs?.warranty || '';
            document.getElementById('productSize').value = product.specs?.size || '';
            
            this.updateImagePreview(product.image);
            document.getElementById('deleteProductBtn').style.display = 'inline-block';
        } else {
            form.reset();
            document.getElementById('productId').value = '';
            document.getElementById('productLocation').value = 'В наличии';
            document.getElementById('productImagePreview').innerHTML = '';
            document.getElementById('deleteProductBtn').style.display = 'none';
        }
    }

    updateImagePreview(url) {
        const preview = document.getElementById('productImagePreview');
        if (preview) {
            if (url) {
                preview.innerHTML = `<img src="${url}" alt="Превью" onerror="this.style.display='none'">`;
            } else {
                preview.innerHTML = '';
            }
        }
    }
}

// ===== EVENT HANDLERS =====
class EventManager {
    constructor(state, ui) {
        this.state = state;
        this.ui = ui;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.setupUpload();
        this.setupButtons();
        this.setupApplications();
        this.setupSettings();
        this.setupKeyboardShortcuts();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.ui.switchSection(section);
                
                if (window.innerWidth <= 1024) {
                    this.ui.elements.sidebar.classList.remove('active');
                }
            });
        });

        if (this.ui.elements.menuToggle) {
            this.ui.elements.menuToggle.addEventListener('click', () => {
                this.ui.elements.sidebar.classList.toggle('active');
            });
        }
    }

    setupModals() {
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.ui.closeModal(modal.id);
                }
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.ui.closeModal(modal.id);
                }
            });
        });
    }

    setupForms() {
        // Сохранение услуги
        document.getElementById('saveServiceBtn')?.addEventListener('click', () => {
            const id = document.getElementById('serviceId').value;
            const serviceName = document.getElementById('serviceName').value.trim();
            const serviceDescription = document.getElementById('serviceDescription').value.trim();
            const servicePrice = document.getElementById('servicePrice').value.trim();

            // Проверка заполнения обязательных полей
            if (!serviceName || !serviceDescription || !servicePrice) {
                this.ui.showNotification('Заполните все обязательные поля', 'error');
                return;
            }

            const serviceData = {
                name: serviceName,
                description: serviceDescription,
                price: servicePrice,
                icon: document.getElementById('serviceIcon').value.trim(),
                features: document.getElementById('serviceFeatures').value
            };

            if (id) {
                this.state.updateService(id, serviceData);
                this.ui.showNotification('Услуга обновлена');
            } else {
                this.state.addService(serviceData);
                this.ui.showNotification('Услуга добавлена');
            }

            this.ui.closeModal('serviceModal');
            this.ui.renderServices();
            this.ui.updateDashboard();
        });

        // Удаление услуги
        document.getElementById('deleteServiceBtn')?.addEventListener('click', () => {
            const id = parseInt(document.getElementById('serviceId').value);
            if (id && confirm('Вы уверены, что хотите удалить эту услугу?')) {
                this.state.deleteService(id);
                this.ui.showNotification('Услуга удалена', 'warning');
                this.ui.closeModal('serviceModal');
                this.ui.renderServices();
                this.ui.updateDashboard();
            }
        });

        // Сохранение товара
        document.getElementById('saveProductBtn')?.addEventListener('click', () => {
            const id = document.getElementById('productId').value;
            const productName = document.getElementById('productName').value.trim();
            const productDescription = document.getElementById('productDescription').value.trim();
            const productPrice = document.getElementById('productPrice').value.trim();
            const productCategory = document.getElementById('productCategory').value.trim();
            const productImage = document.getElementById('productImage').value.trim();

            // Проверка заполнения обязательных полей
            if (!productName || !productDescription || !productPrice || !productCategory || !productImage) {
                this.ui.showNotification('Заполните все обязательные поля', 'error');
                return;
            }

            const productData = {
                name: productName,
                description: productDescription,
                price: productPrice,
                category: productCategory,
                image: productImage,
                location: document.getElementById('productLocation').value.trim(),
                material: document.getElementById('productMaterial').value.trim(),
                age: document.getElementById('productAge').value.trim(),
                warranty: document.getElementById('productWarranty').value.trim(),
                size: document.getElementById('productSize').value.trim()
            };

            if (id) {
                this.state.updateProduct(id, productData);
                this.ui.showNotification('Товар обновлен');
            } else {
                this.state.addProduct(productData);
                this.ui.showNotification('Товар добавлен');
            }

            this.ui.closeModal('productModal');
            this.ui.renderProducts();
            this.ui.updateDashboard();
        });

        // Удаление товара
        document.getElementById('deleteProductBtn')?.addEventListener('click', () => {
            const id = parseInt(document.getElementById('productId').value);
            if (id && confirm('Вы уверены, что хотите удалить этот товар?')) {
                this.state.deleteProduct(id);
                this.ui.showNotification('Товар удален', 'warning');
                this.ui.closeModal('productModal');
                this.ui.renderProducts();
                this.ui.updateDashboard();
            }
        });

        // Выбор картинки для товара
        document.getElementById('browseImagesBtn')?.addEventListener('click', () => {
            this.openImageBrowser('productImage');
        });

        // Изменение URL картинки
        document.getElementById('productImage')?.addEventListener('input', (e) => {
            this.ui.updateImagePreview(e.target.value);
        });
    }

    setupUpload() {
        const uploadArea = this.ui.elements.uploadArea;
        const fileInput = this.ui.elements.imageUpload;
        const browseBtn = this.ui.elements.browseBtn;

        if (!uploadArea || !fileInput || !browseBtn) return;

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });

        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    async handleFileUpload(files) {
        this.ui.showNotification(
            'Для загрузки изображений используйте ссылки на картинки. Вы можете загрузить изображения на сервисы вроде Imgur, а затем вставить URL.',
            'warning'
        );

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                this.ui.showNotification(`Файл ${file.name} слишком большой (макс. 5MB)`, 'error');
                continue;
            }

            if (!file.type.startsWith('image/')) {
                this.ui.showNotification(`Файл ${file.name} не является изображением`, 'error');
                continue;
            }

            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    const imageName = file.name;
                    
                    this.state.addImage(imageUrl, imageName);
                    
                    this.ui.renderImages();
                    this.ui.showNotification(`Изображение "${imageName}" загружено`, 'success');
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Ошибка загрузки файла:', error);
                this.ui.showNotification(`Ошибка загрузки ${file.name}`, 'error');
            }
        }
    }

    setupButtons() {
        // Сохранить все
        document.getElementById('saveAll')?.addEventListener('click', () => {
            console.log('Сохранение всех данных...');
            const saved = this.state.saveData();
            if (saved) {
                this.ui.showNotification('Все данные сохранены в localStorage');
            } else {
                this.ui.showNotification('Ошибка сохранения данных', 'error');
            }
        });

        // Экспорт данных
        document.getElementById('exportData')?.addEventListener('click', () => {
            this.exportDataToFile(true);
        });

        // Добавить услугу
        document.getElementById('addServiceBtn')?.addEventListener('click', () => {
            this.ui.fillServiceForm();
            this.ui.openModal('serviceModal');
        });

        // Добавить товар
        document.getElementById('addProductBtn')?.addEventListener('click', () => {
            this.ui.fillProductForm();
            this.ui.openModal('productModal');
        });

        // Быстрые действия
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                switch (action) {
                    case 'add-service':
                        this.ui.fillServiceForm();
                        this.ui.openModal('serviceModal');
                        this.ui.switchSection('services');
                        break;
                    case 'add-product':
                        this.ui.fillProductForm();
                        this.ui.openModal('productModal');
                        this.ui.switchSection('products');
                        break;
                    case 'upload-image':
                        this.ui.switchSection('images');
                        break;
                    case 'backup':
                        this.createBackup();
                        break;
                }
            });
        });
    }

    setupApplications() {
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            console.log('Фильтрация заявок по статусу:', e.target.value);
        });

        document.getElementById('clearApplications')?.addEventListener('click', () => {
            if (confirm('Удалить все старые заявки? Новые заявки останутся.')) {
                const oldApplications = this.state.applications.filter(app => {
                    const age = Date.now() - new Date(app.date).getTime();
                    return age > 30 * 24 * 60 * 60 * 1000;
                });
                
                this.state.applications = this.state.applications.filter(app => !oldApplications.includes(app));
                localStorage.setItem(ADMIN_CONFIG.APPLICATIONS_KEY, JSON.stringify(this.state.applications));
                
                this.ui.renderApplications();
                this.ui.updateDashboard();
                this.ui.showNotification('Старые заявки удалены', 'warning');
            }
        });
    }

    setupSettings() {
        this.loadSettingsToForm();

        document.getElementById('saveSettings')?.addEventListener('click', () => {
            this.saveSettingsFromForm();
        });

        document.getElementById('resetSettings')?.addEventListener('click', () => {
            if (confirm('Сбросить все настройки к заводским?')) {
                this.state.settings = this.state.loadSettings();
                this.loadSettingsToForm();
                this.ui.showNotification('Настройки сброшены', 'warning');
            }
        });
    }

    loadSettingsToForm() {
        const settings = this.state.settings;
        if (document.getElementById('companyName')) {
            document.getElementById('companyName').value = settings.companyName || '';
            document.getElementById('companyPhone').value = settings.companyPhone            document.getElementById('companyName').value = settings.companyName || '';
            document.getElementById('companyPhone').value = settings.companyPhone || '';
            document.getElementById('companyEmail').value = settings.companyEmail || '';
            document.getElementById('companyAddress').value = settings.companyAddress || '';
            document.getElementById('companyHours').value = settings.companyHours || '';
            document.getElementById('seoDescription').value = settings.seoDescription || '';
            document.getElementById('seoKeywords').value = settings.seoKeywords || '';
        }
    }

    saveSettingsFromForm() {
        const settings = {
            companyName: document.getElementById('companyName')?.value.trim() || '',
            companyPhone: document.getElementById('companyPhone')?.value.trim() || '',
            companyEmail: document.getElementById('companyEmail')?.value.trim() || '',
            companyAddress: document.getElementById('companyAddress')?.value.trim() || '',
            companyHours: document.getElementById('companyHours')?.value.trim() || '',
            seoDescription: document.getElementById('seoDescription')?.value.trim() || '',
            seoKeywords: document.getElementById('seoKeywords')?.value.trim() || ''
        };

        this.state.settings = settings;
        if (this.state.saveSettings()) {
            this.ui.showNotification('Настройки сохранены');
        } else {
            this.ui.showNotification('Ошибка сохранения настроек', 'error');
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        document.getElementById('saveAll')?.click();
                        break;
                    case 'n':
                        if (this.state.currentSection === 'services') {
                            e.preventDefault();
                            document.getElementById('addServiceBtn')?.click();
                        } else if (this.state.currentSection === 'products') {
                            e.preventDefault();
                            document.getElementById('addProductBtn')?.click();
                        }
                        break;
                    case 'e':
                        e.preventDefault();
                        document.getElementById('exportData')?.click();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.ui.switchSection('dashboard');
                        break;
                }
            }

            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.active');
                if (openModal) {
                    this.ui.closeModal(openModal.id);
                }
            }
        });
    }

    // Делегирование событий для динамических элементов
    setupEventDelegation() {
        document.addEventListener('click', (e) => {
            // Редактирование услуги
            if (e.target.closest('.edit-service')) {
                const item = e.target.closest('.service-item');
                if (item) {
                    const id = parseInt(item.dataset.id);
                    const service = this.state.data.services.find(s => s.id === id);
                    if (service) {
                        this.ui.fillServiceForm(service);
                        this.ui.openModal('serviceModal');
                    }
                }
            }

            // Удаление услуги
            if (e.target.closest('.delete-service')) {
                const item = e.target.closest('.service-item');
                if (item) {
                    const id = parseInt(item.dataset.id);
                    if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
                        if (this.state.deleteService(id)) {
                            this.ui.renderServices();
                            this.ui.updateDashboard();
                            this.ui.showNotification('Услуга удалена', 'warning');
                        }
                    }
                }
            }

            // Редактирование товара
            if (e.target.closest('.edit-product')) {
                const item = e.target.closest('.product-item');
                if (item) {
                    const id = parseInt(item.dataset.id);
                    const product = this.state.data.products.find(p => p.id === id);
                    if (product) {
                        this.ui.fillProductForm(product);
                        this.ui.openModal('productModal');
                    }
                }
            }

            // Удаление товара
            if (e.target.closest('.delete-product')) {
                const item = e.target.closest('.product-item');
                if (item) {
                    const id = parseInt(item.dataset.id);
                    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
                        if (this.state.deleteProduct(id)) {
                            this.ui.renderProducts();
                            this.ui.updateDashboard();
                            this.ui.showNotification('Товар удален', 'warning');
                        }
                    }
                }
            }

            // Удаление изображения
            if (e.target.closest('.delete-image')) {
                const item = e.target.closest('.image-item');
                if (item) {
                    const id = parseInt(item.dataset.id);
                    if (confirm('Вы уверены, что хотите удалить это изображение?')) {
                        if (this.state.deleteImage(id)) {
                            this.ui.renderImages();
                            this.ui.showNotification('Изображение удалено', 'warning');
                        }
                    }
                }
            }

            // Использование изображения
            if (e.target.closest('.use-image')) {
                const item = e.target.closest('.image-item');
                if (item) {
                    const id = parseInt(item.dataset.id);
                    const image = this.state.images.find(img => img.id === id);
                    if (image) {
                        this.openImageBrowser(null, image.url);
                    }
                }
            }

            // Добавление первой услуги
            if (e.target.closest('#addFirstService')) {
                this.ui.fillServiceForm();
                this.ui.openModal('serviceModal');
            }

            // Добавление первого товара
            if (e.target.closest('#addFirstProduct')) {
                this.ui.fillProductForm();
                this.ui.openModal('productModal');
            }

            // Просмотр заявки
            if (e.target.closest('.view-application')) {
                const row = e.target.closest('.table-row');
                if (row) {
                    const id = parseInt(row.dataset.id);
                    const application = this.state.applications.find(app => app.id === id);
                    if (application) {
                        this.viewApplication(application);
                    }
                }
            }

            // Изменение статуса заявки
            if (e.target.closest('.change-status')) {
                const row = e.target.closest('.table-row');
                if (row) {
                    const id = parseInt(row.dataset.id);
                    const application = this.state.applications.find(app => app.id === id);
                    if (application) {
                        this.changeApplicationStatus(application);
                    }
                }
            }
        });

        document.addEventListener('input', (e) => {
            // Поиск услуг
            if (e.target.id === 'serviceSearch') {
                const searchTerm = e.target.value.toLowerCase();
                document.querySelectorAll('.service-item').forEach(item => {
                    const name = item.querySelector('h4').textContent.toLowerCase();
                    const description = item.querySelector('p').textContent.toLowerCase();
                    item.style.display = name.includes(searchTerm) || description.includes(searchTerm) ? '' : 'none';
                });
            }

            // Поиск товаров
            if (e.target.id === 'productSearch') {
                const searchTerm = e.target.value.toLowerCase();
                document.querySelectorAll('.product-item').forEach(item => {
                    const name = item.querySelector('h4').textContent.toLowerCase();
                    const description = item.querySelector('p').textContent.toLowerCase();
                    item.style.display = name.includes(searchTerm) || description.includes(searchTerm) ? '' : 'none';
                });
            }
        });
    }

    openImageBrowser(targetInputId = null, imageUrl = null) {
        if (imageUrl && targetInputId) {
            document.getElementById(targetInputId).value = imageUrl;
            this.ui.updateImagePreview(imageUrl);
            this.ui.closeModal('imageBrowserModal');
        } else {
            this.ui.openModal('imageBrowserModal');
        }
    }

    viewApplication(application) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px">
                <div class="modal-header">
                    <h3>Заявка #${application.id}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="application-details">
                        <div class="detail-row">
                            <strong>Дата:</strong>
                            <span>${new Date(application.date).toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Имя:</strong>
                            <span>${application.name}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Телефон:</strong>
                            <span>${application.phone}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Email:</strong>
                            <span>${application.email || 'Не указан'}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Сообщение:</strong>
                            <p class="application-message">${application.message || 'Нет сообщения'}</p>
                        </div>
                        <div class="detail-row">
                            <strong>Статус:</strong>
                            <span class="status-badge status-${application.status || 'new'}">
                                ${this.ui.getStatusText(application.status)}
                            </span>
                        </div>
                        <div class="detail-row">
                            <strong>Источник:</strong>
                            <span>${application.source || 'Неизвестно'}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="changeStatusBtn">Изменить статус</button>
                    <button class="btn btn-secondary close-view">Закрыть</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.close-view').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        modal.querySelector('#changeStatusBtn').addEventListener('click', () => {
            modal.remove();
            this.changeApplicationStatus(application);
        });
    }

    changeApplicationStatus(application) {
        const currentStatus = application.status || 'new';
        const statuses = [
            { value: 'new', label: 'Новая' },
            { value: 'processed', label: 'В работе' },
            { value: 'completed', label: 'Завершена' }
        ];

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px">
                <div class="modal-header">
                    <h3>Изменить статус заявки #${application.id}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Текущий статус:</label>
                        <span class="status-badge status-${currentStatus}">
                            ${this.ui.getStatusText(currentStatus)}
                        </span>
                    </div>
                    <div class="form-group">
                        <label for="newStatus">Новый статус:</label>
                        <select id="newStatus" class="form-control">
                            ${statuses.map(status => `
                                <option value="${status.value}" ${currentStatus === status.value ? 'selected' : ''}>
                                    ${status.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="saveStatusBtn">Сохранить</button>
                    <button class="btn btn-secondary" id="cancelStatusBtn">Отмена</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelStatusBtn').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        modal.querySelector('#saveStatusBtn').addEventListener('click', () => {
            const newStatus = modal.querySelector('#newStatus').value;
            const index = this.state.applications.findIndex(app => app.id === application.id);
            
            if (index !== -1) {
                this.state.applications[index].status = newStatus;
                localStorage.setItem(ADMIN_CONFIG.APPLICATIONS_KEY, JSON.stringify(this.state.applications));
                
                this.ui.renderApplications();
                this.ui.updateDashboard();
                this.ui.showNotification(`Статус заявки #${application.id} изменен`);
            }
            
            modal.remove();
        });
    }

    createBackup() {
        const backupData = {
            timestamp: new Date().toISOString(),
            data: this.state.data,
            images: this.state.images,
            settings: this.state.settings,
            applications: this.state.applications
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `art17-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.ui.showNotification('Бэкап создан и скачан');
    }

    exportDataToFile(includeApplications = false) {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: this.state.data,
            settings: this.state.settings,
            images: this.state.images
        };

        if (includeApplications) {
            exportData.applications = this.state.applications;
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `art17-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.ui.showNotification('Данные экспортированы');
    }

    importDataFromFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (confirm('Это заменит текущие данные. Продолжить?')) {
                    if (importedData.data) {
                        this.state.data = importedData.data;
                        this.state.saveData();
                    }
                    
                    if (importedData.images) {
                        this.state.images = importedData.images;
                        this.state.saveImages();
                    }
                    
                    if (importedData.settings) {
                        this.state.settings = importedData.settings;
                        this.state.saveSettings();
                    }
                    
                    if (importedData.applications) {
                        this.state.applications = importedData.applications;
                        localStorage.setItem(ADMIN_CONFIG.APPLICATIONS_KEY, JSON.stringify(this.state.applications));
                    }
                    
                    this.ui.renderServices();
                    this.ui.renderProducts();
                    this.ui.renderImages();
                    this.ui.updateDashboard();
                    this.ui.showNotification('Данные успешно импортированы');
                }
            } catch (error) {
                console.error('Ошибка импорта:', error);
                this.ui.showNotification('Ошибка импорта файла', 'error');
            }
        };
        
        reader.readAsText(file);
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
class AdminApp {
    constructor() {
        this.state = new AdminState();
        this.ui = new UIManager(this.state);
        this.events = new EventManager(this.state, this.ui);
        
        this.init();
    }

    init() {
        console.log('AdminApp инициализирован');
        
        // Начальная загрузка интерфейса
        this.ui.switchSection('dashboard');
        this.ui.renderServices();
        this.ui.renderProducts();
        this.ui.renderImages();
        this.ui.renderApplications();
        this.ui.updateDashboard();
        
        // Настройка делегирования событий
        this.events.setupEventDelegation();
        
        // Импорт данных
        this.setupImport();
        
        // Автосохранение
        this.setupAutoSave();
        
        // Проверка обновлений
        this.checkForUpdates();
    }

    setupImport() {
        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.json';
        importInput.style.display = 'none';
        document.body.appendChild(importInput);

        document.getElementById('importData')?.addEventListener('click', () => {
            importInput.click();
        });

        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.events.importDataFromFile(file);
                importInput.value = '';
            }
        });
    }

    setupAutoSave() {
        let saveTimeout;
        
        document.addEventListener('input', (e) => {
            if (e.target.closest('.form-control')) {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    this.state.saveData();
                    this.ui.showNotification('Автосохранение...', 'info');
                }, 2000);
            }
        });
    }

    checkForUpdates() {
        // Здесь можно добавить проверку обновлений
        const lastUpdate = localStorage.getItem('art17_last_update');
        const now = new Date();
        
        if (!lastUpdate || (now - new Date(lastUpdate)) > 7 * 24 * 60 * 60 * 1000) {
            console.log('Рекомендуется проверить обновления данных');
        }
        
        localStorage.setItem('art17_last_update', now.toISOString());
    }
}

// ===== ЗАПУСК ПРИЛОЖЕНИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.adminApp = new AdminApp();
        console.log('Приложение успешно запущено');
        
        // Глобальные функции для использования в HTML
        window.uploadImage = function(url, name) {
            window.adminApp.state.addImage(url, name);
            window.adminApp.ui.renderImages();
            window.adminApp.ui.showNotification('Изображение добавлено');
        };
        
        window.deleteItem = function(type, id) {
            if (type === 'service') {
                window.adminApp.state.deleteService(id);
                window.adminApp.ui.renderServices();
            } else if (type === 'product') {
                window.adminApp.state.deleteProduct(id);
                window.adminApp.ui.renderProducts();
            }
            window.adminApp.ui.updateDashboard();
        };
        
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        
        // Показать сообщение об ошибке
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h2>Ошибка загрузки административной панели</h2>
            <p>${error.message}</p>
            <p>Пожалуйста, обновите страницу или обратитесь к разработчику.</p>
        `;
        document.body.innerHTML = '';
        document.body.appendChild(errorDiv);
    }
});

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

function openModal(modalId) {
    window.adminApp.ui.openModal(modalId);
}

function closeModal(modalId) {
    window.adminApp.ui.closeModal(modalId);
}

function showNotification(message, type = 'success') {
    window.adminApp.ui.showNotification(message, type);
}

// Экспорт данных в формате JSON
function exportToJSON() {
    window.adminApp.events.exportDataToFile(true);
}

// Импорт данных из JSON файла
function importFromJSON(event) {
    const file = event.target.files[0];
    if (file) {
        window.adminApp.events.importDataFromFile(file);
    }
}

// Очистка всех данных (с подтверждением)
function clearAllData() {
    if (confirm('ВНИМАНИЕ: Это удалит ВСЕ данные. Вы уверены?')) {
        localStorage.clear();
        location.reload();
    }
}

// Сброс к заводским настройкам
function factoryReset() {
    if (confirm('Сбросить все настройки к заводским?')) {
        localStorage.removeItem(ADMIN_CONFIG.STORAGE_KEY);
        localStorage.removeItem(ADMIN_CONFIG.IMAGES_KEY);
        localStorage.removeItem(ADMIN_CONFIG.SETTINGS_KEY);
        location.reload();
    }
}
