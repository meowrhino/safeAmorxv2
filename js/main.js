// ============================================================================
// GRID (home)
// ============================================================================
(() => {
    const CONFIG = {
        CELLS_IN_MAX_DIMENSION: 10,
        CELLS_IN_MAX_DIMENSION_MOBILE: 5,
        RESIZE_DEBOUNCE_MS: 150,
        MAX_ATTEMPTS: 50,
        AVOID_OTHER_DESTINATIONS: true,
        PREFER_EXISTING_PATHS: true,
        BLOCK_ADJACENT_SECTIONS: true,
        BLOCK_DIAGONAL_ADJACENCY: false
    };

    const DEFAULT_HOME_LABEL = 'home';
    const DEFAULT_CATEGORIES = [
        { key: 'about', label: 'about' },
        { key: 'booking', label: 'booking' },
        { key: 'collabs', label: 'collabs' },
        { key: 'training', label: 'training' },
        { key: 'blog', label: 'blog' }
    ];

    let sections = [];

    function normalizeCategories(rawCategories, dataKeys = []) {
        const normalized = Array.isArray(rawCategories)
            ? rawCategories.map((category) => {
                const key = typeof category?.key === 'string' ? category.key.trim() : '';
                if (!key) return null;
                const label = typeof category?.label === 'string' && category.label.trim()
                    ? category.label.trim()
                    : key;
                return { key, label };
            }).filter(Boolean)
            : [];

        const keys = new Set(normalized.map((category) => category.key));

        DEFAULT_CATEGORIES.forEach((category) => {
            if (keys.has(category.key)) return;
            keys.add(category.key);
            normalized.push({ ...category });
        });

        dataKeys.forEach((key) => {
            if (!key || keys.has(key)) return;
            keys.add(key);
            normalized.push({ key, label: key });
        });

        return normalized;
    }

    function buildSectionsFromData(data) {
        const dataKeys = data && typeof data === 'object'
            ? Object.keys(data).filter((key) => key !== 'meta' && Array.isArray(data[key]))
            : [];
        const categories = normalizeCategories(data?.meta?.categories, dataKeys)
            .filter((category) => category.key !== 'home');
        const homeLabel = typeof data?.meta?.homeLabel === 'string' && data.meta.homeLabel.trim()
            ? data.meta.homeLabel.trim()
            : DEFAULT_HOME_LABEL;

        return [
            { key: 'home', label: homeLabel, url: 'index.html', isHome: true },
            ...categories.map((category) => ({
                key: category.key,
                label: category.label || category.key,
                url: `${category.key}.html`,
                isHome: false
            }))
        ];
    }

    async function loadSections() {
        try {
            const response = await fetch('data.json', { cache: 'no-cache' });
            if (!response.ok) {
                const errorMsg = response.status === 404 
                    ? 'data.json no encontrado'
                    : response.status >= 500
                    ? 'Error del servidor al cargar data.json'
                    : `Error HTTP ${response.status} al cargar data.json`;
                throw new Error(errorMsg);
            }
            const data = await response.json();
            return buildSectionsFromData(data);
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.error('data.json contiene JSON inválido:', error);
            } else {
                console.warn('No se pudo cargar data.json para el grid:', error.message);
            }
            return buildSectionsFromData(null);
        }
    }

    function getCellsPerAxis() {
        return window.matchMedia('(max-width: 768px)').matches
            ? CONFIG.CELLS_IN_MAX_DIMENSION_MOBILE
            : CONFIG.CELLS_IN_MAX_DIMENSION;
    }

    function calculateGridSize(containerWidth, containerHeight) {
        const cellsPerAxis = getCellsPerAxis();
        const cellWidth = Math.max(1, Math.floor(containerWidth / cellsPerAxis));
        const cellHeight = Math.max(1, Math.floor(containerHeight / cellsPerAxis));

        return {
            cols: cellsPerAxis,
            rows: cellsPerAxis,
            cellWidth,
            cellHeight
        };
    }

    function generatePositions(cols, rows) {
        const positions = [];
        const used = new Set();

        function markForbiddenAround(x, y) {
            used.add(toKey(x, y));
            if (!CONFIG.BLOCK_ADJACENT_SECTIONS) return;

            const offsets = [
                { dx: 1, dy: 0 },
                { dx: -1, dy: 0 },
                { dx: 0, dy: 1 },
                { dx: 0, dy: -1 }
            ];

            if (CONFIG.BLOCK_DIAGONAL_ADJACENCY) {
                offsets.push(
                    { dx: 1, dy: 1 },
                    { dx: 1, dy: -1 },
                    { dx: -1, dy: 1 },
                    { dx: -1, dy: -1 }
                );
            }

            for (const { dx, dy } of offsets) {
                const nx = x + dx;
                const ny = y + dy;
                if (!isInBounds(nx, ny, cols, rows)) continue;
                used.add(toKey(nx, ny));
            }
        }

        for (const section of sections) {
            let x, y, key;
            let attempts = 0;

            do {
                x = Math.floor(Math.random() * cols);
                y = Math.floor(Math.random() * rows);
                key = toKey(x, y);
                attempts++;
                if (attempts > 100) return null;
            } while (used.has(key));

            markForbiddenAround(x, y);
            positions.push({ x, y, section });
        }

        return positions;
    }

    function toKey(x, y) {
        return `${x},${y}`;
    }

    function fromKey(key) {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
    }

    function isInBounds(x, y, cols, rows) {
        return x >= 0 && x < cols && y >= 0 && y < rows;
    }

    const DIR_MASK = Object.freeze({
        up: 1,
        right: 2,
        down: 4,
        left: 8
    });

    const PIPE_CLASS_BY_MASK = new Map([
        [DIR_MASK.up, 'pipe-end-up'],
        [DIR_MASK.right, 'pipe-end-right'],
        [DIR_MASK.down, 'pipe-end-down'],
        [DIR_MASK.left, 'pipe-end-left'],
        [DIR_MASK.left | DIR_MASK.right, 'pipe-straight-h'],
        [DIR_MASK.up | DIR_MASK.down, 'pipe-straight-v'],
        [DIR_MASK.right | DIR_MASK.down, 'pipe-curve-tr'],
        [DIR_MASK.up | DIR_MASK.right, 'pipe-curve-br'],
        [DIR_MASK.left | DIR_MASK.down, 'pipe-curve-tl'],
        [DIR_MASK.up | DIR_MASK.left, 'pipe-curve-bl'],
        [DIR_MASK.up | DIR_MASK.left | DIR_MASK.right, 'pipe-t-up'],
        [DIR_MASK.down | DIR_MASK.left | DIR_MASK.right, 'pipe-t-down'],
        [DIR_MASK.up | DIR_MASK.down | DIR_MASK.left, 'pipe-t-left'],
        [DIR_MASK.up | DIR_MASK.down | DIR_MASK.right, 'pipe-t-right'],
        [DIR_MASK.up | DIR_MASK.right | DIR_MASK.down | DIR_MASK.left, 'pipe-cross']
    ]);

    function findSimplePath(start, end) {
        const path = [];
        let x = start.x;
        let y = start.y;

        path.push({ x, y });

        while (x !== end.x) {
            x += (end.x > x) ? 1 : -1;
            path.push({ x, y });
        }

        while (y !== end.y) {
            y += (end.y > y) ? 1 : -1;
            path.push({ x, y });
        }

        return path;
    }

    function findPath(start, end, cols, rows, blocked = new Set(), preferred = null) {
        const startKey = toKey(start.x, start.y);
        const endKey = toKey(end.x, end.y);

        if (startKey === endKey) return [{ x: start.x, y: start.y }];

        const queue = [startKey];
        let queueIndex = 0;
        const cameFrom = new Map();
        cameFrom.set(startKey, null);

        while (queueIndex < queue.length) {
            const currentKey = queue[queueIndex++];
            if (currentKey === endKey) break;

            const current = fromKey(currentKey);
            const neighbors = [];
            const directions = [
                { dx: 1, dy: 0 },
                { dx: -1, dy: 0 },
                { dx: 0, dy: 1 },
                { dx: 0, dy: -1 }
            ];

            for (const { dx, dy } of directions) {
                const nx = current.x + dx;
                const ny = current.y + dy;
                if (!isInBounds(nx, ny, cols, rows)) continue;

                const nKey = toKey(nx, ny);
                if (blocked.has(nKey)) continue;
                if (cameFrom.has(nKey)) continue;

                neighbors.push({ x: nx, y: ny, key: nKey });
            }

            if (preferred && preferred.size > 0) {
                const preferredNeighbors = [];
                const normalNeighbors = [];
                for (const n of neighbors) {
                    if (preferred.has(n.key)) preferredNeighbors.push(n);
                    else normalNeighbors.push(n);
                }
                neighbors.length = 0;
                neighbors.push(...preferredNeighbors, ...normalNeighbors);
            }

            for (const neighbor of neighbors) {
                cameFrom.set(neighbor.key, currentKey);
                queue.push(neighbor.key);
            }
        }

        if (!cameFrom.has(endKey)) return null;

        const path = [];
        let currentKey = endKey;
        while (currentKey) {
            path.push(fromKey(currentKey));
            currentKey = cameFrom.get(currentKey);
        }

        path.reverse();
        return path;
    }

    function generateAllPaths(positions, cols, rows) {
        const home = positions.find(p => p.section.isHome);
        const destinations = positions.filter(p => !p.section.isHome);
        const paths = {};

        if (!home) return null;

        const preferredCells = new Set();

        for (const dest of destinations) {
            const start = { x: home.x, y: home.y };
            const end = { x: dest.x, y: dest.y };

            let blocked = new Set();
            if (CONFIG.AVOID_OTHER_DESTINATIONS) {
                blocked = new Set(
                    destinations
                        .filter(d => d.section.key !== dest.section.key)
                        .map(d => toKey(d.x, d.y))
                );
            }

            const path = CONFIG.AVOID_OTHER_DESTINATIONS || CONFIG.PREFER_EXISTING_PATHS
                ? findPath(start, end, cols, rows, blocked, CONFIG.PREFER_EXISTING_PATHS ? preferredCells : null)
                : findSimplePath(start, end);

            if (!path) return null;
            paths[dest.section.key] = path;

            if (CONFIG.PREFER_EXISTING_PATHS) {
                for (const p of path) preferredCells.add(toKey(p.x, p.y));
            }
        }

        return paths;
    }

    function addConnectionMask(connections, x, y, mask) {
        const key = toKey(x, y);
        connections.set(key, (connections.get(key) ?? 0) | mask);
    }

    function buildConnectionsMap(paths) {
        const connections = new Map();

        for (const pathName in paths) {
            const path = paths[pathName];
            if (!Array.isArray(path) || path.length < 2) continue;

            for (let i = 0; i < path.length - 1; i++) {
                const curr = path[i];
                const next = path[i + 1];

                if (next.x > curr.x) {
                    addConnectionMask(connections, curr.x, curr.y, DIR_MASK.right);
                    addConnectionMask(connections, next.x, next.y, DIR_MASK.left);
                } else if (next.x < curr.x) {
                    addConnectionMask(connections, curr.x, curr.y, DIR_MASK.left);
                    addConnectionMask(connections, next.x, next.y, DIR_MASK.right);
                } else if (next.y > curr.y) {
                    addConnectionMask(connections, curr.x, curr.y, DIR_MASK.down);
                    addConnectionMask(connections, next.x, next.y, DIR_MASK.up);
                } else if (next.y < curr.y) {
                    addConnectionMask(connections, curr.x, curr.y, DIR_MASK.up);
                    addConnectionMask(connections, next.x, next.y, DIR_MASK.down);
                }
            }
        }

        return connections;
    }

    function createGrid(gridSize, positions, paths) {
        const container = document.getElementById('gridContainer');
        if (!container) return;

        container.innerHTML = '';

        const posMap = new Map();
        positions.forEach(p => posMap.set(toKey(p.x, p.y), p.section));

        const connections = buildConnectionsMap(paths);
        const fragment = document.createDocumentFragment();

        for (let y = 0; y < gridSize.rows; y++) {
            for (let x = 0; x < gridSize.cols; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                const key = toKey(x, y);
                const section = posMap.get(key);

                if (section) {
                    if (section.isHome) {
                        cell.classList.add('home');
                        const label = document.createElement('span');
                        label.className = 'section-label';
                        label.textContent = section.label;
                        cell.appendChild(label);
                    } else {
                        cell.classList.add('destination');
                        const link = document.createElement('a');
                        link.href = section.url;
                        link.textContent = section.label;
                        cell.appendChild(link);
                    }
                }

                if (!section && connections.has(key)) {
                    const mask = connections.get(key);
                    const pieceClass = PIPE_CLASS_BY_MASK.get(mask);
                    if (pieceClass) cell.classList.add('pipe', pieceClass);
                }

                fragment.appendChild(cell);
            }
        }

        container.appendChild(fragment);
    }

    function tryGenerateValid(gridSize) {
        for (let attempt = 0; attempt < CONFIG.MAX_ATTEMPTS; attempt++) {
            const positions = generatePositions(gridSize.cols, gridSize.rows);
            if (!positions) continue;

            const paths = generateAllPaths(positions, gridSize.cols, gridSize.rows);
            if (paths) {
                return { positions, paths };
            }
        }
        return null;
    }

    function initGrid() {
        const container = document.getElementById('gridContainer');
        if (!container) return;

        container.style.width = '';
        container.style.height = '';
        container.style.gridTemplateColumns = '';
        container.style.gridTemplateRows = '';
        container.style.transform = '';

        const rect = container.getBoundingClientRect();
        const gridSize = calculateGridSize(rect.width, rect.height);

        const gridWidth = gridSize.cols * gridSize.cellWidth;
        const gridHeight = gridSize.rows * gridSize.cellHeight;

        container.style.width = `${gridWidth}px`;
        container.style.height = `${gridHeight}px`;
        container.style.gridTemplateColumns = `repeat(${gridSize.cols}, ${gridSize.cellWidth}px)`;
        container.style.gridTemplateRows = `repeat(${gridSize.rows}, ${gridSize.cellHeight}px)`;

        const snappedRect = container.getBoundingClientRect();
        const dx = Math.round(snappedRect.left) - snappedRect.left;
        const dy = Math.round(snappedRect.top) - snappedRect.top;
        if (dx !== 0 || dy !== 0) {
            container.style.transform = `translate(${dx}px, ${dy}px)`;
        }

        const config = tryGenerateValid(gridSize);
        if (!config) return;

        createGrid(gridSize, config.positions, config.paths);
    }

    async function setupGrid() {
        if (!document.getElementById('gridContainer')) return;

        sections = await loadSections();
        initGrid();
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(initGrid, CONFIG.RESIZE_DEBOUNCE_MS);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupGrid);
    } else {
        setupGrid();
    }
})();

// ============================================================================
// LOADER (contenido dinámico)
// ============================================================================
(() => {
    const COLLAPSE_RESIZE_DEBOUNCE_MS = 150;
    const BLOG_BATCH = 6;
    let collapseResizeTimeout;

    function setParagraphsMaxHeight(wrapper) {
        if (!wrapper) return;
        wrapper.style.setProperty('--content-max-height', `${wrapper.scrollHeight}px`);
    }

    function updateCollapsibleHeights(root = document) {
        const wrappers = root.querySelectorAll('.content-paragraphs');
        wrappers.forEach(setParagraphsMaxHeight);
    }

    let resizeObserver = null;

    function setupResizeObserver(contentContainer) {
        // Limpiar observer anterior si existe
        if (resizeObserver) {
            resizeObserver.disconnect();
        }

        // Crear nuevo ResizeObserver con debounce
        let resizeTimeout;
        resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateCollapsibleHeights(contentContainer);
            }, COLLAPSE_RESIZE_DEBOUNCE_MS);
        });

        // Observar el contenedor principal
        resizeObserver.observe(contentContainer);
    }

    async function initContentLoader() {
        const contentContainer = document.querySelector('.page-content');
        if (!contentContainer) return;

        const pageType = detectPageType();
        if (!pageType) return;

        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                const errorMsg = response.status === 404
                    ? 'data.json no encontrado'
                    : response.status >= 500
                    ? 'Error del servidor al cargar data.json'
                    : `Error HTTP ${response.status} al cargar data.json`;
                throw new Error(errorMsg);
            }

            const data = await response.json();
            const contentArray = Array.isArray(data?.[pageType]) ? data[pageType] : [];
            renderContent(contentArray, pageType);
            requestAnimationFrame(() => updateCollapsibleHeights(contentContainer));
            
            // Usar ResizeObserver en lugar de window.resize
            setupResizeObserver(contentContainer);
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.error('data.json contiene JSON inválido:', error);
            } else {
                console.error('Error al inicializar el loader:', error.message);
            }
            // Mostrar placeholder si falla la carga
            renderContent([], pageType);
        }
    }

    function detectPageType() {
        const pageCategory = document.body?.dataset?.category
            || document.querySelector('.page-content')?.dataset?.category;
        if (!pageCategory) return null;
        return pageCategory.trim().toLowerCase();
    }

    function renderContent(contentArray, pageType) {
        const contentContainer = document.querySelector('.page-content');
        if (!contentContainer) return;

        const fragment = document.createDocumentFragment();

        const sections = Array.isArray(contentArray) ? contentArray : [];

        if (sections.length === 0) {
            fragment.appendChild(createPlaceholderSection());
        } else {
            sections.forEach((section, index) => {
                const sectionElement = createSection(section, index);
                fragment.appendChild(sectionElement);
            });
        }

        const h1 = contentContainer.querySelector('h1');
        const backLink = contentContainer.querySelector('.back-link');
        const footerLink = contentContainer.querySelector('.about-web-link');

        if (footerLink) {
            contentContainer.insertBefore(fragment, footerLink);
        } else if (backLink) {
            contentContainer.insertBefore(fragment, backLink);
        } else if (h1) {
            h1.after(fragment);
        } else {
            contentContainer.appendChild(fragment);
        }

        if (pageType === 'blog') {
            setupBlogPagination(contentContainer);
        }
    }

    // Crea sección vacía para mostrar "proximamente".
    function createPlaceholderSection() {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'content-section';
        sectionDiv.classList.add('is-empty');
        const p = document.createElement('p');
        p.textContent = 'proximamente';
        sectionDiv.appendChild(p);
        return sectionDiv;
    }

    function normalizeBlocks(section) {
        const fallbackIndent = section && section.sangria !== undefined ? section.sangria : 0;
        if (Array.isArray(section.bloques)) {
            return section.bloques.map(block => ({
                subtitulo: typeof block.subtitulo === 'string' ? block.subtitulo : '',
                texto: Array.isArray(block.texto)
                    ? block.texto
                    : (typeof block.texto === 'string' ? [block.texto] : []),
                desplegable: typeof block.desplegable === 'boolean' ? block.desplegable : false,
                sangria: (typeof block.sangria === 'number' || typeof block.sangria === 'string') ? block.sangria : fallbackIndent
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

    // Extrae un <a> del HTML sin permitir nodos adicionales.
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

    // Inserta texto y anchors preservando el contenido no link.
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

    let lightbox;
    let lightboxKeyHandlerAttached = false;

    function ensureLightbox() {
        if (lightbox) return lightbox;
        lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.setAttribute('aria-hidden', 'true');

        const img = document.createElement('img');
        img.className = 'lightbox-image';
        img.alt = '';
        lightbox.appendChild(img);

        lightbox.addEventListener('click', (event) => {
            if (event.target === lightbox) closeLightbox();
        });

        if (!lightboxKeyHandlerAttached) {
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') closeLightbox();
            });
            lightboxKeyHandlerAttached = true;
        }

        document.body.appendChild(lightbox);
        return lightbox;
    }

    function openLightbox(src, altText) {
        if (!src) return;
        const overlay = ensureLightbox();
        const img = overlay.querySelector('img');
        img.src = src;
        img.alt = altText || '';
        overlay.classList.add('is-visible');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
    }

    function closeLightbox() {
        if (!lightbox) return;
        const img = lightbox.querySelector('img');
        img.src = '';
        img.alt = '';
        lightbox.classList.remove('is-visible');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
    }

    function createSection(section, index) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'content-section';
        sectionDiv.setAttribute('data-section-index', index);
        let hasContent = false;

        if (section.titulo) {
            const h2 = document.createElement('h2');
            h2.textContent = section.titulo;
            sectionDiv.appendChild(h2);
            hasContent = true;
        }

        const blocks = normalizeBlocks(section);
        blocks.forEach((block, blockIndex) => {
            const blockWrapper = document.createElement('div');
            blockWrapper.className = 'content-block';
            const blockIndent = normalizeIndent(block.sangria);
            if (blockIndent) {
                blockWrapper.style.setProperty('--block-paragraph-indent', blockIndent);
            }

            const paragraphsWrapper = document.createElement('div');
            paragraphsWrapper.className = 'content-paragraphs';
            paragraphsWrapper.id = `block-${index}-${blockIndex}-content`;

            let hasParagraphs = false;
            let hasHeader = false;
            block.texto.forEach(parrafo => {
                const trimmed = typeof parrafo === 'string' ? parrafo.trim() : '';
                if (!trimmed) return;
                const p = document.createElement('p');
                appendParagraphContent(p, parrafo);
                paragraphsWrapper.appendChild(p);
                hasParagraphs = true;
            });

            if (block.subtitulo && block.subtitulo.trim()) {
                const header = document.createElement('div');
                header.className = 'content-block-header';
                const h3 = document.createElement('h3');
                h3.textContent = block.subtitulo;
                header.appendChild(h3);
                hasHeader = true;

                if (block.desplegable && hasParagraphs) {
                    const toggle = document.createElement('button');
                    toggle.type = 'button';
                    toggle.className = 'block-toggle';
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.setAttribute('aria-controls', paragraphsWrapper.id);
                    toggle.setAttribute('aria-label', 'Expandir bloque');
                    toggle.textContent = '>';

                    toggle.addEventListener('click', () => {
                        setParagraphsMaxHeight(paragraphsWrapper);
                        const isCollapsed = blockWrapper.classList.toggle('is-collapsed');
                        toggle.setAttribute('aria-expanded', String(!isCollapsed));
                        toggle.setAttribute('aria-label', isCollapsed ? 'Expandir bloque' : 'Contraer bloque');
                    });

                    blockWrapper.classList.add('is-collapsed');
                    header.appendChild(toggle);
                }

                blockWrapper.appendChild(header);
            }

            if (hasHeader || hasParagraphs) {
                if (hasParagraphs) {
                    blockWrapper.appendChild(paragraphsWrapper);
                }
                sectionDiv.appendChild(blockWrapper);
                hasContent = true;
            }
        });

        if (section.imagenes && Array.isArray(section.imagenes) && section.imagenes.length > 0) {
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'images-container';

            section.imagenes.forEach(image => {
                if (!image || !image.src) return;
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'image-item';

                const img = document.createElement('img');
                img.src = image.src;
                img.alt = image.alt || '';
                img.loading = 'lazy';
                img.decoding = 'async';
                img.className = 'image-thumb';

                item.appendChild(img);
                item.addEventListener('click', () => openLightbox(image.src, image.alt || ''));
                imagesContainer.appendChild(item);
            });

            if (imagesContainer.children.length > 0) {
                sectionDiv.appendChild(imagesContainer);
                hasContent = true;
            }
        }

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
            hasContent = true;
        }

        if (!hasContent) {
            sectionDiv.classList.add('is-empty');
            const p = document.createElement('p');
            p.textContent = 'proximamente';
            sectionDiv.appendChild(p);
        }

        return sectionDiv;
    }

    // Paginación tipo "load more" para blog.
    function setupBlogPagination(container) {
        const sections = Array.from(container.querySelectorAll('.content-section'));
        if (sections.length <= BLOG_BATCH) return;

        let visibleLimit = BLOG_BATCH;
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.type = 'button';
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.textContent = 'cargar más';

        loadMoreBtn.addEventListener('click', () => {
            visibleLimit += BLOG_BATCH;
            applyPagination();
        });

        const backLink = container.querySelector('.back-link');
        const footerLink = container.querySelector('.about-web-link');
        if (footerLink) {
            container.insertBefore(loadMoreBtn, footerLink);
        } else if (backLink) {
            container.insertBefore(loadMoreBtn, backLink);
        } else {
            container.appendChild(loadMoreBtn);
        }

        function applyPagination() {
            let count = 0;
            sections.forEach((section) => {
                count += 1;
                section.hidden = count > visibleLimit;
            });
            loadMoreBtn.style.display = count > visibleLimit ? 'inline-flex' : 'none';
        }

        applyPagination();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContentLoader);
    } else {
        initContentLoader();
    }
})();
