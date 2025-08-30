#!/bin/bash
cd C:\Users\robgo\sispac-app\sispac-app || exit
git add .
git commit -m "Commit automático: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
