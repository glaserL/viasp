function askBackend() {
    console.log("Fetching rules internal..")
    fetch("http://localhost:8080/rules").then(function (r) {
        if (r.ok) {
            r.json().then(async function (rules) {
                console.log(rules);
            });
        }
    });
}

function initializeShit() {

    console.log("Initializing Searchbar.")
    let searchBar = document.getElementById("q")
    searchBar.onclick = askBackend
    console.log("Initialized Searchbar.")
}

document.addEventListener("DOMContentLoaded", function () {
    initializeShit()

})
