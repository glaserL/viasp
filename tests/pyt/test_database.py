from src.gasp.server.database import CallCenter
from tests.pyt.test_replayer import run_sample


def test_add_a_call_to_database():
    db = CallCenter()
    sample_calls = run_sample()
    assert len(db.calls) == 0, "Database should be empty initially."
    assert len(db.get_all()) == 0, "Database should be empty initially."
    assert len(db.get_pending()) == 0, "Database should be empty initially."
    db.extend(sample_calls)
    assert len(db.calls) == 4, "Database should contain 4 after adding 4."
    assert len(db.get_all()) == 4, "Database should contain 4 after adding 4."
    assert len(db.get_pending()) == 4, "Database should contain 4 pending after adding 4 and not consuming them."
    db.mark_call_as_used(sample_calls[0])
    assert len(db.calls) == 4, "Database should contain 4 after adding 4."
    assert len(db.get_all()) == 4, "Database should contain 4 after adding 4."
    assert len(db.get_pending()) == 3, "Database should contain 3 pending after adding 4 and consuming one."
