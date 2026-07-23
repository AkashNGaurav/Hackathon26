from fastapi import Request
from fastapi.params import Depends
from app.schemas import LLMConfig
from app import db as db_module

def get_db():
    db = db_module.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_llm(request: Request, llm_config: LLMConfig = Depends()):
    services = getattr(request.app.state, "services", None)
    if services is None or getattr(services, "agent", None) is None:
        return None
    return services.agent.get(
        llm_config.model,
        llm_config.temperature,
        llm_config.max_tokens,
        llm_config.max_retries,
    )