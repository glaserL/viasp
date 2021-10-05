from dataclasses import dataclass
from typing import List, Any, Sequence, Dict

from clingo import Function


@dataclass
class Model:
    atoms: List[Function]


@dataclass
class ClingoMethodCall:
    name: str
    args: Sequence[Any]
    kwargs: Dict[str, Any]
