// ============================================================================
// CONFIGURACIÓN
// ============================================================================

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
    { name: 'curriculum', url: 'curriculum.html', isHome: false },
    { name: 'blog', url: 'blog.html', isHome: false },
    { name: 'booking', url: 'booking.html', isHome: false }
];

// ============================================================================
// GRID ADAPTABLE
// ============================================================================

function getCellsInMaxDimension() {
    return window.matchMedia('(max-width: 768px)').matches
        ? CONFIG.CELLS_IN_MAX_DIMENSION_MOBILE
        : CONFIG.CELLS_IN_MAX_DIMENSION;
}

function calculateGridSize(containerWidth, containerHeight) {
    const cellsInMaxDimension = getCellsInMaxDimension();
    const maxDim = Math.max(containerWidth, containerHeight);
    const minDim = Math.min(containerWidth, containerHeight);
    // Forzamos tamaño de celda entero (px) para evitar subpíxeles y "seams"
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

// ============================================================================
// POSICIONAMIENTO ALEATORIO
// ============================================================================

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

// ============================================================================
// PATHFINDING
// ============================================================================

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
    // ends
    [DIR_MASK.up, 'pipe-end-up'],
    [DIR_MASK.right, 'pipe-end-right'],
    [DIR_MASK.down, 'pipe-end-down'],
    [DIR_MASK.left, 'pipe-end-left'],

    // straights
    [DIR_MASK.left | DIR_MASK.right, 'pipe-straight-h'],
    [DIR_MASK.up | DIR_MASK.down, 'pipe-straight-v'],

    // curves (match css/styles.css)
    [DIR_MASK.right | DIR_MASK.down, 'pipe-curve-tr'], // down + right
    [DIR_MASK.up | DIR_MASK.right, 'pipe-curve-br'], // up + right
    [DIR_MASK.left | DIR_MASK.down, 'pipe-curve-tl'], // down + left
    [DIR_MASK.up | DIR_MASK.left, 'pipe-curve-bl'], // up + left

    // T
    [DIR_MASK.up | DIR_MASK.left | DIR_MASK.right, 'pipe-t-up'], // missing down
    [DIR_MASK.down | DIR_MASK.left | DIR_MASK.right, 'pipe-t-down'], // missing up
    [DIR_MASK.up | DIR_MASK.down | DIR_MASK.left, 'pipe-t-left'], // missing right
    [DIR_MASK.up | DIR_MASK.down | DIR_MASK.right, 'pipe-t-right'], // missing left

    // cross
    [DIR_MASK.up | DIR_MASK.right | DIR_MASK.down | DIR_MASK.left, 'pipe-cross']
]);

function findSimplePath(start, end, cols, rows) {
    const path = [];
    let x = start.x;
    let y = start.y;
    
    path.push({ x, y });
    
    // primero mover horizontalmente
    while (x !== end.x) {
        x += (end.x > x) ? 1 : -1;
        path.push({ x, y });
    }
    
    // luego mover verticalmente
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
            if (cameFrom.has(nKey)) continue; // ya visitado

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
            : findSimplePath(start, end, cols, rows);

        if (!path) return null;
        paths[dest.section.name] = path;

        if (CONFIG.PREFER_EXISTING_PATHS) {
            for (const p of path) preferredCells.add(toKey(p.x, p.y));
        }
    }
    
    return paths;
}

// ============================================================================
// RENDERIZADO SIMPLE
// ============================================================================

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
    container.innerHTML = '';
    
    // crear mapa de posiciones
    const posMap = new Map();
    positions.forEach(p => posMap.set(toKey(p.x, p.y), p.section));
    
    const connections = buildConnectionsMap(paths);
    
    const fragment = document.createDocumentFragment();

    // crear celdas
    for (let y = 0; y < gridSize.rows; y++) {
        for (let x = 0; x < gridSize.cols; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            const key = toKey(x, y);
            const section = posMap.get(key);
            
            // si es una sección
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

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

function tryGenerateValid(gridSize) {
    for (let attempt = 0; attempt < CONFIG.MAX_ATTEMPTS; attempt++) {
        const positions = generatePositions(gridSize.cols, gridSize.rows);
        if (!positions) continue;
        
        const paths = generateAllPaths(positions, gridSize.cols, gridSize.rows);
        if (paths) {
            console.log(`✅ configuración válida en intento ${attempt + 1}`);
            return { positions, paths };
        }
    }
    return null;
}

function init() {
    console.log('🚀 inicializando...');
    
    const container = document.getElementById('gridContainer');
    // Reset: permite que el CSS calcule el tamaño "máximo disponible" antes de fijar píxeles
    container.style.width = '';
    container.style.height = '';
    container.style.gridTemplateColumns = '';
    container.style.gridTemplateRows = '';
    container.style.transform = '';

    const rect = container.getBoundingClientRect();
    const gridSize = calculateGridSize(rect.width, rect.height);

    // Fijar el grid a píxeles enteros para que las piezas conecten sin gaps
    container.style.width = `${gridSize.cols * gridSize.cellSize}px`;
    container.style.height = `${gridSize.rows * gridSize.cellSize}px`;
    container.style.gridTemplateColumns = `repeat(${gridSize.cols}, ${gridSize.cellSize}px)`;
    container.style.gridTemplateRows = `repeat(${gridSize.rows}, ${gridSize.cellSize}px)`;

    // Snap subpíxel: si el contenedor queda centrado en .5px, aparecen "grietas" en las uniones.
    const snappedRect = container.getBoundingClientRect();
    const dx = Math.round(snappedRect.left) - snappedRect.left;
    const dy = Math.round(snappedRect.top) - snappedRect.top;
    if (dx !== 0 || dy !== 0) {
        container.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    
    console.log('📐 grid:', gridSize);
    
    const config = tryGenerateValid(gridSize);
    if (!config) {
        console.error('❌ no se pudo generar configuración válida');
        return;
    }
    
    createGrid(gridSize, config.positions, config.paths);
    console.log('✨ listo');
}

let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(init, CONFIG.RESIZE_DEBOUNCE_MS);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', handleResize);
