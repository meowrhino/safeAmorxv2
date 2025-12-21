/**
 * editor.js - Gestión del editor de secciones
 */

const Editor = {
    container: null,
    currentCategory: 'about',
    data: null,
    
    /**
     * Inicializar el editor
     */
    init(data) {
        this.container = document.getElementById('sectionsContainer');
        this.data = data || Storage.getEmptyStructure();
    },
    
    /**
     * Renderizar secciones de una categoría
     */
    renderCategory(category) {
        this.currentCategory = category;
        this.container.innerHTML = '';
        
        const sections = this.data[category] || [];
        
        if (sections.length === 0) {
            this.container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 2rem;">No hay secciones. Haz clic en "+ Añadir Sección" para empezar.</p>';
            return;
        }
        
        sections.forEach((section, index) => {
            const sectionCard = this.createSectionCard(section, index);
            this.container.appendChild(sectionCard);
        });
    },
    
    /**
     * Crear tarjeta de sección
     */
    createSectionCard(section, index) {
        const card = document.createElement('div');
        card.className = 'section-card';
        card.dataset.index = index;
        
        // Header
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <span class="section-number">Sección #${index + 1}</span>
            <div class="section-actions">
                <button class="btn btn-icon btn-small" onclick="Editor.moveSection(${index}, -1)" title="Mover arriba" ${index === 0 ? 'disabled' : ''}>
                    ↑
                </button>
                <button class="btn btn-icon btn-small" onclick="Editor.moveSection(${index}, 1)" title="Mover abajo" ${index === this.data[this.currentCategory].length - 1 ? 'disabled' : ''}>
                    ↓
                </button>
                <button class="btn btn-icon btn-small btn-danger" onclick="Editor.deleteSection(${index})" title="Eliminar sección">
                    🗑️
                </button>
            </div>
        `;
        card.appendChild(header);
        
        // Título
        const tituloGroup = this.createFormGroup('Título (H2)', 'text', section.titulo || '', 
            (value) => this.updateSection(index, 'titulo', value));
        card.appendChild(tituloGroup);
        
        // Subtítulo
        const subtituloGroup = this.createFormGroup('Subtítulo (H3)', 'text', section.subtitulo || '', 
            (value) => this.updateSection(index, 'subtitulo', value), true);
        card.appendChild(subtituloGroup);
        
        // Texto (párrafos)
        const textoGroup = this.createParagraphsGroup(section.texto || [], index);
        card.appendChild(textoGroup);
        
        // Logos
        const logosGroup = this.createLogosGroup(section.logos || [], index);
        card.appendChild(logosGroup);
        
        return card;
    },
    
    /**
     * Crear grupo de formulario
     */
    createFormGroup(label, type, value, onChange, optional = false) {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const labelEl = document.createElement('label');
        labelEl.className = 'form-label' + (optional ? ' optional' : '');
        labelEl.textContent = label;
        group.appendChild(labelEl);
        
        const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
        input.className = type === 'textarea' ? 'form-textarea' : 'form-input';
        if (type !== 'textarea') input.type = type;
        input.value = value;
        input.addEventListener('input', (e) => onChange(e.target.value));
        group.appendChild(input);
        
        return group;
    },
    
    /**
     * Crear grupo de párrafos
     */
    createParagraphsGroup(paragraphs, sectionIndex) {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = 'Texto (Párrafos)';
        group.appendChild(label);
        
        const list = document.createElement('div');
        list.className = 'paragraph-list';
        
        paragraphs.forEach((paragraph, pIndex) => {
            const item = this.createParagraphItem(paragraph, sectionIndex, pIndex);
            list.appendChild(item);
        });
        
        group.appendChild(list);
        
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-add';
        addBtn.textContent = '+ Añadir Párrafo';
        addBtn.onclick = () => this.addParagraph(sectionIndex);
        group.appendChild(addBtn);
        
        return group;
    },
    
    /**
     * Crear item de párrafo
     */
    createParagraphItem(paragraph, sectionIndex, pIndex) {
        const item = document.createElement('div');
        item.className = 'paragraph-item';
        
        const header = document.createElement('div');
        header.className = 'paragraph-header';
        header.innerHTML = `
            <span class="paragraph-label">Párrafo ${pIndex + 1}</span>
            <button class="btn btn-icon btn-small" onclick="Editor.deleteParagraph(${sectionIndex}, ${pIndex})" title="Eliminar párrafo">
                🗑️
            </button>
        `;
        item.appendChild(header);
        
        const textarea = document.createElement('textarea');
        textarea.className = 'form-textarea';
        textarea.value = paragraph;
        textarea.addEventListener('input', (e) => this.updateParagraph(sectionIndex, pIndex, e.target.value));
        item.appendChild(textarea);
        
        return item;
    },
    
    /**
     * Crear grupo de logos
     */
    createLogosGroup(logos, sectionIndex) {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.className = 'form-label optional';
        label.textContent = 'Logos';
        group.appendChild(label);
        
        const list = document.createElement('div');
        list.className = 'logo-list';
        
        logos.forEach((logo, lIndex) => {
            const item = this.createLogoItem(logo, sectionIndex, lIndex);
            list.appendChild(item);
        });
        
        group.appendChild(list);
        
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-add';
        addBtn.textContent = '+ Añadir Logo';
        addBtn.onclick = () => this.addLogo(sectionIndex);
        group.appendChild(addBtn);
        
        return group;
    },
    
    /**
     * Crear item de logo
     */
    createLogoItem(logo, sectionIndex, lIndex) {
        const item = document.createElement('div');
        item.className = 'logo-item';
        
        const header = document.createElement('div');
        header.className = 'logo-header';
        header.innerHTML = `
            <span class="logo-label">Logo ${lIndex + 1}</span>
            <button class="btn btn-icon btn-small" onclick="Editor.deleteLogo(${sectionIndex}, ${lIndex})" title="Eliminar logo">
                🗑️
            </button>
        `;
        item.appendChild(header);
        
        const fields = document.createElement('div');
        fields.className = 'logo-fields';
        
        // SRC
        const srcInput = document.createElement('input');
        srcInput.className = 'form-input';
        srcInput.type = 'text';
        srcInput.placeholder = 'URL de la imagen (src)';
        srcInput.value = logo.src || '';
        srcInput.addEventListener('input', (e) => this.updateLogo(sectionIndex, lIndex, 'src', e.target.value));
        fields.appendChild(srcInput);
        
        // Link
        const linkInput = document.createElement('input');
        linkInput.className = 'form-input';
        linkInput.type = 'text';
        linkInput.placeholder = 'URL del enlace (link)';
        linkInput.value = logo.link || '';
        linkInput.addEventListener('input', (e) => this.updateLogo(sectionIndex, lIndex, 'link', e.target.value));
        fields.appendChild(linkInput);
        
        // Alt
        const altInput = document.createElement('input');
        altInput.className = 'form-input';
        altInput.type = 'text';
        altInput.placeholder = 'Texto alternativo (alt)';
        altInput.value = logo.alt || '';
        altInput.addEventListener('input', (e) => this.updateLogo(sectionIndex, lIndex, 'alt', e.target.value));
        fields.appendChild(altInput);
        
        item.appendChild(fields);
        return item;
    },
    
    /**
     * Actualizar sección
     */
    updateSection(index, field, value) {
        this.data[this.currentCategory][index][field] = value;
        this.triggerUpdate();
    },
    
    /**
     * Actualizar párrafo
     */
    updateParagraph(sectionIndex, pIndex, value) {
        this.data[this.currentCategory][sectionIndex].texto[pIndex] = value;
        this.triggerUpdate();
    },
    
    /**
     * Actualizar logo
     */
    updateLogo(sectionIndex, lIndex, field, value) {
        if (!this.data[this.currentCategory][sectionIndex].logos) {
            this.data[this.currentCategory][sectionIndex].logos = [];
        }
        this.data[this.currentCategory][sectionIndex].logos[lIndex][field] = value;
        this.triggerUpdate();
    },
    
    /**
     * Añadir nueva sección
     */
    addSection() {
        const newSection = {
            titulo: '',
            texto: []
        };
        this.data[this.currentCategory].push(newSection);
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
    },
    
    /**
     * Eliminar sección
     */
    deleteSection(index) {
        if (confirm('¿Estás seguro de que quieres eliminar esta sección?')) {
            this.data[this.currentCategory].splice(index, 1);
            this.renderCategory(this.currentCategory);
            this.triggerUpdate();
        }
    },
    
    /**
     * Mover sección
     */
    moveSection(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.data[this.currentCategory].length) return;
        
        const sections = this.data[this.currentCategory];
        [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
        
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
    },
    
    /**
     * Añadir párrafo
     */
    addParagraph(sectionIndex) {
        if (!this.data[this.currentCategory][sectionIndex].texto) {
            this.data[this.currentCategory][sectionIndex].texto = [];
        }
        this.data[this.currentCategory][sectionIndex].texto.push('');
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
    },
    
    /**
     * Eliminar párrafo
     */
    deleteParagraph(sectionIndex, pIndex) {
        this.data[this.currentCategory][sectionIndex].texto.splice(pIndex, 1);
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
    },
    
    /**
     * Añadir logo
     */
    addLogo(sectionIndex) {
        if (!this.data[this.currentCategory][sectionIndex].logos) {
            this.data[this.currentCategory][sectionIndex].logos = [];
        }
        this.data[this.currentCategory][sectionIndex].logos.push({
            src: '',
            link: '',
            alt: ''
        });
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
    },
    
    /**
     * Eliminar logo
     */
    deleteLogo(sectionIndex, lIndex) {
        this.data[this.currentCategory][sectionIndex].logos.splice(lIndex, 1);
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
    },
    
    /**
     * Disparar actualización (para preview y otros)
     */
    triggerUpdate() {
        if (window.Formatter && window.Formatter.onDataChange) {
            window.Formatter.onDataChange();
        }
    }
};
