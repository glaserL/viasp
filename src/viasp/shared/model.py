from copy import copy
from dataclasses import dataclass, field
from inspect import Signature
from typing import Any, Sequence, Dict, Union, Collection, Set, FrozenSet
from uuid import UUID, uuid4

from clingo import Symbol


@dataclass()
class Node:
    diff: FrozenSet[Symbol] = field(hash=True)
    rule_nr: int = field(hash=True)
    atoms: FrozenSet[Symbol] = field(default_factory=frozenset, hash=True)
    uuid: UUID = field(default_factory=uuid4, hash=False)

    def __hash__(self):
        return hash((self.atoms, self.rule_nr, self.diff))

    def __eq__(self, o):
        return isinstance(o, type(self)) and (self.atoms, self.rule_nr, self.diff) == (o.atoms, o.rule_nr, o.diff)

    def __repr__(self):
        return f"Node(diff={{{'. '.join(map(str, self.diff))}}}, rule_nr={self.rule_nr}, atoms={{{'. '.join(map(str, self.atoms))}}}, uuid={self.uuid})"


@dataclass(frozen=True, eq=True)
class Model:
    atoms: Set[str]
    _prev: Set[str]

    def __hash__(self):
        return hash((frozenset(self.atoms), frozenset(self._prev)))

    @classmethod
    def from_previous_union(cls, new: Collection[str], prev: Collection[str]):
        """Here new is ONLY the added one, without the stuff in prev"""
        new, prev = set(new), set(prev)
        return cls(new | prev, prev)

    @classmethod
    def from_previous_diff(cls, new: Collection[str], prev: Collection[str]):
        """Here new is the entire new model, including the stuff in prev"""
        new, prev = set(new), set(prev)
        return cls(new, prev - new)


@dataclass(frozen=True)
class CostableModel(Model):
    cost: int

    def __hash__(self):
        return hash((frozenset(self.atoms), frozenset(self._prev), self.cost))

    @classmethod
    def from_previous_union_cost(cls, new: Collection[str], prev: Collection[str], cost: int):
        """Here new is ONLY the added one, without the stuff in prev"""
        new, prev = set(new), set(prev)
        return cls(new | prev, prev, cost)

    @classmethod
    def from_previous_diff_cost(cls, new: Collection[str], prev: Collection[str], cost: int):
        """Here new is the entire new model, including the stuff in prev"""
        new, prev = set(new), set(prev)
        return cls(new, prev - new, cost)


@dataclass(frozen=True)
class Transformation:
    id: int
    rules: Sequence[str]

    def __hash__(self):
        return hash(tuple(self.rules))


@dataclass
class ClingoMethodCall:
    name: str
    kwargs: Dict[str, Any]
    uuid: Union[UUID, None] = field(default_factory=uuid4)

    @classmethod
    def merge(cls, name: str, signature: Signature, args: Sequence[Any], kwargs: Dict[str, Any]):
        args_dict = copy(kwargs)
        param_names = list(signature.parameters)
        for index, arg in enumerate(args):
            args_dict[param_names[index]] = arg
        return cls(name, args_dict)


def fromPrev(new: Union[Model, Collection[str]], prev: Union[Model, Collection[str]], mode: str = "union",
             cost: int = None) -> Union[Model, CostableModel]:
    if isinstance(new, Model):
        new = new.atoms
    if isinstance(prev, Model):
        prev = prev.atoms
    if mode == "diff":
        if cost is not None:
            return CostableModel.from_previous_diff_cost(new, prev, cost)
        else:
            return Model.from_previous_diff(new, prev)
    elif mode == "union":
        if cost is not None:
            return CostableModel.from_previous_union_cost(new, prev, cost)
        else:
            return Model.from_previous_union(new, prev)
    else:
        raise TypeError
