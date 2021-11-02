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
    var atomString = make_atoms_string(child.atoms);
    atomString = atomString.length == 0 ? "Ø" : atomString;
    return `<div id="${child.uuid}" style="cursor: pointer" onclick="showDetail( this )"
                             class=set_container>
                             
                            <div class="set_value">
                                ${atomString}
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
                .then(_ => drawEdges())
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

function adjustLine(src, tgt) {
    var from = document.getElementById(src)
    var to = document.getElementById(tgt)

    var line = document.createElement("div");

    line.style.background = "red";
    var graph = document.getElementById("graph_container")
    console.log(`Drawing edge from ${src} to ${tgt}`)

    graph.appendChild(line)
    var fT = from.offsetTop + from.offsetHeight / 2;
    var tT = to.offsetTop + to.offsetHeight / 2;
    var fL = from.offsetLeft + from.offsetWidth / 2;
    var tL = to.offsetLeft + to.offsetWidth / 2;

    var CA = Math.abs(tT - fT);
    var CO = Math.abs(tL - fL);
    var H = Math.sqrt(CA * CA + CO * CO);
    var ANG = 180 / Math.PI * Math.acos(CA / H);

    if (tT > fT) {
        var top = (tT - fT) / 2 + fT;
    } else {
        var top = (fT - tT) / 2 + tT;
    }
    if (tL > fL) {
        var left = (tL - fL) / 2 + fL;
    } else {
        var left = (fL - tL) / 2 + tL;
    }

    if ((fT < tT && fL < tL) || (tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)) {
        ANG *= -1;
    }
    top -= H / 2;

    console.log(`Drawing line ${line} with ANG ${ANG} at top ${top} and left ${left}with heigth  ${H}`)

    line.style["-webkit-transform"] = 'rotate(' + ANG + 'deg)';
    line.style["-moz-transform"] = 'rotate(' + ANG + 'deg)';
    line.style["-ms-transform"] = 'rotate(' + ANG + 'deg)';
    line.style["-o-transform"] = 'rotate(' + ANG + 'deg)';
    line.style["-transform"] = 'rotate(' + ANG + 'deg)';
    line.style.top = top + 'px';
    line.style.left = left + 'px';
    line.style.height = H + 'px';
}

function collectNodesShown() {
    var shownNodes = document.getElementsByClassName("set_container")
    var result = Array.from(shownNodes).map(e => e.getAttribute("id"))
    console.log(`Found ${result} ids`)

    return result
}


function drawEdges() {
    console.log("Drawing edges..")
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


                console.log(`Got ${JSON.stringify(edges)} from backend`)
                for (const edge of edges) {
                    console.log(`Got ${JSON.stringify(edge)} from backend`)
                    var c1 = new Connector({ele1: edge["src"], ele2: edge["tgt"], lineStyle: '1px solid red'})
                    c1.link()
                }
            }
        )
}

/*
muConnector - a class to create a line joining two elements.

To use, call new with id's of both elements and optonal lineStyle (which must be a valid css border line def such as '1px solid #000' , e.g.
var c1=new Connector(id1, id2, lineStyle)

Default line style is '1px solid #666666'

Whatever you use for drag control, call moved(e, ele) per increment of movement, where e=event and ele=the jq element being moved.

*/

var Connector = function (params): void {
    if (typeof (params) == "undefined") {
        return;
    }
    var ele1 = params.ele1 || '';   // First element to link
    var ele2 = params.ele2 || '';   // Second element to link
    if (ele1.length === 0 || ele2.length === 0) {
        return;
    }
    // If not two element id's then abandon.

    var className = params.class || 'muConnector'

    var lineStyle = params.lineStyle || '1px solid #666666';   // CSS style for connector line.

    this.gapX1 = params.gapX1 || 0;  // First element gap before start of connector, etc
    this.gapY1 = params.gapY1 || 0;
    this.gapX2 = params.gapX2 || 0;
    this.gapY2 = params.gapY2 || 0;


    this.gap = params.gap || 0; // use a single gap setting.
    if (this.gap > 0) {
        this.gapX1 = this.gap
        this.gapY1 = this.gap
        this.gapX2 = this.gap
        this.gapY2 = this.gap
    }

    var pos = function () { // only used for standalone drag processing.
        this.left = 0;
        this.top = 0;
    }

    this.PseudoGuid = new (function () { // Make a GUID to use in unique id assignment - from and credit to http://stackoverflow.com/questions/226689/unique-element-id-even-if-element-doesnt-have-one
        this.empty = "00000000-0000-0000-0000-000000000000";
        this.GetNew = function () {
            var fC = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1).toUpperCase();
            }
            return (fC() + fC() + "-" + fC() + "-" + fC() + "-" + fC() + "-" + fC() + fC() + fC());
        };
    })();

    this.id = this.PseudoGuid.GetNew(); // use guid to avoid id-clashes with manual code.
    this.ele1 = (document.getElementById(ele1));
    this.ele2 = (document.getElementById(ele2));

// Append the div that is the link line into the DOM
    this.lineID = 'L' + this.id;
    const link_node = "<div id='" + this.lineID + "' class='" + className + "' style='position: 'absolute', 'border-left': this.lineStyle, 'z-index': -100'  ></div>";

    document.getElementById('graph_container').insertAdjacentHTML('beforeend', link_node)
    this.line = document.getElementById('L' + this.id);
    // this.line.css()

// We may need to store the offsets of each element that we are connecting.
    this.offsets = [];
    this.offsets[ele1] = new pos;
    this.offsets[ele2] = new pos;

}

Connector.prototype.link = function link() {

    var offset1 = this.ele1.getBoundingClientRect();
    var originX = offset1.left + this.ele1.offsetWidth / 2;
    var originY = offset1.top + this.ele1.offsetHeight / 2;

    var offset2 = this.ele2.getBoundingClientRect();
    var targetX = offset2.left + this.ele2.offsetWidth / 2;
    var targetY = offset2.top + this.ele2.offsetHeight / 2;
    console.log(originX)
    console.log(originY)
    console.log(targetX)
    console.log(targetY)
    var l = this.hyp((targetX - originX), (targetY - originY));
    var angle = 180 / 3.1415 * Math.acos((targetY - originY) / l);
    if (targetX > originX) {
        angle = angle * -1
    }
    // Compute adjustments to edge of element plus gaps.
    var adj1 = this.edgeAdjust(angle, this.gapX1 + offset1.width / 2, this.gapY1 + offset1.height / 2)
    var adj2 = this.edgeAdjust(angle, this.gapX2 + offset2.width / 2, this.gapY2 + offset2.height / 2)


    l = l - (adj1.hp + adj2.hp)
    console.log("FFFFINAL")
    console.log(l)
    console.log(adj1)
    console.log(adj1.hp)
    console.log(originX)
    this.line.style.left = originX
    this.line.style.height = l
    this.line.style.width = 0
    this.line.style.top = originY + adj1.hp
    this.line.style["-webkit-transform"] = 'rotate(' + angle + 'deg)'
    this.line.style["-moz-transform"] = 'rotate(' + angle + 'deg)'
    this.line.style["-o-transform"] = 'rotate(' + angle + 'deg)'
    this.line.style["-ms-transform"] = 'rotate(' + angle + 'deg)'
    this.line.style["transform"] = 'rotate(' + angle + 'deg)'
    this.line.style["transform-origin"] = '0 ' + (-1 * adj1.hp) + 'px';
}

Connector.prototype.Round = function (value, places) {
    var multiplier = Math.pow(10, places);
    return (Math.round(value * multiplier) / multiplier);
}

Connector.prototype.edgeAdjust = function (a, w1, h1) {
    var w = 0, h = 0

    // compute corner angles
    var ca = []
    ca[0] = Math.atan(w1 / h1) * 180 / 3.1415926 // RADIANS !!!
    ca[1] = 180 - ca[0]
    ca[2] = ca[0] + 180
    ca[3] = ca[1] + 180

    // Based on the possible sector and angle combinations work out the adjustments.
    if ((this.Round(a, 0) === 0)) {
        h = h1
        w = 0
    } else if ((this.Round(a, 0) === 180)) {
        h = h1
        w = 0
    } else if ((a > 0 && a <= ca[0]) || (a < 0 && a >= (-1 * ca[0]))) {
        h = h1
        w = -1 * Math.tan(a * (3.1415926 / 180)) * h1
    } else if (a > ca[0] && a <= 90) {
        h = Math.tan((90 - a) * (3.1415926 / 180)) * w1
        w = w1
    } else if (a > 90 && a <= ca[1]) {
        h = -1 * Math.tan((a - 90) * (3.1415926 / 180)) * w1
        w = w1
    } else if (a > ca[1] && a <= 180) {
        h = h1
        w = -1 * Math.tan((180 - a) * (3.1415926 / 180)) * h1
    } else if (a > -180 && a <= (-1 * ca[1])) {
        h = h1
        w = Math.tan((a - 180) * (3.1415926 / 180)) * h1
    } else if (a > (-1 * ca[1]) && a <= 0) {
        h = Math.tan((a - 90) * (3.1415926 / 180)) * w1
        w = w1
    }

    // We now have the width and height offsets - compute the hypotenuse.
    var hp = this.hyp(w, h)
    console.log(`a${a}, w${w1}, h${h1}Hyp of ${hp}`)

    return {hp: hp}
}

Connector.prototype.hyp = function hyp(X, Y) {
    return Math.abs(Math.sqrt((X * X) + (Y * Y)))
}


Connector.prototype.moved = function moved(e, ele) {
    var id = ele.attr('id');
    this.link()
}

