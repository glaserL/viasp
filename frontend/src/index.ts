import './style.css';
import printMe from "./cool";

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

document.body.appendChild(component());
