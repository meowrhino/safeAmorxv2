// ============================================================================
// SAFE AMORX - UTILIDADES COMPARTIDAS
// ============================================================================
// Funciones comunes utilizadas por main.js y formatter.js
// ============================================================================

/**
 * Normaliza bloques de una sección
 * @param {Object} section - Sección con bloques
 * @returns {Array} Array de bloques normalizados
 */
function normalizeBlocks(section) {
    const fallbackIndent = section && section.sangria !== undefined ? section.sangria : 0;
    
    if (Array.isArray(section.bloques)) {
        return section.bloques.map(block => ({
            subtitulo: typeof block.subtitulo === 'string' ? block.subtitulo : '',
            texto: Array.isArray(block.texto)
                ? block.texto
                : (typeof block.texto === 'string' ? [block.texto] : []),
            desplegable: typeof block.desplegable === 'boolean' ? block.desplegable : false,
            sangria: (typeof block.sangria === 'number' || typeof block.sangria === 'string') 
                ? block.sangria 
                : fallbackIndent
        }));
    }

    const subtitulo = Array.isArray(section.subtitulo)
        ? (section.subtitulo.find(sub => typeof sub === 'string' && sub.trim()) || '')
        : (typeof section.subtitulo === 'string' ? section.subtitulo : '');
    const texto = Array.isArray(section.texto)
        ? section.texto
        : (typeof section.texto === 'string' ? [section.texto] : []);

    return [{ subtitulo, texto, desplegable: false, sangria: fallbackIndent }];
}

/**
 * Normaliza valor de sangría a formato de porcentaje
 * @param {number|string} value - Valor de sangría
 * @returns {string} Valor normalizado en formato "X%" o cadena vacía
 */
function normalizeIndent(value) {
    if (value === null || value === undefined) return '';
    
    if (typeof value === 'number' && Number.isFinite(value)) {
        const clamped = Math.min(50, Math.max(0, value));
        return `${clamped}%`;
    }
    
    if (typeof value === 'string' && value.trim()) {
        const trimmed = value.trim();
        if (/^\d+(\.\d+)?%$/.test(trimmed) || /^\d+(\.\d+)?$/.test(trimmed)) {
            const parsed = Number.parseFloat(trimmed);
            if (Number.isFinite(parsed)) {
                const clamped = Math.min(50, Math.max(0, parsed));
                return `${clamped}%`;
            }
        }
    }
    
    return '';
}

/**
 * Normaliza valor de sangría a número
 * @param {number|string} value - Valor de sangría
 * @returns {number} Valor normalizado entre 0 y 50
 */
function normalizeIndentValue(value) {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.min(50, Math.max(0, value));
    }
    
    if (typeof value === 'string' && value.trim()) {
        const trimmed = value.trim().replace('%', '');
        const parsed = Number.parseFloat(trimmed);
        if (Number.isFinite(parsed)) {
            return Math.min(50, Math.max(0, parsed));
        }
    }
    
    return 0;
}

/**
 * Extrae un elemento <a> del HTML de forma segura
 * @param {string} html - HTML que contiene un enlace
 * @returns {HTMLAnchorElement|null} Elemento anchor o null
 */
function buildAnchorFromHtml(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const anchor = wrapper.querySelector('a');
    if (!anchor) return null;

    const safeAnchor = document.createElement('a');
    safeAnchor.textContent = anchor.textContent || '';
    const href = anchor.getAttribute('href');
    const target = anchor.getAttribute('target');
    const rel = anchor.getAttribute('rel');
    
    if (href) safeAnchor.setAttribute('href', href);
    if (target) safeAnchor.setAttribute('target', target);
    if (rel) {
        safeAnchor.setAttribute('rel', rel);
    } else if (target === '_blank') {
        safeAnchor.setAttribute('rel', 'noopener noreferrer');
    }
    
    return safeAnchor;
}

/**
 * Inserta texto y enlaces HTML preservando el contenido no-link
 * @param {HTMLElement} container - Contenedor donde insertar el contenido
 * @param {string} raw - Texto crudo con posibles enlaces HTML
 */
function appendParagraphContent(container, raw) {
    if (typeof raw !== 'string') return;
    
    const regex = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(raw)) !== null) {
        const before = raw.slice(lastIndex, match.index);
        if (before) {
            container.appendChild(document.createTextNode(before));
        }
        const anchor = buildAnchorFromHtml(match[0]);
        if (anchor) {
            container.appendChild(anchor);
        } else {
            container.appendChild(document.createTextNode(match[0]));
        }
        lastIndex = regex.lastIndex;
    }

    const after = raw.slice(lastIndex);
    if (after) {
        container.appendChild(document.createTextNode(after));
    }
}

// Exportar funciones para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        normalizeBlocks,
        normalizeIndent,
        normalizeIndentValue,
        buildAnchorFromHtml,
        appendParagraphContent
    };
}
