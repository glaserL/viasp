import pytest

from viasp.shared.model import Filter, Signature, Transformation

GOOD_SIGNATURE_FILTER = Filter(Signature("holds", 2))

GOOD_TRANSFORMATION_FILTER = Filter(Transformation(42, ["a:-b.", "b :- a."]))

BAD_FILTER = {""}


@pytest.fixture(scope="function", autouse=True)
def reset_db(client):
    client.delete("filter/clear")


def test_add_filter_should_save_the_filter(client):
    client.post("filter", json=GOOD_SIGNATURE_FILTER)
    res = client.get("filter")
    assert res.status_code == 200
    assert len(res.json) == 1


def test_add_malformed_filter_should_return_400(client):
    res = client.post("filter", json=BAD_FILTER)
    assert res.status_code == 400


def test_delete_filter_should_delete_the_filter(client):
    client.post("filter", json=GOOD_TRANSFORMATION_FILTER)
    prev = len(client.get("filter").json)
    client.delete("filter", json=GOOD_TRANSFORMATION_FILTER)
    res = client.get("filter")
    assert res.status_code == 200
    assert len(res.json) == prev - 1


def test_get_filter_should_get_all_active_filters(client):
    client.post("filter", json=GOOD_TRANSFORMATION_FILTER)
    client.post("filter", json=GOOD_SIGNATURE_FILTER)
    res = client.get("filter")
    assert res.status_code == 200
    assert len(res.json) == 2


def test_delete_malformed_filter_should_return_400(client):
    res = client.delete("filter", json=BAD_FILTER)
    assert res.status_code == 400


def test_delete_non_existing_filter_should_return_400(client):
    client.post("filter", json=GOOD_TRANSFORMATION_FILTER)
    res = client.delete("filter", json=GOOD_SIGNATURE_FILTER)
    assert res.status_code == 400


def test_clear_filter_removes_all_filters(client):
    client.post("filter", json=GOOD_TRANSFORMATION_FILTER)
    client.post("filter", json=GOOD_SIGNATURE_FILTER)
    res = client.delete("filter/clear")
    assert res.status_code == 200
    assert len(client.get("filter").json) == 0


def test_clear_filter_rejects_all_other_methods(client):
    client.post("filter", json=GOOD_TRANSFORMATION_FILTER)
    client.post("filter", json=GOOD_SIGNATURE_FILTER)
    res = client.get("filter/clear")
    assert res.status_code == 405
    res = client.post("filter/clear")
    assert res.status_code == 405
    res = client.patch("filter/clear")
    assert res.status_code == 405
