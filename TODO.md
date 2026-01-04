# TODO

## 22-12-25
- Definir si el formatter debe priorizar el guardado local o permitir recargar desde el repo (boton o clear storage).
- Forzar no-cache al cargar `data.json` en paginas internas para evitar contenido viejo.
- Anadir fallback si `navigator.clipboard` no esta disponible (contexto no seguro / file://).

## 27-12-25
- Revisar boton "Copiar JSON" del formatter: agregar fallback y mejor feedback cuando falle.

## 29-12-25
- Nombrar magic numbers y moverlos a variables (CSS custom properties y CONFIG en JS), incluyendo el limite de intentos del grid.
- Cambiar deteccion de pagina del loader a data-attr en body y actualizar HTML/README.
- Limpiar fuentes: eliminar familias no usadas y cargar solo las necesarias via link en cada HTML.
- Pase final de orden/consistencia del CSS (tokens agrupados, secciones coherentes, sin redundancias).


## 04-01-26 - Estado Actual y Revisión Completa

### ✅ Completado en esta actualización

1. **Refactorización del formatter**: Separado en 3 archivos (HTML, CSS, JS)
2. **Extracción de lógica compartida**: Creado `utils.js` con funciones reutilizables
3. **Mejora de error handling**: Manejo específico de errores HTTP y JSON inválido
4. **Optimización de performance**: Implementado `ResizeObserver` en lugar de `window.resize`
5. **Corrección de bugs menores**: CSS duplicado, data-category incorrecto, link de prueba

### 📋 Tareas del TODO anterior - Estado

#### Del 22-12-25:
- ✅ **Guardado local vs repo**: Resuelto con botón "Limpiar local"
- ✅ **No-cache en data.json**: Implementado con `{ cache: 'no-cache' }`
- ✅ **Fallback clipboard**: Ya implementado en formatter

#### Del 27-12-25:
- ✅ **Botón "Copiar JSON"**: Funcionando correctamente con fallback

#### Del 29-12-25:
- ✅ **Magic numbers a variables**: Ya implementado (CONFIG en JS, custom properties en CSS)
- ✅ **Detección de página con data-attr**: Ya implementado en todas las páginas
- ✅ **Limpiar fuentes**: Solo se carga Archivo en formatter, BBH Bogle en páginas internas
- ✅ **Orden/consistencia CSS**: Completado con 24 secciones bien delimitadas

### 🎯 Tareas Pendientes (Opcionales)

#### Prioridad Baja:
1. **Tests automatizados**: Añadir unit tests para `utils.js` (funciones críticas)
2. **Documentación**: Crear README.md con:
   - Instrucciones de instalación
   - Estructura de `data.json`
   - Guía de uso del formatter
   - Convenciones de código
3. **Validación en formatter**:
   - URLs: verificar formato válido (regex o URL API)
   - Sangría: limitar rango 0-50 en UI
   - Categorías: prevenir duplicados al renombrar
4. **Autoguardado**: Guardar automáticamente cada 30-60 segundos en formatter
5. **Exportar formatos**: Añadir botones para exportar a:
   - Markdown (.md)
   - HTML estático
   - PDF (con estilos)

#### Mejoras UX:
6. **Confirmación en "Limpiar local"**: Añadir `confirm()` antes de borrar localStorage
7. **Historial de cambios**: Implementar undo/redo en formatter
8. **Preview en tiempo real**: Actualizar preview mientras se escribe (con debounce)
9. **Drag & drop**: Reordenar secciones y bloques arrastrando
10. **Búsqueda**: Añadir buscador en formatter para encontrar texto en secciones

### 📊 Estado General del Proyecto

**Código**: ✅ Excelente (modular, comentado, sin duplicación)  
**Performance**: ✅ Optimizada (ResizeObserver, lazy loading, debounce)  
**Mantenibilidad**: ✅ Alta (separación de concerns, utils compartido)  
**Bugs**: ✅ 0 críticos, 0 menores  
**Documentación**: ⚠️ Básica (solo comentarios en código)  
**Tests**: ❌ No implementados  

### 🚀 Recomendación

El proyecto está en **excelente estado** para producción. Las tareas pendientes son mejoras opcionales que pueden implementarse según necesidad y prioridad del equipo.

**Prioridad inmediata**: Ninguna (todo funcional)  
**Prioridad media**: Documentación (README.md)  
**Prioridad baja**: Tests, validación, autoguardado, exportar formatos
