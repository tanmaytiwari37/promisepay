import json
import re
from typing import Optional, Any
import httpx
from fastapi import HTTPException
from app.core.config import settings


def clean_json_string(raw: str) -> str:
    text = raw.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    return text


async def call_llm_json(prompt: str, system_prompt: str = "") -> Optional[dict]:
    if settings.LLM_PROVIDER == "mock" or not settings.LLM_API_KEY:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.LLM_API_KEY}"
    full_prompt = f"{system_prompt}\n\nPlease respond ONLY with valid JSON.\n\n{prompt}"
    payload = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {"response_mime_type": "application/json"}
    }

    last_error = None
    for attempt in range(2):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code != 200:
                    last_error = f"Gemini API status {resp.status_code}: {resp.text}"
                    continue
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                cleaned = clean_json_string(text)
                return json.loads(cleaned)
        except Exception as e:
            last_error = str(e)
            if attempt == 1:
                raise HTTPException(
                    status_code=502,
                    detail=f"AI service returned invalid JSON or encountered an error: {last_error}"
                )

    raise HTTPException(
        status_code=502,
        detail=f"AI service unavailable: {last_error}"
    )
