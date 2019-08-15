var closeButton;
var deptSaveBtn;
var depts;
var deptParams;

var searchButton;
var searchBox;


// Collect list of departments
function getDepts(){
    depts = document.getElementsByClassName("deptChBox");
    var aDepts = [];

    // create a string usable in an api call
    for(var i = 0; i<depts.length; i++){
        if(depts[i].checked == true){
            aDepts.push(depts[i].value);
        }
    };

    console.log(aDepts);
    var deptString = "";
    for(j = 0; j<aDepts.length; j++){
        if(j != aDepts.length -1){
            deptString += aDepts[j] + "|";
        } else {
            deptString += aDepts[j];
        }
    };
    console.log(deptString);
    FetchObjectsByDept(deptString);
}

function FetchObjectsByDept(params){
    fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=' + params)
        .then(function (response){
            return response.json();
        })
        .then(function (data){
            console.log(data.objectIDs.length);

            // TO DO: Compare to list of public domain object ids, remove those which are not public domain
            var kv_pair = {'objList': data.objectIDs};
            SaveChanges(kv_pair);
        })
}

function FetchObjectsBySearch(params){
    fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?q=' + params)
        .then( function (response){
            return response.json();
        })
        .then(function (data){
            console.log(data.objectIDs.length);

            // TO DO: Compare to list of public domain object ids, remove those which are not public domain
            var kv_pair = {'objList': data.objectIDs};

            SaveChanges(kv_pair);
        })
}

function SaveChanges(pair){
    chrome.storage.local.set(pair, function(){
        console.log("Settings saved");
    });
}

// Fetch new list of objects for selected department(s), create array

// Save new array to memory

// Listener for changes to search

// Fetch list of objects for search term, create array

// Save new array to memory

document.addEventListener("DOMContentLoaded", function(){
    closeButton = document.getElementById("close");
    deptSaveBtn = document.getElementById("dept-save-btn");
    searchButton = document.getElementById("search-save-btn");
    searchBox = document.getElementById("search-box");

    closeButton.addEventListener("click", function(){
        window.close();
    });

    deptSaveBtn.addEventListener("click", function(){
        getDepts();
    })

    searchButton.addEventListener("click", function(){
        FetchObjectsBySearch(searchBox.value);
    })
});

