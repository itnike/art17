// ===== ЗАГРУЗКА ДАННЫХ ИЗ JSON =====

// Загружает услуги из products.json
async function loadServices() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        
        const container = document.getElementById('services-container');
        if (!container) return;
        
        container.innerHTML = data.services.map(service => `
            <div class="service-card">
                <div class="service-icon">
                    <i class="fas ${service.icon}"></i>
                </div>
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                <p class="service-price">${service.price}</p>
                <button class="service-button" onclick="selectService(${service.id})">
                    Заказать услугу
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        document.getElementById('services-container').innerHTML = 
            '<p>Услуги временно недоступны</p>';
    }
}

// Загружает товары из products.json
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        
        const container = document.getElementById('products-container');
        if (!container) return;
        
        container.innerHTML = data.products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3'">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p class="product-price">${product.price}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${product.location}</p>
                    <button class="cta-button" onclick="selectProduct(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Заказать
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        document.getElementById('products-container').innerHTML = 
            '<p>Товары временно недоступны</p>';
    }
}

// Загружает портфолио из products.json
async function loadPortfolio() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        
        const container = document.getElementById('portfolio-container');
        if (!container) return;
        
        container.innerHTML = data.products.map(product => `
            <div class="portfolio-item">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3'">
                <div class="portfolio-overlay">
                    <h3>${product.name}</h3>
                    <p>${product.location}</p>
                    <p>${product.price}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки портфолио:', error);
        document.getElementById('portfolio-container').innerHTML = 
            '<p>Портфолио временно недоступно</p>';
    }
}

// ===== ОБРАБОТКА ВЫБОРА =====

function selectService(serviceId) {
    fetch('data/products.json')
        .then(response => response.json())
        .then(data => {
            const service = data.services.find(s => s.id === serviceId);
            if (service) {
                document.getElementById('interest').value = 'service';
                document.getElementById('message').value = 
                    `Интересует услуга: ${service.name}\n${service.price}\n\n`;
                scrollToContact();
            }
        });
}

function selectProduct(productId) {
    fetch('data/products.json')
        .then(response => response.json())
        .then(data => {
            const product = data.products.find(p => p.id === productId);
            if (product) {
                document.getElementById('interest').value = 'product';
                document.getElementById('message').value = 
                    `Интересует товар: ${product.name}\nЦена: ${product.price}\nЛокация: ${product.location}\n\n`;
                scrollToContact();
            }
        });
}

// ===== СУЩЕСТВУЮЩИЕ ФУНКЦИИ (из вашего кода) =====

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            navLinks.classList.remove('active');
        }
    });
});

// Scroll to contact form
function scrollToContact() {
    document.getElementById('contact').scrollIntoView({
        behavior: 'smooth'
    });
}

// Form submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Получаем данные формы
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        interest: document.getElementById('interest').value,
        message: document.getElementById('message').value,
        date: new Date().toLocaleString()
    };
    
    // Можно сохранить в localStorage для просмотра заявок
    saveApplication(formData);
    
    // Показываем уведомление
    alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в течение часа.');
    
    // Очищаем форму
    this.reset();
});

// Сохранение заявки в localStorage
function saveApplication(application) {
    try {
        let applications = JSON.parse(localStorage.getItem('art17_applications')) || [];
        applications.push(application);
        localStorage.setItem('art17_applications', JSON.stringify(applications));
        console.log('Заявка сохранена:', application);
    } catch (error) {
        console.error('Ошибка сохранения заявки:', error);
    }
}

// ===== ЗАГРУЗКА ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем данные
    loadServices();
    loadProducts();
    loadPortfolio();
    
    // Проверяем localStorage на наличие старых заявок
    const savedApps = localStorage.getItem('art17_applications');
    if (savedApps) {
        console.log('Сохраненных заявок:', JSON.parse(savedApps).length);
    }
});
