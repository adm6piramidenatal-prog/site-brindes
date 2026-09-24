"""Criterion: Login e acesso ao emissor.

Verifies that the seeded demo user admin@resortbrindes.com.br / senha123 can log in
successfully and that /auth/me reflects the authenticated session; also verifies
invalid credentials are rejected.
"""


def test_login_with_valid_demo_credentials_succeeds(client):
    resp = client.post(
        "/auth/login",
        json={"email": "admin@resortbrindes.com.br", "password": "senha123"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["user"]["email"] == "admin@resortbrindes.com.br"
    assert "voucherfest_session" in resp.cookies

    me_resp = client.get("/auth/me", cookies=resp.cookies)
    assert me_resp.status_code == 200, me_resp.text
    assert me_resp.json()["email"] == "admin@resortbrindes.com.br"


def test_login_with_invalid_password_is_rejected(client):
    resp = client.post(
        "/auth/login",
        json={"email": "admin@resortbrindes.com.br", "password": "wrong-password"},
    )
    assert resp.status_code == 401, resp.text
