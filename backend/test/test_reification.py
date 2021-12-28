import clingo
import pytest
from clingo.ast import Rule, parse_string, ASTType
from viasp.asp.reify import transform, ProgramReifier, ProgramAnalyzer


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
    expected = "h(1, b(X)) :- model(b(X)), c(X), not a(X).h(1, b(X)) :- model(b(X)), a(X), not c(X).b(X) :- h(_,b(X))."
    assertProgramEqual(transform(rule), parse_program_to_ast(expected))


def extract_rule_nrs_from_parsed_program(prg):
    rule_nrs = []
    for rule in prg:
        if rule.ast_type != ASTType.Rule:
            continue
        head = rule.head.atom.symbol
        if head.name == "h" and str(head.arguments[0]) != "_":
            rule_nrs.append(head.arguments[0].symbol.number)

    return rule_nrs


def test_programs_with_facts_result_in_matching_program_mappings():
    program = "b(X) :- c(X), not a(X). b(X) :- a(X), not c(X)."
    expected = "h(1, b(X)) :- model(b(X)), c(X), not a(X).h(1, b(X)) :- model(b(X)), a(X), not c(X).b(X) :- h(_,b(X))."
    parsed = parse_program_to_ast(expected)
    transformed = transform(program)
    assertProgramEqual(transformed, parsed)


def test_choice_rule_is_transformed_correctly():
    rule = "{b(X)}."
    expected = "h(1, b(X)) :- model(b(X)). b(X) :- h(_,b(X))."
    assertProgramEqual(transform(rule), parse_program_to_ast(expected))


def test_normal_rule_with_choice_in_head_is_transformed_correctly():
    rule = "{b(X)} :- c(X)."
    expected = "#program base.h(1, b(X)) :- model(b(X)), c(X).b(X) :- h(_,b(X))."
    assertProgramEqual(transform(rule), parse_program_to_ast(expected))


def test_head_aggregate_is_transformed_correctly():
    rule = "{a(X) : b(X)}."
    expected = "#program base.h(1, a(X)) :- model(a(X)), b(X). a(X) :- h(_,a(X))."
    assertProgramEqual(transform(rule), parse_program_to_ast(expected))


def test_dependency_graph_creation():
    program = "a. b :- a. c :- a."

    analyzer = ProgramAnalyzer()
    result = analyzer.sort_program(program)
    assert len(result) == 2, "Facts should not be in the sorted program."
    assert len(analyzer.dependants) == 2, "Facts should not be in the dependency graph."


def test_negative_recursion_gets_grouped():
    program = "a. b :- not c, a. c :- not b, a."

    analyzer = ProgramAnalyzer()
    result = analyzer.sort_program(program)
    assert len(result) == 1, "Negative recursions should be grouped into one transformation."


def multiple_non_recursive_rules_with_same_head_should_not_be_grouped():
    program = "f(B) :- x(B). f(B) :- f(A), rel(A,B)."

    analyzer = ProgramAnalyzer()
    result = analyzer.sort_program(program)
    assert len(result) == 2, "Multiple rules with same head that are not recursive should not be grouped."


def sorting_works():
    program = "d :- c. b :- a. a. c :- b. "
    transformer = ProgramReifier()
    _ = transform(program, transformer)


def test_data_type_is_correct():
    program = "d :- c. b :- a. a. c :- b."
    transformer = ProgramAnalyzer()
    result = transformer.sort_program(program)
    assert len(result) > 0 and len(
        result[0].rules) > 0, "Transformation should return something and the transformation should contain a rule."
    a_rule = next(iter(result[0].rules))
    data_type = type(a_rule)
    assert data_type == clingo.ast.AST, f"{a_rule} should be an ASTType, not {data_type}"


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
def test_traveling_salesperson_works():
    pass


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
