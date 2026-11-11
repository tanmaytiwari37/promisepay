"""PayPal Sandbox Orders Integration Service."""


def create_order(amount: float, currency: str = "USD") -> dict:
    """Create PayPal order with intent AUTHORIZE."""
    # TODO: Call PayPal Orders v2 API to create order
    return {"order_id": "TODO", "status": "CREATED"}


def authorize_payment(order_id: str) -> dict:
    """Authorize a created PayPal order."""
    # TODO: Call PayPal Orders v2 API to authorize
    return {"authorization_id": "TODO", "status": "AUTHORIZED"}


def capture_payment(authorization_id: str) -> dict:
    """Capture an authorized payment after customer approval."""
    # TODO: Call PayPal Payments v2 API to capture authorization
    return {"capture_id": "TODO", "status": "COMPLETED"}

