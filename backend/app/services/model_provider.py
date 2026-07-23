# pyrefly: ignore [missing-import]
import json
import os
from dotenv import load_dotenv
from openai import OpenAI
from mem0 import Memory
from typing import Optional, Any

load_dotenv()

MODEL_CONFIG = {
    "version": "v1.1",
    "llm": {
        "provider": "gemini",
        "config": {
            "model": "gemini-3-flash-preview",
            "api_key": os.environ.get("GEMINI_API_KEY")
        }
    },
    "embedder": {
        "provider": "gemini",
        "config": {
            "model": "models/gemini-embedding-001",
            "api_key": os.environ.get("GEMINI_API_KEY")
        }
    },
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "host": "localhost",
            "port": 6333,
            "embedding_model_dims": 768
        }
    }
}

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
    memory_client = Memory.from_config(MODEL_CONFIG)

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
    
    def get_memory(self, user_id: str, prompt: str) -> str:
        """
        Get the memory associated to the user regarding the investments.
        Here, system will try and devise the investment style by nature of
        conversations and other discussions of the particular user.
        :param user_id: UserID of the user trying to prompt
        :param prompt: Prompt given by the user
        :return: String containing the memory of the user
        """
        search_memory = self.memory_client.search(user_id=user_id, query=prompt)
        if search_memory:
            memories = [
                f"ID: {memory.id}\nMemory: {memory.text}" for memory in search_memory.get("results")
            ]
            print("Memory found for user", user_id)
            return f"""Here is the context about the user: {json.dumps(memories)}"""
        print("Memory not found for user", user_id)
        return ""

    def add_memory(self, ai_response: str, user_prompt: str, user_id: str) -> bool:
        """
        Adds memory for the particular prompt and keeps it ready for the next response
        :param ai_response: AI response to be added to memory
        :param user_prompt: User prompt to be added to memory
        :param user_id: User ID of the user
        :return: True if memory is added successfully, False otherwise
        """
        try:
            self.memory_client.add(
                user_id=user_id, 
                messages=[
                    {"role": "user", "content": user_prompt},
                    {"role": "assistant", "content": ai_response}
                ]
            )
            return True
        except Exception as e:
            print("Error adding memory:", e)
            return False

    def analyze_text(self, prompt: str, user_id: str) -> dict[str, Any]:
        # Placeholder for Gemini or compatible model call
        client = self.get(model="gemini-3-flash-preview")
        memory = self.get_memory(user_id=user_id, prompt=prompt)
        response = client.chat.completions.create(
            model="gemini-3-flash-preview",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT + memory},
                {"role": "user", "content": prompt}
            ]
        )
        ai_response = response.choices[0].message.content
        self.add_memory(user_id=user_id, user_prompt=prompt, ai_response=ai_response)
        return ai_response
    
    def chat(self, system_prompt: str, messages: list[dict[str, str]], user_id: str="") -> str:
        client = self.get(model="gemini-3-flash-preview")
        prompt = "".join([message["content"] for message in messages])
        memory = self.get_memory(user_id=user_id, prompt=prompt)
        response = client.chat.completions.create(
            model="gemini-3-flash-preview",
            messages=[{"role": "system", "content": system_prompt + memory}, *messages],
        )
        ai_response = response.choices[0].message.content
        self.add_memory(ai_response=ai_response, user_prompt=prompt, user_id=user_id)
        return (ai_response or "I could not generate a response.").strip()
