from scipy.spatial import distance as dist

def compute_ear(eye_landmarks) -> float:
    # Compute Euclidean distances between vertical eye landmarks
    A = dist.euclidean(eye_landmarks[1], eye_landmarks[5])
    B = dist.euclidean(eye_landmarks[2], eye_landmarks[4])
    # Compute Euclidean distance between horizontal eye landmarks
    C = dist.euclidean(eye_landmarks[0], eye_landmarks[3])
    # EAR equation
    ear = (A + B) / (2.0 * C)
    return ear

def compute_mar(mouth_landmarks) -> float:
    # For dlib 68, top lip (62->index 62-48=14 in mouth slice), bottom lip (66->18)
    # left corner (48->0), right corner (54->6)
    # The mouth landmarks are from 48 to 67.
    A = dist.euclidean(mouth_landmarks[14], mouth_landmarks[18]) # 62 and 66
    C = dist.euclidean(mouth_landmarks[0], mouth_landmarks[6]) # 48 and 54
    mar = A / C if C > 0 else 0
    return mar

def calculate(landmarks) -> tuple[float, float]:
    """
    Compute EAR and MAR based on 68 dlib landmarks.
    Return (ear, mar) rounded to 4 decimal places.
    """
    if len(landmarks) < 68:
        return 0.0, 0.0

    left_eye = landmarks[36:42]
    right_eye = landmarks[42:48]
    mouth = landmarks[48:68]

    left_ear = compute_ear(left_eye)
    right_ear = compute_ear(right_eye)
    
    ear = (left_ear + right_ear) / 2.0
    mar = compute_mar(mouth)

    return round(ear, 4), round(mar, 4)
