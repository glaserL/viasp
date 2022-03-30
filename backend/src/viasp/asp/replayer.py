from typing import Sequence, Optional, Callable

from clingo import Control

from ..server.database import ProgramDatabase
from ..shared.event import Event, publish
from ..shared.model import ClingoMethodCall
from ..shared.simple_logging import warn


def handler(cls):
    cls.handlers = {}
    for methodname in dir(cls):
        method = getattr(cls, methodname)
        if hasattr(method, '_handles'):
            for name in method._handles:
                cls.handlers[name] = method
    return cls


def handles(*args):
    def wrapper(func):
        func._handles = args
        return func

    return wrapper


@handler
class ClingoReconstructor:

    def _get_handling_function(self, func_name: str) -> Optional[Callable]:
        for func, responsive_for in self.handlers.items():
            if func_name in responsive_for:
                return func

    def apply(self, call: ClingoMethodCall, ctl: Control) -> Control:
        func = self.handlers.get(call.name, None)
        if func is None:
            warn(f"No function for {call.name} found. Defaulting to NOOP.")
            return self.no_op(ctl, call)
        return func(self, ctl, call)

    @handles("DEFAULT", "solve")
    def no_op(self, ctl, _) -> Control:
        return ctl

    @handles("ground")
    def identity(self, ctl: Control, call: ClingoMethodCall) -> Control:
        func = getattr(ctl, call.name)
        func(**call.kwargs)
        return ctl

    @handles("add")
    def add(self, ctl: Control, call: ClingoMethodCall) -> Control:
        db = ProgramDatabase()
        db.add_to_program(call.kwargs["program"])
        func = getattr(ctl, call.name)
        func(**call.kwargs)
        return ctl

    @handles("__init__")
    def create_(self, _, call: ClingoMethodCall):
        db = ProgramDatabase()
        db.clear_program()
        return Control(**call.kwargs)

    @handles("load")
    def load(self, ctl: Control, call: ClingoMethodCall):
        path = call.kwargs["path"]
        prg = ""
        with open(path, encoding="utf-8") as f:
            prg = "\n".join(f.readlines())
        db = ProgramDatabase()
        db.add_to_program(prg)
        ctl.load(path)
        return ctl


BOB_THE_BUILDER = ClingoReconstructor()


def apply_multiple(calls: Sequence[ClingoMethodCall], ctl=None) -> Control:
    for call in calls:
        ctl = apply(call, ctl)
    return ctl


def apply(call: ClingoMethodCall, ctl=None):
    result = BOB_THE_BUILDER.apply(call, ctl)
    publish(Event.CALL_EXECUTED, call=call)
    return result
