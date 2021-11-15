import {collectNodesShown} from "./graph";
import {backendURL} from "../util";

let connectors: muConnector[] = [];

export function clearConnections() {
    for (const connector of connectors) {
        connector.destroy()
    }
    connectors = []
}

export function refreshEdges() {
    connectors.forEach((c) => {

    });

}

export function drawEdges() {
    clearConnections()

    fetch(backendURL("edges"), {
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


class pos {
    left: number = 0;
    top: number = 0;
}

class PseudoGuid {
    private empty: string;

    constructor() {
        // Make a GUID to use in unique id assignment - from and credit to http://stackoverflow.com/questions/226689/unique-element-id-even-if-element-doesnt-have-one
        this.empty = '00000000-0000-0000-0000-000000000000';

    };

    GetNew() {
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
    }

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

    constructor(params: { ele1: string; ele2: string; lineStyle: string; class?: any; gapX1?: any; defaultGap?: any; gapY1?: any; gapX2?: any; gapY2?: any; gap?: any; }) {
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


        this.PseudoGuid = new PseudoGuid()

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

    Round(value: number, places: number) {
        var multiplier = Math.pow(10, places);
        return Math.round(value * multiplier) / multiplier;
    }

    edgeAdjust(a: number, w1: number, h1: number) {
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

    hyp(X: number, Y: number) {
        return Math.abs(Math.sqrt(X * X + Y * Y));
    }

    destroy() {

        const id = "L" + this.id;
        const thingToClear = document.getElementById(id);
        thingToClear.remove()
    }

    refresh() {
        let rect = this.ele2.getBoundingClientRect();
        this.offsets[this.ele2.id].left = rect.left + document.body.scrollLeft;
        this.offsets[this.ele2.id].top = rect.top + document.body.scrollTop;

        this.link();

    }
}
