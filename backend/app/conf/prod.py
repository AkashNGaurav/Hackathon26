from app.services.model_provider import ChatModelProvider
from dataclasses import dataclass, field
import os

@dataclass
class Services:
    agent: ChatModelProvider = field(init=False)

    async def initialize(self):
        self.agent = ChatModelProvider(os.environ.get("GEMINI_API_URL"),
        os.environ.get("GEMINI_API_KEY"))
        print("✅ ChatModelProvider initialized successfully")
