import time
import uuid
from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException
from app.core.config import settings

_token_cache: Dict[str, Any] = {
    "token": None,
    "expires_at": 0
}


async def get_access_token() -> str:
    if settings.PAYPAL_MODE == "mock" or not settings.PAYPAL_CLIENT_ID or not settings.PAYPAL_CLIENT_SECRET:
        return "mock_access_token_xyz"

    now = time.time()
    if _token_cache["token"] and _token_cache["expires_at"] > now + 60:
        return _token_cache["token"]

    url = f"{settings.PAYPAL_BASE_URL}/v1/oauth2/token"
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            resp = await client.post(
                url,
                data={"grant_type": "client_credentials"},
                auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
                headers={"Accept": "application/json", "Accept-Language": "en_US"}
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail=f"PayPal authentication failed: {resp.text}"
                )
            data = resp.json()
            access_token = data["access_token"]
            expires_in = data.get("expires_in", 3600)
            _token_cache["token"] = access_token
            _token_cache["expires_at"] = now + expires_in
            return access_token
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Error connecting to PayPal OAuth: {str(e)}"
            )


async def create_order(project_id: int, amount: float, currency: str = "USD", idempotency_key: Optional[str] = None) -> Dict[str, Any]:
    if not idempotency_key:
        idempotency_key = f"promisepay-ord-{project_id}-{uuid.uuid4().hex[:8]}"

    if settings.PAYPAL_MODE == "mock" or not settings.PAYPAL_CLIENT_ID:
        mock_order_id = f"MOCK-ORD-{project_id}-{uuid.uuid4().hex[:6]}"
        return {
            "order_id": mock_order_id,
            "status": "CREATED",
            "approval_url": f"https://www.sandbox.paypal.com/checkoutnow?token={mock_order_id}",
            "idempotency_key": idempotency_key,
            "mode": "mock"
        }

    token = await get_access_token()
    url = f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "PayPal-Request-Id": idempotency_key
    }
    payload = {
        "intent": "AUTHORIZE",
        "purchase_units": [
            {
                "reference_id": f"project-{project_id}",
                "description": f"PromisePay Payment Protection Agreement Project #{project_id}",
                "amount": {
                    "currency_code": currency,
                    "value": f"{amount:.2f}"
                }
            }
        ],
        "application_context": {
            "return_url": f"{settings.primary_frontend_url}/projects/{project_id}/payment/success",
            "cancel_url": f"{settings.primary_frontend_url}/projects/{project_id}/payment/cancel",
            "user_action": "CONTINUE"
        }
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=502,
                detail=f"PayPal order creation failed ({resp.status_code}): {resp.text}"
            )
        data = resp.json()
        approval_url = None
        for link in data.get("links", []):
            if link.get("rel") == "approve":
                approval_url = link.get("href")
        return {
            "order_id": data["id"],
            "status": data["status"],
            "approval_url": approval_url,
            "idempotency_key": idempotency_key,
            "mode": "sandbox"
        }


async def authorize_order(order_id: str) -> Dict[str, Any]:
    if settings.PAYPAL_MODE == "mock" or not settings.PAYPAL_CLIENT_ID:
        mock_auth_id = f"MOCK-AUTH-{order_id}"
        return {
            "authorization_id": mock_auth_id,
            "status": "COMPLETED",
            "mode": "mock"
        }

    token = await get_access_token()
    url = f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/authorize"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(url, headers=headers)
        if resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=502,
                detail=f"PayPal order authorization failed ({resp.status_code}): {resp.text}"
            )
        data = resp.json()
        # Find authorization ID
        auth_id = None
        purchase_units = data.get("purchase_units", [])
        if purchase_units:
            authorizations = purchase_units[0].get("payments", {}).get("authorizations", [])
            if authorizations:
                auth_id = authorizations[0].get("id")
        return {
            "authorization_id": auth_id or order_id,
            "status": data.get("status", "COMPLETED"),
            "mode": "sandbox"
        }


async def capture_authorization(authorization_id: str) -> Dict[str, Any]:
    if settings.PAYPAL_MODE == "mock" or not settings.PAYPAL_CLIENT_ID:
        mock_capture_id = f"MOCK-CAP-{authorization_id}"
        return {
            "capture_id": mock_capture_id,
            "status": "COMPLETED",
            "mode": "mock"
        }

    token = await get_access_token()
    url = f"{settings.PAYPAL_BASE_URL}/v2/payments/authorizations/{authorization_id}/capture"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(url, headers=headers)
        if resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=502,
                detail=f"PayPal capture failed ({resp.status_code}): {resp.text}"
            )
        data = resp.json()
        return {
            "capture_id": data.get("id"),
            "status": data.get("status", "COMPLETED"),
            "mode": "sandbox"
        }
