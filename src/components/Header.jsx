import styled from 'styled-components'
import { Zap, Radio, Battery } from 'lucide-react'

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 24px;
  font-weight: bold;
`

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
`

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
`

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.status === 'Ready' ? '#00ff88' : 
                       props.status === 'Mission Complete' ? '#00ff88' : '#ffaa00'};
  animation: ${props => props.status !== 'Ready' ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`

function Header({ droneStatus }) {
  return (
    <HeaderContainer>
      <Logo>
        <Zap size={28} />
        DominionOS - AI Drone Command
      </Logo>
      <StatusBar>
        <StatusItem>
          <Radio size={16} />
          Connected
        </StatusItem>
        <StatusItem>
          <Battery size={16} />
          98%
        </StatusItem>
        <StatusItem>
          <StatusDot status={droneStatus} />
          {droneStatus}
        </StatusItem>
      </StatusBar>
    </HeaderContainer>
  )
}

export default Header