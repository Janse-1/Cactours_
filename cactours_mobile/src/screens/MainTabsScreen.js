import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, radii } from '../theme/tokens'
import CatalogScreen from './CatalogScreen'
import HomeScreen from './HomeScreen'
import ProfileScreen from './ProfileScreen'

const tabs = [
  { id: 'home', label: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
  { id: 'explore', label: 'Explorar', icon: 'compass-outline', activeIcon: 'compass' },
  { id: 'profile', label: 'Mi espacio', icon: 'person-outline', activeIcon: 'person' },
]

export default function MainTabsScreen({
  navigation,
  route,
  user,
  onUserUpdated,
  onLogout,
  sessionLoading,
  sessionNotice,
}) {
  const [activeTab, setActiveTab] = useState(route.params?.tab || 'home')

  useEffect(() => {
    if (route.params?.tab) setActiveTab(route.params.tab)
  }, [route.params?.sessionUpdatedAt, route.params?.tab])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.screen}>
        <View style={styles.content}>
          {activeTab === 'home' ? (
            <HomeScreen
              navigation={navigation}
              onExplore={() => setActiveTab('explore')}
              onProfile={() => setActiveTab('profile')}
            />
          ) : activeTab === 'explore' ? (
            <CatalogScreen
              navigation={navigation}
              onProfile={() => setActiveTab('profile')}
            />
          ) : (
            <ProfileScreen
              navigation={navigation}
              user={user}
              onUserUpdated={onUserUpdated}
              onLogout={onLogout}
              loading={sessionLoading}
              sessionNotice={sessionNotice}
            />
          )}
        </View>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={tab.label}
                onPress={() => setActiveTab(tab.id)}
                style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
              >
                <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
                  <Ionicons
                    name={active ? tab.activeIcon : tab.icon}
                    size={19}
                    color={active ? colors.blanco : colors.muted}
                  />
                </View>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.mineralIvory },
  screen: { flex: 1, backgroundColor: colors.mineralIvory },
  content: { flex: 1 },
  tabBar: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(2,99,116,0.1)',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.97)',
  },
  tab: { minWidth: 82, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 5 },
  tabIconWrap: { minWidth: 42, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill },
  tabIconWrapActive: { backgroundColor: colors.turquesaCactours },
  tabLabel: { color: colors.muted, fontSize: 8, fontWeight: '700' },
  tabLabelActive: { color: colors.turquesaCactours, fontWeight: '800' },
  tabPressed: { opacity: 0.7 },
})
