import { useState, useCallback } from 'react'

/**
 * useMapData
 * Recibe los datos crudos del ZonasBot y los pasa al mapa.
 *
 * Uso en App.jsx:
 *   const { mapData, handleBotData, clearMap } = useMapData()
 */
export function useMapData() {
  const [mapData, setMapData] = useState(null)

  const handleBotData = useCallback((key, data, barrio) => {
    setMapData({ key, payload: data, barrio })
  }, [])

  const clearMap = useCallback(() => setMapData(null), [])

  return { mapData, handleBotData, clearMap }
}