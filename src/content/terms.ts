export interface TermsSection {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: "1. Aceptación de los Términos",
    paragraphs: [
      "Al acceder o utilizar LibrosCuba, usted acepta cumplir con los presentes términos y condiciones. Esta plataforma es un servicio de vitrina digital operado bajo el ecosistema de CSD (Cuban Software Development).",
    ],
  },
  {
    title: "2. Propósito Exclusivo de la Plataforma",
    paragraphs: [
      "LibrosCuba ha sido creada con el único y exclusivo fin de facilitar la compra y venta de libros físicos dentro del territorio nacional.",
    ],
    bullets: [
      "Solo libros físicos: queda terminantemente prohibida la publicación de libros en formato digital (PDF, EPUB, etc.) o audiolibros.",
      "Uso estricto: la plataforma no podrá ser utilizada para la venta de ningún otro tipo de artículo o servicio que no sea un libro físico.",
    ],
  },
  {
    title: "3. Política de Tolerancia Cero y Expulsión",
    paragraphs: [
      "El incumplimiento de la exclusividad temática conlleva sanciones inmediatas:",
    ],
    bullets: [
      "Cualquier usuario que publique contenido ajeno a los libros físicos será automáticamente eliminado de la plataforma.",
      "La administración de LibrosCuba se reserva el derecho de eliminar, sin previo aviso, cualquier tienda o anuncio que viole estas reglas o que se considere inapropiado para la comunidad.",
    ],
  },
  {
    title: "4. Responsabilidad de las Transacciones",
    paragraphs: [
      "LibrosCuba funciona únicamente como un catálogo o vitrina que conecta a compradores y vendedores a través de WhatsApp.",
    ],
    bullets: [
      "Sin intermediación: la plataforma no gestiona pagos, cobros ni entregas físicas.",
      "Responsabilidad civil: cualquier acuerdo, transacción monetaria o logística de envío es responsabilidad exclusiva de las partes involucradas. LibrosCuba no se hace responsable por estafas, libros en mal estado o incumplimientos en la entrega.",
    ],
  },
  {
    title: "5. Gestión del Inventario",
    paragraphs: [
      "Los vendedores son responsables de mantener su catálogo actualizado, utilizando las herramientas de edición y eliminación para retirar libros que ya no estén disponibles.",
      "El vendedor debe proporcionar información veraz sobre el estado del libro (nuevo o usado) y su ubicación exacta (provincia y municipio).",
    ],
  },
  {
    title: "6. Privacidad y Datos",
    paragraphs: [
      "Para los compradores, el acceso es libre y no requiere registro de datos personales en nuestro sistema.",
      "Para los vendedores, el número de WhatsApp proporcionado será público con el fin de facilitar el contacto de compra.",
    ],
  },
]
