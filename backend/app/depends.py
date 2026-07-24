from fastapi import Request
from fastapi.params import Depends
from app.schemas import LLMConfig
from app import db as db_module
from app.services.model_provider import ChatModelProvider

def get_db():
    db = db_module.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_llm(request: Request, llm_config: LLMConfig = Depends()) -> "OpenAI":
    client: "OpenAI" = request.app.state.services.agent
    return client.get(llm_config.model,
                      llm_config.temperature,
                      llm_config.max_tokens,
                      llm_config.max_retries)

def get_model_provider(request: Request) -> ChatModelProvider:
    return request.app.state.services.agent
