# Nelyess Capacita — guía de uso y publicación

## 1. Qué contiene esta entrega

Proyecto completo React + Express, conservando los datos entregados en `data/portal_database.json`.

Cambios:
- Capacitaciones con área, subtema, objetivo, requisitos, pasos, errores frecuentes y material de Drive.
- Publicaciones fijas y comunicados que no caducan automáticamente, con orden manual, borradores, archivo y papelera.
- Enlace directo de Drive en el editor de las novedades principales; vista previa en ventana y opción de abrir el original.
- Panel administrativo de pantalla completa; la página pública queda oculta mientras se administra.
- Histórico editable, filtros de año/mes/categoría/tipo, agrupación mensual y orden descendente de fecha.
- Registro de cambios buscable y versiones de los nuevos contenidos restaurables.
- Retiro de contraseñas predeterminadas del código; acceso configurado por el propietario.

Esta entrega modifica el archivo del proyecto. No reemplaza automáticamente la web alojada en nelyess.ai.studio.

## 2. Ejecutarlo en tu computadora (Windows)

1. Instala Node.js 22.12 o superior desde https://nodejs.org/.
2. Extrae el ZIP. Abre la carpeta `nelyess-capacita`.
3. Copia `.env.example` y renombra la copia a `.env`. En el Explorador activa la visualización de extensiones para no crear `.env.txt`.
4. Abre `.env` con un editor. Define `ADMIN_USERNAME` y una contraseña larga y única en `ADMIN_PASSWORD`. No dejes este valor vacío.
5. Abre una terminal dentro de esa carpeta y ejecuta:

```bash
npm ci
npm run dev
```

6. Abre http://localhost:3000.
7. Usa “Acceso Capacitador” o http://localhost:3000/#admin y tus credenciales.

No hay una contraseña universal. Los perfiles heredados del respaldo no habilitan cuentas adicionales: esta versión utiliza una cuenta administradora configurada en el servidor. Cambiar sus variables requiere reiniciar; ese reinicio cierra sesiones anteriores.

## 3. Uso de las nuevas secciones

### Comunicado principal con Drive

En Administración → Novedades y Publicaciones → Crear o Editar:
- Completa el comunicado.
- Pega el enlace completo en “Enlace de Drive para previsualizar en este comunicado”.
- Selecciona Publicado y guarda.
- En la vista pública aparecerá “Previsualizar documento”.

Se admiten archivos de Drive y documentos, hojas o presentaciones de Google. Las carpetas y otros enlaces se abren en la página original. El botón no sube ni copia archivos a Drive: registra el enlace.

La ventana no modifica permisos. Si el documento está restringido, Google puede pedir acceso. Si Google no permite visualizarlo dentro de una ventana o el navegador lo bloquea, usa “Abrir original”. La aplicación no puede detectar todos los errores internos de Google por tratarse de otro dominio.

### Publicaciones fijas

En Administración → Publicaciones fijas:
- Agrega noticias del día o comunicados.
- Usa Categoría para clasificarlos y Orden para determinar su posición.
- Publica cuando estén listos.
- No desaparecen por antigüedad; se retiran manualmente cambiando el estado.
- “Papelera” permite restaurarlos como borrador.

### Capacitaciones

En Administración → Capacitaciones:
- Área: Activaciones o Procesos regulatorios — Perú.
- Subtema: Postpago, Prepago, Reclamos, Reclamaciones, Derechos ARCO u otro.
- Estos campos permiten escribir categorías y subtemas nuevos.
- Escribe los pasos en el contenido y agrega el enlace al material.
- El portal empieza sin capacitaciones ficticias; publica tus propios contenidos validados.

### Histórico ordenado

En Administración → Archivo Histórico puedes incorporar o editar evidencias, su fecha, categoría y enlace. La fecha determina el año y el mes automáticamente.

En la web pública los registros se agrupan por mes, del más reciente al más antiguo. Puedes filtrar por año, mes, categoría y tipo. Los registros de visibilidad interna solo aparecen en la administración.

Archivar una publicación fija la retira de la sección pública. Para catalogarla además como evidencia en el histórico, crea el registro correspondiente con su fecha y enlace.

### Versiones y respaldo

“Papelera e Historial” muestra los cambios más recientes primero y permite buscar por título o responsable. “Restaurar versión” aparece para las entidades compatibles.

“Respaldos JSON” exporta los datos. Incluye también las nuevas publicaciones y capacitaciones. El respaldo contiene enlaces, no copias de los archivos de Drive. Guarda los originales en Drive y conserva respaldos periódicos de la base.

## 4. Subir el código gratis a GitHub

Guardar un repositorio en GitHub no es lo mismo que poner en funcionamiento el servidor de la web.

### Opción sencilla: GitHub Desktop

1. Crea una cuenta en https://github.com/ si no tienes una.
2. Instala GitHub Desktop desde https://desktop.github.com/ e inicia sesión.
3. Elige File → Add local repository y selecciona la carpeta del proyecto.
4. Si no existe un repositorio, utiliza la opción para crear uno en esa carpeta.
5. Antes del primer commit, verifica los archivos seleccionados. No incluyas `.env`, `data/`, `node_modules/`, `dist/` ni respaldos personales. El `.gitignore` incluido los excluye cuando utilizas Git.
6. Escribe un resumen, por ejemplo “Portal Nelyess actualizado”, y realiza el commit.
7. Pulsa Publish repository y conserva “Keep this code private” si el contenido no debe ser público.
8. Cuando cambies código, realiza un nuevo commit y pulsa Push origin.

### Opción desde la web

1. En GitHub, crea un repositorio con New repository.
2. Elige su nombre y visibilidad. Para material interno, usa Private.
3. Selecciona Add file → Upload files.
4. Sube los archivos extraídos del proyecto; subir solamente el ZIP no configura la aplicación.
5. Excluye manualmente `.env`, `data/`, `node_modules/`, `dist/` y respaldos privados. La carga web no aplica automáticamente las exclusiones de `.gitignore`.
6. Guarda con Commit changes.

Conserva `data/portal_database.json` de este ZIP como respaldo privado para transferirlo al servidor. Al no subirlo al repositorio, una instalación nueva comienza con los datos de ejemplo del código; puedes restaurar tu JSON desde el panel.

## 5. Publicar la web con editor funcional

GitHub Pages sirve archivos estáticos. Este proyecto necesita Node.js/Express y un disco persistente; no funcionará completo simplemente activando Pages.

En un alojamiento que ejecute Node.js:

- Instalación y compilación: `npm ci && npm run build`.
- Inicio: `npm start`.
- Variable `NODE_ENV=production`.
- Configura `ADMIN_USERNAME` y `ADMIN_PASSWORD` en los secretos del alojamiento.
- Configura `DATA_DIR` con la ruta de un volumen persistente (por ejemplo `/var/data/nelyess`, si ese volumen existe en tu proveedor).
- Usa HTTPS y una sola instancia del proceso para esta base de datos JSON.
- Restaura tu respaldo desde el panel después de iniciar el servidor.
- Verifica un cambio publicado desde otro dispositivo y después de reiniciar el servicio.

No guardes datos definitivos en un disco temporal: un despliegue puede borrarlos. Esta entrega no incluye una cuenta de alojamiento ni garantiza un plan gratuito con disco persistente. Subir el código a GitHub sí es independiente del costo del servidor.

Para ejecutar localmente la compilación de producción en PowerShell:

```powershell
npm run build
$env:NODE_ENV="production"
npm start
```

## 6. Validaciones y límites

Comprobados: TypeScript, compilación de producción y pruebas automáticas de enlaces Drive, acceso no autorizado, rechazo de claves antiguas, borradores privados, publicación permanente, evidencias internas, restauración y persistencia tras reiniciar.

La revisión visual en navegador remoto no pudo conectarse al servidor local de esta sesión. La visualización real de cada documento de Drive depende de sus permisos y no fue validada con documentos privados del usuario.

El almacenamiento es un archivo JSON en el servidor, no una base de datos externa. Evita ejecutar varias instancias sobre archivos distintos. Las sesiones se mantienen en memoria y finalizan al reiniciar. La configuración de cuentas múltiples y despliegue externo no forma parte de esta entrega.

## Fuentes de consulta

- GitHub Pages y su funcionamiento estático: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- Crear un sitio con Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- GitHub Desktop: https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-a-repository-from-your-local-computer-to-github-desktop
