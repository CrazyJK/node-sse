#!/bin/sh

export NODE_ENV=production

PID_FILE="./noti.pid"
LOG_DIR="./logs"
SSE_NOHUP_LOG="$LOG_DIR/nohup.log"

RUN_CMD="node ./app"

if [ -f $PID_FILE ]; then
	echo "Notificator SSE Server is Already Running!!"
	exit 1
else
	echo "Notificator SSE Server initializing..."
	nohup sh -c "exec $RUN_CMD >> $SSE_NOHUP_LOG 2>&1" > /dev/null &
	echo $! > $PID_FILE
	echo "Notificator SSE Server is running pid="`cat $PID_FILE`
fi

exit 0
