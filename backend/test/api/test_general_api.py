def test_healthcheck_endpoint(client):
    res = client.get("/healthcheck")
    assert res.status_code == 200
    res = client.post("/healthcheck")
    assert res.status_code == 405
    res = client.delete("/healthcheck")
    assert res.status_code == 405
    res = client.put("/healthcheck")
    assert res.status_code == 405
