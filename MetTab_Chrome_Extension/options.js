var closeButton;
var deptSaveBtn;
var depts;
var deptParams;

var searchButton;
var searchBox;
var deptRadio;
var deptFieldset;
var searchRadio;
var searchFieldset;
var selectAll;

var settingsChanged = false;


// Collect list of departments
function getDepts(){
    var aDepts = [];

    // create a string usable in an api call
    for(var i = 0; i<depts.length; i++){
        if(depts[i].checked == true){
            aDepts.push(depts[i].value);
        }
    };

    var deptString = "";
    for(j = 0; j<aDepts.length; j++){
        if(j != aDepts.length -1){
            deptString += aDepts[j] + "|";
        } else {
            deptString += aDepts[j];
        }
    };
    FetchObjectsByDept(deptString);
}

function FetchObjectsByDept(params){
    fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=' + params)
        .then(function (response){
            return response.json();
        })
        .then(function (data){
            console.log(data.objectIDs.length);

            return CheckPD(data.objectIDs, pdObj);
        })
        .then(function (result){
            
            var kv_pair = {'objList': result};

            SaveChanges(kv_pair);
        })
}
// TO DO: What happens if search box is blank?
function FetchObjectsBySearch(params){
    fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?q=' + params)
        .then( function (response){
            return response.json();
        })
        .then(function (data){
            console.log(data.objectIDs.length);

            return CheckPD(data.objectIDs, pdObj);
            
        })
        .then(function (result){
            
            var kv_pair = {'objList': result};

            SaveChanges(kv_pair);
        })
}

function CheckPD(objArray, pdArray){
    return objArray.filter(item => pdArray.includes(item));
}

function SaveChanges(pair){
    chrome.storage.local.set(pair, function(){
        console.log("Settings saved");
        settingsChanged = true;
        
    });
}

function ActivateFieldset(elem){
    if(elem == deptRadio){
        deptFieldset.disabled = false;
        searchFieldset.disabled = true;
    } else if (elem == searchRadio){
        deptFieldset.disabled = true;
        searchFieldset.disabled = false;
    }
}

function SelectAllDepts(sa){
    if(sa.checked){
        for(var k = 0; k < depts.length; k++){
            depts[k].checked = true;
        }
    } else {
        for(var l = 0; l < depts.length; l++){
            depts[l].checked = false;
        }
    }
}

function CheckSavedSettings (){
    //Check to see which radio button was saved, apply.

    // if depts, get the checkboxes, apply

    // if search, get the search term, apply
}

function StoreCurrentOptions (){
    // check to see if settings were changed since the page was loaded, if false:
    
    if(settingsChanged == true){
        // Check to see which radio button was checked, save that value to chrome storage.
        if(deptRadio.checked == true){
            var radioSet = {'radio' : deptRadio};
            SaveChanges(radioSet);

            // Get the checkboxes, and save a list of the ones that were checked
            var deptsToSave = Array.from(depts); // depts is an htmlcollection, need to convert to array
            deptsToSave = deptsToSave.filter(item => item.checked == true)
            var deptSet = {'depts' : deptsToSave};
            SaveChanges(deptSet);

        } else if (searchRadio.checked == true){
            var radioSet = {'radio' : searchRadio};
            SaveChanges(radioSet);

            // if search terms, check what the saved text was
            var searchSet = {'searchTerm' : searchBox.value};
            SaveChanges(searchSet);
        } else {
            console.log("Error: radio button not set");
        }
    }
    
}

document.addEventListener("DOMContentLoaded", function(){
    closeButton = document.getElementById("close");
    deptSaveBtn = document.getElementById("dept-save-btn");
    searchButton = document.getElementById("search-save-btn");
    searchBox = document.getElementById("search-box");

    depts = document.getElementsByClassName("deptChBox");

    deptRadio = document.getElementById("deptRadio");
    searchRadio = document.getElementById("searchRadio");

    deptFieldset = document.getElementById("dept-fieldset");
    searchFieldset = document.getElementById("search-fieldset");

    selectAll = document.getElementById("selectAll");

    // Onload, want to read saved settings and apply

    selectAll.addEventListener("click", function(){
        SelectAllDepts(this);
    })

    deptRadio.addEventListener("change", function(){
        ActivateFieldset(this);
    })

    searchRadio.addEventListener("change", function(){
        ActivateFieldset(this);
    })

    closeButton.addEventListener("click", function(){
        // TO DO: Save current settings before closing the window
        // This may need to be a promise(?) so the window does not close too early.
        StoreCurrentOptions();
        //window.close();
    });

    deptSaveBtn.addEventListener("click", function(){
        StoreCurrentOptions();
        getDepts();
    })

    searchButton.addEventListener("click", function(){
        FetchObjectsBySearch(searchBox.value);
    })
});