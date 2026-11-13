import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { mobileApiRequest } from '../api/client'
import { colors, radii, spacing } from '../theme/tokens'

export default function CatalogScreen({ onSelectTour }) {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    mobileApiRequest('/tours/')
      .then((data) => setTours(data.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Cactours</Text>
        <Text style={styles.subtitle}>Descubre La Guajira y Colombia</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.turquesaCactours} style={styles.loader} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={tours}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.destination}>{item.ciudad_destino}</Text>
              <Text style={styles.title}>{item.nombre_tour}</Text>
              <Text style={styles.description} numberOfLines={3}>
                {item.descripcion}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>
                  ${Number(item.costo).toLocaleString('es-CO')} COP
                </Text>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={() => onSelectTour && onSelectTour(item)}
                >
                  <Text style={styles.ctaText}>Solicitar Reserva</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mineralIvory,
  },
  header: {
    backgroundColor: colors.turquesaCactours,
    padding: spacing.lg,
  },
  brand: {
    color: colors.blanco,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.blanco,
    opacity: 0.9,
    marginTop: 4,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.blanco,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  destination: {
    color: colors.azulPetroleo,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.turquesaCactours,
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 4,
  },
  description: {
    color: colors.carbon,
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  price: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.turquesaCactours,
  },
  ctaButton: {
    backgroundColor: colors.azulBrillante,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.sm,
  },
  ctaText: {
    color: colors.carbon,
    fontWeight: '700',
  },
  errorBox: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.errorBg,
    borderRadius: radii.sm,
  },
  errorText: {
    color: colors.errorText,
  },
})
