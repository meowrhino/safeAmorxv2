/**
 * preview.js - Renderizado de vista previa del contenido
 */

const Preview = {
    container: null,
    
    /**
     * Inicializar el módulo de preview
     */
    init() {
        this.container = document.getElementById('previewContainer');
    },
    
    /**
     * Renderizar vista previa de una categoría
     */
    render(categoryData) {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        if (!categoryData || categoryData.length === 0) {
            this.container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 2rem;">No hay contenido para mostrar</p>';
            return;
        }
        
        categoryData.forEach((section, index) => {
            const sectionElement = this.createSectionPreview(section, index);
            this.container.appendChild(sectionElement);
        });
    },
    
    /**
     * Crear elemento de vista previa para una sección
     */
    createSectionPreview(section, index) {
        const div = document.createElement('div');
        div.className = 'preview-section';
        
        // Título (H2)
        if (section.titulo) {
            const h2 = document.createElement('h2');
            h2.textContent = section.titulo;
            div.appendChild(h2);
        }
        
        // Subtítulo (H3)
        if (section.subtitulo) {
            const h3 = document.createElement('h3');
            h3.textContent = section.subtitulo;
            div.appendChild(h3);
        }
        
        // Párrafos
        if (section.texto && Array.isArray(section.texto)) {
            section.texto.forEach(parrafo => {
                if (parrafo.trim()) {
                    const p = document.createElement('p');
                    p.textContent = parrafo;
                    div.appendChild(p);
                }
            });
        }
        
        // Logos (simplificado para preview)
        if (section.logos && Array.isArray(section.logos) && section.logos.length > 0) {
            const logosDiv = document.createElement('div');
            logosDiv.style.cssText = 'display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;';
            
            section.logos.forEach(logo => {
                if (logo.src) {
                    const logoContainer = document.createElement('div');
                    logoContainer.style.cssText = 'padding: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 4px;';
                    logoContainer.textContent = `🖼️ ${logo.alt || 'Logo'}`;
                    logosDiv.appendChild(logoContainer);
                }
            });
            
            div.appendChild(logosDiv);
        }
        
        return div;
    },
    
    /**
     * Limpiar vista previa
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
};
