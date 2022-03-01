def test_ping_endpoint(client):
    res = client.get("/ping")
    assert res.status_code == 200
    res = client.post("/ping")
    assert res.status_code == 405
    res = client.delete("/ping")
    assert res.status_code == 405
    res = client.put("/ping")
    assert res.status_code == 405


def test_settings_endpoint(client):
    res = client.get("/settings")
    assert res.status_code == 200


def test_change_setting(client):
    res = client.post("/settings?foo=bar")
    assert res.status_code == 200
    res = client.get("/settings")
    assert res.json["foo"] == "bar"
