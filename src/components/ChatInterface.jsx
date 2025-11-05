import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Send, MessageCircle, Zap } from 'lucide-react'

const ChatContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const ChatHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: bold;
`

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const Message = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
  align-self: ${props => props.type === 'user' ? 'flex-end' : 'flex-start'};
  background: ${props => 
    props.type === 'user' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
    props.type === 'system' ? 'rgba(255, 255, 255, 0.1)' :
    'rgba(0, 255, 136, 0.2)'
  };
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${props => props.isNew ? 'slideIn 0.3s ease-out' : 'none'};
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const MessageTime = styled.div`
  font-size: 10px;
  opacity: 0.7;
  margin-top: 5px;
`

const InputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  gap: 10px;
`

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  outline: none;
  max-length: 500;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &.invalid {
    border-color: #ff4444;
    box-shadow: 0 0 5px rgba(255, 68, 68, 0.3);
  }
`

const CharacterCount = styled.div`
  font-size: 10px;
  color: ${props => props.count > 450 ? '#ff4444' : 'rgba(255, 255, 255, 0.5)'};
  margin-top: 5px;
  text-align: right;
`

const SendButton = styled.button`
  padding: 12px 16px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

// Enhanced directional command parser
const parseDirectionalCommand = (message, dronePosition, homeBase, pointsOfInterest) => {
  const lowerMessage = message.toLowerCase()
  const [currentLat, currentLng] = dronePosition
  
  // Define directional movements (in decimal degrees, roughly 100m each step)
  const directions = {
    north: [0.001, 0],
    south: [-0.001, 0], 
    east: [0, 0.001],
    west: [0, -0.001],
    northeast: [0.0007, 0.0007],
    northwest: [0.0007, -0.0007],
    southeast: [-0.0007, 0.0007],
    southwest: [-0.0007, -0.0007]
  }
  
  // Check for specific locations first
  if (lowerMessage.includes('home') || lowerMessage.includes('base')) {
    return {
      target: homeBase,
      description: 'home base',
      action: 'return'
    }
  }
  
  // Check for points of interest
  for (const poi of pointsOfInterest) {
    if (lowerMessage.includes(poi.name.toLowerCase()) || 
        lowerMessage.includes(poi.type) ||
        (poi.type === 'store' && (lowerMessage.includes('shop') || lowerMessage.includes('store'))) ||
        (poi.type === 'landmark' && lowerMessage.includes('landmark')) ||
        (poi.type === 'waypoint' && lowerMessage.includes('waypoint'))) {
      return {
        target: poi.position,
        description: poi.name,
        action: 'move'
      }
    }
  }
  
  // Parse directional commands
  for (const [direction, [latOffset, lngOffset]] of Object.entries(directions)) {
    if (lowerMessage.includes(direction)) {
      // Calculate distance based on command intensity
      let multiplier = 1
      if (lowerMessage.includes('far') || lowerMessage.includes('long') || lowerMessage.includes('distance')) {
        multiplier = 3
      } else if (lowerMessage.includes('little') || lowerMessage.includes('short') || lowerMessage.includes('close')) {
        multiplier = 0.5
      }
      
      const targetPosition = [
        currentLat + (latOffset * multiplier),
        currentLng + (lngOffset * multiplier)
      ]
      
      return {
        target: targetPosition,
        description: `${multiplier > 1 ? 'far ' : multiplier < 1 ? 'short distance ' : ''}${direction}`,
        action: 'move'
      }
    }
  }
  
  // Check for coordinate commands (e.g., "move to 37.7849, -122.4094")
  const coordMatch = message.match(/(-?\d+\.?\d*),?\s*(-?\d+\.?\d*)/)
  if (coordMatch && coordMatch[1] && coordMatch[2]) {
    const lat = parseFloat(coordMatch[1])
    const lng = parseFloat(coordMatch[2])
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        target: [lat, lng],
        description: `coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        action: 'move'
      }
    }
  }
  
  return null
}
const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return ''
  
  // Remove HTML tags and scripts for security
  const cleanInput = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
  
  // Limit length to prevent spam
  const maxLength = 500
  const trimmedInput = cleanInput.trim().substring(0, maxLength)
  
  return trimmedInput
}

// Check for inappropriate content
const containsInappropriateContent = (message) => {
  const inappropriatePatterns = [
    /\b(hack|exploit|break|destroy|attack|crash|kill|bomb|weapon|explosive)\b/i,
    /\b(fuck|shit|damn|hell|ass|bitch|stupid|idiot)\b/i,
    /\b(override|shutdown|disable|emergency|abort|self[-\s]?destruct)\b/i,
    /[!@#$%^&*]{3,}/, // Excessive special characters
    /(.)\1{5,}/, // Repeated characters (spam)
    /\b(admin|root|sudo|password|login|auth)\b/i
  ]
  
  return inappropriatePatterns.some(pattern => pattern.test(message))
}

// Check if message is a valid drone command
const isValidDroneCommand = (message) => {
  const validCommandPatterns = [
    /\b(move|go|fly|navigate|proceed|advance|forward|to)\b/i,
    /\b(scan|search|survey|reconnaissance|look|find|detect)\b/i,
    /\b(return|home|land|base|here|back|rtb)\b/i,
    /\b(altitude|height|climb|descend|up|down|level)\b/i,
    /\b(status|report|diagnostic|health|check|info)\b/i,
    /\b(track|follow|monitor|observe|watch|target)\b/i,
    /\b(patrol|perimeter|guard|secure|protect|circle)\b/i,
    /\b(stop|halt|pause|wait|hold|hover)\b/i,
    /\b(camera|video|photo|record|capture|image)\b/i,
    /\b(speed|velocity|slow|fast|accelerate)\b/i,
    /\b(heading|direction|north|south|east|west|turn|rotate)\b/i,
    /\b(mission|objective|task|job|assignment)\b/i,
    /\b(weather|wind|conditions|environment)\b/i,
    /\b(battery|power|fuel|energy|charge)\b/i,
    /\b(help|assist|support|guide|instructions)\b/i
  ]
  
  return validCommandPatterns.some(pattern => pattern.test(message))
}

// AI responses for different command types with enhanced realism
const getAIResponse = (userMessage, dronePosition, homeBase, pointsOfInterest, setCurrentTarget) => {
  const sanitizedMessage = sanitizeInput(userMessage)
  
  // Check for empty or invalid input
  if (!sanitizedMessage || sanitizedMessage.length < 2) {
    return {
      content: "I didn't receive a clear command. Please provide a specific instruction for the drone operation.",
      action: 'invalid'
    }
  }
  
  // Check for inappropriate content
  if (containsInappropriateContent(sanitizedMessage)) {
    const politeResponses = [
      "I'm programmed to only respond to professional drone operation commands. Please provide appropriate mission directives.",
      "This system is designed for legitimate drone operations only. Please use professional language and valid commands.",
      "I cannot process that type of request. Please provide standard drone operation commands such as 'patrol area' or 'return to base'.",
      "My programming restricts me to safe, professional drone operations. Please rephrase your command using appropriate terminology.",
      "I'm designed to assist with authorized drone missions only. Please provide a legitimate operational command."
    ]
    return {
      content: politeResponses[Math.floor(Math.random() * politeResponses.length)],
      action: 'inappropriate'
    }
  }
  
  const message = sanitizedMessage.toLowerCase()
  
  // Parse directional commands first
  const directionalCommand = parseDirectionalCommand(sanitizedMessage, dronePosition, homeBase, pointsOfInterest)
  if (directionalCommand) {
    setCurrentTarget(directionalCommand.target)
    
    const responses = [
      `Roger that! Navigating to ${directionalCommand.description}. GPS locked, initiating autonomous flight path.`,
      `Copy commander. Setting course for ${directionalCommand.description}. Obstacle avoidance active.`,
      `Affirmative. Proceeding to ${directionalCommand.description}. Flight path calculated and approved.`,
      `Understood. Moving to ${directionalCommand.description}. All navigation systems engaged.`
    ]
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: directionalCommand.action
    }
  }
  
  // Check if it's not a valid drone command
  if (!isValidDroneCommand(message)) {
    const helpfulResponses = [
      "I don't recognize that as a standard drone command. Try directional commands like 'go east', 'fly north', 'move to home base', or 'navigate to store'.",
      "Command not recognized. I can process directions like 'head south', 'return home', coordinates, or location names. What's your destination?",
      "I'm not sure how to interpret that request. Try specific directions: 'go northeast', 'fly to waypoint', 'move far east', or 'return to base'.",
      "That command isn't in my navigation database. Please use directional commands like 'proceed west', 'go to landmark', or specific coordinates.",
      "I couldn't parse that as a valid movement command. Try: 'move north 100 meters', 'fly to store', 'head home', or compass directions."
    ]
    return {
      content: helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)],
      action: 'unrecognized'
    }
  }
  
  // Existing command processing...
  
  if (message.includes('move') || message.includes('go') || message.includes('fly') || message.includes('navigate')) {
    const responses = [
      "Roger that! Initiating autonomous flight to target location. GPS locked, obstacle avoidance active. ETA: 30 seconds.",
      "Affirmative. Calculating optimal flight path with real-time wind analysis. Beginning autonomous navigation sequence.",
      "Copy commander. Engaging AI pathfinding algorithms. Thermal sensors active, collision avoidance enabled. Moving to coordinates.",
      "Understood. Advanced navigation system engaged. Weather conditions optimal. Proceeding to target with precision flight control."
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: 'move'
    }
  }

  if (message.includes('to') || message.includes('proceed') || message.includes('advance') || message.includes('forward')) {
    const responses = [
      "Roger that! Initiating autonomous flight to target location. GPS locked, obstacle avoidance active. ETA: 30 seconds.",
      "Affirmative. Calculating optimal flight path with real-time wind analysis. Beginning autonomous navigation sequence.",
      "Copy commander. Engaging AI pathfinding algorithms. Thermal sensors active, collision avoidance enabled. Moving to coordinates.",
      "Understood. Advanced navigation system engaged. Weather conditions optimal. Proceeding to target with precision flight control."
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: 'move'
    }
  }
  
  if (message.includes('scan') || message.includes('search') || message.includes('survey') || message.includes('reconnaissance') || message.includes('look')) {
    const responses = [
      "Beginning comprehensive area scan with HD camera array. Thermal and visual spectrum analysis activated. AI object recognition online.",
      "Initiating advanced reconnaissance mode. Multi-spectral imaging active. Pattern recognition algorithms processing real-time data.",
      "Roger. Deploying full sensor suite for area surveillance. Infrared, visual, and motion detection systems fully operational.",
      "Commencing detailed area analysis. AI threat assessment active. Object classification and tracking systems engaged."
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: 'scan'
    }
  }

  if (message.includes('return') || message.includes('home') || message.includes('land') || message.includes('base') || message.includes('here')) {
    const responses = [
      "Returning to home base. Auto-landing sequence will engage upon arrival. Mission data successfully archived.",
      "Copy that. Initiating return protocol. All systems nominal. Estimated arrival at base: 2 minutes.",
      "Affirmative. Beginning automated return journey. Flight data logged, mission objectives completed successfully.",
      "Roger commander. RTB protocol active. All mission data secured. Landing pad approach will be fully automated."
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: 'return'
    }
  }
  
  if (message.includes('altitude') || message.includes('height') || message.includes('climb') || message.includes('descend')) {
    const responses = [
      "Current altitude: 150ft. Adjusting to optimal surveillance height of 200ft for enhanced coverage and safety.",
      "Altitude modification confirmed. Climbing to 180ft for improved visual range while maintaining stealth profile.",
      "Roger. Adjusting flight level for optimal mission parameters. New altitude will provide superior tactical advantage.",
      "Copy that. Precision altitude adjustment in progress. Weather conditions factored into climb rate calculations."
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: 'altitude'
    }
  }
  
  if (message.includes('status') || message.includes('report') || message.includes('diagnostic') || message.includes('health')) {
    const responses = [
      "All systems nominal. Battery: 98%, GPS: Strong signal, Camera: 4K recording, Wind: 5mph NE. AI systems functioning perfectly.",
      "Complete systems check: Navigation optimal, Sensors active, Communication strong. Ready for extended mission operations.",
      "Full diagnostic complete: All subsystems green, Fuel reserves excellent, Weather conditions favorable. Standing by for orders.",
      "Status report: Mission-ready condition. All critical systems operational. Advanced AI processing at full capacity."
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: 'status'
    }
  }
  
  if (message.includes('track') || message.includes('follow') || message.includes('monitor') || message.includes('observe')) {
    const responses = [
      "Target acquisition confirmed. Initiating advanced tracking protocol. AI visual recognition locked onto subject.",
      "Copy that. Engaging autonomous tracking mode. Subject identified and tagged. Maintaining optimal surveillance distance.",
      "Roger commander. Target tracking active. Using predictive AI algorithms to anticipate movement patterns.",
      "Affirmative. Advanced tracking systems online. Multi-sensor fusion providing comprehensive target monitoring."
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: 'track'
    }
  }
  
  if (message.includes('stop') || message.includes('halt') || message.includes('pause') || message.includes('wait') || message.includes('hold') || message.includes('hover')) {
    const responses = [
      "Roger. Holding current position. All movement systems on standby. Awaiting further instructions.",
      "Copy that. Drone hovering at current coordinates. Maintaining altitude and position lock.",
      "Affirmative. Emergency stop activated. All propulsion systems halted. Position maintained via GPS.",
      "Understood. Mission paused. Holding current altitude and location. Ready for new directives."
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: 'stop'
    }
  }
  
  if (message.includes('camera') || message.includes('video') || message.includes('photo') || message.includes('record') || message.includes('capture')) {
    const responses = [
      "Camera systems active. Beginning high-resolution recording. 4K video capture initiated with stabilization.",
      "Roger. Activating advanced imaging suite. Photo capture mode enabled with auto-focus and exposure control.",
      "Copy that. Video recording commenced. All camera arrays operational with thermal and visual spectrum capture.",
      "Affirmative. Advanced photography protocols engaged. Multi-angle capture with AI-enhanced image processing."
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: 'camera'
    }
  }
  
  if (message.includes('weather') || message.includes('wind') || message.includes('conditions') || message.includes('environment')) {
    const responses = [
      "Weather assessment: Clear skies, wind 5mph NE, visibility excellent. Optimal flight conditions detected.",
      "Environmental scan complete: Temperature 72°F, humidity 45%, barometric pressure stable. Flight approved.",
      "Current conditions: Light winds favorable, no precipitation detected. All weather parameters within operational limits.",
      "Meteorological report: Wind patterns analyzed, thermal conditions mapped. Safe to proceed with all operations."
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: 'weather'
    }
  }
  
  if (message.includes('help') || message.includes('assist') || message.includes('guide') || message.includes('instructions') || message.includes('commands')) {
    return {
      content: "Available commands: Directional: 'go east/west/north/south', 'fly northeast', 'move far west' | Locations: 'return home', 'go to store', 'move to waypoint' | Coordinates: 'fly to 37.7849, -122.4094' | Actions: 'scan area', 'check status', 'hold position'. I'm your intelligent navigation assistant!",
      action: 'help'
    }
  }
  
  if (message.includes('patrol') || message.includes('perimeter') || message.includes('guard') || message.includes('secure')) {
    const responses = [
      "Initiating automated perimeter patrol. AI threat detection algorithms active. Will report any anomalies immediately.",
      "Roger. Beginning security patrol pattern. Advanced motion detection and facial recognition systems deployed.",
      "Copy that commander. Establishing perimeter surveillance grid. AI-powered threat assessment protocols engaged.",
      "Affirmative. Autonomous security patrol mode activated. All intrusion detection systems at maximum sensitivity."
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      action: 'patrol'
    }
  }
  
  // Default fallback for valid but unspecified commands
  const generalResponses = [
    "Command received and understood. AI processing optimal execution path. Standby for mission confirmation and deployment.",
    "Roger that commander. Advanced AI systems analyzing request. Calculating best approach for mission success.",
    "Affirmative. Mission parameters received. AI decision matrix engaged. Preparing for autonomous execution.",
    "Copy commander. Processing mission directive through advanced AI algorithms. Ready to execute on your command.",
    "Understood. AI command interpretation complete. All systems primed for immediate mission deployment."
  ]
  
  return {
    content: generalResponses[Math.floor(Math.random() * generalResponses.length)],
    action: 'general'
  }
}

function ChatInterface({ messages, setMessages, setDroneStatus, setCurrentCommand, setCurrentTarget, dronePosition, homeBase, pointsOfInterest, missionActive }) {
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [inputError, setInputError] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle input change with validation
  const handleInputChange = (e) => {
    const value = e.target.value
    
    // Basic validation
    if (value.length <= 500) {
      setInputValue(value)
      setInputError(false)
    } else {
      setInputError(true)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return

    // Sanitize input before processing
    const sanitizedInput = sanitizeInput(inputValue)
    
    // Check for empty input after sanitization
    if (!sanitizedInput) {
      const warningMessage = {
        id: Date.now(),
        type: 'bot',
        content: "⚠️ Input contains invalid characters. Please provide a clear, professional drone command.",
        timestamp: new Date(),
        isNew: true
      }
      setMessages(prev => [...prev, warningMessage])
      setInputValue('')
      return
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: sanitizedInput, // Use sanitized input
      timestamp: new Date(),
      isNew: true
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsProcessing(true)
    setDroneStatus('Processing...')

    // Simulate AI processing delay with variable timing based on command type
    const processingTime = sanitizedInput.length > 50 ? 2000 : 1500
    
    setTimeout(() => {
      const aiResponse = getAIResponse(sanitizedInput, dronePosition, homeBase, pointsOfInterest, setCurrentTarget)
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse.content,
        timestamp: new Date(),
        isNew: true
      }

      setMessages(prev => [...prev, botMessage])
      
      // Only update drone status and command for valid actions
      if (!['invalid', 'inappropriate', 'unrecognized', 'help'].includes(aiResponse.action)) {
        setDroneStatus('Executing Command')
        setCurrentCommand(aiResponse.action)
      } else {
        setDroneStatus('Ready') // Reset to ready for invalid commands
      }
      
      setIsProcessing(false)
    }, processingTime)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <MessageCircle size={20} />
        AI Drone Communication
      </ChatHeader>
      
      <MessagesContainer>
        {messages.map((message) => (
          <Message key={message.id} type={message.type} isNew={message.isNew}>
            {message.content}
            <MessageTime>
              {message.timestamp.toLocaleTimeString()}
            </MessageTime>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <div style={{ flex: 1 }}>
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={missionActive ? 
              "Mission in progress... Send new destination or 'stop' command" : 
              "Navigate your drone: 'go east', 'fly north', 'move to store', 'return home'"
            }
            disabled={isProcessing}
            className={inputError ? 'invalid' : ''}
            maxLength={500}
          />
          <CharacterCount count={inputValue.length}>
            {inputValue.length}/500 characters
          </CharacterCount>
        </div>
        <SendButton onClick={handleSend} disabled={isProcessing || !inputValue.trim() || inputError}>
          {isProcessing ? <Zap size={16} /> : <Send size={16} />}
          {isProcessing ? 'Processing...' : 'Send'}
        </SendButton>
      </InputContainer>
    </ChatContainer>
  )
}

export default ChatInterface