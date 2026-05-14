import subprocess
import os
import time

def start_backend():
    print("Starting Backend...")
    cwd = "/Users/priyadharshiniprasanna/Desktop/NoNap/backend"
    with open("backend.log", "w") as log:
        subprocess.Popen(["python3", "main.py"], cwd=cwd, stdout=log, stderr=log)

def start_website():
    print("Starting Website...")
    cwd = "/Users/priyadharshiniprasanna/Desktop/NoNap/website"
    with open("website.log", "w") as log:
        subprocess.Popen(["npm", "run", "dev"], cwd=cwd, stdout=log, stderr=log)

if __name__ == "__main__":
    start_backend()
    start_website()
    print("Services started in background.")
    time.sleep(2)
