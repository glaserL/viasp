from dataclasses import dataclass
from typing import List

from clingo import Function


@dataclass
class Model:
    atoms: List[Function]
