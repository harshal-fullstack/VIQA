from core.embedding import CLIPEmbedder
import cv2
import numpy as np

# Create a dummy image
img = np.zeros((224, 224, 3), dtype=np.uint8)
cv2.imwrite("dummy.jpg", img)

clip = CLIPEmbedder.get_instance()
print("Embedding Image...")
emb = clip.embed_image("dummy.jpg")
print("Image Embedding Success! Length:", len(emb))

print("Embedding Text...")
temb = clip.embed_text("Hello world")
print("Text Embedding Success! Length:", len(temb))
