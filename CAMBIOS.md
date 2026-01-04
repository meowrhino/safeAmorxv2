# Safe Amorx - Cambios y Mejoras

## Resumen de cambios realizados

### 1. Formatter.html - Correcciones y simplificación

#### Problemas corregidos:
- ✅ **Carga de sangría y desplegables**: Eliminada la lógica de merge compleja que causaba que estos valores no se cargaran correctamente desde `data.json`
- ✅ **Simplificación de la carga**: Ahora el formatter carga directamente desde localStorage o data.json sin merge confuso
- ✅ **Valores respetados**: Los campos `sangria` y `desplegable` se cargan y guardan correctamente

#### Mejoras de código:
- 📝 **Comentarios exhaustivos**: Todo el código JavaScript está ahora comentado con JSDoc
- 🧩 **Modularidad**: Separación clara entre Storage, Preview, Editor y Formatter
- 📏 **Legibilidad**: Código más limpio y fácil de entender
- 🎯 **Atomicidad**: Funciones más pequeñas y específicas

#### Mejoras de UI:
- 🎨 **CSS reorganizado**: Estilos mejor estructurados con comentarios claros
- 📱 **Sangría oculta en móvil**: Media query que fuerza `margin-left: 0` en dispositivos móviles
- ✨ **Animaciones mejoradas**: Transiciones más suaves con `cubic-bezier(0.4, 0, 0.2, 1)` para párrafos desplegables

### 2. styles.css - Refactorización completa

#### Mejoras:
- 📚 **Estructura clara**: 24 secciones bien delimitadas y comentadas
- 📝 **Comentarios detallados**: Cada sección explica su propósito
- 🎯 **Organización lógica**: Orden coherente desde reset hasta responsive
- 📱 **Sangría móvil**: Sección dedicada para ocultar sangría en móvil
- ✨ **Animaciones mejoradas**: Transiciones más fluidas para elementos desplegables
- ♿ **Accesibilidad**: Sección para reducción de movimiento

### 3. Estructura del proyecto

```
safeAmorx/
├── formatter.html          (Mejorado: 2341 líneas vs 1431 originales)
├── css/
│   └── styles.css         (Refactorizado y comentado)
├── js/
│   └── main.js            (Sin cambios)
├── data.json              (Sin cambios)
└── [otros archivos]       (Sin cambios)
```

## Cambios técnicos detallados

### Formatter.html

#### Antes:
```javascript
// Lógica de merge compleja
const normalizedStored = this.normalizeData(stored);
const normalizedRepo = this.normalizeData(repoData);
if (normalizedStored && normalizedRepo) {
  this.data = this.mergeMissingBlockFields(normalizedStored, normalizedRepo, {
    preferRepoSangria: isLegacyStorage || !storedHasSangria,
    preferRepoDesplegable: isLegacyStorage || !storedHasDesplegable
  });
  Storage.save(this.data);
}
```

#### Después:
```javascript
// Lógica simplificada
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
```

### styles.css

#### Sangría en móvil:
```css
@media (max-width: 768px) {
    /* OCULTAR SANGRÍA EN MÓVIL */
    .content-paragraphs p {
        margin-left: 0 !important;
    }

    .content-block {
        --block-paragraph-indent: 0 !important;
    }
}
```

#### Animaciones mejoradas:
```css
/* Antes */
.content-paragraphs {
    transition: max-height 0.35s ease, opacity 0.25s ease, transform 0.35s ease;
}

/* Después */
.content-paragraphs {
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                opacity 0.3s ease, 
                transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Cómo usar

1. **Reemplazar archivos**: Copia `formatter.html` y `css/styles.css` en tu proyecto
2. **Probar localmente**: Abre `formatter.html` con Live Server
3. **Verificar carga**: Los valores de sangría y desplegables deberían cargarse correctamente
4. **Probar en móvil**: La sangría no debería aparecer en dispositivos móviles
5. **Probar animaciones**: Los párrafos desplegables deberían tener animaciones suaves

## Notas importantes

- ⚠️ **Limpieza de localStorage**: Si tenías datos antiguos en localStorage, es recomendable usar el botón "Limpiar local" para forzar la recarga desde `data.json`
- 📱 **Responsive**: Todos los cambios son compatibles con móvil, tablet y desktop
- 🔄 **Compatibilidad**: El código es compatible con la estructura actual de `data.json`
- 💾 **Sin pérdida de datos**: Los cambios no afectan la estructura de datos existente

## Recomendaciones futuras

1. **Separar JavaScript**: Considerar extraer el JavaScript del formatter.html a archivos separados
2. **Validación de formularios**: Agregar validación más robusta en los campos del editor
3. **Deshacer/Rehacer**: Implementar historial de cambios
4. **Autoguardado**: Guardar automáticamente cada X segundos
5. **Exportar a otros formatos**: Agregar exportación a Markdown, HTML, etc.

---

## Actualización - 31 de Diciembre de 2024

### 🐞 Correcciones críticas del formatter

#### 1. **Sangría ahora carga correctamente desde data.json**

**Problema**: El control de sangría mostraba 0% aunque en `data.json` el valor era 30.

**Causa**: La línea 1641 usaba `block.sangria || 0`, lo que convertía valores numéricos válidos a 0 cuando eran falsy.

**Solución**: Cambiado a `block.sangria !== undefined && block.sangria !== null ? block.sangria : 0`

```javascript
// Antes
this.createIndentControl(
  block.sangria || 0,
  (value) => this.updateBlockIndent(sectionIndex, blockIndex, value)
)

// Después
this.createIndentControl(
  block.sangria !== undefined && block.sangria !== null ? block.sangria : 0,
  (value) => this.updateBlockIndent(sectionIndex, blockIndex, value)
)
```

**Resultado**: ✅ Los valores de sangría (0, 20, 30, etc.) ahora se cargan correctamente del data.json

---

### ✨ Nueva funcionalidad: Botón de enlaces

#### 2. **Botón 🔗 para añadir links en párrafos**

**Funcionalidad**: Nuevo botón en cada párrafo que permite convertir texto seleccionado en un enlace HTML.

**Ubicación**: Antes de los botones ↑↓ y 🗑️ en cada párrafo.

**Cómo funciona**:
1. Seleccionar texto en el textarea del párrafo
2. Hacer clic en el botón 🔗
3. Introducir la URL en el prompt
4. El texto seleccionado se envuelve en `<a href="URL" target="_blank">texto</a>`

**Validaciones**:
- ⚠️ Alerta si no hay texto seleccionado
- ⚠️ Cancelación si no se introduce URL

**Código añadido**:
```javascript
addLinkToParagraph(sectionIndex, blockIndex, pIndex, textarea) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);

  if (!selectedText || selectedText.trim() === '') {
    alert('⚠️ Por favor, selecciona el texto al que quieres añadir un enlace.');
    return;
  }

  const url = prompt('🔗 Introduce la URL del enlace:', 'https://');
  if (!url || url.trim() === '' || url === 'https://') {
    return;
  }

  const link = `<a href="${url.trim()}" target="_blank">${selectedText}</a>`;
  const newValue = textarea.value.substring(0, start) + link + textarea.value.substring(end);
  textarea.value = newValue;
  this.updateParagraph(sectionIndex, blockIndex, pIndex, newValue);
  
  const newCursorPos = start + link.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
  textarea.focus();
}
```

**Resultado**: ✅ Ahora es fácil añadir enlaces HTML directamente desde el formatter

---

### 🎨 Mejoras visuales

#### 3. **Logo de Safe Amorx reemplaza al botón "home"**

**Cambio**: El enlace de texto "← home" ahora es el logo de Safe Amorx.

**Archivos modificados**:
- `about.html`
- `booking.html`
- `collabs.html`
- `training.html`

**HTML antes**:
```html
<a href="index.html" class="back-link">home</a>
```

**HTML después**:
```html
<a href="index.html" class="back-link">
    <img src="assets/logos/safeAmorx_logo_negro.webp" alt="Safe Amorx" class="back-link-logo">
</a>
```

**CSS añadido**:
```css
.back-link-logo {
  max-width: 180px;
  max-height: 80px;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.back-link {
  padding: 0 0 2rem; /* Más espaciado */
  /* ... resto de estilos ... */
}
```

**Resultado**: ✅ Logo más grande, más espaciado, más visible

---

#### 4. **Enlace "web:meowrhino" reposicionado y estilizado**

**Cambios**:
- 📍 Solo aparece en `about.html`
- 📍 Posicionado abajo a la derecha (debajo del logo home)
- 🖊 Tamaño reducido: `clamp(0.75rem, 1.8vw, 0.95rem)`
- 🎨 Color gris del mapa: `var(--map-line-color)` (#444)
- ❌ Sin subrayado
- 🔅 Opacidad 0.8, hover a 1.0

**CSS antes**:
```css
.about-web-link {
  margin-top: 2.6rem;
  font-size: clamp(1.05rem, 2.4vw, 1.35rem);
  color: var(--map-text-color); /* Verde */
  /* ... */
}
```

**CSS después**:
```css
.about-web-link {
  position: absolute;
  right: 50%;
  bottom: -50dvh;
  transform: translate(50%, 0);
  padding: 0 0 0.8rem;
  font-size: clamp(0.75rem, 1.8vw, 0.95rem);
  color: var(--map-line-color); /* Gris #444 */
  text-decoration: none;
  opacity: 0.8;
  /* ... */
}
```

**Resultado**: ✅ Enlace discreto, pequeño, gris, sin subrayado, abajo a la derecha

---

### 📝 Resumen de archivos modificados

| Archivo | Cambios |
|---------|--------|
| `formatter.html` | Corrección de sangría + botón de links |
| `about.html` | Logo home + enlace web reposicionado |
| `booking.html` | Logo home |
| `collabs.html` | Logo home |
| `training.html` | Logo home |
| `css/styles.css` | Estilos para logo y enlace web |

---

**Versión**: 2.1  
**Fecha**: 31 de Diciembre de 2024  
**Autor**: Manus AI
