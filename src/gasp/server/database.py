from abc import ABC, abstractmethod
from typing import Sequence

from ..shared.model import ClingoMethodCall


class Database(ABC):

    @abstractmethod
    def save_clingo_call(self, call: ClingoMethodCall):
        pass

    @abstractmethod
    def get_clingo_calls(self) -> Sequence[ClingoMethodCall]:
        pass
