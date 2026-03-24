from transformers import BlipProcessor, BlipForQuestionAnswering, T5Tokenizer, T5ForConditionalGeneration
from PIL import Image
import torch
import os

class BLIPVQA:
    """
    Wrapper for Salesforce/blip-vqa-base. Given an image and a question,
    generates a natural language answer, and formats it using a small LLM.
    """
    
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            print("Loading BLIP VQA model and T5 Formatter. This will take some time...")
            cls._instance = cls()
        return cls._instance
        
    def __init__(self, model_name="Salesforce/blip-vqa-base"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.processor = BlipProcessor.from_pretrained(model_name)
        self.model = BlipForQuestionAnswering.from_pretrained(model_name).to(self.device)
        
        self.t5_tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-small")
        self.t5_model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-small").to(self.device)
        
    def answer_question(self, image_path: str, question: str, timestamp: str) -> str:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
            
        raw_image = Image.open(image_path).convert('RGB')
        
        inputs = self.processor(raw_image, question, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            out = self.model.generate(**inputs, max_new_tokens=20)
            
        raw_answer = self.processor.decode(out[0], skip_special_tokens=True)
        
        prompt = f"Convert to a sentence: The answer is '{raw_answer}' at timestamp {timestamp}."
        with torch.no_grad():
            input_ids = self.t5_tokenizer(prompt, return_tensors="pt").input_ids.to(self.device)
            outputs = self.t5_model.generate(input_ids, max_new_tokens=50)
            formatted_answer = self.t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
            
        return formatted_answer

