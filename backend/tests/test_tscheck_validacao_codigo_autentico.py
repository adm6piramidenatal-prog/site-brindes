"""Criterion: Validação de código autêntico.

Logs in, creates a voucher code (fixture winner), then hits the PUBLIC validation
endpoint GET /vouchers/codes/{code} WITHOUT any auth cookie and asserts the returned
data (winner, gift, issue date, observation) matches what was submitted.
"""

import uuid


def test_public_validation_returns_matching_voucher_data(client):
    login_resp = client.post(
        "/auth/login",
        json={"email": "admin@resortbrindes.com.br", "password": "senha123"},
    )
    assert login_resp.status_code == 200, login_resp.text
    session_cookies = login_resp.cookies

    suffix = uuid.uuid4().hex[:8]
    winner_name = f"tscheck-validacao-{suffix}"
    observation = f"observacao-tscheck-{suffix}"
    create_resp = client.post(
        "/vouchers/codes",
        json={
            "gift_id": "day-use-vip",
            "winner_name": winner_name,
            "issue_date": "2026-01-15",
            "observation": observation,
            "stay_days": None,
            "cost_type": None,
        },
        cookies=session_cookies,
    )
    assert create_resp.status_code == 201, create_resp.text
    created = create_resp.json()
    code = created["code"]
    assert code.startswith("FIVE-")

    # Public validation: no cookies sent at all.
    validation_resp = client.get(f"/vouchers/codes/{code}")
    assert validation_resp.status_code == 200, validation_resp.text
    body = validation_resp.json()
    assert body["valid"] is True
    assert body["code"] == code
    assert body["winner_name"] == winner_name
    assert body["issue_date"] == "2026-01-15"
    assert body["observation"] == observation
    assert body["gift_title"] == "Day Use VIP"
