# Appendix grammaticæ

Web estática en español sobre gramática latina y griega. El contenido latino parte de los tres documentos Pages proporcionados por ArchaiosMagister. No se distribuyen los archivos originales.

## Organización

- Morfología: sustantivos, adjetivos, pronombres, preposiciones y sistema verbal.
- Sintaxis: casos, subordinadas y guía de conjunciones.
- Comparación, infinitivos y participios: una sola página por tema, con secciones `#morfologia` y `#sintaxis`. Los dos índices dirigen a la sección correspondiente.
- Griego: estructura prevista, contenido pendiente.

Esta primera edición adapta el texto de los documentos y recompone los paradigmas básicos. No reproduce todos los cuadros de conjugaciones y de verbos irregulares de los originales. Las precisiones respecto de los originales se enumeran en `fuentes.html`.

## Publicación

En Settings → Pages, seleccionar GitHub Actions como origen. El flujo `.github/workflows/pages.yml` publica el sitio tras cada cambio en `main`. Si el primer flujo se ejecutó antes de activar Pages, volver a ejecutarlo desde Actions.

## Edición

Los contenidos son HTML sin dependencias. Modificar la página temática correspondiente y actualizar su texto de búsqueda en `assets/search-data.json`. Los enlaces son relativos para funcionar bajo `/Appendix-grammaticae/`. La hoja de estilo incluye versión móvil e impresión. El buscador necesita HTTP; los índices y capítulos también se pueden abrir como archivos locales.
