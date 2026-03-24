from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os

from dotenv import load_dotenv
load_dotenv()

os.environ["HF_TOKEN"] = os.getenv("HF_TOKEN")

from core.video_processor import extract_frames
from core.embedding import CLIPEmbedder
from core.vqa import BLIPVQA
from core.database import VectorDBWrapper

from fastapi.staticfiles import StaticFiles

app = FastAPI(title="VIQA AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "temp_uploads"
FRAMES_DIR = "temp_frames"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(FRAMES_DIR, exist_ok=True)
app.mount("/frames", StaticFiles(directory=FRAMES_DIR), name="frames")

@app.on_event("startup")
def startup_event():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(FRAMES_DIR, exist_ok=True)
    print("Pre-loading ML Models in background...")
    # These singletons will download weights on first run
    try:
        CLIPEmbedder.get_instance()
        BLIPVQA.get_instance()
    except Exception as e:
        print(f"Warning during model warmup: {e}")

@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    if not file.filename.endswith((".mp4", ".webm", ".avi", ".mkv")):
        raise HTTPException(400, "Invalid video format")
        
    video_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Extract
    frames_info = extract_frames(video_path, FRAMES_DIR, target_fps=1)
    
    # Store
    db = VectorDBWrapper()
    db.reset_collection()
    clip = CLIPEmbedder.get_instance()
    
    for i, frame in enumerate(frames_info):
        emb = clip.embed_image(frame["path"])
        db.store_frame(
            frame_id=f"frame_{i}",
            embedding=emb,
            metadata={"path": frame["path"], "timestamp": frame["timestamp"]}
        )
        
    return {"status": "success", "message": f"Successfully processed {len(frames_info)} frames.", "frames": len(frames_info)}

class QueryRequest(BaseModel):
    question: str

@app.post("/api/query")
async def query_video(req: QueryRequest):
    question = req.question
    if not question.strip():
        raise HTTPException(400, "Question is empty")
        
    clip = CLIPEmbedder.get_instance()
    query_emb = clip.embed_text(question)
    
    db = VectorDBWrapper()
    results = db.search(query_emb, n_results=1)
    
    if not results or not results["ids"][0]:
        raise HTTPException(404, "No relevant frames found")
        
    best_metadata = results["metadatas"][0][0]
    frame_path = best_metadata["path"]
    timestamp = best_metadata["timestamp"]
    
    blip = BLIPVQA.get_instance()
    answer = blip.answer_question(frame_path, question, timestamp)
    
    frame_filename = os.path.basename(frame_path)
    
    return {
        "timestamp": timestamp,
        "answer": answer,
        "frame": f"http://127.0.0.1:8000/frames/{frame_filename}"
    }
