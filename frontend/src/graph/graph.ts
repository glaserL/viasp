import './style.css';
import {backendURL, make_atoms_string, make_rules_string} from "../util";
import {Model, Transformation} from "../types";
import {drawEdges} from "./edges";
import {showDetail} from "../detail/detail";


export function redrawGraph(): Promise<any> {
    return clearGraph().then(drawGraph)
}


function drawGraph(): Promise<any> {
    return fetch(`${backendURL("rules")}`).then(function (r) {
        if (r.ok) {
            r.json().then(async function (rules) {
                const graph_container = document.getElementById("graph_container")
                const facts = await make_facts_container();
                console.log(facts)
                graph_container.appendChild(facts)
                for (const rule of rules) {
                    console.log(rule)
                    const rule_container = await make_rule_container(rule);
                    console.log(`Waited ${rule_container}`)
                    graph_container.appendChild(rule_container);
                }
            })
                .then(_ => drawEdges())
        }
    })
}

function clearGraph(): Promise<any> {
    return new Promise<any>((resolve) => {
        const graph_container = document.getElementById("graph_container")
        graph_container.textContent = ""
        resolve(null)
    });
}


export function collectNodesShown() {
    var shownNodes = document.getElementsByClassName("set_container")
    var result = Array.from(shownNodes).filter(e => e.clientWidth > 0).map(e => e.getAttribute("id"))

    return result
}


function makeNodeDiv(child: Model): HTMLElement {
    var atomString = make_atoms_string(child.atoms);
    atomString = atomString.length == 0 ? "Ø" : atomString;
    let div = document.createElement("div");
    div.id = child.uuid;
    div.style.cursor = "pointer";
    div.onclick = () => showDetail(child.uuid);
    div.classList.add("set_container")
    div.innerHTML = `<div class="set_header">
                             </div>
                            <div class="set_value">
                                ${atomString}
                            </div>`
    return div;
}

function thisisprobablyrefactorable(fact_node: HTMLElement): HTMLElement {
    const fact_row = document.createElement("div")
    fact_row.id = "row_facts"
    fact_row.classList.add("row_container");
    const facts_header = document.createElement("div");
    facts_header.classList.add("row_header")
    facts_header.style.cursor = "pointer";
    facts_header.onclick = () => toggleRow('row_facts');
    facts_header.innerText = "Facts";
    const actual_container = document.createElement("div")
    actual_container.classList.add("row_row");
    actual_container.append(fact_node)
    fact_row.appendChild(facts_header);
    fact_row.appendChild(actual_container);
    return fact_row;

}

async function make_rule_container(rules: Transformation): Promise<HTMLElement> {
    const row = document.createElement("div")
    row.id = `row_${rules.id}`
    row.classList.add("row_container")
    const header = document.createElement("div")
    header.classList.add("row_header")
    header.style.cursor = "pointer";
    header.onclick = () => toggleRow(`row_${rules.id}`)
    header.innerText = make_rules_string(rules.rules);

    const actual_container = document.createElement("div")
    actual_container.classList.add("row_row");
    row.appendChild(header);
    let nodes = await make_node_divs(rules)
    for (const node of nodes) {
        actual_container.appendChild(node);
    }
    row.appendChild(actual_container)
    return row;

}

async function make_facts_container() {
    const facts_node = await fetch(backendURL("facts"))
        .then(r => r.json())
        .then(facts => makeNodeDiv(facts))
    return thisisprobablyrefactorable(facts_node);
}

async function make_node_divs(rule: any): Promise<HTMLElement[]> {
    var nodes: any[] = []
    await fetch(`${backendURL("children")}/?rule_id=${rule.id}`)
        .then((r) => r.json())
        .then(async function (children) {
            for (const child of children) {
                nodes.push(makeNodeDiv(child))
            }
        })
    return Promise.all(nodes);
}

export function toggleRow(row_id: string): void {
    //console.log(`Toggling ${row_id}`);
    const thingToToggle: HTMLElement = document.getElementById(row_id).querySelector(".row_row");
    if (thingToToggle.style.display === "none") {
        thingToToggle.style.display = "flex";

    } else {
        thingToToggle.style.display = "none";
    }

    // setTimeout(drawEdges, 100);
}
