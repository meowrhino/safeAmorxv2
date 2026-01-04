    // ============================================================================
    // STORAGE - Gestión de datos y localStorage
    // ============================================================================
    const DEFAULT_HOME_LABEL = 'home';
    const DEFAULT_CATEGORIES = [
      { key: 'about', label: 'about' },
      { key: 'booking', label: 'booking' },
      { key: 'collabs', label: 'collabs' },
      { key: 'training', label: 'training' },
      { key: 'blog', label: 'blog' }
    ];

    const Storage = {
      STORAGE_KEY: 'safeamorx_content_data',
      META_KEY: 'safeamorx_content_meta',
      SCHEMA_VERSION: 2,

      /**
       * Obtiene la versión del schema almacenado
       */
      getVersion() {
        try {
          const raw = localStorage.getItem(this.META_KEY);
          const parsed = raw ? Number.parseInt(raw, 10) : NaN;
          return Number.isFinite(parsed) ? parsed : 0;
        } catch (error) {
          console.error('Error al leer la versión del almacenamiento:', error);
          return 0;
        }
      },

      /**
       * Guarda datos en localStorage
       */
      save(data) {
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
          localStorage.setItem(this.META_KEY, String(this.SCHEMA_VERSION));
          return true;
        } catch (error) {
          console.error('Error al guardar en LocalStorage:', error);
          return false;
        }
      },

      /**
       * Carga datos desde localStorage
       */
      load() {
        try {
          const data = localStorage.getItem(this.STORAGE_KEY);
          const parsed = data ? JSON.parse(data) : null;
          return this.normalize(parsed);
        } catch (error) {
          console.error('Error al cargar desde LocalStorage:', error);
          return null;
        }
      },

      /**
       * Limpia localStorage
       */
      clear() {
        try {
          localStorage.removeItem(this.STORAGE_KEY);
          localStorage.removeItem(this.META_KEY);
          return true;
        } catch (error) {
          console.error('Error al limpiar LocalStorage:', error);
          return false;
        }
      },

      /**
       * Exporta datos como archivo JSON
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
       * Importa datos desde un archivo
       */
      import(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const parsed = JSON.parse(event.target.result);
              const normalized = this.normalize(parsed);
              if (!normalized || !this.validate(normalized)) {
                reject(new Error('El archivo JSON no tiene la estructura correcta'));
                return;
              }
              resolve(normalized);
            } catch (error) {
              reject(new Error('Error al parsear el archivo JSON: ' + error.message));
            }
          };
          reader.onerror = () => reject(new Error('Error al leer el archivo'));
          reader.readAsText(file);
        });
      },

      /**
       * Valida la estructura de datos
       */
      validate(data) {
        const normalized = this.normalize(data);
        if (!normalized) return false;
        return this.getCategoryKeys(normalized).every((category) => Array.isArray(normalized[category]));
      },

      /**
       * Retorna estructura vacía
       */
      getEmptyStructure() {
        const empty = {
          meta: {
            homeLabel: DEFAULT_HOME_LABEL,
            categories: DEFAULT_CATEGORIES.map((category) => ({ ...category }))
          }
        };

        DEFAULT_CATEGORIES.forEach((category) => {
          empty[category.key] = [];
        });

        return empty;
      },

      /**
       * Copia datos al portapapeles
       */
      async copyToClipboard(data) {
        try {
          const jsonString = JSON.stringify(data, null, 2);
          await navigator.clipboard.writeText(jsonString);
          return true;
        } catch (error) {
          console.error('Error al copiar al portapapeles:', error);
          return false;
        }
      },

      /**
       * Normaliza valores de sangría (0-50)
       */
      normalizeIndentValue(value) {
        if (typeof value === 'number' && Number.isFinite(value)) {
          return Math.min(50, Math.max(0, value));
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (!trimmed) return 0;
          if (/^\d+(\.\d+)?%?$/.test(trimmed)) {
            const parsed = Number.parseFloat(trimmed);
            if (Number.isFinite(parsed)) {
              return Math.min(50, Math.max(0, parsed));
            }
          }
        }
        return 0;
      },

      /**
       * Normaliza categorías (clave + etiqueta)
       */
      normalizeCategories(rawCategories, dataKeys = []) {
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
      },

      /**
       * Asegura meta y categorías en el dataset
       */
      ensureMeta(data) {
        const dataKeys = Object.keys(data).filter((key) => key !== 'meta' && Array.isArray(data[key]));
        const categories = this.normalizeCategories(data?.meta?.categories, dataKeys);
        const homeLabel = typeof data?.meta?.homeLabel === 'string' && data.meta.homeLabel.trim()
          ? data.meta.homeLabel.trim()
          : DEFAULT_HOME_LABEL;

        data.meta = {
          ...data.meta,
          homeLabel,
          categories
        };

        return data.meta;
      },

      /**
       * Devuelve las claves de categoría activas
       */
      getCategoryKeys(data) {
        const categories = Array.isArray(data?.meta?.categories) ? data.meta.categories : DEFAULT_CATEGORIES;
        return categories.map((category) => category.key);
      },

      /**
       * Normaliza la estructura completa de datos
       * SIMPLIFICADO: Ahora siempre respeta los valores del JSON sin merge complejo
       */
      normalize(raw) {
        if (!raw || typeof raw !== 'object') return null;

        const data = JSON.parse(JSON.stringify(raw));

        // Compatibilidad con nombres antiguos
        if (!data.collabs && Array.isArray(data.cv)) {
          data.collabs = data.cv;
        }
        if (!data.collabs && Array.isArray(data.curriculum)) {
          data.collabs = data.curriculum;
        }
        if (data.cv) delete data.cv;
        if (data.curriculum) delete data.curriculum;

        this.ensureMeta(data);

        /**
         * Normaliza una sección individual
         */
        const normalizeSection = (section) => {
          if (!section || typeof section !== 'object') {
            return {
              titulo: '',
              bloques: [{ subtitulo: '', texto: [], desplegable: false, sangria: 0 }],
              imagenes: [],
              logos: []
            };
          }

          const normalized = { ...section };
          const sectionIndent = this.normalizeIndentValue(normalized.sangria);
          delete normalized.sangria;

          // Normalizar imágenes
          normalized.imagenes = Array.isArray(normalized.imagenes)
            ? normalized.imagenes.map(image => ({
              src: typeof image.src === 'string' ? image.src : '',
              alt: typeof image.alt === 'string' ? image.alt : ''
            }))
            : [];

          // Normalizar logos
          normalized.logos = Array.isArray(normalized.logos)
            ? normalized.logos.map(logo => ({
              src: typeof logo.src === 'string' ? logo.src : '',
              link: typeof logo.link === 'string' ? logo.link : '',
              alt: typeof logo.alt === 'string' ? logo.alt : ''
            }))
            : [];

          // Normalizar bloques
          if (!Array.isArray(normalized.bloques)) {
            // Convertir estructura antigua a bloques
            const subtitulo = typeof normalized.subtitulo === 'string' ? normalized.subtitulo : '';
            const texto = Array.isArray(normalized.texto) ? normalized.texto : [];
            normalized.bloques = [{
              subtitulo,
              texto,
              desplegable: false,
              sangria: sectionIndent
            }];
            delete normalized.subtitulo;
            delete normalized.texto;
          } else {
            // Normalizar cada bloque
            normalized.bloques = normalized.bloques.map(block => ({
              subtitulo: typeof block.subtitulo === 'string' ? block.subtitulo : '',
              texto: Array.isArray(block.texto) ? block.texto : [],
              desplegable: typeof block.desplegable === 'boolean' ? block.desplegable : false,
              sangria: this.normalizeIndentValue(
                (block.sangria !== undefined && block.sangria !== null) ? block.sangria : sectionIndent
              )
            }));
          }

          return normalized;
        };

        // Normalizar todas las categorías activas
        this.getCategoryKeys(data).forEach((category) => {
          if (!Array.isArray(data[category])) data[category] = [];
          data[category] = data[category].map(normalizeSection);
        });

        return data;
      },

      /**
       * Carga data.json desde el repositorio
       */
      async fetchFromRepo() {
        try {
          const response = await fetch('data.json', { cache: 'no-cache' });
          if (!response.ok) throw new Error(`Respuesta ${response.status}`);
          const json = await response.json();
          return this.normalize(json);
        } catch (error) {
          console.error('Error al cargar data.json del repo:', error);
          return null;
        }
      }
    };

    // ============================================================================
    // PREVIEW - Vista previa del contenido
    // ============================================================================
    const Preview = {
      container: null,
      lightbox: null,
      lightboxKeyHandlerAttached: false,

      /**
       * Inicializa el módulo de preview
       */
      init() {
        this.container = document.getElementById('previewContainer');
      },

      /**
       * Renderiza el contenido de una categoría
       */
      render(categoryData) {
        if (!this.container) return;
        this.container.innerHTML = '';

        if (!categoryData || categoryData.length === 0) {
          this.container.innerHTML = '<p class="empty-state">No hay contenido para mostrar</p>';
          return;
        }

        categoryData.forEach((section, index) => {
          const sectionElement = this.createSectionPreview(section, index);
          this.container.appendChild(sectionElement);
        });

        requestAnimationFrame(() => this.refreshExpandableHeights());
      },

      /**
       * Establece la altura máxima para animación de desplegables
       */
      setExpandableHeight(wrapper) {
        if (!wrapper) return;
        wrapper.style.setProperty('--preview-max-height', `${wrapper.scrollHeight}px`);
      },

      /**
       * Actualiza todas las alturas de elementos desplegables
       */
      refreshExpandableHeights() {
        if (!this.container) return;
        this.container.querySelectorAll('.preview-paragraphs').forEach((wrapper) => {
          this.setExpandableHeight(wrapper);
        });
      },

      /**
       * Normaliza valor de sangría para CSS
       */
      normalizeIndent(value) {
        const normalized = Storage.normalizeIndentValue(value);
        return normalized ? `${normalized}%` : '';
      },

      /**
       * Extrae un <a> del HTML sin permitir nodos adicionales.
       */
      buildAnchorFromHtml(html) {
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
      },

      /**
       * Inserta texto y anchors preservando el contenido no link.
       */
      appendParagraphContent(container, raw) {
        if (typeof raw !== 'string') return;
        const regex = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(raw)) !== null) {
          const before = raw.slice(lastIndex, match.index);
          if (before) {
            container.appendChild(document.createTextNode(before));
          }
          const anchor = this.buildAnchorFromHtml(match[0]);
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
      },

      /**
       * Asegura que existe el lightbox
       */
      ensureLightbox() {
        if (this.lightbox) return this.lightbox;

        const overlay = document.createElement('div');
        overlay.className = 'preview-lightbox';
        overlay.setAttribute('aria-hidden', 'true');

        const img = document.createElement('img');
        img.className = 'preview-lightbox-image';
        img.alt = '';
        overlay.appendChild(img);

        overlay.addEventListener('click', (event) => {
          if (event.target === overlay) this.closeLightbox();
        });

        if (!this.lightboxKeyHandlerAttached) {
          document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') this.closeLightbox();
          });
          this.lightboxKeyHandlerAttached = true;
        }

        document.body.appendChild(overlay);
        this.lightbox = overlay;
        return overlay;
      },

      /**
       * Abre el lightbox con una imagen
       */
      openLightbox(src, altText) {
        if (!src) return;
        const overlay = this.ensureLightbox();
        const img = overlay.querySelector('img');
        img.src = src;
        img.alt = altText || '';
        overlay.classList.add('is-visible');
        overlay.setAttribute('aria-hidden', 'false');
      },

      /**
       * Cierra el lightbox
       */
      closeLightbox() {
        if (!this.lightbox) return;
        const img = this.lightbox.querySelector('img');
        img.src = '';
        img.alt = '';
        this.lightbox.classList.remove('is-visible');
        this.lightbox.setAttribute('aria-hidden', 'true');
      },

      /**
       * Crea el elemento de preview para una sección
       */
      createSectionPreview(section, index) {
        const div = document.createElement('div');
        div.className = 'preview-section';
        div.dataset.sectionIndex = index;

        if (section.titulo) {
          const h2 = document.createElement('h2');
          h2.textContent = section.titulo;
          div.appendChild(h2);
        }

        const blocks = this.normalizeBlocks(section);
        blocks.forEach((block, blockIndex) => {
          const blockWrapper = document.createElement('div');
          blockWrapper.className = 'preview-block';

          // Aplicar sangría
          const blockIndent = this.normalizeIndent(block.sangria);
          if (blockIndent) {
            blockWrapper.style.setProperty('--preview-paragraph-indent', blockIndent);
          }

          const paragraphsWrapper = document.createElement('div');
          paragraphsWrapper.className = 'preview-paragraphs';
          paragraphsWrapper.id = `preview-block-${index}-${blockIndex}`;

          let hasParagraphs = false;
          let hasHeader = false;

          // Crear párrafos
          block.texto.forEach(parrafo => {
            if (typeof parrafo === 'string' && parrafo.trim()) {
              const p = document.createElement('p');
              this.appendParagraphContent(p, parrafo);
              paragraphsWrapper.appendChild(p);
              hasParagraphs = true;
            }
          });

          // Crear header con subtítulo y toggle si es desplegable
          if (block.subtitulo && block.subtitulo.trim()) {
            const header = document.createElement('div');
            header.className = 'preview-block-header';
            const h3 = document.createElement('h3');
            h3.textContent = block.subtitulo;
            header.appendChild(h3);
            hasHeader = true;

            if (block.desplegable && hasParagraphs) {
              const toggle = document.createElement('button');
              toggle.type = 'button';
              toggle.className = 'preview-toggle';
              toggle.setAttribute('aria-expanded', 'false');
              toggle.setAttribute('aria-controls', paragraphsWrapper.id);
              toggle.setAttribute('aria-label', 'Expandir bloque');
              toggle.textContent = '>';

              toggle.addEventListener('click', () => {
                this.setExpandableHeight(paragraphsWrapper);
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
            div.appendChild(blockWrapper);
          }
        });

        // Agregar imágenes
        if (section.imagenes && Array.isArray(section.imagenes) && section.imagenes.length > 0) {
          const imagesDiv = document.createElement('div');
          imagesDiv.className = 'preview-images';

          section.imagenes.forEach(image => {
            if (!image || !image.src) return;
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'preview-image-item';

            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt || '';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.className = 'preview-image-thumb';

            item.appendChild(img);
            item.addEventListener('click', () => this.openLightbox(image.src, image.alt || ''));
            imagesDiv.appendChild(item);
          });

          if (imagesDiv.children.length > 0) {
            div.appendChild(imagesDiv);
          }
        }

        // Agregar logos
        if (section.logos && Array.isArray(section.logos) && section.logos.length > 0) {
          const logosDiv = document.createElement('div');
          logosDiv.className = 'preview-logos';

          section.logos.forEach(logo => {
            if (logo.src) {
              const logoContainer = document.createElement('div');
              logoContainer.className = 'preview-logo';
              logoContainer.textContent = `🖼️ ${logo.alt || 'Logo'}`;
              logosDiv.appendChild(logoContainer);
            }
          });

          div.appendChild(logosDiv);
        }

        return div;
      },

      /**
       * Normaliza bloques de una sección
       */
      normalizeBlocks(section) {
        if (Array.isArray(section.bloques)) {
          return section.bloques.map(block => ({
            subtitulo: typeof block.subtitulo === 'string' ? block.subtitulo : '',
            texto: Array.isArray(block.texto)
              ? block.texto
              : (typeof block.texto === 'string' ? [block.texto] : []),
            desplegable: typeof block.desplegable === 'boolean' ? block.desplegable : false,
            sangria: Storage.normalizeIndentValue(
              (block.sangria !== undefined && block.sangria !== null) ? block.sangria : 0
            )
          }));
        }

        const subtitulo = typeof section.subtitulo === 'string' ? section.subtitulo : '';
        const texto = Array.isArray(section.texto)
          ? section.texto
          : (typeof section.texto === 'string' ? [section.texto] : []);

        return [{
          subtitulo,
          texto,
          desplegable: false,
          sangria: Storage.normalizeIndentValue(section.sangria)
        }];
      },

      /**
       * Limpia el contenedor
       */
      clear() {
        if (this.container) this.container.innerHTML = '';
      }
    };

    // ============================================================================
    // EDITOR - Gestión de la interfaz de edición
    // ============================================================================
    const Editor = {
      container: null,
      currentCategory: 'about',
      data: null,

      /**
       * Inicializa el editor
       */
      init(data) {
        this.container = document.getElementById('sectionsContainer');
        this.data = data || Storage.getEmptyStructure();
      },

      /**
       * Renderiza una categoría completa
       */
      renderCategory(category) {
        this.currentCategory = category;
        this.container.innerHTML = '';
        const sections = this.data[category] || [];

        if (sections.length === 0) {
          this.container.innerHTML = '<p class="empty-state">No hay secciones. Pulsa "+ añadir sección" para empezar.</p>';
          return;
        }

        sections.forEach((section, index) => {
          const sectionCard = this.createSectionCard(section, index);
          this.container.appendChild(sectionCard);
        });
      },

      /**
       * Crea una tarjeta de sección
       */
      createSectionCard(section, index) {
        const card = document.createElement('div');
        card.className = 'section-card';
        card.dataset.index = index;

        // Header con número y acciones
        const header = document.createElement('div');
        header.className = 'section-header';
        const label = document.createElement('span');
        label.className = 'section-number';
        label.textContent = `Sección #${index + 1}`;
        header.appendChild(label);

        const actions = document.createElement('div');
        actions.className = 'section-actions';

        // Botón mover arriba
        const moveUpBtn = document.createElement('button');
        moveUpBtn.className = 'btn btn-icon btn-small';
        moveUpBtn.title = 'Mover arriba';
        moveUpBtn.textContent = '↑';
        moveUpBtn.disabled = index === 0;
        moveUpBtn.addEventListener('click', () => this.moveSection(index, -1));
        actions.appendChild(moveUpBtn);

        // Botón mover abajo
        const moveDownBtn = document.createElement('button');
        moveDownBtn.className = 'btn btn-icon btn-small';
        moveDownBtn.title = 'Mover abajo';
        moveDownBtn.textContent = '↓';
        moveDownBtn.disabled = index === this.data[this.currentCategory].length - 1;
        moveDownBtn.addEventListener('click', () => this.moveSection(index, 1));
        actions.appendChild(moveDownBtn);

        // Botón eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-icon btn-small btn-danger';
        deleteBtn.title = 'Eliminar sección';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', () => this.deleteSection(index));
        actions.appendChild(deleteBtn);

        header.appendChild(actions);
        card.appendChild(header);

        // Campo título
        card.appendChild(
          this.createFormGroup(
            '',
            'text',
            section.titulo || '',
            (value) => this.updateSection(index, 'titulo', value),
            false,
            'Título'
          )
        );

        // Bloques, imágenes y logos
        card.appendChild(this.createBlocksGroup(section, index));
        card.appendChild(this.createImagesGroup(section.imagenes || [], index));
        card.appendChild(this.createLogosGroup(section.logos || [], index));

        return card;
      },

      /**
       * Crea un grupo de formulario (input o textarea)
       */
      createFormGroup(label, type, value, onChange, optional = false, placeholder = '') {
        const group = document.createElement('div');
        group.className = 'form-group';

        const labelEl = document.createElement('label');
        labelEl.className = 'form-label' + (optional ? ' optional' : '');
        labelEl.textContent = label;
        group.appendChild(labelEl);

        const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
        input.className = type === 'textarea' ? 'form-textarea' : 'form-input';
        if (type !== 'textarea') input.type = type;
        if (placeholder) input.placeholder = placeholder;
        input.value = value;
        input.addEventListener('input', (e) => onChange(e.target.value));
        group.appendChild(input);

        return group;
      },

      /**
       * Normaliza valor de sangría
       */
      normalizeIndentValue(value) {
        return Storage.normalizeIndentValue(value);
      },

      /**
       * Crea control de sangría (slider)
       */
      createIndentControl(value, onChange) {
        const control = document.createElement('label');
        control.className = 'indent-control';

        const label = document.createElement('span');
        label.className = 'indent-label';
        label.textContent = 'Sangría';

        const input = document.createElement('input');
        input.type = 'range';
        input.className = 'indent-range';
        input.min = '0';
        input.max = '50';
        input.step = '1';
        const initial = this.normalizeIndentValue(value);
        input.value = String(initial);

        const valueEl = document.createElement('span');
        valueEl.className = 'indent-value';
        valueEl.textContent = `${initial}%`;

        input.addEventListener('input', (event) => {
          const nextValue = Number(event.target.value);
          valueEl.textContent = `${nextValue}%`;
          onChange(nextValue);
        });

        control.appendChild(label);
        control.appendChild(input);
        control.appendChild(valueEl);
        return control;
      },

      /**
       * Crea grupo de toggle (checkbox)
       */
      createToggleGroup(label, checked, onChange) {
        const group = document.createElement('div');
        group.className = 'form-group';

        const toggle = document.createElement('label');
        toggle.className = 'toggle-row';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!checked;
        input.addEventListener('change', (e) => onChange(e.target.checked));

        const text = document.createElement('span');
        text.textContent = label;

        toggle.appendChild(input);
        toggle.appendChild(text);
        group.appendChild(toggle);
        return group;
      },

      /**
       * Crea grupo de bloques
       */
      createBlocksGroup(section, sectionIndex) {
        const blocks = this.normalizeBlocks(section);
        const group = document.createElement('div');
        group.className = 'form-group';

        const list = document.createElement('div');
        list.className = 'block-list';
        blocks.forEach((block, blockIndex) => {
          const item = this.createBlockCard(block, sectionIndex, blockIndex, blocks.length);
          list.appendChild(item);
        });
        group.appendChild(list);

        const addBlockBtn = document.createElement('button');
        addBlockBtn.className = 'btn btn-add btn-add-block';
        addBlockBtn.textContent = '+ Añadir bloque';
        addBlockBtn.onclick = () => this.addBlock(sectionIndex, blocks.length - 1);
        group.appendChild(addBlockBtn);
        return group;
      },

      /**
       * Crea tarjeta de bloque individual
       */
      createBlockCard(block, sectionIndex, blockIndex, totalBlocks) {
        const card = document.createElement('div');
        card.className = 'block-card';

        // Header del bloque
        const header = document.createElement('div');
        header.className = 'block-header';
        const label = document.createElement('span');
        label.className = 'block-label';
        label.textContent = `Bloque ${blockIndex + 1}`;
        header.appendChild(label);

        // Control de sangría
        header.appendChild(
          this.createIndentControl(
            block.sangria !== undefined && block.sangria !== null ? block.sangria : 0,
            (value) => this.updateBlockIndent(sectionIndex, blockIndex, value)
          )
        );

        // Botón eliminar bloque
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-icon btn-small';
        deleteBtn.title = 'Eliminar bloque';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', () => this.deleteBlock(sectionIndex, blockIndex));
        header.appendChild(deleteBtn);
        card.appendChild(header);

        // Campo subtítulo
        card.appendChild(
          this.createFormGroup(
            '',
            'text',
            block.subtitulo || '',
            (value) => this.updateSubtitle(sectionIndex, blockIndex, value),
            true,
            'Subtítulo'
          )
        );

        // Toggle desplegable
        card.appendChild(
          this.createToggleGroup(
            'Párrafos desplegables',
            !!block.desplegable,
            (value) => this.updateBlockToggle(sectionIndex, blockIndex, value)
          )
        );

        // Párrafos
        card.appendChild(this.createParagraphsGroup(block.texto || [], sectionIndex, blockIndex));

        // Botones de acción
        const actionsRow = document.createElement('div');
        actionsRow.className = 'block-actions-row';

        const addParagraphBtn = document.createElement('button');
        addParagraphBtn.className = 'btn btn-add btn-add-inline';
        addParagraphBtn.textContent = '+ Añadir párrafo';
        addParagraphBtn.onclick = () => this.addParagraph(sectionIndex, blockIndex);
        actionsRow.appendChild(addParagraphBtn);

        // Solo en el último bloque mostrar botones de imagen y logo
        if (blockIndex === totalBlocks - 1) {
          const addImageBtn = document.createElement('button');
          addImageBtn.className = 'btn btn-add btn-add-inline';
          addImageBtn.textContent = '+ Añadir imagen';
          addImageBtn.onclick = () => this.addImage(sectionIndex);
          actionsRow.appendChild(addImageBtn);

          const addLogoBtn = document.createElement('button');
          addLogoBtn.className = 'btn btn-add btn-add-inline';
          addLogoBtn.textContent = '+ Añadir logo';
          addLogoBtn.onclick = () => this.addLogo(sectionIndex);
          actionsRow.appendChild(addLogoBtn);
        }

        card.appendChild(actionsRow);
        return card;
      },

      /**
       * Crea grupo de párrafos
       */
      createParagraphsGroup(paragraphs, sectionIndex, blockIndex) {
        const group = document.createElement('div');
        group.className = 'form-group';

        const list = document.createElement('div');
        list.className = 'paragraph-list';
        paragraphs.forEach((paragraph, pIndex) => {
          const item = this.createParagraphItem(paragraph, sectionIndex, blockIndex, pIndex, paragraphs.length);
          list.appendChild(item);
        });
        group.appendChild(list);
        return group;
      },

      /**
       * Crea item de párrafo individual
       */
      createParagraphItem(paragraph, sectionIndex, blockIndex, pIndex, totalParagraphs) {
        const item = document.createElement('div');
        item.className = 'paragraph-item';

        const header = document.createElement('div');
        header.className = 'paragraph-header';
        const label = document.createElement('span');
        label.className = 'paragraph-label';
        label.textContent = `Párrafo ${pIndex + 1}`;
        header.appendChild(label);

        const actions = document.createElement('div');
        actions.className = 'paragraph-actions';

        // Botón añadir link
        const linkBtn = document.createElement('button');
        linkBtn.className = 'btn btn-icon btn-small';
        linkBtn.title = 'Añadir enlace al texto seleccionado';
        linkBtn.textContent = '🔗';
        linkBtn.addEventListener('click', () => {
          const textarea = item.querySelector('.form-textarea');
          this.addLinkToParagraph(sectionIndex, blockIndex, pIndex, textarea);
        });
        actions.appendChild(linkBtn);

        // Botón mover arriba
        const moveUpBtn = document.createElement('button');
        moveUpBtn.className = 'btn btn-icon btn-small';
        moveUpBtn.title = 'Mover párrafo arriba';
        moveUpBtn.textContent = '↑';
        moveUpBtn.disabled = pIndex === 0;
        moveUpBtn.addEventListener('click', () => this.moveParagraph(sectionIndex, blockIndex, pIndex, -1));
        actions.appendChild(moveUpBtn);

        // Botón mover abajo
        const moveDownBtn = document.createElement('button');
        moveDownBtn.className = 'btn btn-icon btn-small';
        moveDownBtn.title = 'Mover párrafo abajo';
        moveDownBtn.textContent = '↓';
        moveDownBtn.disabled = pIndex === totalParagraphs - 1;
        moveDownBtn.addEventListener('click', () => this.moveParagraph(sectionIndex, blockIndex, pIndex, 1));
        actions.appendChild(moveDownBtn);

        // Botón eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-icon btn-small';
        deleteBtn.title = 'Eliminar párrafo';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', () => this.deleteParagraph(sectionIndex, blockIndex, pIndex));
        actions.appendChild(deleteBtn);

        header.appendChild(actions);
        item.appendChild(header);

        // Textarea del párrafo
        const textarea = document.createElement('textarea');
        textarea.className = 'form-textarea';
        textarea.value = paragraph;
        textarea.addEventListener('input', (e) => this.updateParagraph(sectionIndex, blockIndex, pIndex, e.target.value));
        item.appendChild(textarea);

        return item;
      },

      /**
       * Crea grupo de imágenes
       */
      createImagesGroup(images, sectionIndex) {
        const group = document.createElement('div');
        group.className = 'form-group';

        if (!images || images.length === 0) return group;

        const list = document.createElement('div');
        list.className = 'image-list';
        images.forEach((image, iIndex) => {
          const item = this.createImageItem(image, sectionIndex, iIndex);
          list.appendChild(item);
        });
        group.appendChild(list);
        return group;
      },

      /**
       * Crea item de imagen individual
       */
      createImageItem(image, sectionIndex, iIndex) {
        const item = document.createElement('div');
        item.className = 'image-item';

        const header = document.createElement('div');
        header.className = 'image-header';
        header.innerHTML = `
          <span class="image-label">Imagen ${iIndex + 1}</span>
          <button class="btn btn-icon btn-small" onclick="Editor.deleteImage(${sectionIndex}, ${iIndex})" title="Eliminar imagen">🗑️</button>
        `;
        item.appendChild(header);

        const fields = document.createElement('div');
        fields.className = 'image-fields';

        const srcInput = document.createElement('input');
        srcInput.className = 'form-input';
        srcInput.type = 'text';
        srcInput.placeholder = 'URL de la imagen (src)';
        srcInput.value = image.src || '';
        srcInput.addEventListener('input', (e) => this.updateImage(sectionIndex, iIndex, 'src', e.target.value));
        fields.appendChild(srcInput);

        const altInput = document.createElement('input');
        altInput.className = 'form-input';
        altInput.type = 'text';
        altInput.placeholder = 'Texto alternativo (alt)';
        altInput.value = image.alt || '';
        altInput.addEventListener('input', (e) => this.updateImage(sectionIndex, iIndex, 'alt', e.target.value));
        fields.appendChild(altInput);

        item.appendChild(fields);
        return item;
      },

      /**
       * Crea grupo de logos
       */
      createLogosGroup(logos, sectionIndex) {
        const group = document.createElement('div');
        group.className = 'form-group';

        if (!logos || logos.length === 0) return group;

        const list = document.createElement('div');
        list.className = 'logo-list';
        logos.forEach((logo, lIndex) => {
          const item = this.createLogoItem(logo, sectionIndex, lIndex);
          list.appendChild(item);
        });
        group.appendChild(list);
        return group;
      },

      /**
       * Crea item de logo individual
       */
      createLogoItem(logo, sectionIndex, lIndex) {
        const item = document.createElement('div');
        item.className = 'logo-item';

        const header = document.createElement('div');
        header.className = 'logo-header';
        header.innerHTML = `
          <span class="logo-label">Logo ${lIndex + 1}</span>
          <button class="btn btn-icon btn-small" onclick="Editor.deleteLogo(${sectionIndex}, ${lIndex})" title="Eliminar logo">🗑️</button>
        `;
        item.appendChild(header);

        const fields = document.createElement('div');
        fields.className = 'logo-fields';

        const srcInput = document.createElement('input');
        srcInput.className = 'form-input';
        srcInput.type = 'text';
        srcInput.placeholder = 'URL de la imagen (src)';
        srcInput.value = logo.src || '';
        srcInput.addEventListener('input', (e) => this.updateLogo(sectionIndex, lIndex, 'src', e.target.value));
        fields.appendChild(srcInput);

        const linkInput = document.createElement('input');
        linkInput.className = 'form-input';
        linkInput.type = 'text';
        linkInput.placeholder = 'URL del enlace (link)';
        linkInput.value = logo.link || '';
        linkInput.addEventListener('input', (e) => this.updateLogo(sectionIndex, lIndex, 'link', e.target.value));
        fields.appendChild(linkInput);

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
       * Actualiza campo de una sección
       */
      updateSection(index, field, value) {
        this.data[this.currentCategory][index][field] = value;
        this.triggerUpdate();
      },

      /**
       * Actualiza campo de un logo
       */
      updateLogo(sectionIndex, lIndex, field, value) {
        if (!this.data[this.currentCategory][sectionIndex].logos) {
          this.data[this.currentCategory][sectionIndex].logos = [];
        }
        this.data[this.currentCategory][sectionIndex].logos[lIndex][field] = value;
        this.triggerUpdate();
      },

      /**
       * Actualiza campo de una imagen
       */
      updateImage(sectionIndex, iIndex, field, value) {
        if (!this.data[this.currentCategory][sectionIndex].imagenes) {
          this.data[this.currentCategory][sectionIndex].imagenes = [];
        }
        this.data[this.currentCategory][sectionIndex].imagenes[iIndex][field] = value;
        this.triggerUpdate();
      },

      /**
       * Normaliza bloques de una sección
       */
      normalizeBlocks(section) {
        const fallbackIndent = this.normalizeIndentValue(section.sangria);

        if (!Array.isArray(section.bloques) || section.bloques.length === 0) {
          const subtitulo = typeof section.subtitulo === 'string' ? section.subtitulo : '';
          const texto = Array.isArray(section.texto) ? section.texto : [];
          section.bloques = [{ subtitulo, texto, desplegable: false, sangria: fallbackIndent }];
          delete section.subtitulo;
          delete section.texto;
        }

        section.bloques = section.bloques.map(block => ({
          subtitulo: typeof block.subtitulo === 'string' ? block.subtitulo : '',
          texto: Array.isArray(block.texto) ? block.texto : [],
          desplegable: typeof block.desplegable === 'boolean' ? block.desplegable : false,
          sangria: this.normalizeIndentValue(
            (block.sangria !== undefined && block.sangria !== null) ? block.sangria : fallbackIndent
          )
        }));

        if (section.bloques.length === 0) {
          section.bloques.push({ subtitulo: '', texto: [], desplegable: false, sangria: fallbackIndent });
        }

        return section.bloques;
      },

      /**
       * Actualiza subtítulo de un bloque
       */
      updateSubtitle(sectionIndex, blockIndex, value) {
        const section = this.data[this.currentCategory][sectionIndex];
        const blocks = this.normalizeBlocks(section);
        blocks[blockIndex].subtitulo = value;
        this.triggerUpdate();
      },

      /**
       * Actualiza toggle desplegable de un bloque
       */
      updateBlockToggle(sectionIndex, blockIndex, value) {
        const section = this.data[this.currentCategory][sectionIndex];
        const blocks = this.normalizeBlocks(section);
        blocks[blockIndex].desplegable = value;
        this.triggerUpdate();
      },

      /**
       * Actualiza sangría de un bloque
       */
      updateBlockIndent(sectionIndex, blockIndex, value) {
        const section = this.data[this.currentCategory][sectionIndex];
        const blocks = this.normalizeBlocks(section);
        blocks[blockIndex].sangria = this.normalizeIndentValue(value);
        this.triggerUpdate();
      },

      /**
       * Actualiza texto de un párrafo
       */
      updateParagraph(sectionIndex, blockIndex, pIndex, value) {
        const section = this.data[this.currentCategory][sectionIndex];
        const blocks = this.normalizeBlocks(section);
        blocks[blockIndex].texto[pIndex] = value;
        this.triggerUpdate();
      },

      /**
       * Añade una nueva sección
       */
      addSection() {
        const newSection = {
          titulo: '',
          bloques: [{ subtitulo: '', texto: [], desplegable: false, sangria: 0 }],
          imagenes: [],
          logos: []
        };
        this.data[this.currentCategory].push(newSection);
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
      },

      /**
       * Elimina una sección
       */
      deleteSection(index) {
        if (confirm('¿Estás seguro de que quieres eliminar esta sección?')) {
          this.data[this.currentCategory].splice(index, 1);
          this.renderCategory(this.currentCategory);
          this.triggerUpdate();
        }
      },

      /**
       * Mueve una sección
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
       * Añade un bloque
       */
      addBlock(sectionIndex, afterBlockIndex) {
        const section = this.data[this.currentCategory][sectionIndex];
        const blocks = this.normalizeBlocks(section);
        const insertAt = Math.min(afterBlockIndex + 1, blocks.length);
        blocks.splice(insertAt, 0, { subtitulo: '', texto: [], desplegable: false, sangria: 0 });
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
      },

      /**
       * Elimina un bloque
       */
      deleteBlock(sectionIndex, blockIndex) {
        const section = this.data[this.currentCategory][sectionIndex];
        const blocks = this.normalizeBlocks(section);
        blocks.splice(blockIndex, 1);
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
      },

      /**
       * Añade un párrafo
       */
      addParagraph(sectionIndex, blockIndex) {
        const section = this.data[this.currentCategory][sectionIndex];
        const blocks = this.normalizeBlocks(section);
        blocks[blockIndex].texto.push('');
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
      },

      /**
       * Elimina un párrafo
       */
      deleteParagraph(sectionIndex, blockIndex, pIndex) {
        const section = this.data[this.currentCategory][sectionIndex];
        const blocks = this.normalizeBlocks(section);
        blocks[blockIndex].texto.splice(pIndex, 1);
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
      },

      /**
       * Mueve un párrafo
       */
      moveParagraph(sectionIndex, blockIndex, pIndex, direction) {
        const section = this.data[this.currentCategory][sectionIndex];
        const blocks = this.normalizeBlocks(section);
        const paragraphs = blocks[blockIndex].texto;
        const newIndex = pIndex + direction;
        if (newIndex < 0 || newIndex >= paragraphs.length) return;
        [paragraphs[pIndex], paragraphs[newIndex]] = [paragraphs[newIndex], paragraphs[pIndex]];
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
      },

      /**
       * Añade un enlace al texto seleccionado en un párrafo
       */
      addLinkToParagraph(sectionIndex, blockIndex, pIndex, textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        // Verificar que hay texto seleccionado
        if (!selectedText || selectedText.trim() === '') {
          alert('⚠️ Por favor, selecciona el texto al que quieres añadir un enlace.');
          return;
        }

        // Pedir la URL
        const url = prompt('🔗 Introduce la URL del enlace:', 'https://');
        if (!url || url.trim() === '' || url === 'https://') {
          return; // Usuario canceló o no introdujo URL
        }

        // Crear el enlace en formato HTML
        const link = `<a href="${url.trim()}" target="_blank">${selectedText}</a>`;

        // Reemplazar el texto seleccionado con el enlace
        const newValue = textarea.value.substring(0, start) + link + textarea.value.substring(end);
        textarea.value = newValue;

        // Actualizar el párrafo en los datos
        this.updateParagraph(sectionIndex, blockIndex, pIndex, newValue);

        // Colocar el cursor después del enlace insertado
        const newCursorPos = start + link.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      },

      /**
       * Añade un logo
       */
      addLogo(sectionIndex) {
        if (!this.data[this.currentCategory][sectionIndex].logos) {
          this.data[this.currentCategory][sectionIndex].logos = [];
        }
        this.data[this.currentCategory][sectionIndex].logos.push({ src: '', link: '', alt: '' });
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
      },

      /**
       * Añade una imagen
       */
      addImage(sectionIndex) {
        if (!this.data[this.currentCategory][sectionIndex].imagenes) {
          this.data[this.currentCategory][sectionIndex].imagenes = [];
        }
        this.data[this.currentCategory][sectionIndex].imagenes.push({ src: '', alt: '' });
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
      },

      /**
       * Elimina un logo
       */
      deleteLogo(sectionIndex, lIndex) {
        this.data[this.currentCategory][sectionIndex].logos.splice(lIndex, 1);
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
      },

      /**
       * Elimina una imagen
       */
      deleteImage(sectionIndex, iIndex) {
        this.data[this.currentCategory][sectionIndex].imagenes.splice(iIndex, 1);
        this.renderCategory(this.currentCategory);
        this.triggerUpdate();
      },

      /**
       * Dispara actualización de preview y storage
       */
      triggerUpdate() {
        if (window.Formatter && window.Formatter.onDataChange) {
          window.Formatter.onDataChange();
        }
      }
    };

    // ============================================================================
    // FORMATTER - Controlador principal
    // ============================================================================
    const Formatter = {
      currentCategory: 'about',
      data: null,
      statusTimer: null,

      /**
       * Devuelve las categorías configuradas
       */
      getCategories() {
        const categories = this.data?.meta?.categories;
        return Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
      },

      /**
       * Obtiene la etiqueta de una categoría
       */
      getCategoryLabel(key) {
        const category = this.getCategories().find((item) => item.key === key);
        return category ? category.label : key;
      },

      /**
       * Actualiza la etiqueta de una categoría
       */
      setCategoryLabel(key, label) {
        if (!this.data?.meta) return;
        const categories = this.getCategories();
        const category = categories.find((item) => item.key === key);
        if (category) {
          category.label = label;
        } else {
          categories.push({ key, label });
        }
        this.data.meta.categories = categories;
      },

      /**
       * Asegura que exista el array de una categoría
       */
      ensureCategoryArray(key) {
        if (!this.data) return;
        if (!Array.isArray(this.data[key])) this.data[key] = [];
      },

      /**
       * Renderiza tabs de categorías
       */
      renderTabs() {
        const tabsContainer = document.getElementById('categoryTabs');
        if (!tabsContainer) return;
        tabsContainer.innerHTML = '';

        this.getCategories().forEach((category) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'tab';
          if (category.key === this.currentCategory) {
            button.classList.add('active');
          }
          button.dataset.category = category.key;

          const label = document.createElement('span');
          label.textContent = category.label || category.key;

          const count = document.createElement('span');
          count.className = 'tab-count';
          count.dataset.countFor = category.key;
          count.textContent = String((this.data[category.key] || []).length);

          button.appendChild(label);
          button.appendChild(count);
          tabsContainer.appendChild(button);
        });
      },

      /**
       * Actualiza título visible de categoría
       */
      updateCategoryTitle() {
        const titleEl = document.getElementById('categoryTitle');
        if (!titleEl) return;
        titleEl.textContent = this.getCategoryLabel(this.currentCategory);
      },

      /**
       * Renombra la categoría actual
       */
      renameCurrentCategory() {
        const key = this.currentCategory;
        const currentLabel = this.getCategoryLabel(key);
        const next = prompt('Nuevo nombre para la categoría', currentLabel);
        if (!next) return;
        const trimmed = next.trim();
        if (!trimmed) return;
        this.setCategoryLabel(key, trimmed);
        this.renderTabs();
        this.updateCategoryTitle();
        this.updateCounts();
        Storage.save(this.data);
        this.showStatus('Nombre de categoría actualizado', 'success');
      },

      /**
       * Inicializa la aplicación
       * SIMPLIFICADO: Ya no hace merge complejo, simplemente carga desde repo o localStorage
       */
      async init() {
        const stored = Storage.load();
        let repoData = null;

        // Intentar cargar data.json del repositorio
        if (!stored) {
          this.showStatus('Cargando data.json del repo...', '');
        }

        try {
          repoData = await Storage.fetchFromRepo();
        } catch (error) {
          console.error('No se pudo leer data.json del repo', error);
          this.showStatus('No se pudo leer data.json del repo', 'error');
        }

        // LÓGICA SIMPLIFICADA: Priorizar localStorage si existe, sino usar repo
        if (stored) {
          this.data = stored;
          this.showStatus('Datos recuperados del guardado local', 'success');
        } else if (repoData) {
          this.data = repoData;
          this.showStatus('data.json cargado automáticamente', 'success');
          Storage.save(this.data);
        } else {
          this.data = Storage.getEmptyStructure();
          this.showStatus('Arrancamos con un esquema vacío', 'warning');
        }

        // Inicializar módulos
        Editor.init(this.data);
        Preview.init();
        this.setupEventListeners();

        const categories = this.getCategories();
        if (!categories.find((category) => category.key === this.currentCategory)) {
          this.currentCategory = categories[0]?.key || this.currentCategory;
        }

        this.getCategories().forEach((category) => this.ensureCategoryArray(category.key));
        this.switchCategory(this.currentCategory);
        this.updateCounts();
      },

      /**
       * Configura event listeners
       */
      setupEventListeners() {
        // Tabs de categorías
        const tabsContainer = document.getElementById('categoryTabs');
        if (tabsContainer) {
          tabsContainer.addEventListener('click', (event) => {
            const tab = event.target.closest('.tab');
            if (!tab) return;
            const category = tab.dataset.category;
            this.switchCategory(category);
          });
        }

        // Botón añadir sección
        document.getElementById('addSectionBtn').addEventListener('click', () => {
          Editor.addSection();
          this.updateCounts();
        });

        // Botón renombrar categoría
        const renameBtn = document.getElementById('renameCategoryBtn');
        if (renameBtn) {
          renameBtn.addEventListener('click', () => this.renameCurrentCategory());
        }

        // Botones del footer
        document.getElementById('saveBtn').addEventListener('click', () => this.saveProgress());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadData());

        const resetLocalBtn = document.getElementById('resetLocalBtn');
        if (resetLocalBtn) {
          resetLocalBtn.addEventListener('click', () => this.clearLocalAndReload());
        }

        const copyBtn = document.getElementById('copyJsonBtn');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => this.copyJson());
        }
      },

      /**
       * Cambia de categoría
       */
      switchCategory(category) {
        this.currentCategory = category;
        this.ensureCategoryArray(category);
        this.renderTabs();
        this.updateCategoryTitle();

        // Renderizar contenido
        Editor.renderCategory(category);
        Preview.render(this.data[category]);
      },

      /**
       * Actualiza contadores de secciones
       */
      updateCounts() {
        this.getCategories().forEach((category) => {
          const count = this.data[category.key] ? this.data[category.key].length : 0;
          const countEl = document.querySelector(`[data-count-for="${category.key}"]`);
          if (countEl) countEl.textContent = count;
        });
      },

      /**
       * Callback cuando cambian los datos
       */
      onDataChange() {
        Preview.render(this.data[this.currentCategory]);
        this.updateCounts();
        Storage.save(this.data);
      },

      /**
       * Guarda progreso en localStorage
       */
      saveProgress() {
        const success = Storage.save(this.data);
        this.showStatus(
          success ? 'Progreso guardado en este navegador' : 'No se pudo guardar el progreso',
          success ? 'success' : 'error'
        );
      },

      /**
       * Descarga data.json
       */
      downloadData() {
        const success = Storage.export(this.data, 'data.json');
        this.showStatus(
          success ? 'Descarga lista' : 'No se pudo generar el JSON',
          success ? 'success' : 'error'
        );
      },

      /**
       * Copia JSON al portapapeles
       */
      async copyJson() {
        const success = await Storage.copyToClipboard(this.data);
        this.showStatus(
          success ? 'JSON copiado al portapapeles' : 'No se pudo copiar el JSON',
          success ? 'success' : 'error'
        );
      },

      /**
       * Limpia localStorage y recarga
       */
      clearLocalAndReload() {
        if (!confirm('Se borrará el cache local y se recargará data.json. ¿Continuar?')) return;
        Storage.clear();
        location.reload();
      },

      /**
       * Muestra mensaje de estado
       */
      showStatus(message, type = '') {
        const statusEl = document.getElementById('statusMessage');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = 'status-message ' + type;

        clearTimeout(this.statusTimer);
        this.statusTimer = setTimeout(() => {
          statusEl.textContent = '';
          statusEl.className = 'status-message';
        }, 3200);
      }
    };

    // Iniciar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => Formatter.init());
