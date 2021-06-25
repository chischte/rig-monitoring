#python3
#use "websocket-client" install: pip3 install websocket-client

import websocket 
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)

# pin definitions:
ENA_L = 13 #
ENA_R = 12
DIR_L1 = 6
DIR_L2 = 5
DIR_R1 = 24
DIR_R2 = 25

GPIO.setup(ENA_L, GPIO.OUT)
GPIO.setup(ENA_R, GPIO.OUT)
GPIO.setup(DIR_L1, GPIO.OUT)
GPIO.setup(DIR_L2, GPIO.OUT)
GPIO.setup(DIR_R1, GPIO.OUT)
GPIO.setup(DIR_R2, GPIO.OUT)

ENA_L_PWM = GPIO.PWM(13, 1000)
ENA_R_PWM = GPIO.PWM(12, 1000)

ws = websocket.create_connection("ws://10.10.20.161:8083")

sendPrefix = "ROBOT"
sendPlaceholder = ""
sendMessage = "ROBOT CONNECTED"
"""the placeholders are because the ws string has to have 4 elements at the moment"""
ws.send(sendPrefix + ","+sendPlaceholder+","+sendPlaceholder+"," + sendMessage)

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" SPLIT GPIO STING """
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
def setDirL(dirL):
    if dirL==1:
        GPIO.output(DIR_L1, GPIO.HIGH)
        GPIO.output(DIR_L2, GPIO.LOW)
    else:
        GPIO.output(DIR_L1, GPIO.LOW)
        GPIO.output(DIR_L2, GPIO.HIGH)
        
def setDirR(dirR):
    if dirR==1:
        GPIO.output(DIR_R1, GPIO.HIGH)
        GPIO.output(DIR_R2, GPIO.LOW)
    else:
        GPIO.output(DIR_R1, GPIO.LOW)
        GPIO.output(DIR_R2, GPIO.HIGH)
        


def splitGpio(gpioString):
    gpioList = (gpioString.split(','))
    if gpioList[0] == "GPIO":
        direction = (gpioList[1])
        boost = (gpioList[2])
        gadget = (gpioList[3])
        print("DIRECTION: "+direction+" BOOST: "+boost+" GADGET: "+gadget)
        if direction == "STOP":
            ENA_L_PWM.stop()
            ENA_R_PWM.stop()
            ws.send("ROBOT, , ,ROBO SAYS: BORING")
        
        elif boost == "BOOST":
            ws.send("ROBOT, , ,ROBO SAYS: YEAH BABY!")
            setDirL(1)
            setDirR(1)
            ENA_L_PWM.start(100)
            ENA_R_PWM.start(100)
        
        elif direction =="FWD":
            ws.send("ROBOT, , ,ROBO SAYS: OKY")
            setDirL(1)
            setDirR(1)
            ENA_L_PWM.start(80)
            ENA_R_PWM.start(80)
                          
        elif direction =="BWD":
            ws.send("ROBOT, , ,ROBO SAYS: OKY")
            setDirL(0)
            setDirR(0)
            ENA_L_PWM.start(80)
            ENA_R_PWM.start(80)
            
        elif direction =="ROT-L":
            ws.send("ROBOT, , ,ROBO SAYS: OKY")
            setDirL(0)
            setDirR(1)
            ENA_L_PWM.start(100)
            ENA_R_PWM.start(100)
            
        elif direction =="ROT-R":
            ws.send("ROBOT, , ,ROBO SAYS: OKY")
            setDirL(1)
            setDirR(0)
            ENA_L_PWM.start(100)
            ENA_R_PWM.start(100)
            
        elif direction =="FWD-L":
            ws.send("ROBOT, , ,ROBO SAYS: OKY")
            setDirL(1)
            setDirR(1)
            ENA_L_PWM.start(0)
            ENA_R_PWM.start(100)
        
        elif direction =="FWD-R":
            ws.send("ROBOT, , ,ROBO SAYS: OKY")
            setDirL(1)
            setDirR(1)
            ENA_L_PWM.start(100)
            ENA_R_PWM.start(0)
            
        elif direction =="BWD-L":
            ws.send("ROBOT, , ,ROBO SAYS: OKY")
            setDirL(0)
            setDirR(0)
            ENA_L_PWM.start(0)
            ENA_R_PWM.start(100)
        
        elif direction =="BWD-R":
            ws.send("ROBOT, , ,ROBO SAYS: OKY")
            setDirL(0)
            setDirR(0)
            ENA_L_PWM.start(100)
            ENA_R_PWM.start(0)
            
      
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" LOOP """
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
while 1:
    gpioString = ws.recv()
    """print(gpioString)"""
    splitGpio(gpioString)
   