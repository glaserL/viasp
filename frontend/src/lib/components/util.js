export function make_atoms_string(atoms) {
    // console.log(`IN: ${JSON.stringify(atoms)}`)
    if (Array.isArray(atoms)) {
        // console.log(`An array ${atoms}`)
        return atoms.map(make_atoms_string).join(" ")
    }
    switch (atoms._type) {
        case "Number":
            // console.log(`A number ${JSON.stringify(atoms)}`)
            return atoms.number.toString();
        case "Function":
            // console.log(`A func ${JSON.stringify(atoms)}`)
            const args = atoms.arguments.map(make_atoms_string).join(",")
            return args.length > 0 ? `${atoms.name}(${args})` : `${atoms.name}`
        default:
            throw new TypeError(`Unimplemented type ${atoms._type}`)

    }
}

// class RuleHeader extends Component {
//     render() {
//         const {rule, notifyClick} = this.props
//         return <div className="row_header" onClick={() => notifyClick(this)}>{rule}</div>
//     }
// }
//
export function backendURL(route) {
    const domain = "localhost"
    const port = 5000;
    const url = `http://${domain}:${port}/${route}`;
    console.log(`Returning url ${url}`)
    return url
}
