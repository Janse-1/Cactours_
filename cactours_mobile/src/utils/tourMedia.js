import { resolveMediaUrl } from '../api/client'

const destinationPhotos = [
  { match: ['punta gallinas', 'cabo de la vela'], file: 'Cabo de la Vela.jpg' },
  { match: ['mayapo'], file: 'San Andres2.jpg' },
  { match: ['san andres', 'san andrés'], file: 'San Andres2.jpg' },
  { match: ['amazonas'], file: 'amazonas1.jpg' },
  { match: ['eje cafetero'], file: 'eje cafetero2.jpg' },
  { match: ['montes de oca'], file: 'Montes de oca.jpg' },
  { match: ['taganga'], file: 'Taganga.jpg' },
  { match: ['punta cana'], file: 'Punta Cana3.jpg' },
]

export function getTourImage(tour) {
  const apiImage = tour?.imagen_portada || tour?.imagenes?.[0]?.url
  if (apiImage) return resolveMediaUrl(apiImage)

  const destination = `${tour?.ciudad_destino || ''} ${tour?.nombre_tour || ''}`.toLowerCase()
  const photo = destinationPhotos.find(({ match }) =>
    match.some((alias) => destination.includes(alias)),
  )
  return resolveMediaUrl(`/media/tours/${encodeURIComponent(photo?.file || 'Cabo de la Vela.jpg')}`)
}

export function formatCop(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 'Consulta disponibilidad'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const featuredDestinations = [
  { name: 'San Andrés', line: 'Isla · mar Caribe', file: 'San Andres2.jpg' },
  { name: 'Cabo de la Vela', line: 'La Guajira · desierto', file: 'Cabo de la Vela.jpg' },
  { name: 'Amazonas', line: 'Selva · ríos', file: 'amazonas1.jpg' },
  { name: 'Punta Cana', line: 'Caribe · playas', file: 'Punta Cana3.jpg' },
].map((destination) => ({
  ...destination,
  image: resolveMediaUrl(`/media/tours/${encodeURIComponent(destination.file)}`),
}))
