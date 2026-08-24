import os
from dotenv import dotenv_values
from groq import Groq

env = dotenv_values('c:/Users/ASUS/VIQA/.env')
api_key = env.get('GROQ_API_KEY')
print("API KEY:", api_key[:5] if api_key else "None")

try:
    client = Groq(api_key=api_key)
    completion = client.chat.completions.create(
        messages=[{"role": "user", "content": "test"}],
        model="qwen/qwen3.6-27b"
    )
    print("SUCCESS:", completion.choices[0].message.content)
except Exception as e:
    print("ERROR:", str(e))
