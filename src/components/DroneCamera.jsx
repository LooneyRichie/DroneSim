import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Camera, Zap, Eye, Target, Maximize, Settings, AlertTriangle } from 'lucide-react'

const CameraContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 40%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`

const CameraHeader = styled.div`
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
  z-index: 10;
`

const CameraTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
`

const CameraControls = styled.div`
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
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &.active {
    background: rgba(0, 255, 136, 0.3);
    border-color: #00ff88;
  }
`

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #00ff88;
`

const RecordingDot = styled.div`
  width: 8px;
  height: 8px;
  background: #ff4444;
  border-radius: 50%;
  animation: pulse 1s infinite;
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`

const CameraView = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => {
    const scenes = [
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      'linear-gradient(135deg, #2d1b69 0%, #11998e 50%, #38ef7d 100%)',
      'linear-gradient(135deg, #434343 0%, #000000 50%, #1e3c72 100%)',
      'linear-gradient(135deg, #8360c3 0%, #2ebf91 50%, #52ffb8 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
    ];
    return scenes[props.sceneIndex] || scenes[0];
  }};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: background 2s ease-in-out;
`

const SimulatedFeed = styled.div`
  width: 100%;
  height: 100%;
  background: 
    ${props => props.isNightVision ? 
      'radial-gradient(circle at 50% 50%, rgba(0, 255, 0, 0.1) 0%, transparent 70%)' :
      'radial-gradient(circle at 30% 20%, rgba(0, 255, 136, 0.1) 0%, transparent 50%)'
    },
    ${props => props.isNightVision ? 
      'radial-gradient(circle at 80% 60%, rgba(0, 255, 0, 0.05) 0%, transparent 50%)' :
      'radial-gradient(circle at 70% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)'
    },
    ${props => props.isNightVision ? 
      'linear-gradient(135deg, #001100 0%, #003300 100%)' :
      'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)'
    };
  position: relative;
  padding-top: 50px;
  filter: ${props => props.isNightVision ? 'hue-rotate(120deg) saturate(1.5)' : 'none'};
`

const MovingObjects = styled.div`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: ${props => props.isVehicle ? 
    'linear-gradient(45deg, #ff6b6b, #feca57)' : 
    'linear-gradient(45deg, #48cae4, #0077b6)'
  };
  border-radius: ${props => props.isVehicle ? '2px' : '50%'};
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  transform: translate(-50%, -50%);
  animation: ${props => `move${props.direction} ${props.speed}s linear infinite`};
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  
  @keyframes moveRight {
    0% { transform: translate(-50%, -50%) translateX(-100vw); }
    100% { transform: translate(-50%, -50%) translateX(100vw); }
  }
  
  @keyframes moveLeft {
    0% { transform: translate(-50%, -50%) translateX(100vw); }
    100% { transform: translate(-50%, -50%) translateX(-100vw); }
  }
  
  @keyframes moveUp {
    0% { transform: translate(-50%, -50%) translateY(100vh); }
    100% { transform: translate(-50%, -50%) translateY(-100vh); }
  }
  
  @keyframes moveDown {
    0% { transform: translate(-50%, -50%) translateY(-100vh); }
    100% { transform: translate(-50%, -50%) translateY(100vh); }
  }
`

const Grid = styled.div`
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(${props => props.isNightVision ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 136, 0.2)'} 1px, transparent 1px),
    linear-gradient(90deg, ${props => props.isNightVision ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 136, 0.2)'} 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
  animation: gridShift 10s linear infinite;
  
  @keyframes gridShift {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }
`

const AdvancedCrosshair = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: ${props => props.isLocked ? '#ff4444' : '#00ff88'};
    transition: all 0.3s ease;
  }
  
  &::before {
    top: 50%;
    left: -15px;
    right: -15px;
    height: 2px;
    transform: translateY(-50%);
    box-shadow: 0 0 10px ${props => props.isLocked ? '#ff4444' : '#00ff88'};
  }
  
  &::after {
    left: 50%;
    top: -15px;
    bottom: -15px;
    width: 2px;
    transform: translateX(-50%);
    box-shadow: 0 0 10px ${props => props.isLocked ? '#ff4444' : '#00ff88'};
  }
`

const CornerBrackets = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 15px;
    height: 15px;
    border: 2px solid ${props => props.isLocked ? '#ff4444' : '#00ff88'};
  }
  
  &::before {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
  }
  
  &::after {
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: none;
  }
`

const ScanningLine = styled.div`
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, ${props => props.isScanning ? '#00ff88' : 'transparent'}, transparent);
  animation: ${props => props.isScanning ? 'scan 2s ease-in-out infinite' : 'none'};
  box-shadow: 0 0 20px ${props => props.isScanning ? '#00ff88' : 'transparent'};
  
  @keyframes scan {
    0% { transform: translateY(0); opacity: 1; }
    50% { opacity: 0.5; }
    100% { transform: translateY(calc(100vh - 150px)); opacity: 1; }
  }
`

const TelemetryOverlay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: ${props => props.isNightVision ? '#00ff00' : '#00ff88'};
`

const TelemetryItem = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 4px 6px;
  border-radius: 3px;
  border: 1px solid ${props => props.isNightVision ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 136, 0.3)'};
  text-align: center;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.05);
  }
`

const TargetMarker = styled.div`
  position: absolute;
  width: ${props => props.size || 25}px;
  height: ${props => props.size || 25}px;
  border: 2px solid ${props => props.locked ? '#ff4444' : '#ffaa00'};
  border-radius: 4px;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  transform: translate(-50%, -50%);
  animation: ${props => props.locked ? 'targetLocked 1s ease-in-out infinite' : 'targetScan 2s ease-in-out infinite'};
  background: ${props => props.locked ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 170, 0, 0.1)'};
  
  &::before {
    content: '${props => props.locked ? 'LOCKED' : 'SCANNING'}';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 8px;
    color: ${props => props.locked ? '#ff4444' : '#ffaa00'};
    font-weight: bold;
    white-space: nowrap;
    font-family: 'Courier New', monospace;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 4px;
    background: ${props => props.locked ? '#ff4444' : '#ffaa00'};
    border-radius: 50%;
    box-shadow: 0 0 10px ${props => props.locked ? '#ff4444' : '#ffaa00'};
  }
  
  @keyframes targetLocked {
    0%, 100% { 
      border-color: #ff4444;
      box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
    }
    50% { 
      border-color: #ff8888;
      box-shadow: 0 0 0 15px rgba(255, 68, 68, 0);
    }
  }
  
  @keyframes targetScan {
    0%, 100% { 
      border-color: #ffaa00;
      transform: translate(-50%, -50%) scale(1);
    }
    50% { 
      border-color: #ffcc44;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }
`

const AIAnalysisOverlay = styled.div`
  position: absolute;
  top: 60px;
  right: 10px;
  background: rgba(0, 0, 0, 0.9);
  color: #00ff88;
  padding: 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 9px;
  border: 1px solid rgba(0, 255, 136, 0.3);
  max-width: 120px;
  
  .analysis-item {
    margin-bottom: 3px;
    display: flex;
    justify-content: space-between;
  }
  
  .confidence {
    color: ${props => props.confidence > 90 ? '#00ff00' : props.confidence > 70 ? '#ffaa00' : '#ff4444'};
  }
`

function DroneCamera() {
  const [isRecording, setIsRecording] = useState(true)
  const [isNightVision, setIsNightVision] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [sceneIndex, setSceneIndex] = useState(0)
  const [telemetry, setTelemetry] = useState({
    altitude: 150,
    speed: 12,
    battery: 98,
    temperature: 72,
    windSpeed: 5,
    heading: 245,
    satellites: 12,
    signalStrength: 95
  })
  const [targets, setTargets] = useState([
    { id: 1, top: 35, left: 60, locked: false, size: 25, type: 'vehicle' },
    { id: 2, top: 70, left: 25, locked: false, size: 20, type: 'person' },
    { id: 3, top: 50, left: 80, locked: true, size: 30, type: 'building' }
  ])
  const [movingObjects, setMovingObjects] = useState([
    { id: 1, top: 40, left: 20, size: 8, isVehicle: true, direction: 'Right', speed: 15 },
    { id: 2, top: 60, left: 70, size: 6, isVehicle: false, direction: 'Left', speed: 20 },
    { id: 3, top: 30, left: 50, size: 10, isVehicle: true, direction: 'Up', speed: 12 }
  ])
  const [aiAnalysis, setAiAnalysis] = useState({
    objectsDetected: 5,
    threatsIdentified: 0,
    confidence: 87,
    processingLoad: 34
  })

  // Enhanced telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        altitude: Math.max(50, prev.altitude + (Math.random() - 0.5) * 3),
        speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 4),
        battery: Math.max(0, prev.battery - 0.005),
        temperature: prev.temperature + (Math.random() - 0.5) * 0.8,
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 3),
        heading: (prev.heading + (Math.random() - 0.5) * 8) % 360,
        satellites: Math.max(8, Math.min(15, prev.satellites + (Math.random() - 0.5) * 2)),
        signalStrength: Math.max(70, Math.min(100, prev.signalStrength + (Math.random() - 0.5) * 5))
      }))
    }, 800)

    return () => clearInterval(interval)
  }, [])

  // Dynamic scene changes
  useEffect(() => {
    const sceneInterval = setInterval(() => {
      setSceneIndex(prev => (prev + 1) % 5)
    }, 8000)

    return () => clearInterval(sceneInterval)
  }, [])

  // Target tracking simulation
  useEffect(() => {
    const targetInterval = setInterval(() => {
      setTargets(prev => prev.map(target => ({
        ...target,
        top: Math.max(20, Math.min(80, target.top + (Math.random() - 0.5) * 5)),
        left: Math.max(20, Math.min(80, target.left + (Math.random() - 0.5) * 5)),
        locked: Math.random() > 0.7 ? !target.locked : target.locked
      })))
    }, 2000)

    return () => clearInterval(targetInterval)
  }, [])

  // AI Analysis updates
  useEffect(() => {
    const analysisInterval = setInterval(() => {
      setAiAnalysis(prev => ({
        objectsDetected: Math.max(1, prev.objectsDetected + Math.floor((Math.random() - 0.5) * 3)),
        threatsIdentified: Math.max(0, Math.min(2, prev.threatsIdentified + Math.floor((Math.random() - 0.5) * 2))),
        confidence: Math.max(60, Math.min(99, prev.confidence + (Math.random() - 0.5) * 10)),
        processingLoad: Math.max(10, Math.min(85, prev.processingLoad + (Math.random() - 0.5) * 15))
      }))
    }, 1500)

    return () => clearInterval(analysisInterval)
  }, [])

  // Auto-scanning mode
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setIsScanning(prev => !prev)
    }, 4000)

    return () => clearInterval(scanInterval)
  }, [])

  const toggleNightVision = () => setIsNightVision(!isNightVision)
  const toggleRecording = () => setIsRecording(!isRecording)
  const adjustZoom = (delta) => setZoomLevel(prev => Math.max(1, Math.min(5, prev + delta)))

  return (
    <CameraContainer>
      <CameraHeader>
        <CameraTitle>
          <Camera size={16} />
          Drone Camera Feed - {isNightVision ? 'NIGHT VISION' : '4K Live'} | Zoom: {zoomLevel}x
        </CameraTitle>
        <CameraControls>
          <ControlButton 
            className={isNightVision ? 'active' : ''} 
            onClick={toggleNightVision}
          >
            <Eye size={12} />
            NV
          </ControlButton>
          <ControlButton onClick={() => adjustZoom(0.5)}>
            <Maximize size={12} />
            Z+
          </ControlButton>
          <ControlButton onClick={() => adjustZoom(-0.5)}>
            <Settings size={12} />
            Z-
          </ControlButton>
          <StatusIndicator>
            {isRecording && <RecordingDot />}
            REC
          </StatusIndicator>
          <StatusIndicator>
            <Target size={12} />
            {targets.filter(t => t.locked).length} LOCKED
          </StatusIndicator>
          {aiAnalysis.threatsIdentified > 0 && (
            <StatusIndicator style={{ color: '#ff4444' }}>
              <AlertTriangle size={12} />
              {aiAnalysis.threatsIdentified} THREATS
            </StatusIndicator>
          )}
        </CameraControls>
      </CameraHeader>
      
      <CameraView sceneIndex={sceneIndex}>
        <SimulatedFeed isNightVision={isNightVision}>
          <Grid isNightVision={isNightVision} />
          <ScanningLine isScanning={isScanning} />
          <AdvancedCrosshair isLocked={targets.some(t => t.locked)} />
          <CornerBrackets isLocked={targets.some(t => t.locked)} />
          
          {/* Moving objects for realism */}
          {movingObjects.map(obj => (
            <MovingObjects 
              key={obj.id}
              top={obj.top}
              left={obj.left}
              size={obj.size}
              isVehicle={obj.isVehicle}
              direction={obj.direction}
              speed={obj.speed}
            />
          ))}
          
          {/* Enhanced target markers */}
          {targets.map(target => (
            <TargetMarker 
              key={target.id} 
              top={target.top} 
              left={target.left}
              locked={target.locked}
              size={target.size}
            />
          ))}
          
          {/* AI Analysis Overlay */}
          <AIAnalysisOverlay confidence={aiAnalysis.confidence}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#00ff88' }}>
              AI ANALYSIS
            </div>
            <div className="analysis-item">
              <span>Objects:</span>
              <span>{aiAnalysis.objectsDetected}</span>
            </div>
            <div className="analysis-item">
              <span>Threats:</span>
              <span style={{ color: aiAnalysis.threatsIdentified > 0 ? '#ff4444' : '#00ff88' }}>
                {aiAnalysis.threatsIdentified}
              </span>
            </div>
            <div className="analysis-item">
              <span>Confidence:</span>
              <span className="confidence">{aiAnalysis.confidence}%</span>
            </div>
            <div className="analysis-item">
              <span>CPU Load:</span>
              <span>{aiAnalysis.processingLoad}%</span>
            </div>
          </AIAnalysisOverlay>
          
          {/* Enhanced Telemetry */}
          <TelemetryOverlay isNightVision={isNightVision}>
            <TelemetryItem isNightVision={isNightVision}>
              ALT: {telemetry.altitude.toFixed(0)}ft
            </TelemetryItem>
            <TelemetryItem isNightVision={isNightVision}>
              SPD: {telemetry.speed.toFixed(1)}mph
            </TelemetryItem>
            <TelemetryItem isNightVision={isNightVision}>
              BAT: {telemetry.battery.toFixed(1)}%
            </TelemetryItem>
            <TelemetryItem isNightVision={isNightVision}>
              TMP: {telemetry.temperature.toFixed(0)}°F
            </TelemetryItem>
            <TelemetryItem isNightVision={isNightVision}>
              WND: {telemetry.windSpeed.toFixed(0)}mph
            </TelemetryItem>
            <TelemetryItem isNightVision={isNightVision}>
              HDG: {telemetry.heading.toFixed(0)}°
            </TelemetryItem>
            <TelemetryItem isNightVision={isNightVision}>
              SAT: {telemetry.satellites.toFixed(0)}
            </TelemetryItem>
            <TelemetryItem isNightVision={isNightVision}>
              SIG: {telemetry.signalStrength.toFixed(0)}%
            </TelemetryItem>
            <TelemetryItem isNightVision={isNightVision}>
              ZOOM: {zoomLevel.toFixed(1)}x
            </TelemetryItem>
          </TelemetryOverlay>
        </SimulatedFeed>
      </CameraView>
    </CameraContainer>
  )
}

export default DroneCamera