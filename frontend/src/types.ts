export type NumberSymbol = {
    _type: string,
    number: number
}
export type FunctionSymbol = {
    _type: string,
    name: string,
    arguments: Array<FunctionSymbol | NumberSymbol>
}
export type ClingoSymbol = FunctionSymbol | NumberSymbol
export type Rule = {
    head: ClingoSymbol,
    body: ClingoSymbol[]
}
export type Transformation = {
    _type: string,
    id: string,
    rules: Rule[]
}
export type Model = {
    _type: string,
    uuid: string,
    atoms: ClingoSymbol[]
}
