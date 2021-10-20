import clingo
import pytest

from src.viasp.asp.reify import transform


def assertProgramEqual(actual, expected, message=None):
    if isinstance(actual, list):
        actual = [str(e) for e in actual]

    if isinstance(expected, list):
        expected = [str(e) for e in expected]
    assert actual == expected, message if message is not None else f"{expected} should be equal to {actual}"


@pytest.mark.skip(reason="Not implemented yet.")
def test_rule_with_negation_is_transformed_correctly():
    rule = "a(X) :- b(X), not c(X)."

    expected = "h(0,a(X)) :- model(a(X)), b(X), not c(X)."

    assert expected == transform(rule)


@pytest.mark.skip(reason="Not implemented yet.")
def test_simple_fact_is_transform_correctly():
    rule = "a."
    expected = "a."
    assert expected == transform(rule)


@pytest.mark.skip(reason="Not implemented yet.")
def test_fact_with_variable_is_transform_correctly():
    rule = "a(1)."
    expected = ["#program base.", "a(1)."]
    assertProgramEqual(transform(rule), expected)


@pytest.mark.skip(reason="Not implemented yet.")
def test_normal_rule_without_negation_is_transformed_correctly():
    rule = "b(X) :- c(X)."
    expected = ["#program base.", "h(1, b(X)) :- model(b(X)), c(X).", "b(X) :- h(_,b(X))."]
    assertProgramEqual(transform(rule), expected)


@pytest.mark.skip(reason="Not implemented yet.")
def test_normal_rule_with_negation_is_transformed_correctly():
    rule = "b(X) :- c(X), not a(X)."
    expected = ["#program base.", "h(1, b(X)) :- model(b(X)), c(X), not a(X).", "b(X) :- h(_,b(X))."]
    assertProgramEqual(transform(rule), expected)


@pytest.mark.skip(reason="Not implemented yet.")
def test_multiple_rules_with_same_head_do_not_lead_to_duplicate_h_with_wildcard():
    rule = "b(X) :- c(X), not a(X). b(X) :- a(X), not c(X)."
    expected = ["#program base.", "h(1, b(X)) :- model(b(X)), c(X), not a(X).",
                "h(2, b(X)) :- model(b(X)), a(X), not c(X).", "b(X) :- h(_,b(X))."]
    assertProgramEqual(transform(rule), expected)


@pytest.mark.skip(reason="Not implemented yet.")
def test_choice_rule_is_transformed_correctly():
    rule = "{b(X)}."
    expected = ["#program base.", "h(1, b(X)) :- model(b(X)).", "b(X) :- h(_,b(X))."]
    assertProgramEqual(transform(rule), expected)


@pytest.mark.skip(reason="Not implemented yet.")
def test_normal_rule_with_choice_in_head_is_transformed_correctly():
    rule = "{b(X)} :- c(X)."
    expected = ["#program base.", "h(1, b(X)) :- model(b(X)), c(X).", "b(X) :- h(_,b(X))."]
    assertProgramEqual(transform(rule), expected)


@pytest.mark.skip(reason="Not implemented yet.")
def get_reasons(prg, model):
    ctl = clingo.Control()
    ctl.add("base", [], prg)
    ctl.add("base", [], "".join(model))
    x = ctl.ground([("base", [])])
    reasons = []
    for x in ctl.symbolic_atoms.by_signature("h", 2):
        reasons.append(x.symbol)
    return set(reasons)


@pytest.mark.skip(reason="Not implemented yet.")
def test_remmmme():
    prg = """
a(1).
h(1, b(X)) :- model(b(X)), a(X).
b(X) :- h(_, b(X))."""
    models = [["model(a(1)).",
               "model(b(1))."],
              ["model(a(1))."]]

    reasons = []

    for model in models:
        reasons.append(get_reasons(prg, model))
    assert len(reasons[0]) == 1
    assert len(reasons[1]) == 0
