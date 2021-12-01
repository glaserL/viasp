from collections import defaultdict
from typing import Dict, List, Collection, Tuple, Optional, Iterable, Set

import clingo
import networkx as nx
from clingo import ast, Symbol
from clingo.ast import Transformer, parse_string, Rule, ASTType, AST, Literal

from ..asp.utils import merge_cycles, remove_loops
from ..shared.model import Node, Transformation


def is_constraint(rule: Rule):
    return "atom" in rule.head.child_keys and rule.head.atom.ast_type == ASTType.BooleanConstant


def is_fact(rule, depedants, conditions):
    return len(rule.body) == 0 and not len(depedants) and not len(conditions)


def make_signature(literal: clingo.ast.Literal) -> Tuple[str, int]:
    unpacked = literal.atom.symbol
    return unpacked.name, len(unpacked.arguments) if hasattr(unpacked, "arguments") else 0


def filter_body_arithmetic(elem: clingo.ast.Literal):
    return elem.atom.ast_type != ASTType.Comparison


class ProgramAnalyzer(Transformer):
    """
    Receives a ASP program and finds it's dependencies within, can sort a program by it's dependencies.
    Will merge recursive rules and rules that produce the same head into a Transformation.
    """

    def __init__(self):
        self.dependencies = nx.DiGraph()
        self.dependants: Dict[Tuple[str, int], Set[Rule]] = defaultdict(set)
        self.conditions: Dict[Tuple[str, int], Set[Rule]] = defaultdict(set)
        self.rule2signatures = defaultdict(set)
        self.facts: Set[Symbol] = set()
        self.constants: Set[Symbol] = set()

    def get_facts(self):
        return extract_symbols(self.facts, self.constants)

    def get_constants(self):
        return self.constants

    def visit_Aggregate(self, aggregate, in_head=True, dependants=[], conditions=[]):
        conditional_literals = aggregate.elements
        for elem in conditional_literals:
            self.visit(elem, dependants=dependants, conditions=conditions)
        return aggregate

    def visit_ConditionalLiteral(self, conditional_literal, in_head=True, dependants=[], conditions=[]):
        self.visit(conditional_literal.literal)
        dependants.append(conditional_literal.literal)
        for condition in filter(filter_body_arithmetic, conditional_literal.condition):
            conditions.append(condition)
        return conditional_literal

    def register_symbolic_dependencies(self, dependants, conditions):
        for u in conditions:
            for v in dependants:
                self.dependencies.add_edge(u, v)

    def register_rule_dependencies(self, rule: Rule,
                                   dependants: Collection[Literal],
                                   conditions: Collection[Literal]) -> None:
        for u in conditions:
            u_sig = make_signature(u)
            self.conditions[u_sig].add(rule)
        for v in dependants:
            v_sig = make_signature(v)
            self.dependants[v_sig].add(rule)

    def visit_Rule(self, rule: Rule):
        if not str(rule).startswith("initial"):
            x = 2

        dependants, conditions = [], []
        _ = self.visit(rule.head, in_head=True, dependants=dependants, conditions=conditions)
        conditions.extend(filter(filter_body_arithmetic, rule.body))
        if is_fact(rule, dependants, conditions):
            self.facts.add(rule.head)
        if not len(dependants) and len(rule.body) and not is_constraint(rule):
            dependants.append(rule.head)
        self.register_symbolic_dependencies(dependants, conditions)
        self.register_rule_dependencies(rule, dependants, conditions)

    def visit_Definition(self, definition):
        self.constants.add(definition)
        return definition

    def add_program(self, program: str) -> None:
        parse_string(program, lambda statement: self.visit(statement))

    def sort_program(self, program) -> List[Transformation]:
        parse_string(program, lambda rule: self.visit(rule))
        sorted_program = self.sort_program_by_dependencies()
        return [Transformation(i, prg) for i, prg in enumerate(sorted_program)]

    def get_sorted_program(self) -> List[Transformation]:
        sorted_program = self.sort_program_by_dependencies()
        return [Transformation(i, prg) for i, prg in enumerate(sorted_program)]

    def make_dependency_graph(self, head_dependencies: Dict[Tuple[str, int], Iterable[clingo.ast.AST]],
                              body_dependencies: Dict[Tuple[str, int], Iterable[clingo.ast.AST]]) -> nx.DiGraph:
        """
        We draw a dependency graph based on which rule head contains which literals.
        That way we know, that in order to have a rule r with a body containing literal l, all rules that have l in their
        heads must come before r.
        :param head_dependencies: Mapping from a signature to all rules containing them in the head
        :param body_dependencies: mapping from a signature to all rules containing them in the body
        :return:
        """
        g = nx.DiGraph()
        # Add dependents
        for head_signature, rules_with_head in head_dependencies.items():
            dependent_rules = body_dependencies.get(head_signature, [])
            for parent_rule in rules_with_head:
                for dependent_rule in dependent_rules:
                    g.add_edge(frozenset([parent_rule]), frozenset([dependent_rule]))

            if len(dependent_rules) == 0:
                for rule in rules_with_head:
                    g.add_node(frozenset([rule]))

        return g

    def sort_program_by_dependencies(self):
        deps = self.make_dependency_graph(self.dependants, self.conditions)
        deps = merge_cycles(deps)
        deps = remove_loops(deps)
        program = list(nx.topological_sort(deps))
        return program


class ProgramReifier(Transformer):

    def __init__(self, rule_nr=1):
        self.rule_nr = rule_nr

    def _nest_rule_head_in_h(self, loc, dependants):
        loc_fun = ast.Function(loc, str(self.rule_nr), [], False)
        loc_atm = ast.SymbolicAtom(loc_fun)
        loc_lit = ast.Literal(loc, ast.Sign.NoSign, loc_atm)

        return [ast.Function(loc, "h", [loc_lit, dependant], 0) for dependant in dependants]

    def _make_head_switch(self, head: clingo.ast.AST, location):
        """In: H :- B.
        Out: H:- h(_, H)."""
        # head = rule.head

        wild_card_fun = ast.Function(location, "_", [], False)
        wild_card_atm = ast.SymbolicAtom(wild_card_fun)
        wild_card_lit = ast.Literal(head.location, ast.Sign.NoSign, wild_card_atm)
        fun = ast.Function(head.location, "h", [wild_card_lit, head], 0)
        return ast.Rule(location, head, [fun])

    def _nest_rule_head_in_model(self, head):
        """
        In: H :- B.
        Out: model(H).
        """
        loc = head.location
        new_head = ast.Function(loc, "model", [head], 0)
        return new_head

    def visit_Aggregate(self, aggregate, in_head=True, dependants=[], conditions=[]):
        conditional_literals = aggregate.elements
        for elem in conditional_literals:
            self.visit(elem, dependants=dependants, conditions=conditions)
        return aggregate

    def visit_ConditionalLiteral(self, conditional_literal, in_head=True, dependants=[], conditions=[]):
        self.visit(conditional_literal.literal)
        dependants.append(conditional_literal.literal)
        for condition in conditional_literal.condition:
            conditions.append(condition)
        return conditional_literal

    def visit_Rule(self, rule: clingo.ast.Rule):
        print(f"Visiting rule {rule}")
        # Embed the head
        dependants, conditions = [], []
        loc = rule.location
        _ = self.visit(rule.head, in_head=True, dependants=dependants, conditions=conditions)

        if is_fact(rule, dependants, conditions) or is_constraint(rule):
            return [rule]
        if not dependants:
            # if it's a "simple head"
            dependants.append(rule.head)

        new_head_s = self._nest_rule_head_in_h(rule.location, dependants)
        # Add reified head to body
        new_body = [self._nest_rule_head_in_model(head) for head in dependants]
        new_body.extend(rule.body)
        new_body.extend(conditions)
        new_rules = [Rule(rule.location, new_head, new_body) for new_head in new_head_s]

        # Add switch statement for the head
        head_switches = [self._make_head_switch(head, loc) for head in dependants]
        new_rules.extend(head_switches)
        return new_rules


def register_rules(rule_or_list_of_rules, rulez):
    if isinstance(rule_or_list_of_rules, list):
        for rule in rule_or_list_of_rules:
            if not rule in rulez:
                rulez.extend(rule_or_list_of_rules)
    else:
        if not rule_or_list_of_rules in rulez:
            rulez.append(rule_or_list_of_rules)


def transform(program: str, visitor=None):
    if visitor is None:
        visitor = ProgramReifier()
    rulez = []
    parse_string(program, lambda rule: register_rules(visitor.visit(rule), rulez))
    return rulez


def reify(transformation: Transformation):
    visitor = ProgramReifier(transformation.id)
    result = []
    for rule in transformation.rules:
        result.extend(visitor.visit(rule))
    return result


def reify_list(transformations: Iterable[Transformation]) -> List[AST]:
    reified = []
    for part in transformations:
        reified.extend(reify(part))
    return reified


def extract_symbols(facts, constants=[]):
    ctl = clingo.Control()
    ctl.add("INTERNAL", [], "".join(f"{str(f)}." for f in facts))
    ctl.add("INTERNAL", [], "".join(f"{str(c)}" for c in constants))
    ctl.ground([("INTERNAL", [])])
    result = []
    for fact in ctl.symbolic_atoms:
        result.append(fact.symbol)
    return result
