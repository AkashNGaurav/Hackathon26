# pyrefly: ignore [missing-import]
from asyncio import mixins
from openai import OpenAI
from typing import Optional


class ChatModelProvider:
    def __init__(self, api_url, api_key):
        self.api_url = api_url
        self.api_key = api_key
        self._llm_cache = {}

    def get(self, model: Optional[str], temperature: float = 0, 
            max_tokens: Optional[int] = None, max_retries: int = 6):
        key = (model, temperature, max_tokens, max_retries)
        if key not in self._llm_cache:
            self._llm_cache[key] = OpenAI(
                api_key=self.api_key,
                base_url=self.api_url
            )
        
        return self._llm_cache[key]
