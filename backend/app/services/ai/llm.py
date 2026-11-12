import json
import re
from typing import Optional, Any
import httpx
from fastapi import HTTPException
from app.core.config import settings


def clean_json_string(raw: str) -> str:
    """Strip code fences and extract JSON from LLM response."""
    text = raw.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    return text


async def call_gemini(prompt: str, system_prompt: str = "") -> Optional[dict]:
    """Call Google Gemini API."""
    if not settings.LLM_API_KEY:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.LLM_API_KEY}"
    full_prompt = f"{system_prompt}\n\nPlease respond ONLY with valid JSON.\n\n{prompt}"
    payload = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {"response_mime_type": "application/json"}
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"Gemini API status {resp.status_code}: {resp.text}"
            )
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        cleaned = clean_json_string(text)
        return json.loads(cleaned)


async def call_openai_compatible(prompt: str, system_prompt: str = "") -> Optional[dict]:
    """Call OpenAI-compatible API (NVIDIA NIM, local models, etc.)."""
    if not settings.LLM_API_KEY or not settings.LLM_BASE_URL:
        return None

    url = f"{settings.LLM_BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.LLM_API_KEY}",
        "Content-Type": "application/json"
    }
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": f"{prompt}\n\nPlease respond ONLY with valid JSON."})
    payload = {
        "model": settings.LLM_MODEL,
        "messages": messages,
        "response_format": {"type": "json_object"},
        "temperature": 0.1,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"OpenAI-compatible API status {resp.status_code}: {resp.text}"
            )
        data = resp.json()
        text = data["choices"][0]["message"]["content"]
        cleaned = clean_json_string(text)
        return json.loads(cleaned)


async def call_llm_json(prompt: str, system_prompt: str = "") -> Optional[dict]:
    """
    Provider-agnostic LLM call with one retry.
    Returns parsed JSON dict or None (mock mode).
    Includes ai_mode in response for UI honesty.
    """
    provider = settings.LLM_PROVIDER.lower()

    if provider == "mock" or not settings.LLM_API_KEY:
        return None

    last_error = None
    for attempt in range(2):  # one retry
        try:
            if provider == "gemini":
                result = await call_gemini(prompt, system_prompt)
            elif provider == "openai_compatible":
                result = await call_openai_compatible(prompt, system_prompt)
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Unknown LLM_PROVIDER: {provider}. Use 'mock', 'gemini', or 'openai_compatible'."
                )

            if result is not None:
                result["ai_mode"] = provider
            return result

        except HTTPException:
            raise
        except Exception as e:
            last_error = str(e)
            if attempt == 1:
                raise HTTPException(
                    status_code=502,
                    detail=f"AI service ({provider}) returned invalid JSON or encountered an error: {last_error}"
                )

    raise HTTPException(
        status_code=502,
        detail=f"AI service ({provider}) unavailable: {last_error}"
    )