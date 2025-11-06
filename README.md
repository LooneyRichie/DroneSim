# DominionOS - AI Drone Command & Control System

🚁 **Professional AI Drone Simulation Interface for Investor Demonstrations**

DroneSim is a cutting-edge React application that demonstrates the ease and power of commanding autonomous AI drones through natural language communication of DominionOS. This simulation showcases real-time drone control, live tracking, and intuitive user interaction designed to impress potential investors.

## 🌟 Key Features

### 💬 Intelligent Chat Interface
- **Natural Language Commands**: Simply type commands like "Move to downtown area" or "Scan the perimeter"
- **Real-time AI Responses**: Sophisticated AI processing with realistic response delays
- **Professional Chat UI**: Clean, modern interface with message history and timestamps

### 🗺️ Live Drone Tracking
- **Interactive Map**: Real-time visualization of drone position using Leaflet maps
- **Flight Path Visualization**: See the complete route with dynamic path rendering  
- **Coverage Area Display**: Visual representation of drone surveillance radius
- **GPS Coordinates**: Precise latitude/longitude tracking with live updates

### 📹 Simulated Drone Camera
- **4K Live Feed Simulation**: Professional camera interface with telemetry overlay
- **Target Recognition**: Automatic target detection and tracking simulation
- **Real-time Telemetry**: Live altitude, speed, battery, temperature, and wind data
- **Recording Interface**: Authentic camera controls with recording indicators

### 🎯 Autonomous Mission Execution
- **Command Processing**: Intelligent interpretation of user commands
- **Status Updates**: Real-time mission progress and drone status
- **Professional Feedback**: Detailed responses showing AI decision-making

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd DominionOS

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

- **Frontend**: React 18+ with Hooks
- **Styling**: Styled Components with modern CSS
- **Mapping**: Leaflet & React-Leaflet
- **Icons**: Lucide React
- **Build Tool**: Vite for fast development
- **Responsive Design**: Mobile and desktop optimized

## 📱 User Experience

### Command Examples
- "Move to downtown area" → Initiates autonomous flight with GPS navigation
- "Scan the perimeter" → Activates area surveillance mode
- "Return home" → Auto-landing sequence with mission data saving
- "Check status" → Complete system diagnostics report

### Visual Feedback
- **Real-time Map Updates**: Watch drone movement with smooth animations
- **Professional Telemetry**: Live data feeds showing all drone metrics
- **Status Indicators**: Clear visual feedback for all system states
- **Recording Interface**: Authentic camera feed with target tracking

## 🎨 Design Philosophy

- **Investor-Ready**: Professional appearance suitable for business presentations
- **Intuitive Interface**: No training required - natural language commands
- **Real-time Feedback**: Immediate visual confirmation of all actions
- **Smooth Animations**: Polished transitions and responsive interactions

## 📈 Business Impact

This simulation demonstrates:
- **Accessibility**: Anyone can command advanced AI drones
- **Efficiency**: Natural language replaces complex controls
- **Professional Grade**: Enterprise-ready interface design
- **Scalability**: Expandable to multiple drone management

## 🔧 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```


*Built with React, passion, and the vision to revolutionize drone operations.*

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
