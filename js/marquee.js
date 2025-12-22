// ============================================================================
// CONFIGURACIÓN DE MARQUEES
// ============================================================================

const MARQUEE_CONFIG = {
    // ruta del logo a usar
    logoPath: 'assets/images/LOGO.webp',
    
    // cantidad de logos a mostrar (más logos = loop más suave)
    logoCount: 20,
    
    // espaciado entre logos (valores CSS: px, vw, rem, etc.)
    logoSpacing: '1.6vw',
    
    // opacidad de los logos (0.0 = invisible, 1.0 = completamente visible)
    opacity: 0.9,
    
    // altura de cada logo (valores CSS: vh, px, rem, etc.)
    logoHeight: '18vh',
    
    // altura del contenedor del marquee (debe ser >= logoHeight para evitar cortes)
    containerHeight: '23vh',
    
    // duración de la animación en segundos (más alto = más lento)
    animationDuration: 120,
    
    // altura del contenedor en móviles
    containerHeightMobile: '17vh',
    
    // altura del logo en móviles
    logoHeightMobile: '14vh',
    
    // espaciado entre logos en móviles
    logoSpacingMobile: '4vw'
};

// ============================================================================
// GENERACIÓN DINÁMICA DE MARQUEES
// ============================================================================

function createMarquees() {
    // verificar que no estamos en la página home
    if (document.body.classList.contains('home-page')) {
        return;
    }
    
    // crear marquee superior
    const marqueeTop = createMarqueeElement('top');
    document.body.insertBefore(marqueeTop, document.body.firstChild);
    
    // crear marquee inferior
    const marqueeBottom = createMarqueeElement('bottom');
    document.body.appendChild(marqueeBottom);
    
    // aplicar estilos dinámicos
    applyDynamicStyles();
}

function createMarqueeElement(position) {
    const marqueeContainer = document.createElement('div');
    marqueeContainer.className = `marquee-${position}`;
    
    const marqueeContent = document.createElement('div');
    marqueeContent.className = 'marquee-content';
    
    // generar logos según configuración
    for (let i = 0; i < MARQUEE_CONFIG.logoCount; i++) {
        const logo = document.createElement('img');
        logo.src = MARQUEE_CONFIG.logoPath;
        logo.alt = 'safe amorx';
        logo.className = 'marquee-logo';
        marqueeContent.appendChild(logo);
    }
    
    marqueeContainer.appendChild(marqueeContent);
    return marqueeContainer;
}

function applyDynamicStyles() {
    // crear elemento style para inyectar CSS dinámico
    const style = document.createElement('style');
    style.id = 'marquee-dynamic-styles';
    
    style.textContent = `
        /* estilos dinámicos generados desde configuración */
        .marquee-top,
        .marquee-bottom {
            height: ${MARQUEE_CONFIG.containerHeight};
        }
        
        .marquee-logo {
            height: ${MARQUEE_CONFIG.logoHeight};
            margin: 0 ${MARQUEE_CONFIG.logoSpacing};
            opacity: ${MARQUEE_CONFIG.opacity};
        }
        
        .marquee-top .marquee-content {
            animation-duration: ${MARQUEE_CONFIG.animationDuration}s;
        }
        
        .marquee-bottom .marquee-content {
            animation-duration: ${MARQUEE_CONFIG.animationDuration}s;
        }
        
        .page-container {
            padding-top: calc(${MARQUEE_CONFIG.containerHeight} + 60px);
            padding-bottom: calc(${MARQUEE_CONFIG.containerHeight} + 24px);
        }

        .back-link {
            z-index: 3;
        }
        
        /* responsive: móviles */
        @media (max-width: 768px) {
            .marquee-top,
            .marquee-bottom {
                height: ${MARQUEE_CONFIG.containerHeightMobile};
            }
            
            .marquee-logo {
                height: ${MARQUEE_CONFIG.logoHeightMobile};
                margin: 0 ${MARQUEE_CONFIG.logoSpacingMobile};
            }
            
            .page-container {
                padding-top: calc(${MARQUEE_CONFIG.containerHeightMobile} + 32px);
                padding-bottom: calc(${MARQUEE_CONFIG.containerHeightMobile} + 24px);
            }

        }
    `;
    
    document.head.appendChild(style);
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
