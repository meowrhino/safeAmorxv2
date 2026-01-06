// ============================================================================
// ANIMACIONES DE SCROLL - INTERSECTION OBSERVER
// ============================================================================

(() => {
    'use strict';

    // Configuración de las zonas de visibilidad
    const VIEWPORT_CONFIG = {
        desktop: {
            topMargin: 5,    // 5dvh arriba
            bottomMargin: 5  // 5dvh abajo
        },
        mobile: {
            topMargin: 10,   // 10dvh arriba
            bottomMargin: 10 // 10dvh abajo
        }
    };

    // Detectar si es móvil
    function isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    // Obtener configuración actual
    function getConfig() {
        return isMobile() ? VIEWPORT_CONFIG.mobile : VIEWPORT_CONFIG.desktop;
    }

    // Crear Intersection Observer para las content-section
    function initScrollAnimations() {
        const sections = document.querySelectorAll('.content-section');
        if (sections.length === 0) return;

        const config = getConfig();
        
        // Calcular rootMargin basado en dvh
        // Formato: "top right bottom left"
        const rootMargin = `-${config.topMargin}% 0px -${config.bottomMargin}% 0px`;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Elemento entra en la zona visible
                    entry.target.classList.add('visible');
                } else {
                    // Elemento sale de la zona visible
                    entry.target.classList.remove('visible');
                }
            });
        }, {
            root: null, // viewport
            rootMargin: rootMargin,
            threshold: 0.1 // 10% del elemento debe estar visible
        });

        // Añadir clase scroll-animate y observar todas las secciones
        sections.forEach(section => {
            section.classList.add('scroll-animate');
            observer.observe(section);
        });

        // Re-calcular en resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Re-inicializar con nueva configuración
                observer.disconnect();
                initScrollAnimations();
            }, 250);
        });
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }
})();
