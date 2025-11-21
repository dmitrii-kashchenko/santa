import { useState, useEffect } from 'react'

export const useGeoblock = () => {
  const [isBlocked, setIsBlocked] = useState(null)
  const [isChecking, setIsChecking] = useState(true)
  const [locationData, setLocationData] = useState(null)

  useEffect(() => {
    const checkGeolocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        
        setLocationData({
          country: data.country_name || data.country || 'Unknown',
          countryCode: data.country_code || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || data.region_code || 'Unknown',
          timezone: data.timezone || 'Unknown',
          ip: data.ip || 'Unknown'
        })
        
        if (data.country_code === 'US') {
          setIsBlocked(false)
        } else {
          setIsBlocked(true)
        }
      } catch (error) {
        console.error('[useGeoblock] Error checking geolocation:', error)
        setIsBlocked(true)
        setLocationData(null)
      } finally {
        setIsChecking(false)
      }
    }

    checkGeolocation()
  }, [])

  return { isBlocked, isChecking, locationData }
}

