# Nelyess Capacita — SOLO GitHub Pages

Esta versión guarda el código y el contenido público en tu repositorio. GitHub Actions compila la página y GitHub Pages la publica. No necesita Render, servidor Express, base de datos ni claves. La administración se realiza con tu cuenta de GitHub, editando archivos. El botón «Administrar en GitHub» explica cómo hacerlo; no es un editor visual ni un acceso con contraseña propio.

## Publicar por primera vez

1. Descomprime Nelyess_SOLO_GITHUB_PAGES.zip en tu computadora.
2. Abre https://github.com/nelyess/nelyess-capacita e inicia sesión.
3. En Code, pulsa Add file → Upload files. Arrastra el CONTENIDO de la carpeta descomprimida, no el ZIP ni la carpeta que lo contiene. Incluye las carpetas src, contenido, scripts, tests y .github, además de los archivos sueltos. Acepta reemplazar los archivos con el mismo nombre y pulsa Commit changes.
4. Verifica que package.json e index.html estén directamente en la raíz. Verifica también que exista .github/workflows/check.yml con el texto del archivo incluido. Si no se subió .github: Add file → Create new file; escribe `.github/workflows/check.yml`, pega su contenido y guarda. Si ya existe, ábrelo y usa el lápiz para reemplazar su contenido.
5. Settings → Pages → Build and deployment → Source: selecciona **GitHub Actions**. Deja Custom domain vacío. No necesitas comprar ni inventar un dominio.
6. Actions → Publicar Nelyess en GitHub Pages → Run workflow → selecciona tu rama principal → Run workflow. Si pide habilitar Actions, habilítalo en tu repositorio.
7. Espera a que build y deploy aparezcan verdes. Abre https://nelyess.github.io/nelyess-capacita/ y pulsa Ctrl+F5 si aún ves la versión anterior.

Las ramas main, master y principal se publican automáticamente al guardar cambios. Si tu rama tiene otro nombre, cambia `branches` en el workflow. Si el primer intento falló porque aún no seleccionabas GitHub Actions en Pages, vuelve a ejecutarlo después del paso 5.

Los archivos antiguos de Express no se utilizan en esta versión. No sigas las instrucciones antiguas de Render. Si existe un archivo CNAME de un dominio que no tienes, elimínalo y confirma que Custom domain esté vacío. Conserva solo un workflow de despliegue de Pages: este paquete reemplaza `.github/workflows/check.yml`; si creaste otro despliegue anterior, desactívalo para evitar publicaciones simultáneas.

## Editar desde GitHub

Abre `contenido`, selecciona el archivo, pulsa el lápiz, modifica el texto y pulsa Commit changes. Espera al despliegue verde. Los visitantes verán los cambios después de la publicación; actualizar el navegador puede ser necesario. No hay guardado compartido en localStorage: solo los marcadores personales se guardan en el navegador de cada usuario.

| Qué modificar | Archivo dentro de contenido |
|---|---|
| Nombre, encabezado, avisos superiores, menú y pie | configuracion.json |
| Novedades y comunicados principales | novedades.json |
| Noticias y comunicados permanentes | publicaciones-fijas.json |
| Capacitaciones | capacitaciones.json |
| Crear, editar o eliminar categorías | categorias.json |
| Planes | planes.json |
| Equipos | equipos.json |
| Documentos y enlaces | documentos.json |
| Evidencias antiguas ordenadas | historico.json |
| Secciones de texto, listas y enlaces | bloques.json |

Para añadir un elemento copia uno completo dentro de la lista, separándolo con una coma; asigna un `id` distinto. Para quitarlo, elimina su objeto y ajusta la coma. Para vaciar una sección utiliza `[]`. JSON requiere comillas dobles, sin comentarios ni comas después del último elemento. Si algo queda mal, Actions lo marcará en rojo y no reemplazará la última página publicada. Abre el trabajo build para leer el error, corrige y vuelve a guardar.

Cambiar el nombre u orden de un menú es posible en configuracion.json. Los destinos internos disponibles son novedades, equipos, planes, documentos, historico, capacitaciones y bloques. Para nuevas pantallas con funciones distintas hay que editar el código de src; no basta inventar un destino. El diseño visual se modifica en src/index.css y src/App.tsx. No todos los valores heredados de themeSettings alteran el diseño; footerNotice sí controla el pie.

## Plantilla para una capacitación o publicación fija

Puedes pegar la siguiente lista completa en capacitaciones.json si está vacío. Para publicaciones-fijas.json cambia kind a comunicado y adapta categoría, título y contenido. Las publicaciones fijas no caducan automáticamente: permanecen mientras editorialStatus sea publicado.

```json
[
  {
    "id": "cap-001",
    "title": "Activaciones en línea: postpago",
    "summary": "Material de capacitación para asesores.",
    "content": "Escribe aquí los pasos aprobados. Usa \\n para separar líneas.",
    "category": "Activaciones en línea",
    "subcategory": "Postpago",
    "order": 1,
    "editorialStatus": "publicado",
    "kind": "capacitacion",
    "driveUrl": "",
    "source": "Indica la fuente y fecha del material",
    "audience": "Asesores",
    "author": "Administrador",
    "createdAt": "2026-11-09T12:00:00Z",
    "updatedAt": "2026-11-09T12:00:00Z",
    "eventDate": "2026-11-09",
    "requirements": "",
    "commonErrors": "",
    "version": 1
  }
]
```

Para otras capacitaciones duplica el objeto con otro id. Puedes usar subcategoría Prepago; o categoría Procesos regulatorios — Perú, con subcategorías Reclamos, Reclamaciones, Derechos ARCO y Otros procesos. Agrega material verificado por ti: el portal no inventa ni actualiza procedimientos regulatorios.

## Drive en comunicados y capacitaciones

En novedades.json, publicaciones-fijas.json y capacitaciones.json usa `"driveUrl": "https://drive.google.com/file/d/ID_DEL_ARCHIVO/view"` con el enlace REAL copiado desde Compartir en Drive. Aparece la opción de previsualizar en una ventana y abrir el original. Las carpetas se abren en Drive; no se previsualizan como un documento.

El archivo sigue almacenado en Drive, no se copia a GitHub. Compartir el enlace de la página no elimina el archivo. Para que cualquier visitante pueda verlo, configura en Drive Compartir → Acceso general → Cualquier persona con el enlace → Lector, si corresponde a ese documento. Si es restringido, cada visitante necesitará permiso; algunas organizaciones bloquean el acceso público. La vista previa depende del formato, permisos y restricciones de Drive. Siempre queda disponible abrir el enlace original. No hay fotografías decorativas ni carga de imágenes al portal; un documento de Drive sí puede contener imágenes propias.

## Archivo histórico ordenado

Usa historico.json para evidencias anteriores. Mantén el enlace original en documentUrl o driveFolderUrl y una fecha eventDate consistente con year y month. La web ordena por fecha y agrupa por año y mes, con filtros. Guardar cambios en GitHub conserva versiones del código, pero no mueve automáticamente noticias vencidas al archivo: agrega la evidencia al histórico cuando corresponda.

Ejemplo de objeto para incluir dentro de la lista:
```json
{
  "id": "hist-001",
  "title": "Comunicado archivado",
  "description": "Descripción de la evidencia.",
  "category": "Comunicados",
  "tags": ["2026", "postpago"],
  "eventDate": "2026-11-09",
  "year": 2026,
  "month": 11,
  "addedDate": "2026-11-09T12:00:00Z",
  "source": "Administración",
  "documentType": "comunicado_historico",
  "documentUrl": "",
  "driveFolderUrl": "",
  "visibility": "publico",
  "statusText": "Histórico: no utilizar como condición comercial vigente"
}
```

## Acceso y versiones

Los visitantes pueden leer la web sin cuenta. Solo tú y los colaboradores con permisos en GitHub pueden guardar cambios en el repositorio. Para consultar versiones abre el archivo y History. No hay cuentas de administrador propias ni base de datos privada. El código público no implica permiso de modificación para cualquier visitante; agrega una licencia si quieres conceder derechos específicos de reutilización.

Todo archivo subido a un repositorio público es visible, incluso un borrador oculto en la web y versiones anteriores eliminadas después. No subas contraseñas, tokens o evidencia privada. El contenido de ejemplo conservado no está verificado como oferta comercial actual: reemplázalo por tus datos antes de usarlo comercialmente.

Para reportes, el portal enlaza a Issues de GitHub: habilita Issues en Settings → General → Features si deseas usarlo. El visitante necesita cuenta y publica el reporte allí; no se envía desde la página.

## Verificación técnica

Node 24: `npm ci`, `npm run lint`, `npm test`, `npm run build`.
El resultado publicable está en dist. El workflow lo genera automáticamente. No publiques src/main.tsx directamente: el navegador necesita los archivos JavaScript compilados. El base relativo permite publicar bajo /nelyess-capacita/.
