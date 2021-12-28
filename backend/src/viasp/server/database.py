from abc import ABC, abstractmethod
from os import PathLike
from typing import Optional, Set, List
from uuid import UUID

from ..shared.event import Event, subscribe
from ..shared.model import ClingoMethodCall


class Database(ABC):

    @abstractmethod
    def append(self, call: ClingoMethodCall):
        pass

    @abstractmethod
    def extend(self, calls: List[ClingoMethodCall]):
        pass

    @abstractmethod
    def get_all(self) -> List[ClingoMethodCall]:
        pass

    @abstractmethod
    def get_pending(self) -> Optional[List[ClingoMethodCall]]:
        pass

    @abstractmethod
    def mark_call_as_used(self, call: ClingoMethodCall):
        pass


class ProgramDatabase:
    def __init__(self, path="prg.lp"):
        self.path: str = path

    def get_program(self):
        prg = ""
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                prg = "\n".join(f.readlines())
        except FileNotFoundError:
            self.save_program("")
        return prg

    def add_to_program(self, program: str):
        current = self.get_program()
        current = current + program
        self.save_program(current)

    def save_program(self, program: str):
        with open(self.path, "w", encoding="utf-8") as f:
            f.writelines(program.split("\n"))

    def clear_program(self):
        with open(self.path, "w", encoding="utf-8") as f:
            f.write("")


class CallCenter(Database):

    def __init__(self):
        self.calls: List[ClingoMethodCall] = []
        self.used: Set[UUID] = set()
        subscribe(Event.CALL_EXECUTED, self.mark_call_as_used)

    def append(self, call: ClingoMethodCall):
        self.calls.append(call)

    def extend(self, calls: List[ClingoMethodCall]):
        self.calls.extend(calls)

    def get_all(self) -> List[ClingoMethodCall]:
        return self.calls

    def get_pending(self) -> Optional[List[ClingoMethodCall]]:
        return list(filter(lambda call: call.uuid not in self.used, self.calls))

    def mark_call_as_used(self, call: ClingoMethodCall):
        self.used.add(call.uuid)
