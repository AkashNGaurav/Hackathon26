from typing import Any


def safe_json(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {k: safe_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [safe_json(v) for v in obj]
    if isinstance(obj, float):
        return round(obj, 4)
    return obj
