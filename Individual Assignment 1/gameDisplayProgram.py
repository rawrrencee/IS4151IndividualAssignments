import serial
import time

print("Listening on COM7... Press CTRL+C to exit")

try:
	ser = serial.Serial(port='COM7', baudrate=115200, timeout=1)

	while True:
		msg = ser.readline()
		smsg = msg.decode('utf-8').strip()
		if len(smsg) > 0:
			print('RX:{}'.format(smsg))
			ser.write(b'Ack\r\n')
		time.sleep(1)

except KeyboardInterrupt:
	if ser.is_open:
		ser.close()
	print("Program terminated!")