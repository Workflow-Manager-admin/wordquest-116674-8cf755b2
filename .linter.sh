#!/bin/bash
cd /home/kavia/workspace/code-generation/wordquest-116674-8cf755b2/frontend_ui
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

