class DrawingApp {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private paint: boolean;

    private clickX: number[] = [];
    private clickY: number[] = [];
    private clickDrag: boolean[] = [];

    constructor() {
        let canvasHTML = document.getElementById('canvas')
        let canvas = canvasHTML as HTMLCanvasElement;
        let context = canvas.getContext("2d");

        console.log(`Canvas: ${canvas}`);
        console.log(`context: ${context}`);

        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = 'black';
        context.lineWidth = 1;

        this.canvas = canvas;
        this.context = context;

        this.redraw();
        this.createUserEvents();
        this.draw_node("");
    }

    private draw_node(data) {
        const circle = new Path2D();
        circle.arc(50, 75, 5, 0, 2 * Math.PI);
        this.context.fillStyle = 'red';
        this.context.fill(circle);
    }

    private createUserEvents() {
        let canvas = this.canvas;

        canvas.addEventListener("mousedown", this.pressEventHandler);
        canvas.addEventListener("mousemove", this.dragEventHandler);
        canvas.addEventListener("mouseup", this.releaseEventHandler);
        canvas.addEventListener("mouseout", this.cancelEventHandler);

        canvas.addEventListener("touchstart", this.pressEventHandler);
        canvas.addEventListener("touchmove", this.dragEventHandler);
        canvas.addEventListener("touchend", this.releaseEventHandler);
        canvas.addEventListener("touchcancel", this.cancelEventHandler);

    }

    private fitToAvailableSpace() {
        let parent = this.canvas.parentNode as Element
        let rect = parent.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    private redraw() {
        this.fitToAvailableSpace()
        let clickX = this.clickX;
        let context = this.context;
        let clickDrag = this.clickDrag;
        let clickY = this.clickY;
        for (let i = 0; i < clickX.length; ++i) {
            context.beginPath();
            if (clickDrag[i] && i) {
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            } else {
                context.moveTo(clickX[i] - 1, clickY[i]);
            }

            context.lineTo(clickX[i], clickY[i]);
            context.stroke();
        }
        context.closePath();
    }

    private addClick(x: number, y: number, dragging: boolean) {
        this.clickX.push(x);
        this.clickY.push(y);
        this.clickDrag.push(dragging);
    }

    private clearCanvas() {
        this.context
            .clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
    }

    private clearEventHandler = () => {
        this.clearCanvas();
    }

    private releaseEventHandler = () => {
        this.paint = false;
        this.redraw();
    }

    private cancelEventHandler = () => {
        this.paint = false;
    }

    private pressEventHandler = (e: MouseEvent | TouchEvent) => {
        let mouseX = (e as TouchEvent).changedTouches ?
            (e as TouchEvent).changedTouches[0].pageX :
            (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
            (e as TouchEvent).changedTouches[0].pageY :
            (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;

        this.paint = true;
        this.addClick(mouseX, mouseY, false);
        this.redraw();
    }

    private dragEventHandler = (e: MouseEvent | TouchEvent) => {
        let mouseX = (e as TouchEvent).changedTouches ?
            (e as TouchEvent).changedTouches[0].pageX :
            (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
            (e as TouchEvent).changedTouches[0].pageY :
            (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;

        if (this.paint) {
            this.addClick(mouseX, mouseY, true);
            this.redraw();
        }

        e.preventDefault();
    }
}

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
        console.log(`Shrinking ${thingToToggle}...`)
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
