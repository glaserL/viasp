import clingo
import pytest
from clingo.ast import Rule, parse_string
from src.viasp.asp.reify import transform, line_nr_to_rule_mapping


def assertProgramEqual(actual, expected, message=None):
    if isinstance(actual, list):
        actual = set([str(e) for e in actual])

    if isinstance(expected, list):
        expected = set([str(e) for e in expected])
    assert actual == expected, message if message is not None else f"{expected} should be equal to {actual}"


def parse_program_to_ast(prg: str) -> [clingo.ast.AST]:
    parsed = []
    parse_string(prg, lambda rule: parsed.append(rule))
    return parsed


def test_simple_fact_is_transform_correctly():
    rule = "a."
    expected = "a."
    assertProgramEqual(transform(rule), parse_program_to_ast(expected))


def test_fact_with_variable_is_transform_correctly():
    rule = "a(1)."
    expected = "a(1)."
    assertProgramEqual(transform(rule), parse_program_to_ast(expected))


def test_normal_rule_without_negation_is_transformed_correctly():
    rule = "b(X) :- c(X)."
    expected = "h(1, b(X)) :- model(b(X)); c(X). b(X) :- h(_,b(X))."
    assertProgramEqual(transform(rule), parse_program_to_ast(expected))


def test_multiple_nested_variable_gets_transformed_correctly():
    program = "x(1). y(1). l(x(X),y(Y)) :- x(X), y(Y)."
    expected = "x(1). y(1). h(1, l(x(X),y(Y))) :- model(l(x(X),y(Y))), x(X), y(Y). l(x(X),y(Y)) :- h(_, l(x(X),y(Y)))."
    assertProgramEqual(transform(program), parse_program_to_ast(expected))


@pytest.mark.skip(reason="Not implemented yet.")
def test_conflict_variables_are_resolved():
    program = "h(42, 11). x(X) :- y(X)."
    expected = "h(42, 11). h_(1, x(X)) :- model(x(X)), y(X). h(1, x(X)) :- h_(_, x(X))."
    assertProgramEqual(transform(program), parse_program_to_ast(expected))


def test_normal_rule_with_negation_is_transformed_correctly():
    rule = "b(X) :- c(X), not a(X)."
    expected = "h(1, b(X)) :- model(b(X)); c(X); not a(X).b(X) :- h(_,b(X))."
    assertProgramEqual(transform(rule), parse_program_to_ast(expected))


def test_multiple_rules_with_same_head_do_not_lead_to_duplicate_h_with_wildcard():
    rule = "b(X) :- c(X), not a(X). b(X) :- a(X), not c(X)."
    expected = "h(1, b(X)) :- model(b(X)), c(X), not a(X).h(2, b(X)) :- model(b(X)), a(X), not c(X).b(X) :- h(_,b(X))."
    assertProgramEqual(transform(rule), parse_program_to_ast(expected))


@pytest.mark.skip(reason="Not implemented yet.")
def test_choice_rule_is_transformed_correctly():
    rule = "{b(X)}."
    expected = "h(1, b(X)) :- model(b(X)). b(X) :- h(_,b(X))."
    assertProgramEqual(transform(rule), parse_program_to_ast(expected))


@pytest.mark.skip(reason="Not implemented yet.")
def test_normal_rule_with_choice_in_head_is_transformed_correctly():
    rule = "{b(X)} :- c(X)."
    expected = "#program base.h(1, b(X)) :- model(b(X)), c(X).b(X) :- h(_,b(X))."
    assertProgramEqual(transform(rule), parse_program_to_ast(expected))


def test_program_mappings_work():
    rule = "a. x(1). d :- c. y(X) :- x(X). {z(X)} :- not d(X)."  # {z(1..3)}."
    rule_mapping = line_nr_to_rule_mapping(rule)
    assert len(rule_mapping) == 3


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
