/** Parámetros de la primera página del catálogo (debe coincidir con HomePage). */
export const CATALOG_PAGE_SIZE = 40

export const defaultCatalogParams = {
  skip: 0,
  limit: CATALOG_PAGE_SIZE,
} as const
