import json
import sys
from enum import IntEnum
from json import JSONEncoder, JSONDecoder
from dataclasses import is_dataclass, asdict
from typing import Any, Union, Collection
from uuid import UUID

import clingo
import networkx as nx
from _clingo.lib import clingo_model_type_brave_consequences, clingo_model_type_cautious_consequences, \
    clingo_model_type_stable_model
from clingo import Model as clingo_Model, ModelType, Symbol
from clingo.ast import AST, Function

from .model import Node, Transformation, Signature, Filter, StableModel, ClingoMethodCall


def model_to_json(model: Union[clingo_Model, Collection[clingo_Model]], *args, **kwargs) -> str:
    return json.dumps(model, *args, cls=DataclassJSONEncoder, **kwargs)


def object_hook(obj):
    if '_type' not in obj:
        return obj
    type = obj['_type']
    del obj['_type']
    if type == "Function":
        return clingo.Function(**obj)
    elif type == "Number":
        return clingo.Number(**obj)
    elif type == "Node":
        obj['atoms'] = frozenset(obj['atoms'])
        obj['diff'] = frozenset(obj['diff'])
        return Node(**obj)
    elif type == "Transformation":
        return Transformation(**obj)
    elif type == "Signature":
        return Signature(**obj)
    elif type == "Filter":
        return Filter(**obj)
    elif type == "Graph":
        return nx.node_link_graph(obj["_graph"])
    elif type == "StableModel":
        return StableModel(**obj)
    elif type == "ClingoMethodCall":
        return ClingoMethodCall(**obj)
    return obj


class DataclassJSONDecoder(JSONDecoder):
    def __init__(self, *args, **kwargs):
        print("INIT")
        JSONDecoder.__init__(self, object_hook=object_hook, *args, **kwargs)
        print("INITED")


def dataclass_to_dict(o):
    if isinstance(o, Filter):
        return {"_type": "Filter", "on": o.on}
    elif isinstance(o, Node):
        return {"_type": "Node", "atoms": o.atoms, "diff": o.diff, "uuid": o.uuid,
                "rule_nr": o.rule_nr}
    elif isinstance(o, Signature):
        return {"_type": "Signature", "name": o.name, "args": o.args}
    elif isinstance(o, Transformation):
        return {"_type": "Transformation", "id": o.id, "rules": o.rules}
    elif isinstance(o, StableModel):
        return {"_type": "StableModel", "cost": o.cost, "optimality_proven": o.optimality_proven, "type": o.type,
                "atoms": o.atoms, "terms": o.terms, "shown": o.shown, "csp": o.csp, "theory": o.theory}
    elif isinstance(o, ClingoMethodCall):
        return {"_type": "ClingoMethodCall", "name": o.name, "kwargs": o.kwargs, "uuid": o.uuid}
    else:
        raise Exception(f"I/O for {type(o)} not implemented!")


class DataclassJSONEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, clingo_Model):
            x = model_to_dict(o)
            return x
        elif isinstance(o, ModelType):
            return {"__enum__": str(o)}
        elif isinstance(o, Symbol):
            x = symbol_to_dict(o)
            return x
        elif is_dataclass(o):
            result = dataclass_to_dict(o)
            return result
        elif isinstance(o, nx.Graph):
            return {"_type": "Graph", "_graph": nx.node_link_data(o)}
        elif isinstance(o, UUID):
            return o.hex
        elif isinstance(o, frozenset):
            return list(o)
        elif isinstance(o, set):
            return list(o)
        elif isinstance(o, AST):
            return str(o)
        return super().default(o)


def model_to_dict(model: clingo_Model) -> dict:
    model_dict = {"cost": model.cost, "optimality_proven": model.optimality_proven, "type": model.type,
                  "atoms": model.symbols(atoms=True), "terms": model.symbols(terms=True),
                  "shown": model.symbols(shown=True), "csp": model.symbols(csp=True),
                  "theory": model.symbols(theory=True), "_type": "StableModel"}
    return model_dict


def hae(s):
    if isinstance(s, list):
        return [hae(e) for e in s]
    if isinstance(s, Symbol):
        if s.type == clingo.SymbolType.Function:
            return clingo.Function(s.name, hae(s.arguments), s.positive)
        if s.type == clingo.SymbolType.Number:
            return clingo.Number(s.number)


def clingo_model_to_stable_model(model: clingo_Model) -> StableModel:
    return StableModel(model.cost, model.optimality_proven, model.type, hae(model.symbols(atoms=True)),
                       hae(model.symbols(terms=True)), hae(model.symbols(shown=True)), hae(model.symbols(csp=True)),
                       hae(model.symbols(theory=True)))


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
