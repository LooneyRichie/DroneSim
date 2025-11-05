import { useState, useEffect } from 'react'
import styled from 'styled-components'
import ChatInterface from './components/ChatInterface'
import DroneMap from './components/DroneMap'
import DroneCamera from './components/DroneCamera'
import Header from './components/Header'
import './App.css'

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`

const MainContent = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  padding: 20px;
  min-height: 0;
`

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
`

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
`

function App() {
  const [dronePosition, setDronePosition] = useState([37.7749, -122.4194]) // San Francisco
  const [homeBase, setHomeBase] = useState([37.7749, -122.4194]) // Home base position
  const [pointsOfInterest, setPointsOfInterest] = useState([
    { id: 1, position: [37.7849, -122.4094], type: 'store', name: 'Target Location Alpha' },
    { id: 2, position: [37.7649, -122.4294], type: 'landmark', name: 'Observation Point Beta' },
    { id: 3, position: [37.7749, -122.4394], type: 'waypoint', name: 'Patrol Point Gamma' }
  ])
  const [droneStatus, setDroneStatus] = useState('Ready')
  const [flightPath, setFlightPath] = useState([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [currentTarget, setCurrentTarget] = useState(null)
  const [missionActive, setMissionActive] = useState(false)
  const [droneHeading, setDroneHeading] = useState(0) // Heading in degrees
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'system', 
      content: '🚁 DominionOS AI Drone System initialized. Home base established. Advanced AI pilot ready for directional commands.',
      timestamp: new Date()
    },
    { 
      id: 2, 
      type: 'system', 
      content: '📡 GPS locked, cameras online, sensors active. Directional navigation and waypoint system fully operational.',
      timestamp: new Date()
    }
  ])

  // Enhanced drone movement simulation with directional intelligence
  useEffect(() => {
    if (currentCommand && currentTarget) {
      setMissionActive(true)
      let movementCount = 0
      const maxMovements = 20
      
      const interval = setInterval(() => {
        setDronePosition(prev => {
          const [currentLat, currentLng] = prev
          const [targetLat, targetLng] = currentTarget
          
          // Calculate direction to target
          const latDiff = targetLat - currentLat
          const lngDiff = targetLng - currentLng
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)
          
          // If close to target, stop
          if (distance < 0.0005) {
            clearInterval(interval)
            setCurrentCommand('')
            setCurrentTarget(null)
            setDroneStatus('Target Reached - Mission Complete')
            setMissionActive(false)
            
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'bot',
                content: '✅ Target coordinates reached successfully. Drone holding position and awaiting new orders.',
                timestamp: new Date(),
                isNew: true
              }])
            }, 1000)
            
            return prev
          }
          
          // Move towards target with realistic speed
          const moveSpeed = 0.0003
          const latMove = (latDiff / distance) * moveSpeed
          const lngMove = (lngDiff / distance) * moveSpeed
          
          const newPos = [
            currentLat + latMove,
            currentLng + lngMove
          ]
          
          // Update heading based on movement direction
          const heading = (Math.atan2(lngDiff, latDiff) * 180 / Math.PI + 360) % 360
          setDroneHeading(heading)
          
          setFlightPath(path => [...path.slice(-25), newPos])
          return newPos
        })
        
        movementCount++
        if (movementCount >= maxMovements) {
          clearInterval(interval)
          setCurrentCommand('')
          setCurrentTarget(null)
          setDroneStatus('Mission Complete - Standing By')
          setMissionActive(false)
        }
      }, 800)

      return () => clearInterval(interval)
    }
  }, [currentCommand, currentTarget])

  // Periodic status updates when mission is active
  useEffect(() => {
    if (missionActive) {
      const statusInterval = setInterval(() => {
        const statusMessages = [
          '📊 Real-time telemetry: All systems optimal, mission proceeding as planned.',
          '🎯 AI target recognition active, scanning for objects of interest.',
          '🛡️ Obstacle avoidance systems engaged, maintaining safe flight corridor.',
          '📡 Communication link strong, data transmission continuous.',
          '🔋 Power management optimal, extended flight time available.'
        ]
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          content: statusMessages[Math.floor(Math.random() * statusMessages.length)],
          timestamp: new Date(),
          isNew: true
        }])
      }, 8000)

      return () => clearInterval(statusInterval)
    }
  }, [missionActive])

  return (
    <AppContainer>
      <Header droneStatus={droneStatus} />
      <MainContent>
        <LeftPanel>
          <ChatInterface 
            messages={messages}
            setMessages={setMessages}
            setDroneStatus={setDroneStatus}
            setCurrentCommand={setCurrentCommand}
            setCurrentTarget={setCurrentTarget}
            dronePosition={dronePosition}
            homeBase={homeBase}
            pointsOfInterest={pointsOfInterest}
            missionActive={missionActive}
          />
        </LeftPanel>
        <RightPanel>
          <DroneMap 
            dronePosition={dronePosition}
            flightPath={flightPath}
            homeBase={homeBase}
            pointsOfInterest={pointsOfInterest}
            droneHeading={droneHeading}
          />
          <DroneCamera />
        </RightPanel>
      </MainContent>
    </AppContainer>
  )
}

export default App
