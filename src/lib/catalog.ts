/** Primera página del catálogo (debe coincidir con HomePage). Menos datos = respuesta más rápida. */
export const CATALOG_PAGE_SIZE = 20

export const defaultCatalogParams = {
  skip: 0,
  limit: CATALOG_PAGE_SIZE,
} as const
