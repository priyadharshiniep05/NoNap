def generate_alert_payload(state, ear, mar, fatigue_prob, blink_count, yawn_count, lighting, fps, bbox, landmarks):
    """
    Generates the final payload to be sent over WebSocket.
    """
    import datetime
    return {
        "ear": ear,
        "mar": mar,
        "fatigue_prob": round(fatigue_prob, 4),
        "state": state,
        "blink_count": blink_count,
        "yawn_count": yawn_count,
        "lighting": lighting,
        "fps": round(fps, 1),
        "bbox": bbox,
        "landmarks": landmarks,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
