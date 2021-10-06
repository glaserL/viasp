from copy import copy
from dataclasses import dataclass, field
from inspect import Signature
from typing import List, Any, Sequence, Dict, Union
from uuid import UUID, uuid4

from clingo import Function


@dataclass
class Model:
    atoms: List[Function]


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
