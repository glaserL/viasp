import './style.css';
import {backendURL, make_atoms_string} from "../util";
import {Model, Transformation} from "../types";
import {drawEdges} from "./edges";


export function redrawGraph(): Promise<any> {
    return clearGraph().then(drawGraph)
}


function drawGraph(): Promise<any> {
    return fetch(`${backendURL("rules")}`).then(function (r) {
        if (r.ok) {
            r.json().then(async function (rules) {
                const graph_container = document.getElementById("graph_container")
                const facts = await make_facts_container();
                graph_container.insertAdjacentHTML("beforeend", facts)
                for (const rule of rules) {
                    const node_child = await make_rule_container(rule);
                    graph_container.insertAdjacentHTML('beforeend', node_child);
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


async function make_rule_container(rules: Transformation) {
    let nodes = await make_node_divs(rules)
    return `<div id="row_${rules.id}" style="cursor: pointer" class=row_container>
<div class="row_header" style="cursor: pointer" onclick="toggleRow('row_${rules.id}')">${rules.rules}</div>
<div class="row_row">
${nodes.join("")}
</div>
</div>`
}

function makeNodeDiv(child: Model): string {
    var atomString = make_atoms_string(child.atoms);
    atomString = atomString.length == 0 ? "Ø" : atomString;
    return `<div id="${child.uuid}" style="cursor: pointer" onclick="showDetail( this )"
                             class=set_container>
                             <div class="set_header">
                                ${child.uuid}
                             </div>
                            <div class="set_value">
                                ${atomString}
                            </div>
                        </div>`
}

async function make_facts_container() {
    const facts_node = await fetch(backendURL("facts"))
        .then(r => r.json())
        .then(facts => makeNodeDiv(facts))
    return `<div id="row_facts" style="cursor: pointer" class=row_container>
<div class="row_header" style="cursor: pointer" onclick="toggleRow('row_facts')">Facts</div>
<div class="row_row">
${facts_node}
</div>
</div>`
}

async function make_node_divs(rule: any) {
    return fetch(`${backendURL("children")}/?rule_id=${rule.id}`)
        .then((r) => r.json())
        .then(async function (children) {
            //console.log(`Drawing for ${JSON.stringify(rule)} (${children.length}) children ${JSON.stringify(children)}`)
            var nodes = []
            for (const child of children) {
                nodes.push(makeNodeDiv(child))
            }
            return nodes;
        })
}
