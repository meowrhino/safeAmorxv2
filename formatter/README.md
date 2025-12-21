# Safe Amorx - Content Formatter

Editor visual para gestionar el contenido del archivo `data.json` de Safe Amorx.

## 🚀 Cómo Usar

### 1. Abrir el Formatter
Abre el archivo `formatter/index.html` en tu navegador.

### 2. Importar Contenido Existente
- Haz clic en **"📥 Importar"**
- Selecciona el archivo `data.json` actual
- El contenido se cargará automáticamente en el editor

### 3. Editar Contenido
- Usa las **pestañas** (About, Booking, Curriculum) para cambiar entre categorías
- Cada categoría contiene **secciones** que puedes editar
- En cada sección puedes modificar:
  - **Título (H2)**: Encabezado principal de la sección
  - **Subtítulo (H3)**: Encabezado secundario (opcional)
  - **Párrafos**: Array de textos que forman el contenido
  - **Logos**: Imágenes con enlaces (opcional)

### 4. Gestionar Secciones
- **Añadir sección**: Botón "+ Añadir Sección"
- **Eliminar sección**: Botón 🗑️ en cada sección
- **Reordenar**: Botones ↑ ↓ para mover secciones arriba o abajo

### 5. Gestionar Párrafos
- **Añadir párrafo**: Botón "+ Añadir Párrafo" dentro de cada sección
- **Editar párrafo**: Escribe directamente en el textarea
- **Eliminar párrafo**: Botón 🗑️ en cada párrafo

### 6. Gestionar Logos
- **Añadir logo**: Botón "+ Añadir Logo" dentro de cada sección
- **Campos del logo**:
  - **SRC**: URL de la imagen
  - **Link**: URL a donde enlaza el logo
  - **Alt**: Texto alternativo para accesibilidad
- **Eliminar logo**: Botón 🗑️ en cada logo

### 7. Vista Previa
- El panel derecho muestra una **vista previa en tiempo real** del contenido
- Puedes ocultarlo/mostrarlo con el botón **"👁️ Ocultar/Mostrar"**

### 8. Guardar Progreso
- Haz clic en **"💾 Guardar Progreso"** para guardar en el navegador
- Los cambios se guardan en **LocalStorage**
- Puedes cerrar y volver más tarde sin perder tu trabajo

### 9. Exportar JSON
- Cuando termines de editar, haz clic en **"📤 Exportar"**
- Se descargará el archivo `data.json` actualizado
- Reemplaza el archivo `data.json` en el proyecto con este nuevo

### 10. Probar en la Web
- Abre las páginas de la web (about.html, booking.html, curriculum.html)
- El contenido se cargará automáticamente desde el nuevo `data.json`

## 🎨 Características

### Campos Obligatorios
- **texto**: Array de párrafos (puede estar vacío `[]`)

### Campos Opcionales
- **titulo**: Título de la sección
- **subtitulo**: Subtítulo de la sección
- **logos**: Array de objetos con imágenes

### Validación Automática
- El formatter valida que el JSON generado sea correcto
- No permite exportar si hay errores de estructura

### Persistencia
- Los cambios se guardan automáticamente en LocalStorage
- Puedes recuperar tu trabajo si cierras el navegador

## 🔧 Funciones Adicionales

### Resetear Todo
- Botón **"🔄 Resetear Todo"**
- Elimina todo el contenido y vuelve a empezar
- ⚠️ Esta acción no se puede deshacer

### Copiar al Portapapeles
- Puedes copiar el JSON generado al portapapeles
- Útil para compartir o hacer backups rápidos

## 📁 Estructura del JSON

```json
{
  "about": [
    {
      "titulo": "Título de la sección",
      "subtitulo": "Subtítulo opcional",
      "texto": [
        "Primer párrafo",
        "Segundo párrafo"
      ],
      "logos": [
        {
          "src": "ruta/al/logo.png",
          "link": "https://enlace.com",
          "alt": "Descripción del logo"
        }
      ]
    }
  ],
  "booking": [...],
  "curriculum": [...]
}
```

## 💡 Consejos

1. **Guarda frecuentemente**: Usa "💾 Guardar Progreso" cada cierto tiempo
2. **Haz backups**: Exporta el JSON antes de hacer cambios grandes
3. **Vista previa**: Revisa siempre la vista previa antes de exportar
4. **Párrafos cortos**: Divide el texto en párrafos para mejor legibilidad
5. **Logos opcionales**: No es necesario añadir logos si no los necesitas

## 🐛 Solución de Problemas

### El formatter no carga
- Asegúrate de abrir `index.html` desde un servidor local o directamente en el navegador
- Comprueba la consola del navegador (F12) para ver errores

### No puedo importar mi JSON
- Verifica que el archivo sea un JSON válido
- Asegúrate de que tenga las tres categorías: about, booking, curriculum

### Los cambios no se guardan
- Haz clic en "💾 Guardar Progreso" manualmente
- Verifica que tu navegador permita LocalStorage

### La vista previa no se actualiza
- Recarga la página (F5)
- Verifica que hayas guardado los cambios

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias, revisa el código en:
- `js/formatter.js` - Lógica principal
- `js/editor.js` - Gestión del editor
- `js/preview.js` - Vista previa
- `js/storage.js` - Almacenamiento y exportación

---

**¡Disfruta editando el contenido de Safe Amorx! 🎉**
