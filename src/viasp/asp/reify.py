from typing import Dict, List, Collection, Tuple

import clingo
from clingo import ast
from clingo.ast import Transformer, parse_string, Rule, ASTType


def is_fact(rule):
    return len(rule.body) == 0


class IdentityTransformAsReferenceForMe(Transformer):

    def visit_Rule(self, rule: clingo.ast.AST, *args, **kwargs):
        print(f"Visiting {rule=}")
        return Rule(rule.location, self.visit(rule.head, *args, **kwargs),
                    self.visit_sequence(rule.body, *args, **kwargs))

    #
    # def visit_Head(self, head: clingo.ast.AST, *args, **kwargs):
    #     print(f"Visiting {head=}")
    #     return head
    #
    # def visit_Literal(self, literal, *args, **kwargs):
    #     print(f"Visiting {literal=}")
    #     return literal

    #
    # def visit_Aggregate(self, aggregate):
    #     print(f"Visiting {aggregate=}")
    #     a = aggregate.left_guard
    #     b = aggregate.elements
    #     c = aggregate.right_guard
    #     return aggregate

    def visit_HeadAggregate(self, head_aggregate):
        print(f"Visiting {head_aggregate=}")
        return head_aggregate


class sasa(Transformer):

    def __init__(self):
        self.rule_nr = 1

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
        print(f"Visiting {str(aggregate)=}, {in_head=}")
        for elem in conditional_literals:
            self.visit(elem, dependants=dependants, conditions=conditions)
        return aggregate

    def visit_ConditionalLiteral(self, conditional_literal, in_head=True, dependants=[], conditions=[]):
        print(f"Visiting {str(conditional_literal)=}, {in_head=}")
        self.visit(conditional_literal.literal)
        dependants.append(conditional_literal.literal)
        for condition in conditional_literal.condition:
            conditions.append(condition)
        return conditional_literal

    def visit_Rule(self, rule: clingo.ast.AST):
        print(f"Visiting rule {rule}")
        # Embed the head
        dependants, conditions = [], []
        loc = rule.location
        visited_head = self.visit(rule.head, in_head=True, dependants=dependants, conditions=conditions)

        if is_fact(rule) and not dependants and not conditions:
            return rule
        if not dependants:
            dependants.append(rule.head)

        new_head_s = self._nest_rule_head_in_h(rule.location, dependants)
        # Add reified head to body
        new_body = [self._nest_rule_head_in_model(head) for head in dependants]
        new_body.extend(rule.body)
        new_body.extend(conditions)
        new_rules = [Rule(rule.location, new_head, new_body) for new_head in new_head_s]

        # Add switch statement for the head
        head_switches = [self._make_head_switch(head, loc) for head in dependants]
        self.rule_nr += 1
        new_rules.extend(head_switches)
        return new_rules
    #
    # def visit_Literal(self, literal: clingo.ast.AST, body):
    #     print(f"Visiting {literal=} {literal.sign=}")
    #     if body and literal.sign == ast.Sign.NoSign:
    #         model_fun = ast.Function(literal.location, "model", [literal], False)
    #         model_atm = ast.SymbolicAtom(model_fun)
    #         model_lit = ast.Literal(literal.location, literal.sign, model_atm)
    #         return model_lit
    #     else:
    #         return literal


# def register_rules(rule_or_list_of_rules, rulez):
#     if isinstance(rule_or_list_of_rules, list):
#         rulez.extend(rule_or_list_of_rules)
#     else:
#         rulez.append(rule_or_list_of_rules)


def register_rules(rule_or_list_of_rules, rulez):
    if isinstance(rule_or_list_of_rules, list):
        for rule in rule_or_list_of_rules:
            if not rule in rulez:
                rulez.extend(rule_or_list_of_rules)
    else:
        if not rule_or_list_of_rules in rulez:
            rulez.append(rule_or_list_of_rules)


def transform(program: str):
    itarfm = sasa()
    rulez = []
    parse_string(program, lambda rule: register_rules(itarfm.visit(rule), rulez))
    return rulez


def add_to_dict_and_increment(dct: Dict[int, clingo.ast.AST], elem: clingo.ast.AST, counter: int):
    dct[counter] = elem
    counter += 1


class JustTheRulesTransformer(Transformer):

    def __init__(self):
        self.rule_nr = 1

    def visit_Rule(self, rule):
        if is_fact(rule):
            return rule
        else:
            rule_nr = self.rule_nr
            self.rule_nr += 1

            return rule_nr, rule


def extract_symbols(facts):
    ctl = clingo.Control()
    ctl.add("INTERNAL", [], "".join(str(f) for f in facts))
    ctl.ground([("INTERNAL", [])])
    result = []
    for fact in ctl.symbolic_atoms:
        result.append(fact.symbol)
    return result


def line_nr_to_rule_mapping_and_facts(program: str) -> Tuple[Dict[int, clingo.ast.AST], Collection[clingo.Symbol]]:
    jtrt = JustTheRulesTransformer()
    all_rules: List[clingo.ast.AST] = []
    parse_string(program, lambda rule: all_rules.append(jtrt.visit(rule)))
    mappings = {nr: rule for nr, rule in filter(lambda e: isinstance(e, tuple), all_rules)}
    facts = [fact for fact in filter(lambda e: not isinstance(e, tuple) and e.ast_type != ASTType.Program, all_rules)]
    facts = extract_symbols(facts)
    return mappings, facts
