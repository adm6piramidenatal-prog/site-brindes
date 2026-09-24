"""Criterion: Cinco modelos selecionaveis.

Verifies GET /api/vouchers/config returns exactly 5 gift options (models) and that the
initial/default model is "3 Diarias - Captacao" as stated in the seed facts.
"""


def test_voucher_config_returns_five_gift_options(client):
    resp = client.get("/vouchers/config")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert len(body["gift_options"]) == 5, body["gift_options"]

    titles = [option["title"] for option in body["gift_options"]]
    assert "Diárias" in titles
    assert titles[0] == "Diárias"

    # Each option should carry the fields the frontend preview depends on.
    for option in body["gift_options"]:
        assert option["id"]
        assert option["title"]
        assert option["background_path"]
        assert option["theme"]
