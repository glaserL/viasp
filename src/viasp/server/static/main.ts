console.log("ELELGIGGLE");

function makeNode(node): string {
    console.log(node)
    return `<div id="${node.id}" style="cursor: pointer" onclick="showDetail( this )" class=set_container>
<div class="set_header">SIGNATURE</div>
<div class="set_value">${node.atoms}</div>
</div>
    `
}

document.addEventListener("DOMContentLoaded", function () {
    fetch(`
    rules`).then(function (r) {
        if (r.ok) {
            r.json().then(function (models) {
                const graph_container = document.getElementById("graph_container")
                for (const value of models) {
                    const node_child = makeNode(value);
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
    if (thingToToggle.height === "" || thingToToggle.height === "0px") {
        console.log("Opening..")
        thingToToggle.height = "100px"
    } else {
        console.log(`Shrinking ${thingToToggle}..`)
        thingToToggle.height = "0";
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
    console.log(node.id)
    fetch(`
    model /${node.id}`).then(function (model) {
        return model.json();
    }).then(function (returnstuff) {
        const detail = document.getElementById("detailSidebar");
        console.log(returnstuff)
        detail.innerHTML = ` < h3 >${returnstuff.true}</h3><p>Known to be false: ${returnstuff.false}</
    p > `
    })
}

function openNav() {
    document.getElementById("detailSidebar").style.width = "250px";
}

function closeNav() {
    document.getElementById("detailSidebar").style.width = "0"
}
