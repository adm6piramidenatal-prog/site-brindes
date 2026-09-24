"""Criterion: Fluxo de emissão preservado.

The core emission flow (login -> pick "Diárias" gift -> name/date/observation ->
3 or 6 diárias -> unique code generation) must still work end to end at the API level
for both stay-day options.
"""

import uuid

import pytest


@pytest.mark.parametrize("stay_days,cost_type", [(3, "com-custo"), (6, "sem-custo")])
def test_diarias_code_generation_for_each_stay_option(client, stay_days, cost_type):
    login_resp = client.post(
        "/auth/login",
        json={"email": "admin@resortbrindes.com.br", "password": "senha123"},
    )
    assert login_resp.status_code == 200, login_resp.text
    session_cookies = login_resp.cookies

    suffix = uuid.uuid4().hex[:8]
    winner_name = f"tscheck-fluxo-{stay_days}d-{suffix}"
    create_resp = client.post(
        "/vouchers/codes",
        json={
            "gift_id": "diarias-captacao-3",
            "winner_name": winner_name,
            "issue_date": "2026-02-01",
            "observation": "fluxo preservado",
            "stay_days": stay_days,
            "cost_type": cost_type,
        },
        cookies=session_cookies,
    )
    assert create_resp.status_code == 201, create_resp.text
    body = create_resp.json()
    assert body["stay_days"] == stay_days
    assert body["cost_type"] == cost_type
    assert body["code"].startswith("FIVE-")

    # Persisted and publicly validatable with the same stay/cost data.
    validation_resp = client.get(f"/vouchers/codes/{body['code']}")
    assert validation_resp.status_code == 200, validation_resp.text
    validation = validation_resp.json()
    assert validation["stay_days"] == stay_days
    assert validation["cost_type"] == cost_type
    assert validation["winner_name"] == winner_name
