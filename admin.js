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
    }

    loadData() {
        try {
            // Пытаемся загрузить из localStorage
            const stored = localStorage.getItem(ADMIN_CONFIG.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }

            // Если нет в localStorage, загружаем из файла
            return this.loadDefaultData();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return this.loadDefaultData();
        }
    }

    async loadDefaultData() {
        try {
            const response = await fetch('data/products.json');
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Файл не найден');
        } catch (error) {
            // Возвращаем дефолтные данные
            return {
                services: [],
                products: []
            };
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
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
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
        const newService = {
            ...service,
            id: Date.now(),
            features: service.features ? service.features.split('\n').filter(f => f.trim()) : []
        };
        this.data.services.push(newService);
        this.saveData();
        this.logActivity(`Добавлена услуга: ${service.name}`);
        return newService;
    }

    updateService(id, updates) {
        const index = this.data.services.findIndex(s => s.id === id);
        if (index !== -1) {
            this.data.services[index] = {
                ...this.data.services[index],
                ...updates,
                features: updates.features ? updates.features.split('\n').filter(f => f.trim()) : this.data.services[index].features
            };
            this.saveData();
            this.logActivity(`Обновлена услуга: ${updates.name}`);
            return true;
        }
        return false;
    }

    deleteService(id) {
        const index = this.data.services.findIndex(s => s.id === id);
        if (index !== -1) {
            const service = this.data.services[index];
            this.data.services.splice(index, 1);
            this.saveData();
            this.logActivity(`Удалена услуга: ${service.name}`);
            return true;
        }
        return false;
    }

    addProduct(product) {
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
        return newProduct;
    }

    updateProduct(id, updates) {
        const index = this.data.products.findIndex(p => p.id === id);
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
            return true;
        }
        return false;
    }

    deleteProduct(id) {
        const index = this.data.products.findIndex(p => p.id === id);
        if (index !== -1) {
            const product = this.data.products[index];
            this.data.products.splice(index, 1);
            this.saveData();
            this.logActivity(`Удален товар: ${product.name}`);
            return true;
        }
        return false;
    }

    addImage(url, name) {
        const newImage = {
            id: Date.now(),
            url,
            name: name || `Изображение ${this.images.length + 1}`,
            uploadedAt: new Date().toISOString()
        };
        this.images.unshift(newImage);
        this.saveImages();
        return newImage;
    }

    deleteImage(id) {
        const index = this.images.findIndex(img => img.id === id);
        if (index !== -1) {
            this.images.splice(index, 1);
            this.saveImages();
            return true;
        }
        return false;
    }

    logActivity(message) {
        const activity = {
            id: Date.now(),
            message,
            timestamp: new Date().toISOString(),
            icon: 'fa-history'
        };

        // Сохраняем последние 10 активностей
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

        // Обновляем счетчики
        document.getElementById('services-count').textContent = stats.services;
        document.getElementById('products-count').textContent = stats.products;
        document.getElementById('portfolio-count').textContent = stats.portfolio;
        document.getElementById('applications-count').textContent = stats.applications;
        document.getElementById('app-count').textContent = stats.applications;

        // Обновляем активность
        this.updateActivityList();
    }

    updateActivityList() {
        const activities = this.state.getActivities();
        const container = document.getElementById('activityList');

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
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200'">
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
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Переключение секций
    switchSection(sectionId) {
        // Обновляем навигацию
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

        // Обновляем контент
        this.elements.contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });

        // Обновляем заголовок
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

        // Сохраняем текущую секцию
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
            
            // Показать кнопку удаления
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
            
            // Обновить превью
            this.updateImagePreview(product.image);
            
            // Показать кнопку удаления
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
        if (url) {
            preview.innerHTML = `<img src="${url}" alt="Превью" onerror="this.style.display='none'">`;
        } else {
            preview.innerHTML = '';
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
        // Навигация по секциям
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.ui.switchSection(section);
                
                // На мобильных закрываем меню
                if (window.innerWidth <= 1024) {
                    this.ui.elements.sidebar.classList.remove('active');
                }
            });
        });

        // Мобильное меню
        if (this.ui.elements.menuToggle) {
            this.ui.elements.menuToggle.addEventListener('click', () => {
                this.ui.elements.sidebar.classList.toggle('active');
            });
        }
    }

    setupModals() {
        // Закрытие модальных окон
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.ui.closeModal(modal.id);
                }
            });
        });

        // Закрытие при клике вне окна
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
            const serviceData = {
                name: document.getElementById('serviceName').value,
                description: document.getElementById('serviceDescription').value,
                price: document.getElementById('servicePrice').value,
                icon: document.getElementById('serviceIcon').value,
                features: document.getElementById('serviceFeatures').value
            };

            if (id) {
                // Обновление
                this.state.updateService(parseInt(id), serviceData);
                this.ui.showNotification('Услуга обновлена');
            } else {
                // Добавление
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
            const productData = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: document.getElementById('productPrice').value,
                category: document.getElementById('productCategory').value,
                image: document.getElementById('productImage').value,
                location: document.getElementById('productLocation').value,
                material: document.getElementById('productMaterial').value,
                age: document.getElementById('productAge').value,
                warranty: document.getElementById('productWarranty').value,
                size: document.getElementById('productSize').value
            };

            if (id) {
                // Обновление
                this.state.updateProduct(parseInt(id), productData);
                this.ui.showNotification('Товар обновлен');
            } else {
                // Добавление
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

        // Drag & Drop
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

        // Клик по области загрузки
        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // Выбор файлов
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    async handleFileUpload(files) {
        // В GitHub Pages мы не можем сохранять файлы на сервер,
        // поэтому показываем уведомление о том, что нужно использовать URL
        this.ui.showNotification(
            'Для загрузки изображений используйте ссылки на картинки. Вы можете загрузить изображения на сервисы вроде Imgur, а затем вставить URL.',
            'warning'
        );

        // Альтернатива: использовать base64 кодирование (ограничено размером)
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
                // Конвертируем в base64 для предварительного просмотра
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Сохраняем как data URL (только для предпросмотра)
                    const imageUrl = e.target.result;
                    const imageName = file.name;
                    
                    // Добавляем в состояние
                    this.state.addImage(imageUrl, imageName);
                    
                    // Обновляем UI
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
            // Обновляем основной файл products.json
            this.exportDataToFile();
            this.ui.showNotification('Все данные сохранены');
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
        // Фильтр заявок
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filterApplications(e.target.value);
        });

        // Очистка заявок
        document.getElementById('clearApplications')?.addEventListener('click', () => {
            if (confirm('Удалить все старые заявки? Новые заявки останутся.')) {
                const oldApplications = this.state.applications.filter(app => {
                    const age = Date.now() - new Date(app.date).getTime();
                    return age > 30 * 24 * 60 * 60 * 1000; // Старше 30 дней
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
        // Загрузка настроек в форму
        this.loadSettingsToForm();

        // Сохранение настроек
        document.getElementById('saveSettings')?.addEventListener('click', () => {
            this.saveSettingsFromForm();
        });

        // Сброс настроек
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
        document.getElementById('companyName').value = settings.companyName || '';
        document.getElementById('companyPhone').value = settings.companyPhone || '';
        document.getElementById('companyEmail').value = settings.companyEmail || '';
        document.getElementById('companyAddress').value = settings.companyAddress || '';
        document.getElementById('companyHours').value = settings.companyHours || '';
        document.getElementById('seoDescription').value = settings.seoDescription || '';
        document.getElementById('seoKeywords').value = settings.seoKeywords || '';
    }

    saveSettingsFromForm() {
        this.state.settings = {
            companyName: document.getElementById('companyName').value,
            companyPhone: document.getElementById('companyPhone').value,
            companyEmail: document.getElementById('companyEmail').value,
            companyAddress: document.getElementById('companyAddress').value,
            companyHours: document.getElementById('companyHours').value,
            seoDescription: document.getElementById('seoDescription').value,
            seoKeywords: document.getElementById('seoKeywords').value
        };

        if (this.state.saveSettings()) {
            this.ui.showNotification('Настройки сохранены');
        } else {
            this.ui.showNotification('Ошибка сохранения настроек', 'error');
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + S - Сохранить все
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                document.getElementById('saveAll').click();
            }

            // Escape - Закрыть модальное окно
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    this.ui.closeModal(modal.id);
                });
            }

            // F1 - Перейти к дашборду
            if (e.key === 'F1') {
                e.preventDefault();
                this.ui.switchSection('dashboard');
            }
        });
    }

    openImageBrowser(targetInputId) {
        // Заполняем браузер изображениями
        const browser = document.getElementById('imageBrowser');
        browser.innerHTML = this.state.images.map(img => `
            <div class="browser-image ${this.state.selectedImage?.id === img.id ? 'selected' : ''}" 
                 data-id="${img.id}" data-url="${img.url}">
                <img src="${img.url}" alt="${img.name}">
            </div>
        `).join('');

        // Добавляем обработчики выбора
        browser.querySelectorAll('.browser-image').forEach(img => {
            img.addEventListener('click', () => {
                browser.querySelectorAll('.browser-image').forEach(i => i.classList.remove('selected'));
                img.classList.add('selected');
                this.state.selectedImage = {
                    id: parseInt(img.dataset.id),
                    url: img.dataset.url
                };
            });
        });

        // Обработчик выбора изображения
        document.getElementById('selectImageBtn').onclick = () => {
            if (this.state.selectedImage) {
                document.getElementById(targetInputId).value = this.state.selectedImage.url;
                this.ui.updateImagePreview(this.state.selectedImage.url);
                this.ui.closeModal('imageBrowserModal');
            }
        };

        this.ui.openModal('imageBrowserModal');
    }

    filterApplications(status) {
        // Реализация фильтрации заявок
        console.log('Фильтрация заявок по статусу:', status);
        // В реальном приложении здесь была бы логика фильтрации
    }

    exportDataToFile(download = false) {
        const data = {
            services: this.state.data.services,
            products: this.state.data.products,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        if (download) {
            const a = document.createElement('a');
            a.href = url;
            a.download = `art17-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // Сохраняем в основной файл (эмулируем сохранение)
            localStorage.setItem(ADMIN_CONFIG.STORAGE_KEY, JSON.stringify(data));
            
            // Здесь в реальном приложении был бы AJAX запрос на сервер
            console.log('Данные для сохранения:', data);
        }

        URL.revokeObjectURL(url);
    }

    createBackup() {
        const backup = {
            data: this.state.data,
            images: this.state.images,
            settings: this.state.settings,
            applications: this.state.applications,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `art17-full-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.ui.showNotification('Бэкап создан и скачан');
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация состояния
    const state = new AdminState();
    
    // Инициализация UI
    const ui = new UIManager(state);
    
    // Инициализация обработчиков событий
    const events = new EventManager(state, ui);
    
    // Начальная загрузка данных
    ui.updateDashboard();
    ui.renderServices();
    ui.renderProducts();
    ui.renderImages();
    ui.renderApplications();
    
    // Делегирование событий для динамических элементов
    document.addEventListener('click', (e) => {
        // Редактирование услуги
        if (e.target.closest('.edit-service')) {
            const item = e.target.closest('.service-item');
            const id = parseInt(item.dataset.id);
            const service = state.data.services.find(s => s.id === id);
            if (service) {
                ui.fillServiceForm(service);
                ui.openModal('serviceModal');
            }
        }
        
        // Удаление услуги
        if (e.target.closest('.delete-service')) {
            const item = e.target.closest('.service-item');
            const id = parseInt(item.dataset.id);
            if (id && confirm('Удалить эту услугу?')) {
                state.deleteService(id);
                ui.renderServices();
                ui.updateDashboard();
                ui.showNotification('Услуга удалена', 'warning');
            }
        }
        
        // Редактирование товара
        if (e.target.closest('.edit-product')) {
            const item = e.target.closest('.product-item');
            const id = parseInt(item.dataset.id);
            const product = state.data.products.find(p => p.id === id);
            if (product) {
                ui.fillProductForm(product);
                ui.openModal('productModal');
            }
        }
        
        // Удаление товара
        if (e.target.closest('.delete-product')) {
            const item = e.target.closest('.product-item');
            const id = parseInt(item.dataset.id);
            if (id && confirm('Удалить этот товар?')) {
                state.deleteProduct(id);
                ui.renderProducts();
                ui.updateDashboard();
                ui.showNotification('Товар удален', 'warning');
            }
        }
        
        // Использование изображения
        if (e.target.closest('.use-image')) {
            const item = e.target.closest('.image-item');
            const id = parseInt(item.dataset.id);
            const image = state.images.find(img => img.id === id);
            if (image) {
                state.selectedImage = image;
                events.openImageBrowser('productImage');
                ui.switchSection('products');
            }
        }
        
        // Удаление изображения
        if (e.target.closest('.delete-image')) {
            const item = e.target.closest('.image-item');
            const id = parseInt(item.dataset.id);
            if (id && confirm('Удалить это изображение?')) {
                state.deleteImage(id);
                ui.renderImages();
                ui.showNotification('Изображение удалено', 'warning');
            }
        }
        
        // Просмотр заявки
        if (e.target.closest('.view-application')) {
            const row = e.target.closest('.table-row');
            const id = row.dataset.id;
            const app = state.applications.find(a => a.id === id);
            if (app) {
                alert(`
Заявка #${app.id}
Дата: ${new Date(app.date).toLocaleString()}
Имя: ${app.name}
Телефон: ${app.phone}
Email: ${app.email}
Интересует: ${app.interest}
Сообщение: ${app.message || 'Нет сообщения'}
                `);
            }
        }
        
        // Изменение статуса заявки
        if (e.target.closest('.change-status')) {
            const row = e.target.closest('.table-row');
            const id = row.dataset.id;
            const app = state.applications.find(a => a.id === id);
            if (app) {
                const newStatus = prompt('Введите новый статус (new, processed, completed):', app.status);
                if (newStatus && ['new', 'processed', 'completed'].includes(newStatus)) {
                    app.status = newStatus;
                    localStorage.setItem(ADMIN_CONFIG.APPLICATIONS_KEY, JSON.stringify(state.applications));
                    ui.renderApplications();
                    ui.updateDashboard();
                    ui.showNotification('Статус заявки обновлен');
                }
            }
        }
        
        // Добавление первой услуги
        if (e.target.closest('#addFirstService')) {
            ui.fillServiceForm();
            ui.openModal('serviceModal');
        }
        
        // Добавление первого товар
        if (e.target.closest('#addFirstProduct')) {
            ui.fillProductForm();
            ui.openModal('productModal');
        }
    });
    
    console.log('Админ-панель загружена!');
    
    // Периодическая проверка новых заявок (каждые 30 секунд)
    setInterval(() => {
        const oldCount = state.applications.length;
        state.applications = JSON.parse(localStorage.getItem(ADMIN_CONFIG.APPLICATIONS_KEY)) || [];
        
        if (state.applications.length > oldCount) {
            ui.updateDashboard();
            if (state.currentSection !== 'applications') {
                ui.showNotification(`Новая заявка! Всего: ${state.applications.length}`, 'success');
            }
        }
    }, 30000);
});
