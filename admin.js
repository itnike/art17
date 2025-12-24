// ===== КОНФИГУРАЦИЯ =====
const ADMIN_CONFIG = {
    STORAGE_KEY: 'art17_admin_data',
    APPLICATIONS_KEY: 'art17_applications',
    IMAGES_KEY: 'art17_images'
};

// ===== STATE MANAGEMENT =====
class AdminState {
    constructor() {
        const loadedData = this.loadData();
        
        this.data = {
            services: loadedData.services || [],
            products: loadedData.products || []
        };
        
        this.images = this.loadImages();
        this.applications = JSON.parse(localStorage.getItem(ADMIN_CONFIG.APPLICATIONS_KEY)) || [];
        this.currentSection = 'dashboard';
        
        console.log('✅ State инициализирован:', this.data);
    }

    loadData() {
        try {
            const stored = localStorage.getItem(ADMIN_CONFIG.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    services: Array.isArray(parsed.services) ? parsed.services : [],
                    products: Array.isArray(parsed.products) ? parsed.products : []
                };
            }
            return { services: [], products: [] };
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            return { services: [], products: [] };
        }
    }

    loadImages() {
        try {
            const stored = localStorage.getItem(ADMIN_CONFIG.IMAGES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('❌ Ошибка загрузки изображений:', error);
            return [];
        }
    }

    saveData() {
        try {
            localStorage.setItem(ADMIN_CONFIG.STORAGE_KEY, JSON.stringify(this.data));
            console.log('💾 Данные сохранены:', this.data);
            this.showNotification('Данные сохранены!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            this.showNotification('Ошибка сохранения', 'error');
            return false;
        }
    }

    saveImages() {
        try {
            localStorage.setItem(ADMIN_CONFIG.IMAGES_KEY, JSON.stringify(this.images));
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения изображений:', error);
            return false;
        }
    }

    // === УСЛУГИ ===
    addService(service) {
        try {
            const newService = {
                ...service,
                id: Date.now(),
                features: service.features ? service.features.split('\n').filter(f => f.trim()) : []
            };
            
            this.data.services.push(newService);
            this.saveData();
            console.log('✅ Услуга добавлена:', newService);
            return newService;
        } catch (error) {
            console.error('❌ Ошибка добавления услуги:', error);
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
                console.log('✅ Услуга обновлена');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Ошибка обновления услуги:', error);
            return false;
        }
    }

    deleteService(id) {
        try {
            const index = this.data.services.findIndex(s => s.id === id);
            if (index !== -1) {
                this.data.services.splice(index, 1);
                this.saveData();
                console.log('✅ Услуга удалена');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Ошибка удаления услуги:', error);
            return false;
        }
    }

    // === ТОВАРЫ ===
    addProduct(product) {
        try {
            const newProduct = {
                ...product,
                id: Date.now(),
                showInPortfolio: product.showInPortfolio === 'true' || product.showInPortfolio === true,
                specs: {
                    material: product.material || '',
                    age: product.age || '',
                    warranty: product.warranty || '',
                    size: product.size || ''
                }
            };
            
            this.data.products.push(newProduct);
            this.saveData();
            console.log('✅ Товар добавлен:', newProduct);
            return newProduct;
        } catch (error) {
            console.error('❌ Ошибка добавления товара:', error);
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
                    showInPortfolio: updates.showInPortfolio === 'true' || updates.showInPortfolio === true,
                    specs: {
                        material: updates.material || this.data.products[index].specs.material,
                        age: updates.age || this.data.products[index].specs.age,
                        warranty: updates.warranty || this.data.products[index].specs.warranty,
                        size: updates.size || this.data.products[index].specs.size
                    }
                };
                
                this.saveData();
                console.log('✅ Товар обновлен');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Ошибка обновления товара:', error);
            return false;
        }
    }

    deleteProduct(id) {
        try {
            const index = this.data.products.findIndex(p => p.id === id);
            if (index !== -1) {
                this.data.products.splice(index, 1);
                this.saveData();
                console.log('✅ Товар удален');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Ошибка удаления товара:', error);
            return false;
        }
    }

    // === ПОРТФОЛИО ===
    getPortfolioItems() {
        return this.data.products.filter(product => product.showInPortfolio === true);
    }

    // === УВЕДОМЛЕНИЯ ===
    showNotification(message, type = 'success') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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
            servicesList: document.getElementById('servicesList'),
            productsList: document.getElementById('productsList'),
            imageGallery: document.getElementById('imageGallery'),
            applicationsTable: document.getElementById('applicationsTable'),
            portfolioSelection: document.getElementById('portfolioSelection')
        };
    }

    // === ОБНОВЛЕНИЕ ДАШБОРДА ===
    updateDashboard() {
        const stats = {
            services: this.state.data.services.length,
            products: this.state.data.products.length,
            portfolio: this.state.getPortfolioItems().length,
            applications: this.state.applications.filter(app => app.status === 'new').length
        };

        if (document.getElementById('services-count'))
            document.getElementById('services-count').textContent = stats.services;
        if (document.getElementById('products-count'))
            document.getElementById('products-count').textContent = stats.products;
        if (document.getElementById('portfolio-count'))
            document.getElementById('portfolio-count').textContent = stats.portfolio;
        if (document.getElementById('applications-count'))
            document.getElementById('applications-count').textContent = stats.applications;
    }

    // === РЕНДЕРИНГ УСЛУГ ===
    renderServices() {
        const container = this.elements.servicesList;
        if (!container) return;
        
        // ПРОВЕРКА ДАННЫХ
        if (!this.state.data || !Array.isArray(this.state.data.services)) {
            console.error('❌ Ошибка: services не является массивом');
            container.innerHTML = '<p>Ошибка загрузки услуг</p>';
            return;
        }
        
        if (this.state.data.services.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-concierge-bell fa-3x"></i>
                    <h3>Услуг пока нет</h3>
                    <p>Добавьте вашу первую услугу</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.state.data.services.map(service => `
            <div class="service-item" data-id="${service.id}">
                <div class="service-icon-small">
                    <i class="fas ${service.icon || 'fa-paint-brush'}"></i>
                </div>
                <div class="item-content">
                    <h4>${service.name || 'Без названия'}</h4>
                    <p>${service.description || 'Без описания'}</p>
                    <div class="item-meta">
                        <span class="price">${service.price || 'Цена не указана'}</span>
                        <span class="features">${service.features?.length || 0} особенностей</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small edit-service" data-id="${service.id}" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger delete-service" data-id="${service.id}" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // === РЕНДЕРИНГ ТОВАРОВ ===
    renderProducts() {
        const container = this.elements.productsList;
        if (!container) return;
        
        if (!this.state.data || !Array.isArray(this.state.data.products)) {
            console.error('❌ Ошибка: products не является массивом');
            container.innerHTML = '<p>Ошибка загрузки товаров</p>';
            return;
        }
        
        if (this.state.data.products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart fa-3x"></i>
                    <h3>Товаров пока нет</h3>
                    <p>Добавьте ваш первый товар</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.state.data.products.map(product => `
            <div class="product-item" data-id="${product.id}">
                <div class="product-image-small">
                    <img src="${product.image || 'https://via.placeholder.com/200'}" 
                         alt="${product.name || 'Товар'}" 
                         onerror="this.src='https://via.placeholder.com/200'">
                </div>
                <div class="item-content">
                    <h4>${product.name || 'Товар'}</h4>
                    <p>${product.description || 'Без описания'}</p>
                    <div class="item-meta">
                        <span class="price">${product.price || 'Цена не указана'}</span>
                        <span class="category">${product.category || 'Без категории'}</span>
                        <span class="portfolio-badge ${product.showInPortfolio ? 'active' : ''}">
                            ${product.showInPortfolio ? 'В портфолио' : 'Не в портфолио'}
                        </span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small edit-product" data-id="${product.id}" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger delete-product" data-id="${product.id}" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// ===== EVENT MANAGER =====
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
        this.setupButtons();
        this.setupEventDelegation();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
            });
        });
    }

    switchSection(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });

        if (sectionId === 'services') {
            this.ui.renderServices();
        } else if (sectionId === 'products') {
            this.ui.renderProducts();
        }
    }

    setupModals() {
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    setupForms() {
        // ФОРМА УСЛУГИ
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
                this.state.updateService(id, serviceData);
            } else {
                this.state.addService(serviceData);
            }

            document.getElementById('serviceModal').classList.remove('active');
            this.ui.renderServices();
            this.ui.updateDashboard();
        });

        document.getElementById('deleteServiceBtn')?.addEventListener('click', () => {
            const id = document.getElementById('serviceId').value;
            if (id && confirm('Удалить эту услугу?')) {
                this.state.deleteService(parseInt(id));
                document.getElementById('serviceModal').classList.remove('active');
                this.ui.renderServices();
                this.ui.updateDashboard();
            }
        });

        // ФОРМА ТОВАРА
        document.getElementById('saveProductBtn')?.addEventListener('click', () => {
            const id = document.getElementById('productId').value;
            const productData = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: document.getElementById('productPrice').value,
                category: document.getElementById('productCategory').value,
                image: document.getElementById('productImage').value,
                location: document.getElementById('productLocation').value || 'В наличии',
                material: document.getElementById('productMaterial').value,
                age: document.getElementById('productAge').value,
                warranty: document.getElementById('productWarranty').value,
                size: document.getElementById('productSize').value,
                showInPortfolio: document.getElementById('productInPortfolio')?.checked || false
            };

            if (id) {
                this.state.updateProduct(id, productData);
            } else {
                this.state.addProduct(productData);
            }

            document.getElementById('productModal').classList.remove('active');
            this.ui.renderProducts();
            this.ui.updateDashboard();
        });

        document.getElementById('deleteProductBtn')?.addEventListener('click', () => {
            const id = document.getElementById('productId').value;
            if (id && confirm('Удалить этот товар?')) {
                this.state.deleteProduct(parseInt(id));
                document.getElementById('productModal').classList.remove('active');
                this.ui.renderProducts();
                this.ui.updateDashboard();
            }
        });
    }

    setupButtons() {
        document.getElementById('saveAll')?.addEventListener('click', () => {
            this.state.saveData();
        });

        document.getElementById('addServiceBtn')?.addEventListener('click', () => {
            document.getElementById('serviceForm').reset();
            document.getElementById('serviceId').value = '';
            document.getElementById('deleteServiceBtn').style.display = 'none';
            document.getElementById('serviceModal').classList.add('active');
        });

        document.getElementById('addProductBtn')?.addEventListener('click', () => {
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            document.getElementById('deleteProductBtn').style.display = 'none';
            document.getElementById('productModal').classList.add('active');
        });
    }

    setupEventDelegation() {
        document.addEventListener('click', (e) => {
            // Редактирование услуги
            if (e.target.closest('.edit-service')) {
                const id = parseInt(e.target.closest('.edit-service').dataset.id);
                const service = this.state.data.services.find(s => s.id === id);
                if (service) {
                    document.getElementById('serviceId').value = service.id;
                    document.getElementById('serviceName').value = service.name;
                    document.getElementById('serviceDescription').value = service.description;
                    document.getElementById('servicePrice').value = service.price;
                    document.getElementById('serviceIcon').value = service.icon || '';
                    document.getElementById('serviceFeatures').value = service.features?.join('\n') || '';
                    
                    document.getElementById('deleteServiceBtn').style.display = 'block';
                    document.getElementById('serviceModal').classList.add('active');
                }
            }

            // Удаление услуги
            if (e.target.closest('.delete-service')) {
                const id = parseInt(e.target.closest('.delete-service').dataset.id);
                if (confirm('Удалить эту услугу?')) {
                    this.state.deleteService(id);
                    this.ui.renderServices();
                    this.ui.updateDashboard();
                }
            }

            // Редактирование товара
            if (e.target.closest('.edit-product')) {
                const id = parseInt(e.target.closest('.edit-product').dataset.id);
                const product = this.state.data.products.find(p => p.id === id);
                if (product) {
                    document.getElementById('productId').value = product.id;
                    document.getElementById('productName').value = product.name;
                    document.getElementById('productDescription').value = product.description;
                    document.getElementById('productPrice').value = product.price;
                    document.getElementById('productCategory').value = product.category;
                    document.getElementById('productImage').value = product.image;
                    document.getElementById('productLocation').value = product.location;
                    document.getElementById('productMaterial').value = product.specs?.material || '';
                    document.getElementById('productAge').value = product.specs?.age || '';
                    document.getElementById('productWarranty').value = product.specs?.warranty || '';
                    document.getElementById('productSize').value = product.specs?.size || '';
                    
                    const portfolioCheckbox = document.getElementById('productInPortfolio');
                    if (portfolioCheckbox) {
                        portfolioCheckbox.checked = product.showInPortfolio || false;
                    }
                    
                    document.getElementById('deleteProductBtn').style.display = 'block';
                    document.getElementById('productModal').classList.add('active');
                }
            }

            // Удаление товара
            if (e.target.closest('.delete-product')) {
                const id = parseInt(e.target.closest('.delete-product').dataset.id);
                if (confirm('Удалить этот товар?')) {
                    this.state.deleteProduct(id);
                    this.ui.renderProducts();
                    this.ui.updateDashboard();
                }
            }
        });
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
class AdminApp {
    constructor() {
        this.state = new AdminState();
        this.ui = new UIManager(this.state);
        this.events = new EventManager(this.state, this.ui);
        
        this.init();
    }

    init() {
        console.log('✅ AdminApp запущен');
        
        this.ui.renderServices();
        this.ui.renderProducts();
        this.ui.updateDashboard();
        
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new AdminApp();
// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
window.switchSection = function(sectionId) {
    if (window.adminApp && window.adminApp.events) {
        window.adminApp.events.switchSection(sectionId);
    }
    return false;
};

window.toggleSidebar = function() {
    document.querySelector('.sidebar').classList.toggle('active');
};

window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
};
});
