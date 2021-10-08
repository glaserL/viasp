console.log("ELELGIGGLE");

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


function drawEdges() {
    fetch("edges").then(function (response) {
        return response.json();
    }).then(function (edges) {
        for (const edge in edges) {
            const from = document.getElementById(edge.from).offset();
            const to = document.getElementById(edge.from).offset();

        }
    })
}

function showDetail(node) {
    if (isClosed("detailSidebar")) {
        openNav();
    }
    console.log(node.id)
    fetch(`model/${node.id}`).then(function (model) {
        return model.json();
    }).then(function (returnstuff) {
        const detail = document.getElementById("detailSidebar");
        console.log(returnstuff)
        detail.innerHTML = `<h3>${returnstuff.true}</h3><p>Known to be false: ${returnstuff.false}</p>`
    })
}

function openNav() {
    document.getElementById("detailSidebar").style.width = "250px";
}

function closeNav() {
    document.getElementById("detailSidebar").style.width = "0"
}
