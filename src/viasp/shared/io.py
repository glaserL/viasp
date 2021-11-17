import json
from enum import IntEnum
from json import JSONEncoder, JSONDecoder
from dataclasses import is_dataclass, asdict
from typing import Any, Union, Collection
from uuid import UUID

import clingo
from _clingo.lib import clingo_model_type_brave_consequences, clingo_model_type_cautious_consequences, \
    clingo_model_type_stable_model
from clingo import Model as clingo_Model, ModelType, Symbol
from clingo.ast import AST

from .model import Model, CostableModel, Node, Transformation


def model_to_json(model: Union[clingo_Model, Collection[clingo_Model]], *args, **kwargs) -> str:
    return json.dumps(model, *args, cls=ClingoModelEncoder, **kwargs)


class DataclassJSONDecoder(JSONDecoder):
    def __init__(self, *args, **kwargs):
        JSONDecoder.__init__(self, object_hook=self.object_hook, *args, **kwargs)

    def object_hook(self, obj):
        if '_type' not in obj:
            return obj
        type = obj['_type']
        del obj['_type']
        if type == 'Model':
            return Model(**obj)
        elif type == 'CostableModel':
            return CostableModel(**obj)
        elif type == "Function":
            return clingo.Function(**obj)
        elif type == "Number":
            return clingo.Number(**obj)
        elif type == "Node":
            obj['atoms'] = frozenset(obj['atoms'])
            obj['diff'] = frozenset(obj['diff'])
            return Node(**obj)
        elif type == "Transformation":
            return Transformation(**obj)
        return obj


class DataclassJSONEncoder(JSONEncoder):
    def default(self, o):
        if is_dataclass(o):
            result = asdict(o)
            print(o)
            result["_type"] = repr(o).split("(")[0]
            return result
        elif isinstance(o, UUID):
            return o.hex
        elif isinstance(o, frozenset):
            return list(o)
        elif isinstance(o, set):
            return list(o)
        elif isinstance(o, AST):
            return str(o)
        elif isinstance(o, clingo_Model):
            x = model_to_dict(o)
            return x
        elif isinstance(o, ModelType):
            if o in [ModelType.CautiousConsequences, ModelType.BraveConsequences, ModelType.StableModel]:
                return {"__enum__": str(o)}
            return super().default(o)
        elif isinstance(o, Symbol):
            x = symbol_to_dict(o)
            return x
        return super().default(o)


def model_to_dict(model: clingo_Model) -> dict:
    model_dict = {"cost": model.cost, "optimality_proven": model.optimality_proven, "type": model.type,
                  "atoms": model.symbols(atoms=True), "terms": model.symbols(terms=True),
                  "shown": model.symbols(shown=True), "csp": model.symbols(csp=True),
                  "theory": model.symbols(theory=True)}
    return model_dict


def symbol_to_dict(symbol: clingo.Symbol) -> dict:
    symbol_dict = {}
    if symbol.type == clingo.SymbolType.Function:
        symbol_dict["_type"] = "Function"
        symbol_dict["name"] = symbol.name
        symbol_dict["positive"] = symbol.positive
        symbol_dict["arguments"] = symbol.arguments
    elif symbol.type == clingo.SymbolType.Number:
        symbol_dict["number"] = symbol.number
        symbol_dict["_type"] = "Number"
    return symbol_dict


class viasp_ModelType(IntEnum):
    """
    Enumeration of the different types of models.
    """
    BraveConsequences = clingo_model_type_brave_consequences
    '''
    The model stores the set of brave consequences.
    '''
    CautiousConsequences = clingo_model_type_cautious_consequences
    '''
    The model stores the set of cautious consequences.
    '''
    StableModel = clingo_model_type_stable_model
    '''
    The model captures a stable model.
    '''

    @classmethod
    def from_clingo_ModelType(cls, clingo_ModelType: ModelType):
        print(f"In: {clingo_ModelType} with {clingo_ModelType.name=}")
        if clingo_ModelType.name == cls.BraveConsequences.name:
            return cls.BraveConsequences
        elif clingo_ModelType.name == cls.StableModel.name:
            return cls.StableModel
        else:
            return cls.CautiousConsequences


class ClingoModelEncoder(JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o, clingo_Model):
            x = model_to_dict(o)
            return x
        elif isinstance(o, ModelType):
            if o in [ModelType.CautiousConsequences, ModelType.BraveConsequences, ModelType.StableModel]:
                return {"__enum__": str(o)}
            return super().default(o)
        elif isinstance(o, Symbol):
            x = symbol_to_dict(o)
            return x
        return super().default(o)


def deserialize(data: str, *args, **kwargs):
    return json.loads(data, *args, cls=DataclassJSONDecoder, **kwargs)
