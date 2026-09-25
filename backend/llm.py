from google import genai
import os
import time
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_answer(question, context):

    prompt = f"""
You are an AI Study Assistant.

Answer the user's question using only the provided study material.

Study Material:
{context}

Question:
{question}

Instructions:
- Give a clear and concise answer.
- Use the study material as the source.
- Do not invent information.
- If the answer is not present in the study material, say:
  "The answer is not available in the uploaded study material."
"""

    for attempt in range(3):

        try:

            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt
            )

            return response.text

        except Exception as e:

            error_message = str(e)

            # Gemini temporary server error
            if "503" in error_message or "UNAVAILABLE" in error_message:

                if attempt < 2:
                    time.sleep(3)
                    continue

                return (
                    "Gemini is temporarily unavailable. "
                    "Please try again in a few moments."
                )

            # Gemini quota exceeded
            if "429" in error_message or "RESOURCE_EXHAUSTED" in error_message:

                return (
                    "Gemini API quota has been reached. "
                    "Please try again after the quota resets."
                )

            raise e