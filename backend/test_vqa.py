import os
import glob
from core.vqa import BLIPVQA

frames_dir = "temp_frames"
live_frames = glob.glob(os.path.join(frames_dir, "live_*.jpg"))
latest_frame = max(live_frames, key=os.path.getctime)

print(f"Testing on {latest_frame}")

blip = BLIPVQA.get_instance()
q1 = "how many have finger"
q2 = "how many fingers are shown"
q3 = "what is the person doing"

for q in [q1, q2, q3]:
    ans = blip.answer_question(latest_frame, q, "00:00")
    print(f"Q: {q}")
    print(f"A: {ans}")
