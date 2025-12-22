// ============================================================================
// CONFIGURACIÓN DE MARQUEES
// ============================================================================

const MARQUEE_CONFIG = {
    // ruta del logo a usar
    logoPath: 'assets/images/LOGO.webp',
    
    // cantidad de logos a mostrar (más logos = loop más suave)
    logoCount: 24
};

// ============================================================================
// GENERACIÓN DINÁMICA DE MARQUEES
// ============================================================================

function createMarquees() {
    // verificar que no estamos en la página home
    if (document.body.classList.contains('home-page')) {
        return;
    }

    const marqueeTop = ensureMarquee('top');
    const marqueeBottom = ensureMarquee('bottom');

    fillMarquee(marqueeTop);
    fillMarquee(marqueeBottom);
}

function ensureMarquee(position) {
    const selector = `.marquee-${position}`;
    let marqueeContainer = document.querySelector(selector);
    if (marqueeContainer) return marqueeContainer;

    marqueeContainer = document.createElement('div');
    marqueeContainer.className = `marquee-${position}`;

    if (position === 'top') {
        document.body.insertBefore(marqueeContainer, document.body.firstChild);
    } else {
        document.body.appendChild(marqueeContainer);
    }

    return marqueeContainer;
}

function fillMarquee(marqueeContainer) {
    marqueeContainer.innerHTML = '';
    const marqueeContent = document.createElement('div');
    marqueeContent.className = 'marquee-content';

    for (let i = 0; i < MARQUEE_CONFIG.logoCount; i++) {
        const logo = document.createElement('img');
        logo.src = MARQUEE_CONFIG.logoPath;
        logo.alt = 'safe amorx';
        logo.className = 'marquee-logo';
        marqueeContent.appendChild(logo);
    }

    marqueeContainer.appendChild(marqueeContent);
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

// ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createMarquees);
} else {
    createMarquees();
}
