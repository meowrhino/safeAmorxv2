/**
 * storage.js - Gestión de almacenamiento local y exportación/importación
 */

const Storage = {
    STORAGE_KEY: 'safeamorx_content_data',
    
    /**
     * Guardar datos en LocalStorage
     */
    save(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error al guardar en LocalStorage:', error);
            return false;
        }
    },
    
    /**
     * Cargar datos desde LocalStorage
     */
    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al cargar desde LocalStorage:', error);
            return null;
        }
    },
    
    /**
     * Limpiar LocalStorage
     */
    clear() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error al limpiar LocalStorage:', error);
            return false;
        }
    },
    
    /**
     * Exportar datos como archivo JSON
     */
    export(data, filename = 'data.json') {
        try {
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error al exportar JSON:', error);
            return false;
        }
    },
    
    /**
     * Importar datos desde archivo JSON
     */
    import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Validar estructura básica
                    if (!this.validate(data)) {
                        reject(new Error('El archivo JSON no tiene la estructura correcta'));
                        return;
                    }
                    
                    resolve(data);
                } catch (error) {
                    reject(new Error('Error al parsear el archivo JSON: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsText(file);
        });
    },
    
    /**
     * Validar estructura de datos
     */
    validate(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        // Verificar que existan las tres categorías
        const requiredCategories = ['about', 'booking', 'curriculum'];
        for (const category of requiredCategories) {
            if (!Array.isArray(data[category])) {
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Obtener estructura vacía por defecto
     */
    getEmptyStructure() {
        return {
            about: [],
            booking: [],
            curriculum: []
        };
    },
    
    /**
     * Copiar al portapapeles
     */
    copyToClipboard(data) {
        try {
            const jsonString = JSON.stringify(data, null, 2);
            navigator.clipboard.writeText(jsonString);
            return true;
        } catch (error) {
            console.error('Error al copiar al portapapeles:', error);
            return false;
        }
    }
};
