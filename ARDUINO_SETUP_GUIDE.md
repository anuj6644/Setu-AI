# 🤖 Arduino to React Integration - Complete Setup Guide

## 📋 **Overview**
This guide will help you set up a complete Arduino sensor system that feeds real-time data to your React simulation in JSON format.

## 🔧 **Hardware Requirements**

### **Basic Setup (Minimum)**
- Arduino Uno/Nano/ESP32
- USB cable
- Breadboard and jumper wires
- Computer with Arduino IDE installed

### **Sensor Components**
1. **Strain Gauge System**:
   - HX711 Load Cell Amplifier
   - Strain gauge/load cell
   - 4 connecting wires

2. **Vibration Sensor**:
   - SW-420 Vibration Sensor (or similar)
   - 3 connecting wires

3. **Temperature Sensor**:
   - DS18B20 Digital Temperature Sensor
   - 4.7kΩ pull-up resistor
   - 3 connecting wires

4. **Optional - Accelerometer**:
   - MPU6050 6-axis accelerometer/gyroscope
   - I2C connection (4 wires)

### **Additional Components**
- LED (13mm) for status indicator
- 10kΩ resistors (2-3 pieces)
- Capacitors (100nF ceramic, 10µF electrolytic)

## 🔌 **Wiring Diagram**

```
Arduino Uno Connections:
┌─────────────────────────────────────────────┐
│  HX711 (Strain Gauge)                      │
│  VDD  → 5V                                 │
│  VCC  → 5V                                 │
│  GND  → GND                                │
│  DT   → Digital Pin 2                      │
│  SCK  → Digital Pin 3                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  SW-420 Vibration Sensor                   │
│  VCC  → 5V                                 │
│  GND  → GND                                │
│  DO   → Digital Pin 4                      │
│  AO   → Analog Pin A0                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  DS18B20 Temperature Sensor                │
│  VDD  → 5V                                 │
│  GND  → GND                                │
│  DATA → Digital Pin 5 (with 4.7kΩ pullup) │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Status LED                                 │
│  Anode  → Digital Pin 13                   │
│  Cathode → GND (through 220Ω resistor)     │
└─────────────────────────────────────────────┘
```

## 📦 **Software Setup**

### **Step 1: Install Arduino IDE**
1. Download Arduino IDE from [arduino.cc](https://www.arduino.cc/en/software)
2. Install and open Arduino IDE
3. Connect your Arduino via USB
4. Select your board: `Tools > Board > Arduino Uno`
5. Select your port: `Tools > Port > COMx` (Windows)

### **Step 2: Install Required Libraries**
In Arduino IDE, go to `Tools > Manage Libraries` and install:

1. **ArduinoJson** (by Benoit Blanchon)
2. **HX711** (by Bogdan Necula)
3. **OneWire** (by Jim Studt)
4. **DallasTemperature** (by Miles Burton)
5. **MPU6050** (optional, by Electronic Cats)

### **Step 3: Upload Arduino Code**
1. Copy the code from `arduino/sensor_reader.ino`
2. Paste it into a new Arduino sketch
3. Verify the code: `Sketch > Verify/Compile`
4. Upload to Arduino: `Sketch > Upload`
5. Open Serial Monitor: `Tools > Serial Monitor`
6. Set baud rate to `115200`

### **Step 4: Test Arduino Output**
You should see JSON output like this:
```json
{
  "infrastructure_id": "BRIDGE_001",
  "location": "Delhi Metro Bridge",
  "timestamp": 1642680123456,
  "status": "normal",
  "sensors": {
    "strain": 850.5,
    "vibration": 2.3,
    "temperature": 25.7,
    "accelerometer": {
      "x": 0.1,
      "y": -0.2,
      "z": 9.8
    }
  },
  "system": {
    "uptime": 1234,
    "free_memory": 1456,
    "battery_level": 95
  }
}
```

## 🖥️ **Backend Server Setup**

### **Step 1: Install Node.js**
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install Node.js (includes npm)
3. Verify installation: `node --version` and `npm --version`

### **Step 2: Setup Backend Server**
```bash
# Navigate to project directory
cd C:\Users\agope\OneDrive\Desktop\Coding\sihprac\Setu-AI

# Create backend directory (if not exists)
mkdir backend
cd backend

# Install dependencies
npm install express cors ws serialport @serialport/parser-readline

# Start the server
npm start
```

### **Step 3: Run Backend Server**
```bash
cd backend
node server.js
```

You should see:
```
🚀 Setu AI Backend Server running on port 3001
📡 WebSocket server running on port 8080
🌐 API available at: http://localhost:3001/api/sensor-data
✅ Connected to Arduino on COM3
```

## 🌐 **React Frontend Integration**

### **Step 1: Start React Development Server**
```bash
# In project root directory
npm run dev
```

### **Step 2: Access Arduino Simulation**
Navigate to: `http://localhost:8081/arduino`

## 🎯 **Usage Instructions**

### **Arduino Commands**
You can send commands to Arduino through the React interface or API:

1. **Calibrate Strain Gauge**:
   - Click "📏 Calibrate" button in React app
   - Or send `TARE` command via serial

2. **Check Status**:
   - Click "📊 Status" button
   - Or send `STATUS` command via serial

3. **Manual Calibration**:
   - Send `CALIBRATE` command
   - Place known weight on strain gauge
   - Send `WEIGHT:1000` (replace 1000 with actual weight in grams)

### **Data Flow**
```
Arduino → Serial JSON → Node.js Server → WebSocket → React App
                     ↓
                  REST API (fallback)
```

## 🔍 **Troubleshooting**

### **Arduino Not Detected**
1. Check USB connection
2. Install Arduino drivers
3. Try different USB port
4. Check COM port in Device Manager (Windows)
5. Restart Arduino IDE

### **Serial Communication Issues**
1. Verify baud rate (115200)
2. Close Serial Monitor before uploading code
3. Check for conflicting serial connections
4. Restart Arduino after upload

### **Sensor Reading Problems**
1. **Strain Gauge**: Check HX711 wiring, calibrate sensor
2. **Vibration**: Verify sensor sensitivity setting
3. **Temperature**: Check DS18B20 address, pull-up resistor

### **Backend Connection Issues**
1. Check Node.js installation
2. Verify port availability (3001, 8080)
3. Check Windows Firewall settings
4. Restart backend server

### **React Connection Problems**
1. Verify backend server is running
2. Check WebSocket connection in browser console
3. Test REST API endpoint: `http://localhost:3001/api/sensor-data`
4. Clear browser cache

## 📊 **Sensor Calibration**

### **Strain Gauge Calibration**
```cpp
// In Arduino code, adjust these values:
const float STRAIN_CALIBRATION_FACTOR = 2280.0; // Adjust based on your sensor
const long STRAIN_OFFSET = 0;

// Calibration steps:
// 1. Upload code with no load on sensor
// 2. Send TARE command to zero the scale
// 3. Place known weight (e.g., 1kg)
// 4. Send WEIGHT:1000 command
// 5. Note the calibration factor in output
// 6. Update STRAIN_CALIBRATION_FACTOR in code
```

### **Vibration Sensor Setup**
```cpp
// Adjust sensitivity in code:
const float VIBRATION_SENSITIVITY = 0.5; // Increase for more sensitivity

// Test vibration detection:
// 1. Upload code
// 2. Gently tap or shake the sensor
// 3. Monitor serial output for vibration readings
// 4. Adjust sensitivity as needed
```

### **Temperature Calibration**
```cpp
// DS18B20 is pre-calibrated, but you can add offset:
float temperature = temperatureSensor.getTempCByIndex(0) + TEMP_OFFSET;
const float TEMP_OFFSET = 0.0; // Adjust if needed
```

## 🚀 **Advanced Features**

### **Adding More Sensors**
1. Connect additional sensors to available pins
2. Add sensor reading code in `readSensorData()` function
3. Update JSON output in `outputJSONData()` function
4. Modify React interface to display new data

### **Wireless Communication**
Replace Arduino Uno with ESP32 for WiFi capabilities:
```cpp
// Add WiFi libraries
#include <WiFi.h>
#include <WebSocketsClient.h>

// Connect to WiFi and send data directly to React app
```

### **Data Logging**
Add SD card module to log sensor data:
```cpp
#include <SD.h>
// Log data to SD card for later analysis
```

### **Multiple Infrastructure Points**
- Use multiple Arduino setups
- Assign unique `infrastructure_id` to each
- Backend server can handle multiple serial connections

## 📝 **Expected Output**

### **Arduino Serial Monitor**
```json
{"status":"ready","message":"All sensors initialized successfully"}
{"infrastructure_id":"BRIDGE_001","location":"Delhi Metro Bridge","timestamp":1642680123456,"status":"normal","sensors":{"strain":856.2,"vibration":1.8,"temperature":24.3,"accelerometer":{"x":0,"y":0,"z":0}},"system":{"uptime":1234,"free_memory":1456,"battery_level":95}}
```

### **React App Features**
- ✅ Real-time 3D model animation based on sensor data
- ✅ Live data display with status colors
- ✅ Connection status indicator
- ✅ Arduino control buttons (calibrate, status)
- ✅ Data history chart
- ✅ System information display

Your Arduino sensor system is now fully integrated with the React simulation! 🎉

## 🆘 **Need Help?**
- Check Arduino Serial Monitor for error messages
- Verify all connections match the wiring diagram
- Test each sensor individually
- Monitor backend server console for connection status
- Use browser developer tools to check WebSocket connection
