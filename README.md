# safe amorx

Sitio web de Safe Amorx con navegación en grid, contenido dinámico desde `data.json`, marquees animados y un editor visual incluido.

## Estructura
- `index.html` (home con grid aleatoria)
- `about.html`, `booking.html`, `cv.html`, `blog.html` (páginas de contenido)
- `data.json` (fuente única de contenido para about/booking/cv)
- `formatter.html` (editor visual inline para `data.json`)
- `css/` (`styles.css`, `pages.css`, `content.css`, `marquee.css`)
- `js/` (`grid.js`, `loader.js`, `marquee.js`)
- `assets/` (imágenes, fondos)

## Contenido dinámico (`data.json`)
- Claves: `about`, `booking`, `cv`, cada una es un array de secciones.
- Estructura de sección:
  - `titulo` (h2)
  - `subtitulo` (h3, opcional)
  - `texto` (array de párrafos, obligatorio aunque sea vacío)
  - `logos` (array opcional con `src`, `link`, `alt`)
- `js/loader.js` detecta la página (about/booking/cv), carga `data.json` y pinta h2/h3/p/logos dentro de `.page-content`.

### Editar contenido
- Manual: abre `data.json`, modifica los bloques de cada categoría y guarda.
- Con el editor: abre `formatter.html`, carga automáticamente `data.json` o tu guardado local, edita y:
  - Guarda en local (`Guardar local`, autosave suave).
  - Copia el JSON al portapapeles.
  - Descarga `data.json` listo para reemplazar en el repo.

## Navegación y grid (home)
- `js/grid.js` genera una grid adaptable (10×10 desktop, compacta en móvil), coloca home + destinos aleatoriamente y conecta con caminos calculados.
- Respeta espaciamiento entre secciones, evita solapes y reutiliza trayectos existentes para caminos más limpios.
- Los estilos de tuberías están en `css/styles.css` (rectas, curvas, T, cruces, extremos).

## Marquees y layout de páginas internas
- `js/marquee.js` crea marquees superior/inferior con logos y ajusta el padding de la página para no solapar el contenido.
- `css/pages.css` y `css/content.css` definen un layout ligero: contenido alineado al inicio, padding reducido en móvil y botón “home” dentro del flujo al final del texto.

## Uso rápido
- Abrir el sitio: abre `index.html` en el navegador (las rutas internas son relativas).
- Editar contenido: usar `formatter.html`, descargar `data.json` y reemplazar el existente.
- Añadir nuevas secciones: vía editor o añadiendo objetos en el array correspondiente en `data.json`.

## Notas de desarrollo
- El loader tolera JSONs con `curriculum` y los migra a `cv` automáticamente.
- El home link en páginas internas está en el flujo del contenido, debajo del texto.
- Evita modificar rutas/archivos sin actualizar los enlaces en `js/grid.js` y `js/loader.js`.
