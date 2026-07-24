# pyrefly: ignore [missing-import]
import json
import os
import logging
from dotenv import load_dotenv
from openai import OpenAI
from typing import Optional, Any

try:
    from mem0 import Memory
except Exception:
    Memory = None

logger = logging.getLogger(__name__)
load_dotenv()


MODEL_CONFIG = {
    "version": "v1.1",
    "llm": {
        "provider": "gemini",
        "config": {
            "model": os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
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
            "host": os.getenv("QDRANT_HOST", "localhost"),
            "port": int(os.getenv("QDRANT_PORT", "6333")),
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

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, 'initialized'):
            self._llm_cache = {}
            self._memory_client = None
            self._memory_init_attempted = False
            self.initialized = True

    @property
    def api_key(self) -> str:
        return os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY") or ""

    @property
    def api_url(self) -> Optional[str]:
        url = os.environ.get("GEMINI_API_URL")
        if not url and (os.environ.get("GEMINI_API_KEY") or self.api_key.startswith("AIza")):
            return "https://generativelanguage.googleapis.com/v1beta/openai/"
        return url or None

    @property
    def memory_client(self) -> Optional[Any]:
        if not self._memory_init_attempted:
            self._memory_init_attempted = True
            if Memory is not None:
                try:
                    self._memory_client = Memory.from_config(MODEL_CONFIG)
                except Exception as e:
                    host = MODEL_CONFIG["vector_store"]["config"]["host"]
                    port = MODEL_CONFIG["vector_store"]["config"]["port"]
                    print(f"[Mem0 Warning] Could not connect to Qdrant vector store at {host}:{port} ({e}). Memory features disabled.")
                    self._memory_client = None
            else:
                self._memory_client = None
        return self._memory_client

    def get(self, model: Optional[str] = None, temperature: float = 0, 
            max_tokens: Optional[int] = None, max_retries: int = 6):
        current_api_key = self.api_key or "dummy_key_for_testing"
        current_api_url = self.api_url
        key = (model, temperature, max_tokens, max_retries, current_api_key, current_api_url)
        if key not in self._llm_cache:
            try:
                self._llm_cache[key] = OpenAI(
                    api_key=current_api_key,
                    base_url=current_api_url
                )
            except Exception as exc:
                logger.error("Failed to initialize OpenAI client with base_url=%s: %s", current_api_url, exc)
                self._llm_cache[key] = None
        
        return self._llm_cache[key]

    
    def get_memory(self, user_id: str, prompt: str) -> str:
        """
        Get the memory associated to the user regarding the investments.
        """
        if not user_id or not self.memory_client:
            return ""

        try:
            search_memory = self.memory_client.search(user_id=user_id, query=prompt)
            if search_memory and isinstance(search_memory, dict) and search_memory.get("results"):
                memories = [
                    f"ID: {memory.id}\nMemory: {memory.text}" for memory in search_memory.get("results")
                ]
                print("Memory found for user", user_id)
                return f"""Here is the context about the user: {json.dumps(memories)}"""
        except Exception as e:
            print(f"Error fetching memory for user {user_id}:", e)
        return ""

    def add_memory(self, ai_response: str, user_prompt: str, user_id: str) -> bool:
        """
        Adds memory for the particular prompt and keeps it ready for the next response
        """
        if not user_id or not self.memory_client:
            return False

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
            print(f"Error adding memory for user {user_id}:", e)
            return False

    def analyze_text(self, prompt: str, user_id: str) -> dict[str, Any]:
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        client = self.get(model=model_name)
        memory = self.get_memory(user_id=user_id, prompt=prompt)
        try:
            response = client.chat.completions.create(
                model=model_name,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT + memory},
                    {"role": "user", "content": prompt}
                ]
            )
        except Exception as exc:
            if model_name != "gemini-3.6-flash":
                logger.warning("Primary model %s failed (%s), trying gemini-3.6-flash fallback", model_name, exc)
                fallback_client = self.get(model="gemini-3.6-flash")
                response = fallback_client.chat.completions.create(
                    model="gemini-3.6-flash",
                    response_format={"type": "json_object"},
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT + memory},
                        {"role": "user", "content": prompt}
                    ]
                )
            else:
                raise exc

        ai_response = response.choices[0].message.content
        self.add_memory(user_id=user_id, user_prompt=prompt, ai_response=ai_response)
        return ai_response
    
    def chat(self, system_prompt: str, messages: list[dict[str, str]], user_id: str="") -> str:
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        client = self.get(model=model_name)
        prompt = "".join([message["content"] for message in messages if isinstance(message, dict) and "content" in message])
        memory = self.get_memory(user_id=user_id, prompt=prompt)
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "system", "content": system_prompt + memory}, *messages],
            )
        except Exception as exc:
            if model_name != "gemini-3.6-flash":
                logger.warning("Primary model %s failed (%s), trying gemini-3.6-flash fallback", model_name, exc)
                fallback_client = self.get(model="gemini-3.6-flash")
                response = fallback_client.chat.completions.create(
                    model="gemini-3.6-flash",
                    messages=[{"role": "system", "content": system_prompt + memory}, *messages],
                )
            else:
                raise exc

        ai_response = response.choices[0].message.content
        self.add_memory(ai_response=ai_response, user_prompt=prompt, user_id=user_id)
        return (ai_response or "I could not generate a response.").strip()
