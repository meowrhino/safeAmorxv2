# safe amorx

Sitio web de Safe Amorx con navegación en grid, contenido dinámico desde `data.json`, marquees animados y un editor visual incluido.

## Estructura
- `index.html` (home con grid aleatoria)
- `about.html`, `booking.html`, `cv.html`, `blog.html` (páginas de contenido)
- `data.json` (fuente única de contenido para about/booking/cv)
- `formatter.html` (editor visual inline para `data.json`)
- `css/styles.css` (estilos únicos de todo el sitio)
- `js/main.js` (lógica única: grid + marquee + loader)
- `assets/` (imágenes, fondos)

## Contenido dinámico (`data.json`)
- Claves: `about`, `booking`, `cv`, cada una es un array de secciones.
- Estructura de sección:
  - `titulo` (h2)
  - `bloques` (array de bloques con `subtitulo` + `texto`)
    - `subtitulo` (h3, opcional)
    - `texto` (array de párrafos)
  - `logos` (array opcional con `src`, `link`, `alt`)
- `js/main.js` detecta la página (about/booking/cv), carga `data.json` y pinta h2/h3/p/logos dentro de `.page-content`.

### Editar contenido
- Manual: abre `data.json`, modifica los bloques de cada categoría y guarda.
- Con el editor: abre `formatter.html`, carga automáticamente `data.json` o tu guardado local, edita y:
  - Guarda en local (`Guardar local`, autosave suave).
  - Copia el JSON al portapapeles.
  - Descarga `data.json` listo para reemplazar en el repo.

## Navegación y grid (home)
- `js/main.js` genera una grid adaptable (10×10 desktop, compacta en móvil), coloca home + destinos aleatoriamente y conecta con caminos calculados.
- Respeta espaciamiento entre secciones, evita solapes y reutiliza trayectos existentes para caminos más limpios.
- Los estilos de tuberías están en `css/styles.css` (rectas, curvas, T, cruces, extremos).

## Marquees y layout de páginas internas
- `js/main.js` crea marquees superior/inferior con logos.
- `css/styles.css` define el layout en flujo: marquee top → contenido → home → marquee bottom.

## Uso rápido
- Abrir el sitio: abre `index.html` en el navegador (las rutas internas son relativas).
- Editar contenido: usar `formatter.html`, descargar `data.json` y reemplazar el existente.
- Añadir nuevas secciones: vía editor o añadiendo objetos en el array correspondiente en `data.json`.

## Notas de desarrollo
- El loader tolera JSONs con `curriculum` y los migra a `cv` automáticamente.
- Si una sección no tiene `bloques`, el loader la trata como un único bloque con `subtitulo` + `texto`.
- El home link en páginas internas está en el flujo del contenido, debajo del texto.
- Evita modificar rutas/archivos sin actualizar los enlaces en `js/main.js`.
