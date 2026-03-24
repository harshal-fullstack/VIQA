from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import os

class CLIPEmbedder:
    """
    A unified wrapper for the CLIP model to create dense vector representations
    of both text and images in the same latent space using HuggingFace.
    """
    
    _instance = None
    
    @classmethod
    def get_instance(cls, model_name="openai/clip-vit-base-patch32"):
        if cls._instance is None:
            print(f"Loading CLIP model: {model_name}. This may take a minute...")
            cls._instance = cls(model_name)
        return cls._instance

    def __init__(self, model_name="openai/clip-vit-base-patch32"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = CLIPModel.from_pretrained(model_name).to(self.device)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        
    def embed_image(self, image_path: str) -> list:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
            
        image = Image.open(image_path)
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        with torch.no_grad():
            outputs = self.model.get_image_features(pixel_values=inputs['pixel_values'])
            image_features = outputs if isinstance(outputs, torch.Tensor) else outputs.pooler_output
            image_features /= image_features.norm(dim=-1, keepdim=True)
        return image_features[0].cpu().tolist()
        
    def embed_text(self, text: str) -> list:
        inputs = self.processor(text=[text], padding=True, return_tensors="pt").to(self.device)
        with torch.no_grad():
            outputs = self.model.get_text_features(input_ids=inputs['input_ids'], attention_mask=inputs['attention_mask'])
            text_features = outputs if isinstance(outputs, torch.Tensor) else outputs.pooler_output
            text_features /= text_features.norm(dim=-1, keepdim=True)
        return text_features[0].cpu().tolist()
