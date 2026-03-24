import cv2
import os

def extract_frames(video_path: str, output_dir: str, target_fps: int = 1) -> list:
    """
    Extracts frames from a video file at a specified frames per second (fps).
    Saves the extracted frames as JPEG images in `output_dir`.
    Returns a list of dicts with path and timestamp information.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")
        
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    if video_fps == 0:
        video_fps = 30 # fallback if metadata is missing
        
    frame_interval = max(1, int(video_fps / target_fps))
    
    extracted_frames = []
    frame_count = 0
    saved_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            timestamp_sec = frame_count / video_fps
            minutes = int(timestamp_sec // 60)
            seconds = int(timestamp_sec % 60)
            time_str = f"{minutes:02d}:{seconds:02d}"
            
            frame_name = f"frame_{saved_count:04d}.jpg"
            frame_path = os.path.join(output_dir, frame_name)
            
            # Save frame to disk
            cv2.imwrite(frame_path, frame)
            
            extracted_frames.append({
                "path": frame_path,
                "timestamp": time_str,
                "seconds": timestamp_sec
            })
            saved_count += 1
            
        frame_count += 1
        
    cap.release()
    return extracted_frames
