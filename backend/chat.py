import os
from google import genai
from google.genai.types import *
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def ask_gemini(question: str, image_b64: str = None):
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)

        if image_b64:
             system_instruction = """
            You are the CHIMERA-01 onboard AI assistant. You are currently connected to the single astronaut on board the deep-space probe. 
            The situation is CRITICAL. The probe has suffered a failure.
            
            Your mission is to provide multispectral diagnosis and guidance.
            You can see what the astronaut sees. Analyze the images provided for anomalies, damage, or technical data.
            
            GUARDRAILS:
            - Maintain a calm, authoritative, and operational tone.
            - Be precise and concise. Minimizing cognitive load is priority #1.
            - Answer ONLY based on visual evidence or technical knowledge.
            - Do not use markdown formatting (no bold/italic).
            - Reply in clear English.
            """
             
             contents = [
                f"User Question: {question}",
                Part.from_bytes(
                    data=image_b64,
                    mime_type="image/jpeg",
                ),
            ]
        else:
            # Text-only mode
            system_instruction = """
            You are the CHIMERA-01 onboard AI assistant. You are communicating with the astronaut.
            The situation is CRITICAL.
            
            GUARDRAILS:
            - Maintain a calm, authoritative, and operational tone.
            - Be concise.
            - Do not use markdown formatting.
            """
            contents = [question]

        response_text = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,
                max_output_tokens=1000,
                response_mime_type="text/plain",
            ),
        )

        return response_text.text

    except Exception as e:
        return f"Error communicating with Gemini: {str(e)}"
