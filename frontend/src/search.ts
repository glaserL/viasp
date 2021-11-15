import './search.css'
import {backendURL, make_atoms_string, make_rules_string} from "./util";

var currentFocus = -1;

function clearActives(options: HTMLCollectionOf<Element>) {
    Array.from(options).map(opt => opt.classList.remove("active"))
}

function updateSelection(options: HTMLCollectionOf<Element>) {


    console.log(`Updating ${options.length} options ${currentFocus}`)

    if (!options) return false;
    clearActives(options)
    if (currentFocus >= options.length) currentFocus = 0
    if (currentFocus < 0) currentFocus = (options.length - 1)
    options[currentFocus].classList.add("active")
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
    fetch(`${backendURL("query")}?q=` + query).then(
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


async function handleKeyPress(event: KeyboardEvent) {
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

export function initializeSearchBar(): void {
    let searchBar = document.getElementById("q")
    let form = document.getElementsByTagName("form")[0];

    form.onsubmit = async function (event) {
        event.preventDefault();
    }
    console.log(
        `Adding event listener to ${searchBar}`
    )
    searchBar.onkeyup = function (event) {
        handleKeyPress(event)
    }
    console.log("Initialized Searchbar.")
}
