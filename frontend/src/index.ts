import './style.css';
import './header.css';
import printMe from "./cool";
import {initializeSearchBar} from './search';
import {backendURL} from "./util";

function component() {
    const element = document.createElement('div');
    element.innerHTML = "FINNNLY"

    element.classList.add('hello');

    const btn = document.createElement('button');
    btn.innerHTML = 'Click me and check the console!';
    btn.onclick = printMe;
    element.appendChild(btn);

    return element;
}


function initCheckBox() {
    var checkbox = document.querySelector("input[type=checkbox]");

    checkbox.addEventListener('change', function () {
        fetch(`
    ${backendURL('settings')}/?${this.getAttribute("value")}=${this.checked}`, {
            method: "POST"
        }).then(function (r) {
            console.log(r);
        })
    });
}


document.addEventListener("DOMContentLoaded", function () {
    initCheckBox();
    initializeSearchBar();
    // clearFilterPill().then(drawGraph).then(initializeSearchBar);
})
