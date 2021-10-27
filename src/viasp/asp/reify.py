from typing import Dict, List, Collection, Tuple

import clingo
from clingo import ast
from clingo.ast import Transformer, parse_string, Rule, ASTType


class IdentityTransformAsReferenceForMe(Transformer):

    def visit_Rule(self, rule: clingo.ast.AST, *args, **kwargs):
        print(f"Visiting {rule=}")
        return Rule(rule.location, self.visit(rule.head, *args, **kwargs),
                    self.visit_sequence(rule.body, *args, **kwargs))

    def visit_Head(self, head: clingo.ast.AST, *args, **kwargs):
        print(f"Visiting {head=}")
        return head

    def visit_Literal(self, literal, *args, **kwargs):
        print(f"Visiting {literal=}")
        return literal


class sasa(Transformer):

    def __init__(self):
        self.rule_nr = 1

    def _nest_rule_head(self, rule: clingo.ast.AST):
        loc = rule.location
        loc_fun = ast.Function(loc, str(self.rule_nr), [], False)
        loc_atm = ast.SymbolicAtom(loc_fun)
        loc_lit = ast.Literal(loc, ast.Sign.NoSign, loc_atm)
        new_head = ast.Function(loc, "h", [loc_lit, rule.head], 0)

        return new_head

    def _make_head_switch(self, rule: clingo.ast.AST):
        """In: H :- B.
        Out: H:- h(_, H)."""
        head = rule.head
        wild_card_fun = ast.Function(rule.location, "_", [], False)
        wild_card_atm = ast.SymbolicAtom(wild_card_fun)
        wild_card_lit = ast.Literal(head.location, ast.Sign.NoSign, wild_card_atm)
        fun = ast.Function(head.location, "h", [wild_card_lit, head], 0)
        return ast.Rule(rule.location, head, [fun])

    def _nest_rule_head_in_model(self, head):
        """
        In: H :- B.
        Out: model(H).
        """
        loc = head.location
        new_head = ast.Function(loc, "model", [head], 0)
        return new_head

    def visit_Rule(self, rule: clingo.ast.AST):
        print(f"Visiting rule {rule}")
        if len(rule.body) == 0:
            # It's a fact.
            return rule

        # Embed the head
        new_head = self._nest_rule_head(rule)
        # Add reified head to body
        new_body = [self._nest_rule_head_in_model(rule.head)]
        new_body.extend(rule.body)
        new_rule = Rule(rule.location, new_head, new_body)

        # Add switch statement for the head
        head_switch = self._make_head_switch(rule)
        self.rule_nr += 1
        return [new_rule, head_switch]

    def visit_Literal(self, literal: clingo.ast.AST, body):
        print(f"Visiting {literal=} {literal.sign=}")
        if body and literal.sign == ast.Sign.NoSign:
            model_fun = ast.Function(literal.location, "model", [literal], False)
            model_atm = ast.SymbolicAtom(model_fun)
            model_lit = ast.Literal(literal.location, literal.sign, model_atm)
            return model_lit
        else:
            return literal


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
        if len(rule.body) == 0:
            return rule
        else:
            self.rule_nr += 1

            return self.rule_nr, rule


def line_nr_to_rule_mapping_and_facts(program: str) -> Tuple[Dict[int, clingo.ast.AST], Collection[clingo.ast.AST]]:
    jtrt = JustTheRulesTransformer()
    all_rules: List[clingo.ast.AST] = []
    parse_string(program, lambda rule: all_rules.append(jtrt.visit(rule)))
    mappings = {nr: rule for nr, rule in filter(lambda e: isinstance(e, tuple), all_rules)}
    facts = [fact for fact in filter(lambda e: not isinstance(e, tuple) and e.ast_type != ASTType.Program, all_rules)]
    return mappings, facts
