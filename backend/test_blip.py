from transformers import BlipProcessor, BlipForQuestionAnswering, T5Tokenizer, T5ForConditionalGeneration
from PIL import Image
import torch
import numpy as np

device = "cuda" if torch.cuda.is_available() else "cpu"
processor = BlipProcessor.from_pretrained("Salesforce/blip-vqa-base")
model = BlipForQuestionAnswering.from_pretrained("Salesforce/blip-vqa-base").to(device)

t5_tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-small")
t5_model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-small").to(device)

img = Image.fromarray(np.zeros((224, 224, 3), dtype=np.uint8))
question = "What color is the car?"
timestamp = "01:23"

# Simulate raw answer
with torch.no_grad():
    inputs = processor(img, question, return_tensors="pt").to(device)
    out = model.generate(**inputs)
    raw_answer = processor.decode(out[0], skip_special_tokens=True)

if not raw_answer:
    raw_answer = "black"

# Format
prompt = f"Convert to a sentence: The answer is '{raw_answer}' at timestamp {timestamp}."
with torch.no_grad():
    input_ids = t5_tokenizer(prompt, return_tensors="pt").input_ids.to(device)
    outputs = t5_model.generate(input_ids, max_new_tokens=50)
    formatted = t5_tokenizer.decode(outputs[0], skip_special_tokens=True)

print(f"Raw answer: {raw_answer}")
print(f"Formatted answer: {formatted}")
