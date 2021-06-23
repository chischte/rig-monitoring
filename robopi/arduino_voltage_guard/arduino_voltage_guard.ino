//#include <Insomnia.h>

// PINS:
const byte VOLTAGE_PIN = A0;

void setup() {
  Serial.begin(9600);
  pinMode(VOLTAGE_PIN, INPUT);
  
}
//*****************************************************************************
//********************#*********#####***#####***######*************************
//********************#********#*****#*#*****#**#*****#************************
//********************#********#*****#*#*****#**######*************************
//********************#********#*****#*#*****#**#******************************
//********************#######***#####***#####***#******************************
//*****************************************************************************
void loop() {

  const float ratioVoltageDivider = 3.0;
  const float arduinoMaxVoltage = 5.0; //[V]
  float measuredVoltage = float(analogRead(VOLTAGE_PIN)) / 1023.0 * arduinoMaxVoltage * ratioVoltageDivider;
  const float calibrationFactor=12.04/12.9; // to calibrate the measurement with a voltage meter

  measuredVoltage=measuredVoltage*calibrationFactor;

  const float numberOfSerialLipos = 3.0; // 3.0 = 3S Lipo
  float cellVoltage = measuredVoltage / numberOfSerialLipos;


  const float minVoltage = 3.71; // minimum voltage per cell
  const float capacityFactor = 227.3; // capacity in percent per volt over minVoltage
  float capacity = (cellVoltage - minVoltage) * capacityFactor;

  const float smoothingFactor = 5.0;
  static float smoothedCapacity;
  smoothedCapacity = (smoothedCapacity * (smoothingFactor - 1) + capacity) / smoothingFactor;

  if (smoothedCapacity > 100) {
    smoothedCapacity = 100;
  }
  if (smoothedCapacity < 0) {
    smoothedCapacity = 0;
  }

  //Serial.print(measuredVoltage,2);
  //Serial.println("V");
  Serial.println(int(smoothedCapacity));
  //Serial.println("%");

  delay(1000);
}

