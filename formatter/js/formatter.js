/**
 * formatter.js - Módulo principal que coordina el formatter
 */

const Formatter = {
    currentCategory: 'about',
    data: null,
    previewVisible: true,
    
    /**
     * Inicializar la aplicación
     */
    init() {
        // Intentar cargar datos guardados o usar estructura vacía
        this.data = Storage.load() || Storage.getEmptyStructure();
        
        // Inicializar módulos
        Editor.init(this.data);
        Preview.init();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Renderizar estado inicial
        this.switchCategory('about');
        this.updateCounts();
        
        // Mostrar mensaje de bienvenida
        this.showStatus('Formatter cargado correctamente', 'success');
    },
    
    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Tabs de categorías
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.target.dataset.category || e.target.closest('.tab').dataset.category;
                this.switchCategory(category);
            });
        });
        
        // Botón añadir sección
        document.getElementById('addSectionBtn').addEventListener('click', () => {
            Editor.addSection();
            this.updateCounts();
        });
        
        // Botón importar
        document.getElementById('importBtn').addEventListener('click', () => {
            this.importData();
        });
        
        // Botón exportar
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        // Botón guardar
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveProgress();
        });
        
        // Botón resetear
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetData();
        });
        
        // Botón toggle preview
        document.getElementById('togglePreviewBtn').addEventListener('click', () => {
            this.togglePreview();
        });
        
        // Input de archivo (hidden)
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });
    },
    
    /**
     * Cambiar de categoría
     */
    switchCategory(category) {
        this.currentCategory = category;
        
        // Actualizar tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        // Actualizar título
        const categoryTitles = {
            about: 'About',
            booking: 'Booking',
            curriculum: 'Curriculum'
        };
        document.getElementById('categoryTitle').textContent = categoryTitles[category];
        
        // Renderizar editor y preview
        Editor.renderCategory(category);
        Preview.render(this.data[category]);
    },
    
    /**
     * Actualizar contadores de secciones
     */
    updateCounts() {
        ['about', 'booking', 'curriculum'].forEach(category => {
            const count = this.data[category] ? this.data[category].length : 0;
            const countEl = document.getElementById(`count-${category}`);
            if (countEl) {
                countEl.textContent = count;
            }
        });
    },
    
    /**
     * Callback cuando los datos cambian
     */
    onDataChange() {
        Preview.render(this.data[this.currentCategory]);
        this.updateCounts();
    },
    
    /**
     * Guardar progreso en LocalStorage
     */
    saveProgress() {
        const success = Storage.save(this.data);
        if (success) {
            this.showStatus('Progreso guardado correctamente', 'success');
        } else {
            this.showStatus('Error al guardar el progreso', 'error');
        }
    },
    
    /**
     * Exportar datos como JSON
     */
    exportData() {
        const success = Storage.export(this.data, 'data.json');
        if (success) {
            this.showStatus('JSON exportado correctamente', 'success');
        } else {
            this.showStatus('Error al exportar el JSON', 'error');
        }
    },
    
    /**
     * Importar datos desde archivo
     */
    importData() {
        document.getElementById('fileInput').click();
    },
    
    /**
     * Manejar selección de archivo
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const data = await Storage.import(file);
            
            if (confirm('¿Quieres reemplazar el contenido actual con el archivo importado?')) {
                this.data = data;
                Editor.data = data;
                this.switchCategory(this.currentCategory);
                this.updateCounts();
                this.showStatus('Archivo importado correctamente', 'success');
            }
        } catch (error) {
            this.showStatus('Error al importar: ' + error.message, 'error');
        }
        
        // Limpiar input
        event.target.value = '';
    },
    
    /**
     * Resetear todos los datos
     */
    resetData() {
        if (confirm('¿Estás seguro de que quieres resetear todo el contenido? Esta acción no se puede deshacer.')) {
            this.data = Storage.getEmptyStructure();
            Editor.data = this.data;
            Storage.clear();
            this.switchCategory(this.currentCategory);
            this.updateCounts();
            this.showStatus('Contenido reseteado', 'success');
        }
    },
    
    /**
     * Toggle vista previa
     */
    togglePreview() {
        this.previewVisible = !this.previewVisible;
        const previewPanel = document.querySelector('.preview-panel');
        const btn = document.getElementById('togglePreviewBtn');
        
        if (this.previewVisible) {
            previewPanel.style.display = 'flex';
            btn.textContent = '👁️ Ocultar';
        } else {
            previewPanel.style.display = 'none';
            btn.textContent = '👁️ Mostrar';
        }
    },
    
    /**
     * Mostrar mensaje de estado
     */
    showStatus(message, type = '') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = 'status-message ' + type;
        
        // Limpiar después de 3 segundos
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status-message';
        }, 3000);
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Formatter.init());
} else {
    Formatter.init();
}
