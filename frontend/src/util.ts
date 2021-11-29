import {ClingoSymbol, Filter, FunctionSymbol, NumberSymbol, Rule, Signature} from "./types";
import {Func} from "mocha";

export function make_atoms_string(atoms: ClingoSymbol[] | ClingoSymbol): string {
    // console.log(`IN: ${JSON.stringify(atoms)}`)
    if (atoms instanceof Array) {
        // console.log(`An array ${atoms}`)
        return atoms.map(make_atoms_string).join(" ")
    }
    switch (atoms._type) {
        case "Number":
            const num = atoms as NumberSymbol;
            // console.log(`A number ${JSON.stringify(atoms)}`)
            return num.number.toString();
        case "Function":
            // console.log(`A func ${JSON.stringify(atoms)}`)
            const func = atoms as FunctionSymbol;
            let args = func.arguments.map(make_atoms_string).join(",")
            return args.length > 0 ? `${func.name}(${args})` : `${func.name}`
        default:
            throw TypeError(`Unimplemented type ${atoms._type}`)

    }
}

export function make_rules_string(rule: Rule[]): string {
    // TODO: This is pretty bad. Adjust types for this.
    return rule.join(" ")
}

export function backendURL(route: string): string {
    let domain = window.location.hostname; //http://someurl.com
    let port = 5000;
    let url = `http://${domain}:${port}/${route}`;
    console.log(`Returning url ${url}`)
    return url
}
