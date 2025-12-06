import os
import re
from typing import List, Dict
import google.generativeai as genai
from app.core.config import settings

# Configure the Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

class TranslatorAgent:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro') # Using gemini-pro for text tasks

    def _extract_code_blocks(self, text: str) -> (str, Dict[str, str]):
        """
        Extracts code blocks from the text and replaces them with placeholders.
        Returns the text with placeholders and a dictionary mapping placeholders to code blocks.
        """
        code_blocks = {}
        # Regex to find fenced code blocks (```language\ncode\n```)
        pattern = re.compile(r'(```.*?```)', re.DOTALL)
        
        def replace_code(match):
            placeholder = f"__CODE_BLOCK_{len(code_blocks)}__"
            code_blocks[placeholder] = match.group(1)
            return placeholder
            
        text_without_code = pattern.sub(replace_code, text)
        return text_without_code, code_blocks

    def _insert_code_blocks(self, text: str, code_blocks: Dict[str, str]) -> str:
        """
        Inserts code blocks back into the translated text.
        """
        for placeholder, code_block in code_blocks.items():
            text = text.replace(placeholder, code_block)
        return text

    async def translate_to_urdu(self, content: str) -> str:
        """
        Translates English content to Urdu, preserving code blocks.
        """
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")

        # 1. Extract code blocks
        content_without_code, extracted_code_blocks = self._extract_code_blocks(content)

        # 2. Translate text without code
        prompt = f"Translate the following English text to Urdu. Maintain the original formatting like paragraphs, bullet points, and headings:\n\n{content_without_code}"
        
        try:
            response = await self.model.generate_content_async(prompt)
            translated_text = response.text
        except Exception as e:
            print(f"Error calling Gemini API for translation: {e}")
            raise

        # 3. Insert code blocks back
        final_translated_content = self._insert_code_blocks(translated_text, extracted_code_blocks)
        
        return final_translated_content
