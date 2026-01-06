// ============================================================================
// FORMATTER EXTENSIONS - Tipos de párrafo y preview mejorado
// ============================================================================

(() => {
    'use strict';

    // Configuración de tipos de párrafo
    const PARAGRAPH_TYPES = {
        type1: {
            id: 'type-1',
            label: 'Glass Blanco',
            class: 'type-1',
            needsImage: false,
            style: {
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }
        },
        type2: {
            id: 'type-2',
            label: 'Glass Negro',
            class: 'type-2',
            needsImage: false,
            style: {
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
            }
        },
        type3: {
            id: 'type-3',
            label: 'Imagen + Glass',
            class: 'type-3',
            needsImage: true,
            defaultImage: 'assets/images/party/party1.jpg',
            style: {
                backgroundImage: 'url(assets/images/party/party1.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }
        },
        type4: {
            id: 'type-4',
            label: 'Glass Verde',
            class: 'type-4',
            needsImage: false,
            style: {
                background: 'rgba(0, 255, 136, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 255, 136, 0.3)'
            }
        },
        type5: {
            id: 'type-5',
            label: 'Imagen Sin Glass',
            class: 'type-5',
            needsImage: true,
            defaultImage: 'assets/images/party/party5.jpg',
            style: {
                backgroundImage: 'url(assets/images/party/party5.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backgroundBlendMode: 'multiply',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }
        }
    };

    // ============================================================================
    // SELECTOR DE TIPO DE PÁRRAFO
    // ============================================================================

    function createParagraphTypeSelector(currentType, onChange) {
        const container = document.createElement('div');
        container.className = 'paragraph-type-selector';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = 'Tipo de Párrafo';
        container.appendChild(label);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'type-buttons';

        Object.values(PARAGRAPH_TYPES).forEach(type => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'type-button';
            button.dataset.type = type.class;
            button.textContent = type.label;

            // Aplicar estilos visuales del tipo
            Object.assign(button.style, type.style);
            button.style.color = '#fff';
            button.style.padding = '1rem';
            button.style.borderRadius = '8px';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s ease';
            button.style.fontSize = '0.9rem';
            button.style.fontWeight = '600';
            button.style.textTransform = 'uppercase';
            button.style.letterSpacing = '0.05em';

            // Marcar como activo si es el tipo actual
            if (currentType === type.class) {
                button.classList.add('active');
                button.style.transform = 'scale(1.05)';
                button.style.boxShadow = '0 4px 12px rgba(0, 255, 136, 0.4)';
            }

            button.addEventListener('click', () => {
                // Remover active de todos
                buttonsContainer.querySelectorAll('.type-button').forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.transform = 'scale(1)';
                    btn.style.boxShadow = 'none';
                });

                // Marcar este como activo
                button.classList.add('active');
                button.style.transform = 'scale(1.05)';
                button.style.boxShadow = '0 4px 12px rgba(0, 255, 136, 0.4)';

                // Llamar callback
                onChange(type.class, type.needsImage);
            });

            buttonsContainer.appendChild(button);
        });

        container.appendChild(buttonsContainer);
        return container;
    }

    // ============================================================================
    // INPUT DE IMAGEN CON VALIDACIÓN
    // ============================================================================

    function createImageInput(currentValue, onChange) {
        const container = document.createElement('div');
        container.className = 'image-input-group';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = 'Ruta de Imagen';
        container.appendChild(label);

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'image-input-wrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-input image-input';
        input.placeholder = 'assets/images/party/party1.jpg';
        input.value = currentValue || '';

        // Preview thumbnail
        const preview = document.createElement('div');
        preview.className = 'image-preview';

        const previewImg = document.createElement('img');
        previewImg.alt = 'Preview';

        const statusIcon = document.createElement('span');
        statusIcon.className = 'image-status';

        preview.appendChild(previewImg);
        preview.appendChild(statusIcon);

        // Validar imagen
        function validateImage(path) {
            if (!path || path.trim() === '') {
                previewImg.src = '';
                statusIcon.textContent = '';
                input.classList.remove('valid', 'invalid');
                return;
            }

            const img = new Image();
            img.onload = () => {
                previewImg.src = path;
                statusIcon.textContent = '✅';
                input.classList.remove('invalid');
                input.classList.add('valid');
            };
            img.onerror = () => {
                previewImg.src = '';
                statusIcon.textContent = '⚠️';
                input.classList.remove('valid');
                input.classList.add('invalid');
            };
            img.src = path;
        }

        // Validar al cargar
        validateImage(currentValue);

        // Evento blur para actualizar
        input.addEventListener('blur', (e) => {
            const value = e.target.value.trim();
            validateImage(value);
            onChange(value);
        });

        inputWrapper.appendChild(input);
        inputWrapper.appendChild(preview);
        container.appendChild(inputWrapper);

        return container;
    }

    // ============================================================================
    // PREVIEW CON BLUR EVENT
    // ============================================================================

    function enhancePreviewWithBlur() {
        const previewContainer = document.querySelector('#previewContainer');
        if (!previewContainer) return;

        // Observar cambios en los inputs del editor
        const editorPanel = document.querySelector('.editor-panel');
        if (!editorPanel) return;

        // Añadir listeners blur a todos los inputs y textareas
        editorPanel.addEventListener('blur', (e) => {
            if (e.target.matches('input, textarea')) {
                console.log('Blur detectado, actualizando preview...');
                // Disparar evento personalizado para que el formatter actualice
                const event = new CustomEvent('formatter:update-preview');
                document.dispatchEvent(event);
            }
        }, true); // useCapture para capturar en fase de captura
    }

    // ============================================================================
    // INTEGRACIÓN CON FORMATTER EXISTENTE
    // ============================================================================

    function extendFormatter() {
        // Esperar a que el formatter original esté listo
        const checkFormatter = setInterval(() => {
            if (window.App && window.App.render) {
                clearInterval(checkFormatter);
                initExtensions();
            }
        }, 100);
    }

    function initExtensions() {
        console.log('Inicializando extensiones del formatter...');

        // Mejorar preview con blur
        enhancePreviewWithBlur();

        // Interceptar creación de secciones para añadir selector de tipo
        const originalCreateSectionCard = window.App.createSectionCard;
        if (originalCreateSectionCard) {
            window.App.createSectionCard = function(section, index) {
                const card = originalCreateSectionCard.call(this, section, index);

                // Añadir selector de tipo de párrafo al principio
                const currentType = section.paragraphType || 'type-1';
                const typeSelector = createParagraphTypeSelector(currentType, (type, needsImage) => {
                    this.updateSection(index, 'paragraphType', type);

                    // Si necesita imagen, mostrar input
                    if (needsImage) {
                        const existingImageInput = card.querySelector('.image-input-group');
                        if (!existingImageInput) {
                            const imageInput = createImageInput(
                                section.paragraphImage || PARAGRAPH_TYPES[type.replace('-', '')].defaultImage,
                                (imagePath) => {
                                    this.updateSection(index, 'paragraphImage', imagePath);
                                }
                            );
                            card.insertBefore(imageInput, card.querySelector('.form-group').nextSibling);
                        }
                    } else {
                        // Remover input de imagen si existe
                        const existingImageInput = card.querySelector('.image-input-group');
                        if (existingImageInput) {
                            existingImageInput.remove();
                        }
                    }
                });

                // Insertar después del título
                const titleGroup = card.querySelector('.form-group');
                if (titleGroup) {
                    titleGroup.after(typeSelector);
                }

                // Si el tipo actual necesita imagen, añadir input
                const typeConfig = Object.values(PARAGRAPH_TYPES).find(t => t.class === currentType);
                if (typeConfig && typeConfig.needsImage) {
                    const imageInput = createImageInput(
                        section.paragraphImage || typeConfig.defaultImage,
                        (imagePath) => {
                            this.updateSection(index, 'paragraphImage', imagePath);
                        }
                    );
                    typeSelector.after(imageInput);
                }

                return card;
            };
        }

        // Interceptar preview para aplicar clases de tipo
        const originalCreateSectionPreview = window.App.createSectionPreview;
        if (originalCreateSectionPreview) {
            window.App.createSectionPreview = function(section, index) {
                const preview = originalCreateSectionPreview.call(this, section, index);

                // Añadir clase de tipo
                const paragraphType = section.paragraphType || 'type-1';
                preview.classList.add(paragraphType);

                // Si tiene imagen, aplicarla
                if (section.paragraphImage) {
                    preview.style.backgroundImage = `url(${section.paragraphImage})`;
                }

                return preview;
            };
        }

        console.log('Extensiones del formatter inicializadas correctamente');
    }

    // Iniciar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', extendFormatter);
    } else {
        extendFormatter();
    }
})();
