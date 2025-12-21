/**
 * loader.js - Sistema de carga dinámica de contenido desde data.json
 * 
 * Este script carga el contenido de las páginas (about, booking, curriculum)
 * desde un archivo JSON y lo inyecta dinámicamente en el HTML.
 */

// Función principal de inicialización
async function initContentLoader() {
    try {
        // Cargar el data.json
        const response = await fetch('../data.json');
        if (!response.ok) {
            throw new Error(`Error al cargar data.json: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Detectar qué página estamos cargando basándonos en el body o el título
        const pageType = detectPageType();
        
        if (pageType && data[pageType]) {
            renderContent(data[pageType], pageType);
        } else {
            console.warn('No se pudo detectar el tipo de página o no hay datos disponibles');
        }
        
    } catch (error) {
        console.error('Error al inicializar el loader:', error);
    }
}

// Detectar el tipo de página actual
function detectPageType() {
    const title = document.title.toLowerCase();
    
    if (title.includes('about')) return 'about';
    if (title.includes('booking')) return 'booking';
    if (title.includes('curriculum') || title.includes('cv')) return 'curriculum';
    
    return null;
}

// Renderizar el contenido en la página
function renderContent(contentArray, pageType) {
    // Buscar el contenedor donde inyectar el contenido
    const contentContainer = document.querySelector('.page-content');
    
    if (!contentContainer) {
        console.error('No se encontró el contenedor .page-content');
        return;
    }
    
    // Crear un contenedor para el contenido dinámico
    const dynamicContent = document.createElement('div');
    dynamicContent.className = 'dynamic-content';
    
    // Iterar sobre cada sección del array
    contentArray.forEach((section, index) => {
        const sectionElement = createSection(section, index);
        dynamicContent.appendChild(sectionElement);
    });
    
    // Insertar el contenido dinámico después del h1 y antes del back-link
    const h1 = contentContainer.querySelector('h1');
    const backLink = contentContainer.querySelector('.back-link');
    
    if (h1 && backLink) {
        contentContainer.insertBefore(dynamicContent, backLink);
    } else if (h1) {
        h1.after(dynamicContent);
    } else {
        contentContainer.appendChild(dynamicContent);
    }
}

// Crear una sección individual
function createSection(section, index) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'content-section';
    sectionDiv.setAttribute('data-section-index', index);
    
    // Añadir el título (h2) si existe
    if (section.titulo) {
        const h2 = document.createElement('h2');
        h2.textContent = section.titulo;
        sectionDiv.appendChild(h2);
    }
    
    // Añadir el subtítulo (h3) si existe
    if (section.subtitulo) {
        const h3 = document.createElement('h3');
        h3.textContent = section.subtitulo;
        sectionDiv.appendChild(h3);
    }
    
    // Añadir los párrafos de texto
    if (section.texto && Array.isArray(section.texto) && section.texto.length > 0) {
        section.texto.forEach(parrafo => {
            const p = document.createElement('p');
            p.textContent = parrafo;
            sectionDiv.appendChild(p);
        });
    }
    
    // Añadir los logos si existen
    if (section.logos && Array.isArray(section.logos) && section.logos.length > 0) {
        const logosContainer = document.createElement('div');
        logosContainer.className = 'logos-container';
        
        section.logos.forEach(logo => {
            const logoLink = document.createElement('a');
            logoLink.href = logo.link || '#';
            logoLink.target = '_blank';
            logoLink.rel = 'noopener noreferrer';
            
            const logoImg = document.createElement('img');
            logoImg.src = logo.src;
            logoImg.alt = logo.alt || 'Logo';
            logoImg.className = 'logo-item';
            
            logoLink.appendChild(logoImg);
            logosContainer.appendChild(logoLink);
        });
        
        sectionDiv.appendChild(logosContainer);
    }
    
    return sectionDiv;
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContentLoader);
} else {
    initContentLoader();
}
