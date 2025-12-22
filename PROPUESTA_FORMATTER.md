# Propuesta: Formatter Web para Safe Amorx

## Visión General

Crear una aplicación web interactiva que permita editar el contenido del archivo `data.json` de forma visual e intuitiva, similar a los formatters implementados en los repositorios de **mirandaperezhita** y **paulabarjau**.

## Objetivos

1. **Facilitar la edición** del contenido sin necesidad de editar JSON manualmente
2. **Prevenir errores** de sintaxis JSON
3. **Visualizar en tiempo real** cómo se verá el contenido
4. **Exportar** el `data.json` actualizado listo para usar
5. **Importar** el `data.json` existente para editarlo

## Arquitectura Propuesta

### Tecnología
- **Frontend**: HTML + CSS + JavaScript vanilla (sin frameworks)
- **Estructura**: Single Page Application (SPA)
- **Almacenamiento**: LocalStorage para guardar cambios temporales
- **Exportación**: Descarga directa del JSON generado

### Componentes Principales

#### 1. **Panel de Navegación**
- Pestañas para cambiar entre categorías: `About`, `Booking`, `Curriculum`
- Indicador visual de la categoría activa
- Contador de secciones por categoría

#### 2. **Editor de Secciones**
Para cada sección del array, mostrar:

```
┌─────────────────────────────────────────┐
│ SECCIÓN #1                        [🗑️] │
├─────────────────────────────────────────┤
│ Título (H2):                            │
│ [________________________]              │
│                                         │
│ Subtítulo (H3) - Opcional:              │
│ [________________________]              │
│                                         │
│ Texto (Párrafos):                       │
│ ┌─────────────────────────────────┐    │
│ │ Párrafo 1                 [🗑️] │    │
│ │ [_________________________]     │    │
│ └─────────────────────────────────┘    │
│ ┌─────────────────────────────────┐    │
│ │ Párrafo 2                 [🗑️] │    │
│ │ [_________________________]     │    │
│ └─────────────────────────────────┘    │
│ [+ Añadir Párrafo]                      │
│                                         │
│ Logos - Opcional:                       │
│ ┌─────────────────────────────────┐    │
│ │ Logo 1                    [🗑️] │    │
│ │ SRC: [___________________]      │    │
│ │ Link: [__________________]      │    │
│ │ Alt: [___________________]      │    │
│ └─────────────────────────────────┘    │
│ [+ Añadir Logo]                         │
└─────────────────────────────────────────┘
```

#### 3. **Controles Globales**
- **[+ Añadir Nueva Sección]**: Añade una sección vacía al final
- **[↑] [↓]**: Reordenar secciones (mover arriba/abajo)
- **[💾 Guardar en LocalStorage]**: Guardar progreso
- **[📥 Importar JSON]**: Cargar un data.json existente
- **[📤 Exportar JSON]**: Descargar el JSON generado
- **[👁️ Vista Previa]**: Ver cómo se verá en la web
- **[🔄 Resetear]**: Volver al estado original

#### 4. **Panel de Vista Previa**
- Renderizado en tiempo real del contenido
- Estilos idénticos a la web real
- Toggle para mostrar/ocultar

## Funcionalidades Detalladas

### Gestión de Secciones
- **Crear**: Añadir nuevas secciones con campos vacíos
- **Editar**: Modificar cualquier campo en tiempo real
- **Eliminar**: Borrar secciones con confirmación
- **Reordenar**: Drag & drop o botones de flecha
- **Duplicar**: Copiar una sección existente

### Gestión de Párrafos
- **Añadir**: Botón para añadir párrafos al array de texto
- **Editar**: Textarea expandible para cada párrafo
- **Eliminar**: Botón individual por párrafo
- **Reordenar**: Cambiar el orden de los párrafos

### Gestión de Logos
- **Añadir**: Formulario para src, link y alt
- **Vista previa**: Mostrar miniatura del logo si la URL es válida
- **Validación**: Comprobar que las URLs son válidas
- **Eliminar**: Borrar logos individualmente

### Validación
- **Campos obligatorios**: El array `texto` debe existir (puede estar vacío)
- **Formato JSON**: Validar que el JSON generado es correcto
- **URLs**: Validar formato de URLs en logos
- **Feedback visual**: Indicadores de errores en rojo

### Importación/Exportación
- **Importar**: 
  - Botón para seleccionar archivo `data.json`
  - Validar que el JSON es correcto
  - Cargar datos en el editor
- **Exportar**:
  - Generar JSON formateado (con indentación)
  - Descargar como `data.json`
  - Opción de copiar al portapapeles

### Persistencia
- **AutoSave**: Guardar automáticamente en LocalStorage cada X segundos
- **Recuperación**: Al abrir, preguntar si quiere recuperar cambios no guardados
- **Historial**: Mantener versiones anteriores (opcional)

## Interfaz de Usuario

### Diseño Visual
- **Estilo**: Minimalista, coherente con la estética de Safe Amorx
- **Colores**: Fondo oscuro, texto blanco, acentos en rosa/morado
- **Fuentes**: Archivo (misma que la web)
- **Responsive**: Funcional en desktop y tablet (mobile opcional)

### Layout
```
┌──────────────────────────────────────────────────────┐
│  SAFE AMORX - CONTENT FORMATTER                      │
├──────────────────────────────────────────────────────┤
│  [About] [Booking] [Curriculum]     [Importar] [Exportar] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────┐  ┌──────────────────────┐  │
│  │                    │  │                      │  │
│  │   EDITOR           │  │   VISTA PREVIA       │  │
│  │   (Secciones)      │  │   (Renderizado)      │  │
│  │                    │  │                      │  │
│  │                    │  │                      │  │
│  │                    │  │                      │  │
│  └────────────────────┘  └──────────────────────┘  │
│                                                      │
│  [+ Añadir Sección]  [💾 Guardar]  [🔄 Resetear]    │
└──────────────────────────────────────────────────────┘
```

## Estructura de Archivos

```
formatter.html          # Página única con HTML + CSS + JS embebidos
```

## Flujo de Trabajo del Usuario

1. **Abrir el formatter** (`formatter.html`)
2. **Importar** el `data.json` actual (o empezar desde cero) – ahora se carga automáticamente si existe
3. **Seleccionar categoría** (About, Booking, CV)
4. **Editar secciones**:
   - Modificar títulos, subtítulos
   - Añadir/editar/eliminar párrafos
   - Añadir/editar/eliminar logos
5. **Ver vista previa** en tiempo real
6. **Guardar progreso** (automático o manual)
7. **Exportar JSON** cuando esté listo
8. **Reemplazar** el `data.json` en el proyecto
9. **Probar** en la web real

## Características Avanzadas (Opcional)

### Fase 2 - Mejoras Futuras
- **Markdown support**: Permitir usar markdown en párrafos
- **Drag & drop para logos**: Subir imágenes directamente
- **Plantillas**: Secciones predefinidas para añadir rápidamente
- **Búsqueda**: Buscar texto en todas las secciones
- **Estadísticas**: Contador de palabras, secciones, etc.
- **Modo oscuro/claro**: Toggle de tema
- **Colaboración**: Compartir link para editar juntos (requiere backend)
- **Versionado**: Sistema de versiones con git-like diff

## Ventajas de Esta Propuesta

✅ **No requiere backend**: Todo funciona en el navegador
✅ **Fácil de usar**: Interfaz intuitiva sin conocimientos técnicos
✅ **Previene errores**: Validación automática de JSON
✅ **Portable**: Funciona en cualquier navegador moderno
✅ **Rápido**: Edición y vista previa en tiempo real
✅ **Seguro**: Los datos se guardan localmente
✅ **Escalable**: Fácil añadir nuevas funcionalidades

## Implementación

### Prioridad Alta
1. Editor básico de secciones
2. Gestión de párrafos
3. Exportación de JSON
4. Importación de JSON
5. Validación básica

### Prioridad Media
1. Vista previa en tiempo real
2. Gestión de logos
3. Reordenamiento de secciones
4. LocalStorage/AutoSave

### Prioridad Baja
1. Drag & drop
2. Plantillas
3. Búsqueda
4. Características avanzadas

## Próximos Pasos

1. ✅ Revisar y aprobar esta propuesta
2. 🔨 Crear la estructura base del formatter
3. 🎨 Implementar el editor de secciones
4. 📤 Añadir importación/exportación
5. 👁️ Implementar vista previa
6. 🧪 Testear con el data.json real
7. 📚 Documentar el uso
8. 🚀 Desplegar y usar

## Estimación de Tiempo

- **Versión básica funcional**: 2-3 horas
- **Con vista previa**: +1 hora
- **Con todas las funcionalidades**: +2-3 horas
- **Testing y refinamiento**: +1 hora

**Total estimado**: 6-8 horas para una versión completa y pulida

---

¿Te parece bien esta propuesta? ¿Quieres que empiece con la implementación o prefieres ajustar algo primero?
