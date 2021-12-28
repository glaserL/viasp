from viasp.server.database import CallCenter


def test_add_a_call_to_database(clingo_call_run_sample):
    db = CallCenter()
    assert len(db.calls) == 0, "Database should be empty initially."
    assert len(db.get_all()) == 0, "Database should be empty initially."
    assert len(db.get_pending()) == 0, "Database should be empty initially."
    db.extend(clingo_call_run_sample)
    assert len(db.calls) == 4, "Database should contain 4 after adding 4."
    assert len(db.get_all()) == 4, "Database should contain 4 after adding 4."
    assert len(db.get_pending()) == 4, "Database should contain 4 pending after adding 4 and not consuming them."
    db.mark_call_as_used(clingo_call_run_sample[0])
    assert len(db.calls) == 4, "Database should contain 4 after adding 4."
    assert len(db.get_all()) == 4, "Database should contain 4 after adding 4."
    assert len(db.get_pending()) == 3, "Database should contain 3 pending after adding 4 and consuming one."
