#python3
#use "websocket-client" install: pip3 install websocket-client

import websocket 
import serial

lipoGuard=serial.Serial("/dev/ttyUSB0",9600)  #change ACM number as found from ls /dev/tty/ACM*
lipoGuard.baudrate=9600

ws = websocket.create_connection("ws://10.10.20.161:8083")

def sendLipoInfo(capacity):
    sendPrefix = "LIPO"
    sendPlaceholder = ""
    sendMessage = batteryCapacity
    """the placeholders are because the ws string has to have 4 elements at the moment"""
    ws.send(sendPrefix + ","+sendPlaceholder+","+sendPlaceholder+"," + sendMessage)

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" LOOP """
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
while 1:
   
    """print battery capacity"""
    batteryCapacity=lipoGuard.readline()
    batteryCapacity=batteryCapacity.decode('ASCII')
    print(batteryCapacity)
    sendLipoInfo(batteryCapacity)

