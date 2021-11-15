type NumberSymbol = {
    type: string,
    number: number
}
type FunctionSymbol = {
    type: string,
    name: string,
    arguments: Array<FunctionSymbol | NumberSymbol>
}

type Symbol = FunctionSymbol | NumberSymbol

export function make_atoms_string(atoms: Symbol[] | Symbol): string {
    // console.log(`IN: ${JSON.stringify(atoms)}`)
    if (atoms instanceof Array) {
        // console.log(`An array ${atoms}`)
        return atoms.map(make_atoms_string).join(" ")
    }
    switch (atoms.type) {
        case "Number":
            const num = atoms as NumberSymbol;
            // console.log(`A number ${JSON.stringify(atoms)}`)
            return num.number.toString();
        case "Function":
            // console.log(`A func ${JSON.stringify(atoms)}`)
            const func = atoms as FunctionSymbol;
            let args = func.arguments.map(make_atoms_string).join(",")
            return `${func.name}(${args})`
    }
}

export function make_rules_string(rules: Symbol[]): string {
    return rules.join(" ")
}

export function backendURL(route: string): string {
    let domain = window.location.hostname; //http://someurl.com
    let port = 5000;
    let url = `http://${domain}:${port}/${route}`;
    console.log(`Returning url ${url}`)
    return url
}
