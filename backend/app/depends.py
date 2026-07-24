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


def get_llm(request: Request, llm_config: LLMConfig = Depends()):
    services = getattr(request.app.state, "services", None)
    if services is None or getattr(services, "agent", None) is None:
        from app.services.model_provider import ChatModelProvider
        agent = ChatModelProvider()
    else:
        agent = services.agent

    return agent.get(
        llm_config.model,
        llm_config.temperature,
        llm_config.max_tokens,
        llm_config.max_retries,
    )


def get_model_provider(request: Request) -> ChatModelProvider:
    services = getattr(request.app.state, "services", None)
    if services is None or getattr(services, "agent", None) is None:
        return ChatModelProvider()
    return services.agent

