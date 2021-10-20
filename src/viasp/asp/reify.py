import clingo
from clingo import ast, Number
from clingo.ast import Transformer, parse_string, Rule, Function, ASTSequence


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

    def _nest_rule_head(self, rule: clingo.ast.AST):
        loc = rule.location
        begin = loc.begin.line
        loc_fun = ast.Function(loc, str(begin), [], False)
        loc_atm = ast.SymbolicAtom(loc_fun)
        loc_lit = ast.Literal(loc, ast.Sign.NoSign, loc_atm)
        new_head = ast.Function(loc, "h", [loc_lit, rule.head], 0)

        return new_head

    def _make_helper_thingy(self, rule: clingo.ast.AST):
        """In: H :- B
        Out: H:- h(_, H)"""
        head = rule.head
        wild_card_fun = ast.Function(rule.location, "_", [], False)
        wild_card_atm = ast.SymbolicAtom(wild_card_fun)
        wild_card_lit = ast.Literal(head.location, ast.Sign.NoSign, wild_card_atm)
        fun = ast.Function(head.location, "h", [wild_card_lit, head], 0)
        return ast.Rule(rule.location, head, [fun])

    def visit_Rule(self, rule: clingo.ast.AST):
        print(f"Visiting rule {rule}")
        new_head = self._nest_rule_head(rule)
        helper_thingy = self._make_helper_thingy(rule)
        new_rule = Rule(rule.location, new_head, self.visit_sequence(rule.body, body=True))
        return [new_rule, helper_thingy]

    def visit_Literal(self, literal: clingo.ast.AST, body):
        print(f"Visiting {literal=} {literal.sign=}")
        if body and literal.sign == ast.Sign.NoSign:
            model_fun = ast.Function(literal.location, "model", [literal], False)
            model_atm = ast.SymbolicAtom(model_fun)
            model_lit = ast.Literal(literal.location, literal.sign, model_atm)
            return model_lit
        else:
            return literal

rulez = []


def register_rules(rule_or_list_of_rules):
    if isinstance(rule_or_list_of_rules, list):
        rulez.extend(rule_or_list_of_rules)
    else:
        rulez.append(rule_or_list_of_rules)


def transform(program: str):
    itarfm = sasa()
    parse_string(program, lambda rule: register_rules(itarfm.visit(rule)))
    return rulez
