function make_atoms_string(atoms) {
    console.log(`IN: ${JSON.stringify(atoms)}`)
    if (atoms instanceof Array) {
        console.log(`An array ${atoms}`)
        return atoms.map(make_atoms_string).join(" ")
    }
    switch (atoms["_type"]) {
        case "Number":
            console.log(`A number ${JSON.stringify(atoms)}`)
            return atoms["number"]
        case "Function":
            console.log(`A func ${JSON.stringify(atoms)}`)
            let args = atoms["arguments"].map(make_atoms_string).join(",")
            return `${atoms["name"]}(${args})`
    }

}

async function make_rule_cotainer(node) {
    console.log(node)
    let nodes = await make_node_divs(node)
    return `<div id="row_${node.id}" style="cursor: pointer" class=row_container>
<div class="row_header" style="cursor: pointer" onclick="toggleRow(this)">${node.rules}</div>
<div class="row_row">
${nodes.join("")}
</div>
</div>`
}

function makeNodeDiv(child): string {
    return `<div id="${child.uuid}" style="cursor: pointer" onclick="showDetail( this )"
                             class=set_container>
                             
                            <div class="set_value">
                                ${make_atoms_string(child.atoms)}
                            </div>
                        </div>`
}

async function make_node_divs(rule: any) {
    return fetch(`children/?rule_id=${rule.id}`)
        .then((r) => r.json())
        .then(async function (children) {
            console.log(children)
            var nodes = []
            for (const child of children) {
                nodes.push(makeNodeDiv(child))
            }
            return nodes;
        })
}


document.addEventListener("DOMContentLoaded", function () {
    fetch(`rules`).then(function (r) {
        if (r.ok) {
            r.json().then(async function (rules) {
                const graph_container = document.getElementById("graph_container")
                for (const rule of rules) {
                    const node_child = await make_rule_cotainer(rule);
                    graph_container.insertAdjacentHTML('beforeend', node_child);
                }
            })
        }
    })
})

var checkbox = document.querySelector("input[type=checkbox]");
console.log(checkbox)
checkbox.addEventListener('change', function () {
    fetch(`
    settings/?${this.getAttribute("value")}=${this.checked}`, {
        method: "POST"
    }).then(function (r) {
        console.log(r);
    })
});

function toggleRow(container) {
    console.log(container);
    const thingToToggle = container.parentNode.getElementsByClassName("row_row")[0];
    if (thingToToggle.style.display === "none") {
        thingToToggle.style.display = "flex";
    } else {
        thingToToggle.style.display = "none";
    }
}

function toggleDetailContent(container) {
    console.log(container)
    const thingToToggle = container.parentNode.getElementsByClassName("detail_atom_view_content")[0];
    const stateSpan = container.getElementsByClassName("detail_atom_view_heading_state")[0];
    console.log(thingToToggle)
    console.log(stateSpan)
    if (thingToToggle.style.display === "none") {
        thingToToggle.style.display = "block";
        stateSpan.innerHTML = "&or; "
    } else {
        thingToToggle.style.display = "none";
        stateSpan.innerHTML = "> "
    }
}

function isClosed(id) {
    const width = document.getElementById(id).style.width;
    return width === "" || width === "0px";
}


function showDetail(node) {
    if (isClosed("detailSidebar")) {
        openNav();
    }
    console.log(`Node: ${node}`)
    console.log(node.id)
    fetch(`model/?uuid=${node.id}`)
        .then((r) => r.json())
        .catch(reason => console.log(reason))
        .then(function (data) {
            const detail = document.getElementById("detailSidebar");
            console.log(data)
            var pretty = data.map(elem => createTogglableDetailDivForAtoms("header", elem)).join("")
            detail.innerHTML = `<h3 onclick="closeNav()">Stable Model</h3><p>${pretty}</p>`
        });
}

function createTogglableDetailDivForAtoms(header, elem): string {
    return `<div><h3 class="detail_atom_view_heading" onclick="toggleDetailContent(this)"><span class="detail_atom_view_heading_state">&or; </span>${header}</h3><div class="detail_atom_view_content">${make_atoms_string(elem.atoms)}</div></div>`
}


function openNav() {
    document.getElementById("detailSidebar").style.width = "250px";
}

function closeNav() {
    document.getElementById("detailSidebar").style.width = "0"
}
