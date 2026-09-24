"""Criterion: Código inválido.

GET /vouchers/codes/{code} for a code that was never issued must return 404 (not a
crash, not a 200 with empty data) so the frontend can render a clear "not found" state.
"""


def test_unknown_code_returns_404():
    import httpx
    import os

    api_url = f"{os.environ.get('BACKEND_URL', 'http://localhost:8001')}/api"
    with httpx.Client(base_url=api_url, timeout=30.0) as c:
        resp = c.get("/vouchers/codes/FIVE-00000000-XXXXXX")
        assert resp.status_code == 404, resp.text
        assert "detail" in resp.json()
