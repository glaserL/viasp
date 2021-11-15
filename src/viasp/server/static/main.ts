import {printFun} from "./thisisfun";
import {backendURL} from "../../../../frontend/src/util";

class Signature {
    name: String;
    args: number;
}

class State {
    private cache: Map<String, any>;

    getFilter(): Signature {
        if (this.cache.has("FILTER")) {
            return this.cache.get("FILTER");
        }
    }

    clearFilter() {
        if ((this.cache.has("FILTER"))) {
            this.cache.delete("FILTER");
        }
    }

    setFilter(signature: Signature) {
        this.cache.set("FILTER", signature);
    }
}

const STORAGE = State


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

