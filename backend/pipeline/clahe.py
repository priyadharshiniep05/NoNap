import cv2
import numpy as np

def enhance(frame: np.ndarray) -> tuple[np.ndarray, str]:
    """
    Apply CLAHE adaptive preprocessing.
    Returns:
        (enhanced_frame, lighting_condition)
    """
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l_channel, a, b = cv2.split(lab)
    mean_L = np.mean(l_channel)

    if mean_L < 80:
        lighting_condition = "dark"
        clip_limit = 4.0
    elif mean_L < 140:
        lighting_condition = "moderate"
        clip_limit = 3.0
    else:
        lighting_condition = "bright"
        return frame, lighting_condition

    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8, 8))
    cl = clahe.apply(l_channel)
    limg = cv2.merge((cl, a, b))
    enhanced_frame = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    return enhanced_frame, lighting_condition
