import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Rectangle } from 'react-leaflet'
import L from 'leaflet'
import styled from 'styled-components'
import { Navigation, MapPin, Satellite, Target, Zap, AlertTriangle } from 'lucide-react'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapWrapper = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  height: 60%;
  position: relative;
`

const MapHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
`

const MapTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
`

const MapControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &.active {
    background: rgba(0, 255, 136, 0.3);
    border-color: #00ff88;
  }
`

const MapContent = styled.div`
  height: 100%;
  padding-top: 50px;
  
  .leaflet-container {
    height: 100%;
    border-radius: 0 0 15px 15px;
  }
`

const DroneInfo = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 11px;
  z-index: 1000;
  border: 1px solid rgba(0, 255, 136, 0.3);
  backdrop-filter: blur(10px);
  
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    .label {
      color: rgba(255, 255, 255, 0.7);
    }
    
    .value {
      color: #00ff88;
      font-weight: bold;
    }
  }
`

const MissionInfo = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 11px;
  z-index: 1000;
  border: 1px solid rgba(102, 126, 234, 0.3);
  backdrop-filter: blur(10px);
  min-width: 150px;
  
  .mission-status {
    color: #667eea;
    font-weight: bold;
    margin-bottom: 8px;
    text-align: center;
  }
  
  .mission-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 10px;
  }
`

// Enhanced drone icon with directional heading
const createDroneIcon = (heading = 0) => new L.DivIcon({
  html: `<div style="
    width: 35px;
    height: 35px;
    background: linear-gradient(45deg, #00ff88, #00cc6a);
    border-radius: 50%;
    border: 3px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0, 255, 136, 0.6);
    animation: dronePulse 2s infinite, droneFloat 3s ease-in-out infinite alternate;
    position: relative;
    transform: rotate(${heading}deg);
  ">
    <div style="
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
    "></div>
    <div style="
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-bottom: 8px solid #00ff88;
    "></div>
  </div>
  <style>
    @keyframes dronePulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(0, 255, 136, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
    }
    @keyframes droneFloat {
      0% { transform: translateY(0px) rotate(${heading}deg); }
      100% { transform: translateY(-3px) rotate(${heading}deg); }
    }
    @keyframes recording {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  </style>`,
  className: 'custom-div-icon',
  iconSize: [35, 35],
  iconAnchor: [17, 17]
})

// Home base icon (blue)
const homeBaseIcon = new L.DivIcon({
  html: `<div style="
    width: 25px;
    height: 25px;
    background: linear-gradient(45deg, #0066ff, #0044cc);
    border: 3px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 15px rgba(0, 102, 255, 0.6);
    animation: homePulse 3s infinite;
  ">
    <div style="
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
    "></div>
  </div>
  <style>
    @keyframes homePulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 102, 255, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(0, 102, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 102, 255, 0); }
    }
  </style>`,
  className: 'home-base-icon',
  iconSize: [25, 25],
  iconAnchor: [12, 12]
})

// Point of interest icons
const createPoiIcon = (type) => {
  const colors = {
    store: { bg: '#ff6b35', name: 'Store' },
    landmark: { bg: '#7209b7', name: 'Landmark' },
    waypoint: { bg: '#f72585', name: 'Waypoint' }
  }
  
  const color = colors[type] || colors.waypoint
  
  return new L.DivIcon({
    html: `<div style="
      width: 20px;
      height: 20px;
      background: ${color.bg};
      border: 2px solid white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(${color.bg.slice(1)}, 0.5);
      font-size: 8px;
      color: white;
      font-weight: bold;
    ">
      ${type === 'store' ? '🏪' : type === 'landmark' ? '📍' : '⭐'}
    </div>`,
    className: 'poi-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

// Waypoint markers
const waypointIcon = new L.DivIcon({
  html: `<div style="
    width: 20px;
    height: 20px;
    background: rgba(102, 126, 234, 0.8);
    border: 2px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(102, 126, 234, 0.5);
  ">
    <div style="
      width: 6px;
      height: 6px;
      background: white;
      border-radius: 50%;
    "></div>
  </div>`,
  className: 'waypoint-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
})

function DroneMap({ dronePosition, flightPath, homeBase, pointsOfInterest, droneHeading }) {
  const mapRef = useRef()
  const [satelliteView, setSatelliteView] = useState(false)
  const [showNoFlyZones, setShowNoFlyZones] = useState(true)
  const [showWaypoints, setShowWaypoints] = useState(true)
  const [missionStats, setMissionStats] = useState({
    distance: 0,
    duration: 0,
    coverage: 0,
    objectives: 3
  })
  
  // Create drone icon with current heading
  const droneIcon = createDroneIcon(droneHeading)
  
  // Predefined waypoints for the mission
  const waypoints = [
    [37.7749, -122.4194],
    [37.7849, -122.4094],
    [37.7649, -122.4294],
    [37.7749, -122.4394]
  ]
  
  // No-fly zones for realism
  const noFlyZones = [
    {
      bounds: [[37.7700, -122.4300], [37.7750, -122.4250]],
      type: 'restricted'
    },
    {
      bounds: [[37.7800, -122.4150], [37.7850, -122.4100]],
      type: 'airport'
    }
  ]

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(dronePosition, 15)
    }
  }, [dronePosition])

  // Update mission statistics
  useEffect(() => {
    const distance = flightPath.length > 0 ? flightPath.length * 0.1 : 0
    const duration = Math.floor(Date.now() / 1000) % 3600 // Reset every hour for demo
    
    setMissionStats(prev => ({
      ...prev,
      distance: distance.toFixed(1),
      duration: Math.floor(duration / 60),
      coverage: Math.min(100, (flightPath.length * 2)).toFixed(0)
    }))
  }, [flightPath])

  const pathOptions = {
    color: '#00ff88',
    weight: 4,
    opacity: 0.8,
    dashArray: '10, 5'
  }

  const toggleSatelliteView = () => setSatelliteView(!satelliteView)
  const toggleNoFlyZones = () => setShowNoFlyZones(!showNoFlyZones)
  const toggleWaypoints = () => setShowWaypoints(!showWaypoints)

  return (
    <MapWrapper>
      <MapHeader>
        <MapTitle>
          <Navigation size={16} />
          Live Drone Tracking - Mission Alpha
        </MapTitle>
        <MapControls>
          <ControlButton 
            className={satelliteView ? 'active' : ''} 
            onClick={toggleSatelliteView}
          >
            <Satellite size={12} />
            SAT
          </ControlButton>
          <ControlButton 
            className={showNoFlyZones ? 'active' : ''} 
            onClick={toggleNoFlyZones}
          >
            <AlertTriangle size={12} />
            NFZ
          </ControlButton>
          <ControlButton 
            className={showWaypoints ? 'active' : ''} 
            onClick={toggleWaypoints}
          >
            <Target size={12} />
            WPT
          </ControlButton>
        </MapControls>
      </MapHeader>
      
      <MapContent>
        <MapContainer
          center={dronePosition}
          zoom={15}
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={satelliteView 
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />
          
          {/* Home base marker */}
          <Marker position={homeBase} icon={homeBaseIcon}>
            <Popup>
              <strong>🏠 Home Base</strong><br />
              <strong>Status:</strong> Operational<br />
              <strong>Coordinates:</strong> {homeBase[0].toFixed(6)}, {homeBase[1].toFixed(6)}<br />
              <strong>Landing Pad:</strong> Ready<br />
              <strong>Fuel Station:</strong> Available<br />
              <strong>Command Center:</strong> Active
            </Popup>
          </Marker>
          
          {/* Points of interest */}
          {pointsOfInterest.map((poi) => (
            <Marker key={poi.id} position={poi.position} icon={createPoiIcon(poi.type)}>
              <Popup>
                <strong>{poi.name}</strong><br />
                <strong>Type:</strong> {poi.type.charAt(0).toUpperCase() + poi.type.slice(1)}<br />
                <strong>Coordinates:</strong> {poi.position[0].toFixed(6)}, {poi.position[1].toFixed(6)}<br />
                <strong>Distance from drone:</strong> {
                  (Math.sqrt(
                    Math.pow(poi.position[0] - dronePosition[0], 2) + 
                    Math.pow(poi.position[1] - dronePosition[1], 2)
                  ) * 111320).toFixed(0)
                }m<br />
                <strong>Status:</strong> Accessible
              </Popup>
            </Marker>
          ))}
          
          {/* Drone marker */}
          <Marker position={dronePosition} icon={droneIcon}>
            <Popup>
              <strong>🚁 AI Drone Unit Alpha</strong><br />
              <strong>Position:</strong> {dronePosition[0].toFixed(6)}, {dronePosition[1].toFixed(6)}<br />
              <strong>Altitude:</strong> 150ft AGL<br />
              <strong>Heading:</strong> {droneHeading.toFixed(0)}°<br />
              <strong>Status:</strong> Mission Active<br />
              <strong>Battery:</strong> 98%<br />
              <strong>Speed:</strong> 12 mph<br />
              <strong>Distance to Home:</strong> {
                (Math.sqrt(
                  Math.pow(dronePosition[0] - homeBase[0], 2) + 
                  Math.pow(dronePosition[1] - homeBase[1], 2)
                ) * 111320).toFixed(0)
              }m
            </Popup>
          </Marker>
          
          {/* Waypoints */}
          {showWaypoints && waypoints.map((waypoint, index) => (
            <Marker key={index} position={waypoint} icon={waypointIcon}>
              <Popup>
                <strong>Waypoint {index + 1}</strong><br />
                Coordinates: {waypoint[0].toFixed(4)}, {waypoint[1].toFixed(4)}<br />
                Status: {index < 2 ? 'Completed' : 'Pending'}
              </Popup>
            </Marker>
          ))}
          
          {/* Flight path */}
          {flightPath.length > 1 && (
            <Polyline positions={flightPath} pathOptions={pathOptions} />
          )}
          
          {/* Enhanced coverage area with gradient effect */}
          <Circle
            center={dronePosition}
            radius={150}
            pathOptions={{
              fillColor: '#00ff88',
              fillOpacity: 0.15,
              color: '#00ff88',
              weight: 2,
              opacity: 0.6,
              dashArray: '5, 5'
            }}
          />
          
          {/* Secondary coverage ring */}
          <Circle
            center={dronePosition}
            radius={300}
            pathOptions={{
              fillColor: '#667eea',
              fillOpacity: 0.05,
              color: '#667eea',
              weight: 1,
              opacity: 0.4,
              dashArray: '10, 10'
            }}
          />
          
          {/* No-fly zones */}
          {showNoFlyZones && noFlyZones.map((zone, index) => (
            <Rectangle
              key={index}
              bounds={zone.bounds}
              pathOptions={{
                fillColor: '#ff4444',
                fillOpacity: 0.2,
                color: '#ff4444',
                weight: 2,
                opacity: 0.8,
                dashArray: '3, 3'
              }}
            />
          ))}
        </MapContainer>
      </MapContent>
      
      <DroneInfo>
        <div className="info-row">
          <span className="label">Coordinates:</span>
          <span className="value">{dronePosition[0].toFixed(4)}, {dronePosition[1].toFixed(4)}</span>
        </div>
        <div className="info-row">
          <span className="label">Flight Path Points:</span>
          <span className="value">{flightPath.length}</span>
        </div>
        <div className="info-row">
          <span className="label">Coverage Radius:</span>
          <span className="value">150m Primary</span>
        </div>
        <div className="info-row">
          <span className="label">GPS Satellites:</span>
          <span className="value">12 Connected</span>
        </div>
        <div className="info-row">
          <span className="label">Distance to Home:</span>
          <span className="value">{
            (Math.sqrt(
              Math.pow(dronePosition[0] - homeBase[0], 2) + 
              Math.pow(dronePosition[1] - homeBase[1], 2)
            ) * 111320).toFixed(0)
          }m</span>
        </div>
        <div className="info-row">
          <span className="label">Current Heading:</span>
          <span className="value">{droneHeading.toFixed(0)}°</span>
        </div>
      </DroneInfo>
      
      <MissionInfo>
        <div className="mission-status">MISSION STATUS</div>
        <div className="mission-item">
          <span>Distance Traveled:</span>
          <span>{missionStats.distance} km</span>
        </div>
        <div className="mission-item">
          <span>Mission Duration:</span>
          <span>{missionStats.duration} min</span>
        </div>
        <div className="mission-item">
          <span>Area Coverage:</span>
          <span>{missionStats.coverage}%</span>
        </div>
        <div className="mission-item">
          <span>Objectives:</span>
          <span>2/{missionStats.objectives}</span>
        </div>
        <div className="mission-item">
          <span>Status:</span>
          <span style={{ color: '#00ff88' }}>ACTIVE</span>
        </div>
      </MissionInfo>
    </MapWrapper>
  )
}

export default DroneMap