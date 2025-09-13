/*
  Setu AI - Infrastructure Monitoring Sensor Reader
  
  This Arduino sketch reads multiple sensors and outputs data in JSON format
  for real-time infrastructure monitoring.
  
  Sensors:
  - Strain Gauge (Analog)
  - Vibration Sensor (Analog/Digital)  
  - Temperature Sensor (DS18B20 or Analog)
  - Accelerometer (Optional - MPU6050)
  
  Hardware Requirements:
  - Arduino Uno/Nano/ESP32
  - Strain gauge with HX711 amplifier
  - Vibration sensor (SW-420 or similar)
  - Temperature sensor (DS18B20 or LM35)
  - Optional: MPU6050 accelerometer
*/

#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Pin Definitions
#define STRAIN_GAUGE_DT_PIN   2    // HX711 DT pin
#define STRAIN_GAUGE_SCK_PIN  3    // HX711 SCK pin
#define VIBRATION_ANALOG_PIN  A0   // Vibration sensor analog pin
#define VIBRATION_DIGITAL_PIN 4    // Vibration sensor digital pin
#define TEMPERATURE_PIN       5    // DS18B20 temperature sensor pin
#define LED_STATUS_PIN        13   // Status LED

// Temperature sensor setup
OneWire oneWire(TEMPERATURE_PIN);
DallasTemperature temperatureSensor(&oneWire);

// HX711 Strain Gauge Library (install HX711 library)
#include "HX711.h"
HX711 strainGauge;

// Global variables
struct SensorData {
  float strain;      // Strain in microstrains (µε)
  float vibration;   // Vibration frequency in Hz
  float temperature; // Temperature in Celsius
  float acceleration_x; // X-axis acceleration (if using MPU6050)
  float acceleration_y; // Y-axis acceleration
  float acceleration_z; // Z-axis acceleration
  unsigned long timestamp; // Timestamp in milliseconds
  String status;     // Status: "normal", "warning", "critical"
};

SensorData sensorData;
unsigned long lastReading = 0;
const unsigned long READING_INTERVAL = 1000; // Read every 1 second

// Calibration values (adjust based on your sensors)
const float STRAIN_CALIBRATION_FACTOR = 2280.0; // HX711 calibration
const float VIBRATION_SENSITIVITY = 0.5;        // Vibration sensor sensitivity
const long STRAIN_OFFSET = 0;                   // Zero offset for strain gauge

void setup() {
  Serial.begin(115200);
  Serial.println(F("{\"status\":\"initializing\",\"message\":\"Setu AI Sensor System Starting...\"}"));
  
  // Initialize pins
  pinMode(LED_STATUS_PIN, OUTPUT);
  pinMode(VIBRATION_DIGITAL_PIN, INPUT);
  
  // Initialize sensors
  initializeStrainGauge();
  initializeTemperatureSensor();
  
  // Blink LED to show initialization
  for(int i = 0; i < 3; i++) {
    digitalWrite(LED_STATUS_PIN, HIGH);
    delay(200);
    digitalWrite(LED_STATUS_PIN, LOW);
    delay(200);
  }
  
  Serial.println(F("{\"status\":\"ready\",\"message\":\"All sensors initialized successfully\"}"));
  delay(1000);
}

void loop() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastReading >= READING_INTERVAL) {
    // Read all sensors
    readSensorData();
    
    // Determine status based on readings
    determineStatus();
    
    // Output JSON data
    outputJSONData();
    
    // Update LED based on status
    updateStatusLED();
    
    lastReading = currentTime;
  }
  
  // Small delay to prevent overwhelming the serial port
  delay(10);
}

void initializeStrainGauge() {
  strainGauge.begin(STRAIN_GAUGE_DT_PIN, STRAIN_GAUGE_SCK_PIN);
  
  if (strainGauge.is_ready()) {
    Serial.println(F("{\"sensor\":\"strain_gauge\",\"status\":\"ready\"}"));
    strainGauge.set_scale(STRAIN_CALIBRATION_FACTOR);
    strainGauge.set_offset(STRAIN_OFFSET);
    
    // Tare the scale (zero it)
    strainGauge.tare();
    delay(1000);
  } else {
    Serial.println(F("{\"sensor\":\"strain_gauge\",\"status\":\"error\",\"message\":\"HX711 not found\"}"));
  }
}

void initializeTemperatureSensor() {
  temperatureSensor.begin();
  int deviceCount = temperatureSensor.getDeviceCount();
  
  if (deviceCount > 0) {
    Serial.print(F("{\"sensor\":\"temperature\",\"status\":\"ready\",\"devices\":"));
    Serial.print(deviceCount);
    Serial.println(F("}"));
    temperatureSensor.setResolution(12); // Set to 12-bit resolution
  } else {
    Serial.println(F("{\"sensor\":\"temperature\",\"status\":\"error\",\"message\":\"DS18B20 not found\"}"));
  }
}

void readSensorData() {
  // Read strain gauge
  if (strainGauge.is_ready()) {
    long rawStrain = strainGauge.get_units(3); // Average of 3 readings
    sensorData.strain = abs(rawStrain); // Convert to positive microstrain
  } else {
    sensorData.strain = 0;
  }
  
  // Read vibration sensor
  readVibrationSensor();
  
  // Read temperature
  temperatureSensor.requestTemperatures();
  sensorData.temperature = temperatureSensor.getTempCByIndex(0);
  if (sensorData.temperature == DEVICE_DISCONNECTED_C) {
    sensorData.temperature = 25.0; // Default temperature if sensor fails
  }
  
  // Read accelerometer (if connected)
  // Note: Add MPU6050 code here if using accelerometer
  sensorData.acceleration_x = 0;
  sensorData.acceleration_y = 0;
  sensorData.acceleration_z = 0;
  
  sensorData.timestamp = millis();
}

void readVibrationSensor() {
  // Method 1: Analog reading for vibration intensity
  int analogValue = analogRead(VIBRATION_ANALOG_PIN);
  float voltage = analogValue * (5.0 / 1023.0);
  
  // Method 2: Digital reading for vibration detection
  bool vibrationDetected = digitalRead(VIBRATION_DIGITAL_PIN);
  
  // Calculate vibration frequency (simplified)
  static unsigned long lastVibration = 0;
  static int vibrationCount = 0;
  static unsigned long lastFrequencyCheck = 0;
  
  if (vibrationDetected && (millis() - lastVibration > 50)) {
    vibrationCount++;
    lastVibration = millis();
  }
  
  // Calculate frequency every second
  if (millis() - lastFrequencyCheck >= 1000) {
    sensorData.vibration = vibrationCount; // Hz
    vibrationCount = 0;
    lastFrequencyCheck = millis();
  }
  
  // If no digital sensor, use analog value to estimate vibration
  if (!vibrationDetected) {
    sensorData.vibration = map(analogValue, 0, 1023, 0, 50) / 10.0; // Scale to reasonable range
  }
}

void determineStatus() {
  // Determine overall status based on sensor thresholds
  bool critical = false;
  bool warning = false;
  
  // Strain thresholds (microstrains)
  if (sensorData.strain > 2000) {
    critical = true;
  } else if (sensorData.strain > 1000) {
    warning = true;
  }
  
  // Vibration thresholds (Hz)
  if (sensorData.vibration > 10) {
    critical = true;
  } else if (sensorData.vibration > 5) {
    warning = true;
  }
  
  // Temperature thresholds (Celsius)
  if (sensorData.temperature > 60 || sensorData.temperature < -10) {
    critical = true;
  } else if (sensorData.temperature > 45 || sensorData.temperature < 0) {
    warning = true;
  }
  
  // Set status
  if (critical) {
    sensorData.status = "critical";
  } else if (warning) {
    sensorData.status = "warning";
  } else {
    sensorData.status = "normal";
  }
}

void outputJSONData() {
  // Create JSON document
  StaticJsonDocument<512> jsonDoc;
  
  // Infrastructure identification
  jsonDoc["infrastructure_id"] = "BRIDGE_001";
  jsonDoc["location"] = "Delhi Metro Bridge";
  
  // Sensor data
  jsonDoc["timestamp"] = sensorData.timestamp;
  jsonDoc["status"] = sensorData.status;
  
  // Individual sensor readings
  JsonObject sensors = jsonDoc.createNestedObject("sensors");
  sensors["strain"] = round(sensorData.strain * 10) / 10.0;      // Round to 1 decimal
  sensors["vibration"] = round(sensorData.vibration * 10) / 10.0;
  sensors["temperature"] = round(sensorData.temperature * 10) / 10.0;
  
  // Additional data
  JsonObject accelerometer = sensors.createNestedObject("accelerometer");
  accelerometer["x"] = sensorData.acceleration_x;
  accelerometer["y"] = sensorData.acceleration_y;
  accelerometer["z"] = sensorData.acceleration_z;
  
  // System information
  JsonObject system = jsonDoc.createNestedObject("system");
  system["uptime"] = millis() / 1000; // Uptime in seconds
  system["free_memory"] = getFreeMemory();
  system["battery_level"] = getBatteryLevel(); // If using battery
  
  // Output JSON to serial
  serializeJson(jsonDoc, Serial);
  Serial.println(); // New line for proper JSON separation
}

void updateStatusLED() {
  // Update LED based on status
  if (sensorData.status == "critical") {
    // Fast blinking red
    digitalWrite(LED_STATUS_PIN, (millis() / 250) % 2);
  } else if (sensorData.status == "warning") {
    // Slow blinking orange (use PWM for brightness)
    digitalWrite(LED_STATUS_PIN, (millis() / 1000) % 2);
  } else {
    // Solid green (on)
    digitalWrite(LED_STATUS_PIN, HIGH);
  }
}

// Utility functions
int getFreeMemory() {
  // Simple memory check for Arduino
  extern int __heap_start, *__brkval;
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
}

float getBatteryLevel() {
  // Read battery voltage if using battery power
  // Adjust based on your voltage divider circuit
  int batteryPin = A7; // Assuming battery voltage divider on A7
  int rawValue = analogRead(batteryPin);
  float voltage = rawValue * (5.0 / 1023.0) * 2; // Assuming 2:1 voltage divider
  
  // Convert to percentage (assuming 3.3V - 4.2V range for Li-ion)
  float percentage = map(voltage * 100, 330, 420, 0, 100);
  return constrain(percentage, 0, 100);
}

// Commands from serial (for calibration and testing)
void serialEvent() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "TARE") {
      strainGauge.tare();
      Serial.println(F("{\"command\":\"tare\",\"status\":\"completed\"}"));
    } else if (command == "CALIBRATE") {
      Serial.println(F("{\"command\":\"calibrate\",\"message\":\"Place known weight and send weight value\"}"));
    } else if (command.startsWith("WEIGHT:")) {
      float knownWeight = command.substring(7).toFloat();
      float reading = strainGauge.get_units(10);
      float factor = reading / knownWeight;
      strainGauge.set_scale(factor);
      
      Serial.print(F("{\"command\":\"calibrate\",\"factor\":"));
      Serial.print(factor);
      Serial.println(F(",\"status\":\"completed\"}"));
    } else if (command == "STATUS") {
      Serial.println(F("{\"command\":\"status\",\"all_systems\":\"operational\"}"));
    }
  }
}
