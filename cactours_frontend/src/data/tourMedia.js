const mediaUrl = (fileName) => `/media/tours/${encodeURIComponent(fileName)}`

function photoSet(id, name, fileNames) {
  return fileNames.map((fileName, index) => ({
    id: `${id}-${index + 1}`,
    url: mediaUrl(fileName),
    alt: `${name} · fotografía ${index + 1}`,
  }))
}

export const tourMediaShowcases = [
  {
    id: 'amazonas',
    name: 'Amazonas',
    destination: 'Amazonas · Colombia',
    category: 'Selva · ríos · biodiversidad',
    description: 'Una vista aérea de los ríos que atraviesan la selva amazónica.',
    aliases: ['amazonas'],
    gallery: photoSet('amazonas', 'Amazonas', ['amazonas1.jpg', 'amazonas.jpg']),
    contactUrl: `mailto:info@cactours.com?subject=${encodeURIComponent('Disponibilidad: Amazonas')}`,
  },
  {
    id: 'cabo-de-la-vela',
    name: 'Cabo de la Vela',
    destination: 'La Guajira · Colombia',
    category: 'Mar · desierto · horizonte',
    description: 'Costa desértica y mar Caribe en el Cabo de la Vela.',
    aliases: ['cabo de la vela', 'cabo vela'],
    gallery: photoSet('cabo-de-la-vela', 'Cabo de la Vela', [
      'Cabo de la Vela.jpg',
    ]),
    contactUrl: `mailto:info@cactours.com?subject=${encodeURIComponent('Disponibilidad: Cabo de la Vela')}`,
  },
  {
    id: 'eje-cafetero',
    name: 'Eje cafetero',
    destination: 'Eje cafetero · Colombia',
    category: 'Montañas · cultura cafetera',
    description: 'Paisajes de montaña y caminos del Eje cafetero colombiano.',
    aliases: ['eje cafetero'],
    gallery: photoSet('eje-cafetero', 'Eje cafetero', [
      'eje cafetero2.jpg',
      'Eje cafetero.jpg',
      'eje cafetero1.jpg',
    ]),
    contactUrl: `mailto:info@cactours.com?subject=${encodeURIComponent('Disponibilidad: Eje cafetero')}`,
  },
  {
    id: 'montes-de-oca',
    name: 'Montes de Oca',
    destination: 'La Guajira · Colombia',
    category: 'Naturaleza · La Guajira',
    description: 'Aguas turquesa y naturaleza en Montes de Oca.',
    aliases: ['montes de oca'],
    gallery: photoSet('montes-de-oca', 'Montes de Oca', [
      'Montes de oca.jpg',
      'Montes de oca1.jpg',
    ]),
    contactUrl: `mailto:info@cactours.com?subject=${encodeURIComponent('Disponibilidad: Montes de Oca')}`,
  },
  {
    id: 'taganga',
    name: 'Taganga',
    destination: 'Santa Marta · Magdalena',
    category: 'Bahía · costa Caribe',
    description: 'Una vista costera de Taganga, en el entorno de Santa Marta.',
    aliases: ['taganga'],
    gallery: photoSet('taganga', 'Taganga', [
      'Taganga.jpg',
      'Taganga1.jpg',
      'Taganga2.jpg',
      'Taganga3.jpg',
    ]),
    contactUrl: `mailto:info@cactours.com?subject=${encodeURIComponent('Disponibilidad: Taganga')}`,
  },
  {
    id: 'san-andres',
    name: 'San Andrés',
    destination: 'San Andrés · Colombia',
    category: 'Isla · mar Caribe · arrecifes',
    description: 'Mar de siete colores, playas y vida isleña en San Andrés.',
    aliases: ['san andres', 'san andres isla'],
    gallery: photoSet('san-andres', 'San Andrés', [
      'San Andres2.jpg',
      'San Andres3.jpg',
      'San Andres1.jpg',
    ]),
    contactUrl: `mailto:info@cactours.com?subject=${encodeURIComponent('Disponibilidad: San Andrés')}`,
  },
  {
    id: 'punta-cana',
    name: 'Punta Cana',
    destination: 'Punta Cana · República Dominicana',
    category: 'Playas · Caribe',
    description: 'Playas de arena clara y aguas turquesa en el Caribe dominicano.',
    aliases: ['punta cana'],
    gallery: photoSet('punta-cana', 'Punta Cana', [
      'Punta Cana3.jpg',
      'Punta Cana1.jpg',
      'Punta Cana2.jpg',
    ]),
    contactUrl: `mailto:info@cactours.com?subject=${encodeURIComponent('Disponibilidad: Punta Cana')}`,
  },
]

export const featuredSanAndresImage = tourMediaShowcases
  .find((tour) => tour.id === 'san-andres')
  .gallery[0].url

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function findTourMedia(tour) {
  const searchText = normalizeText(`${tour?.slug || ''} ${tour?.nombre_tour || ''} ${tour?.ciudad_destino || ''}`)
  if (!searchText) return null

  return tourMediaShowcases.find((media) =>
    media.aliases.some((alias) => searchText.includes(normalizeText(alias))),
  ) || null
}

export function resolveTourCover(tour) {
  return tour?.imagen_portada || findTourMedia(tour)?.gallery[0]?.url || ''
}

export function resolveTourGallery(tour) {
  const media = findTourMedia(tour)
  const cover = resolveTourCover(tour)
  const coverImage = cover
    ? [{ id: 'cover', url: cover, alt: tour?.nombre_tour || media?.name || 'Tour Cactours' }]
    : []
  const apiImages = (tour?.imagenes || [])
    .filter((image) => image.url && image.url !== cover)
    .map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.descripcion || tour?.nombre_tour || media?.name || 'Imagen del tour',
    }))

  if (apiImages.length) return [...coverImage, ...apiImages]
  if (media) return [...coverImage, ...media.gallery.filter((image) => image.url !== cover)]
  return coverImage
}
