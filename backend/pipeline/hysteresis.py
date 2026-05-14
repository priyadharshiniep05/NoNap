from collections import deque

class HysteresisBuffer:
    def __init__(self, ear_threshold=0.25, mar_threshold=0.6,
                 frames_drowsy=15, frames_yawn=5, buffer_size=30):
        self.ear_threshold = ear_threshold
        self.mar_threshold = mar_threshold
        self.frames_drowsy = frames_drowsy
        self.frames_yawn = frames_yawn
        
        self.ear_buffer = deque(maxlen=buffer_size)
        self.mar_buffer = deque(maxlen=buffer_size)
        
        self.drowsy_counter = 0
        self.yawn_counter = 0
        self.caution_counter = 0
        
        self.state = "ALERT"  # "ALERT" | "CAUTION" | "DROWSY"
        self.blink_count = 0
        self.yawn_count = 0
        
        self.is_blink = False
        self.is_yawn = False

    def update(self, ear: float, mar: float) -> str:
        self.ear_buffer.append(ear)
        self.mar_buffer.append(mar)
        
        # Blink tracking (very simplistic)
        if ear < self.ear_threshold:
            if not self.is_blink:
                self.is_blink = True
                self.blink_count += 1
        else:
            self.is_blink = False
            
        # Yawn tracking
        if mar > self.mar_threshold:
            if not self.is_yawn:
                self.is_yawn = True
                self.yawn_count += 1
            self.yawn_counter += 1
        else:
            self.is_yawn = False
            self.yawn_counter = 0

        # State machine
        if ear < self.ear_threshold:
            self.drowsy_counter += 1
        else:
            if self.state == "DROWSY" and ear >= 0.30:
                self.drowsy_counter = max(0, self.drowsy_counter - 1)
            elif self.state != "DROWSY":
                self.drowsy_counter = 0

        if ear < 0.30 and ear >= self.ear_threshold:
            self.caution_counter += 1
        else:
            if self.state != "DROWSY":
                self.caution_counter = 0

        # Transitions
        if self.drowsy_counter >= self.frames_drowsy:
            self.state = "DROWSY"
        elif self.state == "DROWSY" and self.drowsy_counter <= 5: # Need to recover to reset
            self.state = "CAUTION"
        elif self.caution_counter >= 5 and self.state != "DROWSY":
            self.state = "CAUTION"
        elif self.state == "CAUTION" and self.caution_counter == 0 and self.drowsy_counter == 0:
            self.state = "ALERT"

        return self.state
