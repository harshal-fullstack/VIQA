from core.embedding import CLIPEmbedder
from core.vqa import BLIPVQA

print("Testing CLIP Embedder init...")
clip = CLIPEmbedder.get_instance()
print("CLIP Embedder initialized.")

print("Testing BLIP VQA init...")
blip = BLIPVQA.get_instance()
print("BLIP VQA initialized.")

print("All models loaded successfully!")
