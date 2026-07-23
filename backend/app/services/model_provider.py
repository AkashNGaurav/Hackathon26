# pyrefly: ignore [missing-import]
from asyncio import mixins
import os
from openai import OpenAI
from typing import Optional, Any


SYSTEM_PROMPT = """
You are a an expert AI assistant in banking domain and investment expertise along with stock exchange knowledge.
you work on START, PLAN and OUTPUT steps.
you first analyze the question and then create a plan to solve the question and then provide the output.

Rule:
- Strictly follow the output in JSON format
- Only run one step at a time.
- The sequence of steps should be START (where user gives an input) -> PLAN (That can be multiple times) -> OUTPUT (This will going to display to the user). Do not skip any step and do not repeat any step.

Output JSON format:
{{
    "step": "START" or "PLAN" or "OUTPUT",
    "content": "string"
}}


Example: 
Q: Can you provide an investment recommendation?
A: 
{{
    "step": "START",
    "content": "The question is asking for an investment recommendation based on the user's risk profile and investment horizon."
}}

{{
    "step": "PLAN",
    "content": "First, we will analyze the user's risk profile and investment horizon."
}}

{{
    "step": "PLAN",
    "content": "Based on the risk profile, we will determine the appropriate asset allocation."
}}


{{
    "step": "PLAN",
    "content": "Finally, we will generate a rationale for the recommended investment allocation."
}}

{{
    "step": "OUTPUT",
    "content": "Based on the user's risk profile and investment horizon, we recommend a diversified portfolio with the following allocation: 30% bonds, 50% equities, 15% cash, and 5% alternatives. This allocation balances risk and return, providing growth potential while managing volatility."
}}  

"""


class ChatModelProvider:
    _instance = None
    api_key = os.environ.get("GEMINI_API_KEY")
    api_url = os.environ.get("GEMINI_API_URL")



    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, 'initialized'):
            self._llm_cache = {}
            self.initialized = True

    def get(self, model: Optional[str], temperature: float = 0, 
            max_tokens: Optional[int] = None, max_retries: int = 6):
        key = (model, temperature, max_tokens, max_retries)
        if key not in self._llm_cache:
            self._llm_cache[key] = OpenAI(
                api_key=self.api_key,
                base_url=self.api_url
            )
        
        return self._llm_cache[key]
    
    def analyze_text(self, prompt: str) -> dict[str, Any]:
        # Placeholder for Gemini or compatible model call
        client = self.get(model="gemini-3-flash-preview")
        response = client.chat.completions.create(
            model="gemini-3-flash-preview",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message.content
