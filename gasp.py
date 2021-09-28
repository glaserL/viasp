from typing import Optional, Sequence, List

from clingo import Logger, Function
from clingo import Control as InnerControl
from dataclasses import dataclass


@dataclass
class AddedProgram:
    name: str
    parameters: Sequence[str]
    program: str


@dataclass
class Model:
    atoms: List[Function]


class Control(InnerControl):

    def __init__(self, arguments: Sequence[str] = [], logger: Optional[Logger] = None, message_limit: int = 20):
        super().__init__(arguments, logger, message_limit)
        self.arguments: Sequence[str] = arguments
        self.raw_programs: List[AddedProgram] = []

    def add(self, name: str, parameters: Sequence[str], program: str) -> None:
        super().add(name, parameters, program)
        self.raw_programs.append(AddedProgram(name, parameters, program))

    def paint(self):
        pass

    def select(self, model):
        pass
