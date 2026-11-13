import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import CatalogScreen from './src/screens/CatalogScreen'

export default function App() {
  const [selectedTour, setSelectedTour] = useState(null)

  return (
    <>
      <StatusBar style="light" />
      <CatalogScreen onSelectTour={setSelectedTour} selectedTour={selectedTour} />
    </>
  )
}
