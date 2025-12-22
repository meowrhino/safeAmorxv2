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

    const sections = [
        { name: 'home', url: 'index.html', isHome: true },
        { name: 'about', url: 'about.html', isHome: false },
        { name: 'cv', url: 'cv.html', isHome: false },
        { name: 'blog', url: 'blog.html', isHome: false },
        { name: 'booking', url: 'booking.html', isHome: false }
    ];

    function getCellsInMaxDimension() {
        return window.matchMedia('(max-width: 768px)').matches
            ? CONFIG.CELLS_IN_MAX_DIMENSION_MOBILE
            : CONFIG.CELLS_IN_MAX_DIMENSION;
    }

    function calculateGridSize(containerWidth, containerHeight) {
        const cellsInMaxDimension = getCellsInMaxDimension();
        const maxDim = Math.max(containerWidth, containerHeight);
        const minDim = Math.min(containerWidth, containerHeight);
        const cellSize = Math.max(1, Math.floor(maxDim / cellsInMaxDimension));
        const cellsInMinDim = Math.max(
            1,
            Math.min(cellsInMaxDimension, Math.floor(minDim / cellSize))
        );

        return {
            cols: containerWidth > containerHeight ? cellsInMaxDimension : cellsInMinDim,
            rows: containerWidth > containerHeight ? cellsInMinDim : cellsInMaxDimension,
            cellSize: cellSize
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
                if (attempts > 1000) return null;
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
                        .filter(d => d.section.name !== dest.section.name)
                        .map(d => toKey(d.x, d.y))
                );
            }

            const path = CONFIG.AVOID_OTHER_DESTINATIONS || CONFIG.PREFER_EXISTING_PATHS
                ? findPath(start, end, cols, rows, blocked, CONFIG.PREFER_EXISTING_PATHS ? preferredCells : null)
                : findSimplePath(start, end);

            if (!path) return null;
            paths[dest.section.name] = path;

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
                        label.textContent = section.name;
                        cell.appendChild(label);
                    } else {
                        cell.classList.add('destination');
                        const link = document.createElement('a');
                        link.href = section.url;
                        link.textContent = section.name;
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

        container.style.width = `${gridSize.cols * gridSize.cellSize}px`;
        container.style.height = `${gridSize.rows * gridSize.cellSize}px`;
        container.style.gridTemplateColumns = `repeat(${gridSize.cols}, ${gridSize.cellSize}px)`;
        container.style.gridTemplateRows = `repeat(${gridSize.rows}, ${gridSize.cellSize}px)`;

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

    function setupGrid() {
        if (!document.getElementById('gridContainer')) return;

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
// MARQUEE (páginas internas)
// ============================================================================
(() => {
    const MARQUEE_CONFIG = {
        logoPath: 'assets/images/LOGO.webp',
        logoCount: 24
    };

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

    function setupMarquee() {
        if (document.body.classList.contains('home-page')) return;

        const marqueeTop = document.querySelector('.marquee-top');
        const marqueeBottom = document.querySelector('.marquee-bottom');
        if (!marqueeTop || !marqueeBottom) return;

        fillMarquee(marqueeTop);
        fillMarquee(marqueeBottom);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupMarquee);
    } else {
        setupMarquee();
    }
})();

// ============================================================================
// LOADER (contenido dinámico)
// ============================================================================
(() => {
    async function initContentLoader() {
        const contentContainer = document.querySelector('.page-content');
        if (!contentContainer) return;

        const pageType = detectPageType();
        if (!pageType) return;

        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`Error al cargar data.json: ${response.status}`);
            }

            const data = await response.json();
            if (data && data[pageType]) {
                renderContent(data[pageType]);
            }
        } catch (error) {
            console.error('Error al inicializar el loader:', error);
        }
    }

    function detectPageType() {
        const title = document.title.toLowerCase();

        if (title.includes('about')) return 'about';
        if (title.includes('booking')) return 'booking';
        if (title.includes('curriculum') || title.includes('cv')) return 'cv';

        return null;
    }

    function renderContent(contentArray) {
        const contentContainer = document.querySelector('.page-content');
        if (!contentContainer) return;

        const fragment = document.createDocumentFragment();

        contentArray.forEach((section, index) => {
            const sectionElement = createSection(section, index);
            fragment.appendChild(sectionElement);
        });

        const h1 = contentContainer.querySelector('h1');
        const backLink = contentContainer.querySelector('.back-link');

        if (backLink) {
            contentContainer.insertBefore(fragment, backLink);
        } else if (h1) {
            h1.after(fragment);
        } else {
            contentContainer.appendChild(fragment);
        }
    }

    function normalizeBlocks(section) {
        if (Array.isArray(section.bloques)) {
            return section.bloques.map(block => ({
                subtitulo: typeof block.subtitulo === 'string' ? block.subtitulo : '',
                texto: Array.isArray(block.texto)
                    ? block.texto
                    : (typeof block.texto === 'string' ? [block.texto] : [])
            }));
        }

        const subtitulo = Array.isArray(section.subtitulo)
            ? (section.subtitulo.find(sub => typeof sub === 'string' && sub.trim()) || '')
            : (typeof section.subtitulo === 'string' ? section.subtitulo : '');
        const texto = Array.isArray(section.texto)
            ? section.texto
            : (typeof section.texto === 'string' ? [section.texto] : []);

        return [{ subtitulo, texto }];
    }

    function createSection(section, index) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'content-section';
        sectionDiv.setAttribute('data-section-index', index);

        if (section.titulo) {
            const h2 = document.createElement('h2');
            h2.textContent = section.titulo;
            sectionDiv.appendChild(h2);
        }

        const blocks = normalizeBlocks(section);
        blocks.forEach(block => {
            if (block.subtitulo && block.subtitulo.trim()) {
                const h3 = document.createElement('h3');
                h3.textContent = block.subtitulo;
                sectionDiv.appendChild(h3);
            }

            block.texto.forEach(parrafo => {
                const trimmed = typeof parrafo === 'string' ? parrafo.trim() : '';
                if (!trimmed) return;
                const p = document.createElement('p');
                p.textContent = parrafo;
                sectionDiv.appendChild(p);
            });
        });

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContentLoader);
    } else {
        initContentLoader();
    }
})();
