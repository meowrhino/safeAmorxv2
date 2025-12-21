# Sistema de Carga Dinámica de Contenido - Safe Amorx

Este documento explica el sistema de carga dinámica de contenido implementado en el sitio web de Safe Amorx.

## Estructura del Sistema

El sistema consta de tres componentes principales:

### 1. **data.json**
Archivo JSON que contiene todo el contenido de las páginas organizadas en tres categorías:
- `about`: Información sobre Safe Amorx
- `booking`: Información de contratación y servicios
- `curriculum`: Historial de colaboraciones

Cada categoría contiene un array de objetos con la siguiente estructura:

```json
{
  "titulo": "Título de la sección (H2)",
  "subtitulo": "Subtítulo opcional (H3)",
  "texto": ["Párrafo 1", "Párrafo 2", "..."],
  "logos": [
    {
      "src": "ruta/al/logo.png",
      "link": "https://enlace.com",
      "alt": "Texto alternativo"
    }
  ]
}
```

**Campos obligatorios:**
- `texto`: Array de párrafos (puede estar vacío)

**Campos opcionales:**
- `titulo`: Título de la sección
- `subtitulo`: Subtítulo de la sección
- `logos`: Array de objetos con imágenes y enlaces

### 2. **loader.js**
Script JavaScript que:
- Carga el archivo `data.json`
- Detecta automáticamente qué página está cargando (about, booking o curriculum)
- Inyecta dinámicamente el contenido en el HTML
- Crea los elementos necesarios (h2, h3, párrafos, logos)

### 3. **content.css**
Hoja de estilos que define:
- Variables CSS para fuentes fácilmente modificables
- Estilos para el contenido dinámico
- Configuración de scroll para páginas de contenido
- Diseño responsive

## Variables de Fuentes

En `content.css` puedes modificar fácilmente las fuentes utilizadas:

```css
:root {
    /* Fuente para encabezados (h1, h2, h3) */
    --font-headings: 'BBH Bogle', sans-serif;
    
    /* Fuente para párrafos y texto general */
    --font-paragraphs: 'Archivo', sans-serif;
}
```

**Fuentes disponibles:**
- `'BBH Bogle'` (fuente actual de los encabezados)
- `'Archivo'` (fuente actual de los párrafos)
- `'Montserrat'`
- `'Work Sans'`
- `'Helvetica'`

Para cambiar la fuente, simplemente modifica el valor de la variable correspondiente.

## Cómo Editar el Contenido

### Opción 1: Editar manualmente el data.json

1. Abre el archivo `data.json`
2. Busca la categoría que quieres editar (`about`, `booking` o `curriculum`)
3. Modifica el texto, añade secciones o actualiza logos
4. Guarda el archivo

### Opción 2: Usar el formatter (próximo paso)

El siguiente paso será crear un editor web visual que te permita:
- Ver el contenido actual de forma estructurada
- Editar textos, títulos y subtítulos
- Añadir o eliminar secciones
- Gestionar logos e imágenes
- Exportar el `data.json` actualizado

## Cambios Realizados

### Archivos Nuevos
- `data.json` - Base de datos de contenido
- `js/loader.js` - Sistema de carga dinámica
- `css/content.css` - Estilos para contenido dinámico

### Archivos Renombrados
- `hiring.html` → `booking.html`
- `cv.html` → `curriculum.html`

### Archivos Modificados
- `about.html` - Añadido loader y estilos
- `booking.html` - Actualizado con nuevo sistema
- `curriculum.html` - Actualizado con nuevo sistema
- `js/grid.js` - Actualizados enlaces de navegación

## Funcionamiento del Scroll

Las páginas de contenido ahora tienen scroll habilitado mediante:
- Clase `content-page` en el `<body>`
- Clase `scrollable` en los contenedores
- Estilos específicos en `content.css`

Esto permite que el contenido largo se pueda desplazar verticalmente mientras mantiene el diseño visual del sitio.

## Próximos Pasos

1. **Crear el formatter/editor web** para facilitar la edición del contenido
2. **Añadir logos e imágenes** en las secciones correspondientes del curriculum
3. **Probar diferentes combinaciones de fuentes** para encontrar la mejor opción
4. **Optimizar el rendimiento** del sistema de carga si es necesario

## Soporte

Si tienes dudas o necesitas ayuda con el sistema, revisa este documento o consulta los comentarios en el código de `loader.js` y `content.css`.
