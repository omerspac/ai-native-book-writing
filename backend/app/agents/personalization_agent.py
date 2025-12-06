import os
import re
from typing import Dict, Any
import google.generativeai as genai
from app.core.config import settings
from app.models.user import UserProfile # To get the UserProfile model for type hinting

# Configure the Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

class PersonalizationAgent:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro') # Using gemini-pro for text tasks

    async def personalize_content(self, content: str, user_profile: UserProfile) -> str:
        """
        Personalizes English content based on user profile using Gemini API.
        """
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")

        # Construct a detailed prompt for personalization
        prompt = f"""
        You are an expert content personalizer. Your task is to modify the following technical content
        to better suit a user with the specified background and interests.

        User Profile:
        - Software Level: {user_profile.software_level if user_profile.software_level else 'Not specified'}
        - Hardware Level: {user_profile.hardware_level if user_profile.hardware_level else 'Not specified'}
        - Field of Interest: {user_profile.interest_field if user_profile.interest_field else 'Not specified'}

        Guidelines for Personalization:
        - If the user's software/hardware level is 'Beginner', simplify complex technical terms,
          provide more introductory explanations, and offer analogies.
        - If 'Intermediate', provide more detail on concepts, expand on examples, and discuss trade-offs.
        - If 'Advanced', focus on advanced concepts, performance implications, optimization, and cutting-edge research.
        - If 'Not specified', maintain a general, accessible tone.
        - Tailor examples or explanations to the user's 'Field of Interest' where relevant.
        - Maintain the original structure and formatting (headings, bullet points, code blocks, etc.).
        - DO NOT translate the content. Keep it in English.

        Original Content:
        ```
        {content}
        ```

        Personalized Content:
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            personalized_text = response.text
        except Exception as e:
            print(f"Error calling Gemini API for personalization: {e}")
            raise

        return personalized_text
