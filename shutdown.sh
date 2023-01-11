#!/bin/sh

PID_FILE="./noti.pid"
LOG_DIR="./logs"
SSE_NOHUP_LOG="$LOG_DIR/nohup.log"


if [ ! -f $PID_FILE ]; then
	echo "Notificator SSE Server is Not Running!!"
	exit 1
else
	PID=`cat $PID_FILE 2>/dev/null`
	echo "Shutting down Notificator SSE Server: $PID"
	kill $PID 2>/dev/null
	sleep 2
	kill -9 $PID 2>/dev/null
	rm -f $PID_FILE
	echo "STOPPED `date`" >>$SSE_NOHUP_LOG
fi

exit 0