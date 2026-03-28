import os
from typing import TypedDict
from langgraph.graph import StateGraph, END
from groq import Groq
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

from config import config

# Initialize Groq client
client = Groq(api_key=config.GROQ_API_KEY)

# ==========================================
# 1. AUDIO TRANSCRIPTION
# ==========================================
def transcribe_audio(audio_path):
    """Transcribe user audio to text using Groq's whisper-large-v3 model."""
    print(f"Starting transcription for {audio_path}...")
    with open(audio_path, "rb") as file:
        transcription = client.audio.transcriptions.create(
            file=file,
            model="whisper-large-v3",
            response_format="text"
        )
    return transcription

# ==========================================
# 2. LANGGRAPH STATE DEFINITION
# ==========================================
class AgentState(TypedDict):
    transcript: str      # The full video transcript
    question: str        # User's query
    blip_context: str    # Visual answer from BLIP (if any)
    llm_response: str    # The final combined answer from the LLM

# ==========================================
# 3. GRAPH NODES
# ==========================================
def generate_final_answer(state: AgentState):
    """
    Node that synthesizes the final answer using Groq LLM.
    It takes the video transcript, the user question, and the visual context from BLIP.
    """
    transcript = state.get("transcript", "")
    question = state.get("question", "")
    blip_context = state.get("blip_context", "")

    prompt = f"""You are a helpful and intelligent AI video assistant.
The user is asking a question about a uploaded video.

Visual Context (from a relevant frame):
{blip_context}

Full Audio Transcript of the video:
{transcript if transcript else "(No spoken audio detected)"}

User's Question:
{question}

Based on both the visual context and the video's transcript, provide a concise and comprehensive answer to the user's question. 
If they ask for a summary, summarize the transcript and visual context. 
If they ask about a specific detail, find it in the transcript or visual context.
"""
    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a direct and helpful video analysis assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_completion_tokens=500,
        )
        answer = completion.choices[0].message.content
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        answer = "I'm sorry, I encountered an error while trying to analyze the video text."

    return {"llm_response": answer}

# ==========================================
# 4. BUILD THE GRAPH
# ==========================================
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("generate_answer", generate_final_answer)

# Add edges 
workflow.set_entry_point("generate_answer")
workflow.add_edge("generate_answer", END)

# Compile graph
graph_app = workflow.compile()

# ==========================================
# 5. ENTRY POINT FOR API INTEGRATION
# ==========================================
def run_qa_graph(transcript: str, question: str, blip_context: str = "") -> str:
    """
    Entry point to be called by main.py
    """
    initial_state = AgentState(
        transcript=transcript,
        question=question,
        blip_context=blip_context,
        llm_response=""
    )
    
    print(f"--- Running LangGraph QA. Question: {question} ---")
    final_state = graph_app.invoke(initial_state)
    return final_state.get("llm_response", "")

