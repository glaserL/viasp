from src.gasp.server.database import CallCenter
from src.gasp.server.replayer import apply_multiple
from tests.pyt.test_replayer import run_sample


def test_calls_are_filtered_after_application():
    db = CallCenter()
    db.extend(run_sample())
    assert len(db.get_all()) == 4, "There should be four unused calls before reconstruction."
    assert len(db.get_pending()) == 4, "There should be four unused calls before reconstruction."
    _ = apply_multiple(db.get_all())
    assert len(db.get_all()) == 4, "Get all should still return all of them after application."
    assert len(db.get_pending()) == 0, "The call objects should be marked as used after application."
