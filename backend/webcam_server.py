import cv2
import time
import asyncio
import websockets
import json
import threading
import queue

def stream_webcam():
    # Initialize Camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    # Thread-safe state and frame sharing
    current_state = {"state": "ALERT", "ear": 0.0, "mar": 0.0, "bbox": [], "landmarks": []}
    frame_queue = queue.Queue(maxsize=1)
    running = True

    # Run WebSocket client in a thread with reconnection logic
    def ws_thread():
        async def connect():
            uri = "ws://localhost:8765/detection"
            while running:
                try:
                    print(f"Connecting to {uri}...")
                    async with websockets.connect(uri) as websocket:
                        print("Connected to backend.")
                        while running:
                            if not frame_queue.empty():
                                frame = frame_queue.get()
                                # Encode and send frame
                                _, buffer = cv2.imencode('.jpg', frame)
                                await websocket.send(buffer.tobytes())
                                
                                # Receive and update state
                                try:
                                    resp = await asyncio.wait_for(websocket.recv(), timeout=0.1)
                                    data = json.loads(resp)
                                    current_state.update(data)
                                except asyncio.TimeoutError:
                                    pass 
                            else:
                                await asyncio.sleep(0.01)
                except Exception as e:
                    print(f"WS Connection lost ({e}). Retrying in 2s...")
                    await asyncio.sleep(2)
                
        asyncio.run(connect())
        
    ws_worker = threading.Thread(target=ws_thread, daemon=True)
    ws_worker.start()
    
    print("Starting preview... Press 'q' to quit.")
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Resize for consistent processing
            processed_frame = cv2.resize(frame, (640, 480))
            
            # Update queue for the sender thread
            if frame_queue.full():
                try: frame_queue.get_nowait()
                except queue.Empty: pass
            frame_queue.put(processed_frame)
            
            # Create display copy with overlays
            display_frame = processed_frame.copy()
            
            # Draw Face Bounding Box
            bbox = current_state.get("bbox", [])
            if len(bbox) == 4:
                x1, y1, x2, y2 = bbox
                # Color changes based on state
                color = (0, 255, 0) if current_state["state"] == "ALERT" else (0, 165, 255) if current_state["state"] == "CAUTION" else (0, 0, 255)
                cv2.rectangle(display_frame, (x1, y1), (x2, y2), color, 2)
                
            # Draw Landmarks
            landmarks = current_state.get("landmarks", [])
            for pt in landmarks:
                cv2.circle(display_frame, (int(pt[0]), int(pt[1])), 1, (255, 255, 0), -1)
                
            # UI Text Overlays
            cv2.putText(display_frame, f"EAR: {current_state.get('ear', 0):.3f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)
            cv2.putText(display_frame, f"MAR: {current_state.get('mar', 0):.3f}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)
            state_text = current_state.get('state', 'UNKNOWN')
            cv2.putText(display_frame, f"STATE: {state_text}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255) if state_text == 'DROWSY' else (255,255,255), 2)

            cv2.imshow("NoNap Webcam Local Dev Preview", display_frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        running = False
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    stream_webcam()
