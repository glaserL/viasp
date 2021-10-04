from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Sequence, Any, Dict


@dataclass
class ClingoMethodCall:
    name: str
    args: Sequence[Any]
    kwargs: Dict[str, Any]

class Database(ABC):

    @abstractmethod
    def save_clingo_call(self, call: ClingoMethodCall):
        pass

    @abstractmethod
    def get_clingo_calls(self) -> Sequence[ClingoMethodCall]:
        pass
