function make_atoms_string(atoms) {
    // console.log(`IN: ${JSON.stringify(atoms)}`)
    if (atoms instanceof Array) {
        // console.log(`An array ${atoms}`)
        return atoms.map(make_atoms_string).join(" ")
    }
    switch (atoms["_type"]) {
        case "Number":
            // console.log(`A number ${JSON.stringify(atoms)}`)
            return atoms["number"]
        case "Function":
            // console.log(`A func ${JSON.stringify(atoms)}`)
            let args = atoms["arguments"].map(make_atoms_string).join(",")
            return `${atoms["name"]}(${args})`
    }
}

function
make_rules_string(rules): string {
    return rules.join(" ")
}

async function make_facts_container() {
    const facts_node = await fetch("facts")
        .then(r => r.json())
        .then(facts => makeNodeDiv(facts))
    return `<div id="row_facts" style="cursor: pointer" class=row_container>
<div class="row_header" style="cursor: pointer" onclick="toggleRow('row_facts')">Facts</div>
<div class="row_row">
${facts_node}
</div>
</div>`
}

async function make_rule_container(rules) {
    let nodes = await make_node_divs(rules)
    return `<div id="row_${rules.id}" style="cursor: pointer" class=row_container>
<div class="row_header" style="cursor: pointer" onclick="toggleRow('row_${rules.id}')">${rules.rules}</div>
<div class="row_row">
${nodes.join("")}
</div>
</div>`
}

function makeNodeDiv(child): string {
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

async function make_node_divs(rule: any) {
    return fetch(`children/?rule_id=${rule.id}`)
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


var checkbox = document.querySelector("input[type=checkbox]");
checkbox.addEventListener('change', function () {
    fetch(`
    settings/?${this.getAttribute("value")}=${this.checked}`, {
        method: "POST"
    }).then(function (r) {
        console.log(r);
    })
});

function toggleRow(row_id) {
    //console.log(`Toggling ${row_id}`);
    const thingToToggle: HTMLElement = document.getElementById(row_id).querySelector(".row_row");
    if (thingToToggle.style.display === "none") {
        thingToToggle.style.display = "flex";

    } else {
        thingToToggle.style.display = "none";
    }

    setTimeout(drawEdges, 100);
}

function toggleDetailContent(container) {
    const thingToToggle = container.parentNode.getElementsByClassName("detail_atom_view_content")[0];
    const stateSpan = container.getElementsByClassName("detail_atom_view_heading_state")[0];
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
    fetch(`model/?uuid=${node.id}`)
        .then((r) => r.json())
        .catch(reason => console.log(reason))
        .then(function (data) {
            const detail = document.getElementById("detailSidebar");
            console.log(data)
            var pretty = data.map(elem => createTogglableDetailDivForAtoms(elem[0], elem[1])).join("")
            detail.innerHTML = `<h3 onclick="closeNav()">Stable Model</h3><p>${pretty}</p>`
        });
}

function createTogglableDetailDivForAtoms(header, elem): string {

    return `<div><h3 class="detail_atom_view_heading" onclick="toggleDetailContent(this)"><span class="detail_atom_view_heading_state">&or; </span>${header}</h3><div class="detail_atom_view_content">${make_atoms_string(elem)}</div></div>`
}


function openNav() {
    document.getElementById("detailSidebar").style.width = "250px";
    setTimeout(drawEdges, 100);
}

function closeNav() {
    document.getElementById("detailSidebar").style.width = "0"
    setTimeout(drawEdges, 100);
}


function collectNodesShown() {
    var shownNodes = document.getElementsByClassName("set_container")
    var result = Array.from(shownNodes).filter(e => e.clientWidth > 0).map(e => e.getAttribute("id"))

    return result
}

function clearConnections() {
    for (const connector of connectors) {
        const id = "L" + connector.id;
        const thingToClear = document.getElementById(id);
        thingToClear.remove()
    }
    connectors = []
}

let connectors = [];

function drawEdges() {
    console.log("Drawing edges..")
    clearConnections()

    fetch("edges", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(collectNodesShown())
    })
        .then((r) => r.json())
        .catch(reason => console.log(reason))
        .then(function (edges) {
                //console.log(`Got ${JSON.stringify(edges)} from backend`)
                for (const edge of edges) {
                    //console.log(`Got ${JSON.stringify(edge)} from backend`)
                    var src = edge["src"]
                    var tgt = edge["tgt"]
                    var conn = new muConnector({
                        ele1: src,
                        ele2: tgt,
                        lineStyle: "5px solid red",
                    });
                    connectors.push(conn);
                    conn.link()

                }
            }
        )
}

class muConnector {
    private gapX1: any;
    private gapY1: any;
    private gapX2: any;
    private gapY2: any;
    private gap: any;
    private PseudoGuid: any;
    private id: any;
    private ele1: any;
    private ele2: any;
    private lineID: any;
    private line: any;
    private offsets: any;

    constructor(params) {
        if (typeof params == "undefined") {
            return;
        } // If no params then abandon.
        // Process input params.
        var ele1 = params.ele1 || ""; // First element to link
        var ele2 = params.ele2 || ""; // Second element to link
        if (ele1.length === 0 || ele2.length === 0) {
            return;
        } // If not two element id's then abandon.

        var className = params.class || "muConnector";

        var lineStyle = params.lineStyle || "1px solid #666666"; // CSS style for connector line.

        this.gapX1 = params.gapX1 || (params.defaultGap ? params.defaultGap : 0); // First element gap before start of connector, etc
        this.gapY1 = params.gapY1 || (params.defaultGap ? params.defaultGap : 0);
        this.gapX2 = params.gapX2 || (params.defaultGap ? params.defaultGap : 0);
        this.gapY2 = params.gapY2 || (params.defaultGap ? params.defaultGap : 0);

        this.gap = params.gap || 0; // use a single gap setting.
        if (this.gap > 0) {
            this.gapX1 = this.gap;
            this.gapY1 = this.gap;
            this.gapX2 = this.gap;
            this.gapY2 = this.gap;
        }

        var pos = function () {
            // only used for standalone drag processing.
            this.left = 0;
            this.top = 0;
        };

        this.PseudoGuid = new (function () {
            // Make a GUID to use in unique id assignment - from and credit to http://stackoverflow.com/questions/226689/unique-element-id-even-if-element-doesnt-have-one
            this.empty = "00000000-0000-0000-0000-000000000000";
            this.GetNew = function () {
                var fC = function () {
                    return (((1 + Math.random()) * 0x10000) | 0)
                        .toString(16)
                        .substring(1)
                        .toUpperCase();
                };
                return (
                    fC() +
                    fC() +
                    "-" +
                    fC() +
                    "-" +
                    fC() +
                    "-" +
                    fC() +
                    "-" +
                    fC() +
                    fC() +
                    fC()
                );
            };
        })();

        this.id = this.PseudoGuid.GetNew(); // use guid to avoid id-clashes with manual code.
        this.ele1 = document.getElementById(ele1);
        this.ele2 = document.getElementById(ele2);

        // Append the div that is the link line into the DOM
        this.lineID = "L" + this.id;
        document.getElementById("content").insertAdjacentHTML('beforeend',
            "<div id='" + this.lineID + "' class='" + className + "' style=pointer-events:none;  ></div>");
        this.line = document.getElementById("L" + this.id);

        this.line.style.position = "absolute";
        this.line.style.borderLeft = lineStyle;
        this.line.style.zIndex = -100;

        // We may need to store the offsets of each element that we are connecting.
        this.offsets = [];
        this.offsets[ele1] = new pos();
        this.offsets[ele2] = new pos();

        this.link(); // show the initial link
    }

    link() {
        var linkEle1 = document.getElementById(this.ele1.id);
        var linkEle2 = document.getElementById(this.ele2.id);
        var line = document.getElementById("L" + this.id);

        var ele1rect = linkEle1.getBoundingClientRect();
        var originX =
            ele1rect.left + document.body.scrollLeft + linkEle1.offsetWidth / 2;
        var originY =
            window.pageYOffset +
            ele1rect.top +
            document.body.scrollTop +
            linkEle1.offsetHeight / 2;

        var ele2rect = linkEle2.getBoundingClientRect();
        var targetX =
            ele2rect.left + document.body.scrollLeft + linkEle2.offsetWidth / 2;
        var targetY =
            window.pageYOffset +
            ele2rect.top +
            document.body.scrollTop +
            linkEle2.offsetHeight / 2;

        var l = this.hyp(targetX - originX, targetY - originY);
        var angle = (180 / 3.1415) * Math.acos((targetY - originY) / l);
        if (targetX > originX) {
            angle = angle * -1;
        }

        // Compute adjustments to edge of element plus gaps.
        var adj1 = this.edgeAdjust(
            angle,

            parseFloat(getComputedStyle(linkEle1, null).width.replace("px", "")) /
            2,

            parseFloat(getComputedStyle(linkEle1, null).height.replace("px", "")) /
            2
        );
        var adj2 = this.edgeAdjust(
            angle,

            parseFloat(getComputedStyle(linkEle2, null).width.replace("px", "")) /
            2,

            parseFloat(getComputedStyle(linkEle2, null).height.replace("px", "")) /
            2
        );

        l = l - (adj1.hp + adj2.hp);

        line.style.left = originX + "px";
        line.style.height = l + "px";
        line.style.width = "0";
        line.style.top = originY + adj1.hp + "px";
        line.style.transform = "rotate(" + angle + "deg)";
        line.style.transformOrigin = "0 " + -1 * adj1.hp + "px";
        line.style.zIndex = "100";
    }

    Round(value, places) {
        var multiplier = Math.pow(10, places);
        return Math.round(value * multiplier) / multiplier;
    }

    edgeAdjust(a, w1, h1) {
        var w = 0,
            h = 0;

        // compute corner angles
        var ca = [];
        ca[0] = (Math.atan(w1 / h1) * 180) / 3.1415926; // RADIANS !!!
        ca[1] = 180 - ca[0];
        ca[2] = ca[0] + 180;
        ca[3] = ca[1] + 180;

        // Based on the possible sector and angle combinations work out the adjustments.
        if (this.Round(a, 0) === 0) {
            h = h1;
            w = 0;
        } else if (this.Round(a, 0) === 180) {
            h = h1;
            w = 0;
        } else if ((a > 0 && a <= ca[0]) || (a < 0 && a >= -1 * ca[0])) {
            h = h1;
            w = -1 * Math.tan(a * (3.1415926 / 180)) * h1;
        } else if (a > ca[0] && a <= 90) {
            h = Math.tan((90 - a) * (3.1415926 / 180)) * w1;
            w = w1;
        } else if (a > 90 && a <= ca[1]) {
            h = -1 * Math.tan((a - 90) * (3.1415926 / 180)) * w1;
            w = w1;
        } else if (a > ca[1] && a <= 180) {
            h = h1;
            w = -1 * Math.tan((180 - a) * (3.1415926 / 180)) * h1;
        } else if (a > -180 && a <= -1 * ca[1]) {
            h = h1;
            w = Math.tan((a - 180) * (3.1415926 / 180)) * h1;
        } else if (a > -1 * ca[1] && a <= 0) {
            h = Math.tan((a - 90) * (3.1415926 / 180)) * w1;
            w = w1;
        }

        // We now have the width and height offsets - compute the hypotenuse.
        var hp = this.hyp(w, h);

        return {hp: hp};
    }

    hyp(X, Y) {
        return Math.abs(Math.sqrt(X * X + Y * Y));
    }
}

function refreshEdges() {
    connectors.forEach((c) => {
        var ele = c.ele2;
        var rect = ele.getBoundingClientRect();
        c.offsets[c.ele2.id].left = rect.left + document.body.scrollLeft;
        c.offsets[c.ele2.id].top = rect.top + document.body.scrollTop;

        c.link();

    });

}

//
// window.addEventListener("resize", (e) => {
//   connectors.forEach((c) => {
//     var ele = c.ele2;
//     var rect = ele.getBoundingClientRect();
//     c.offsets[c.ele2.id].left = e.pageX - rect.left + document.body.scrollLeft;
//     c.offsets[c.ele2.id].top = e.pageY - rect.top + document.body.scrollTop;
//
//     ele.style.left = e.pageX - c.offsets[c.ele2.id].left;
//     ele.style.top = e.pageY - c.offsets[c.ele2.id].top;
//     c.link();
//   });
// });
//

////////////////////// ACTIVE FILTER PILL

function showFilterPill(uuid, type) {
    const target = document.getElementById("active_filter")
    if (type == "Node") {
        fetch("/node/" + uuid)
            .then(r => r.json())
            .then(n => {
                target.innerHTML = `${make_atoms_string(n.atoms)}<span class='close'>X</span>`
            })
            .catch(e => console.error(e))
    }
}

function clearFilterPill() {
    const filterPill = document.getElementById("active_filter")
    filterPill.innerHTML = ""
    filterPill.classList.remove("search_set", "search_rule")
    return fetch("/filter", {
        method: "DELETE"
    }).catch(e => console.error("Couldn't redraw graph when clearing filter." + e));
}

function clearFilterPillAndRedraw() {
    return clearFilterPill().then(redrawGraph);
}

////////////////////// SEARCH BAR
var currentFocus = -1;

function clearActives(options: HTMLCollectionOf<Element>) {
    Array.from(options).map(opt => opt.classList.remove("active"))
}

function updateSelection(options) {


    console.log(`Updating ${options.length} options ${currentFocus}`)

    if (!options) return false;
    clearActives(options)
    if (currentFocus >= options.length) currentFocus = 0
    if (currentFocus < 0) currentFocus = (options.length - 1)
    options[currentFocus].classList.add("active")
}

async function handleKeyPress(event) {
    var options = document.getElementsByClassName("search_row")
    if (event.key === "ArrowUp") {
        currentFocus--;
        updateSelection(options)
    } else if (event.key == "ArrowDown") {
        currentFocus++;
        updateSelection(options)
    } else if (event.key == "Enter") {
        event.preventDefault();
        if (currentFocus > -1) {
            if (options) {
                const toBeClicked = options[currentFocus] as HTMLElement;
                toBeClicked.click();
            }
        }
    } else {
        showResults();
    }
}

function showResults() {

/// STOLEN FROM https://www.algolia.com/blog/engineering/how-to-implement-autocomplete-with-javascript-on-your-website/
    console.log("Showing results..")
    let val = document.getElementById("q") as HTMLInputElement;
    const res = document.getElementById("search_result");

    const query = val.value
    if (query == '') {
        res.innerHTML = '';
        return;
    }
    let resultList = '';
    fetch('/query?q=' + query).then(
        function (response) {
            return response.json();
        }).then(function (data) {
        for (let i = 0; i < data.length; i++) {
            // console.log(`GETTING ${JSON.stringify(data[i])}`);
            if (data[i]._type == "Node") {
                resultList += `<li class="search_row search_set" id="result_${data[i]._type}_${data[i].uuid}" onmouseover="{asdfg}" onclick="setFilter(this)">${make_atoms_string(data[i].atoms)}</li>`
            } else {
                resultList += `<li class="search_row search_rule"  id="result_${data[i]._type}_${data[i].id}" onmouseover="{asdfg}"  onclick="setFilter(this)">${make_rules_string(data[i].rules)}</li>`
            }
        }
        res.innerHTML = '<ul class="search_result_list" onmouseover="asdfg">' + resultList + '</ul>';
        return true;
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
        return false;
    });
}

function clearFilter(): void {
    document.getElementById("q").nodeValue = ""
    Array.from(document.getElementsByClassName("search_row")).map(e => e.remove())
}

//
// function showActiveNodeFilter(uuid: string): void {
//     fetch()
// }

function initializeSearchBar(): void {
    let searchBar = document.getElementById("q")
    let form = document.getElementsByTagName("form")[0];

    form.onsubmit = async function (event) {
        event.preventDefault();
    }
    console.log(`Adding event listener to ${searchBar}`)
    searchBar.onkeyup = function (event) {
        handleKeyPress(event)
    }
}

function focus(element: HTMLElement) {
    console.log("Focussing")
    var options = document.getElementsByClassName("search_row")
    clearActives(options)
    element.classList.add("active");
}

function asdfg() {
    console.log("MOUSOVER")
}

function setFilter(elem: HTMLInputElement): void {
    let tmp = elem.id.split("_")
    let type = tmp[1]
    let uuid = tmp[2]
    clearFilter()
    if (type == "Transformation") {
        inverseToggleRow(`row_${uuid}`)
    } else if (type == "Node") {
        fetch("/filter?uuid=" + uuid, {
            method: "POST"
        }).then(redrawGraph).catch(e => console.error(e))
    } else {
        throw TypeError("Unknown type to set filter: " + type);
    }
    showFilterPill(uuid, type)
}

function inverseToggleRow(row_id) {
    Array.from(document.getElementsByClassName("row_container")).filter(e => e.id != row_id).forEach(e => toggleRow(e.id))
}

function drawGraph(): Promise<any> {
    return fetch(`rules`).then(function (r) {
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

function redrawGraph(): Promise<any> {
    return clearGraph().then(drawGraph)
}

document.addEventListener("DOMContentLoaded", function () {
    clearFilterPill().then(drawGraph).then(initializeSearchBar);
})
