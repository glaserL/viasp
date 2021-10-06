from copy import copy
from dataclasses import dataclass
from inspect import Signature
from typing import List, Any, Sequence, Dict

from clingo import Function


@dataclass
class Model:
    atoms: List[Function]


@dataclass
class ClingoMethodCall:
    name: str
    args: Dict[str, Any]

    @classmethod
    def merge(cls, name: str, signature: Signature, args: Sequence[Any], kwargs: Dict[str, Any]):
        args_dict = copy(kwargs)
        param_names = list(signature.parameters)
        for index, arg in enumerate(args):
            args_dict[param_names[index]] = arg
        return cls(name, args_dict)
