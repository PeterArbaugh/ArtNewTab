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
var deptConfMsgDisplay;
var searchConfMsgDisplay;


// Collect list of departments
function getDepts(){
    var aDepts = [];
    var deptString = "";

    // Handle select all depts option. No change to basic API request.
    if (document.getElementById('selectAll').checked == true) {
        // performance issues when selecting all departments, so just saving the list of public domain items ¯\_(ツ)_/¯
        var allDeptObjs = {'objList' : pdObj};
        SaveChanges(allDeptObjs);
        return;
    } else {
        // create a string with dept IDs usable in the api call
        for(var i = 0; i<depts.length; i++){
            if(depts[i].checked == true){
                aDepts.push(depts[i].value);
            }
        };
        // If no depts are selected, default to select all
        if (aDepts.length == 0) {
            SelectAllObjects();
            return;
        } else {
            // otherwise, create the string to pass to the api call
            for(j = 0; j<aDepts.length; j++){
                if(j != aDepts.length -1){
                    deptString += aDepts[j] + "|";
                } else {
                    deptString += aDepts[j];
                }
            };
            FetchObjectsByDept(deptString);
            return;
        }
    }
}

function FetchObjectsByDept(params){
    fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=' + params)
        .then(function (response){
            return response.json();
        })
        .then(function (data){
            return CheckPD(data.objectIDs, pdObj);
        })
        .then(function (result){
            
            var kv_pair = {'objList': result};

            SaveChanges(kv_pair);
            SendConfirmMsgDept("Options saved!");
            HideSpinner(deptSpinner);
        })
}

function FetchObjectsBySearch(params){
    // if search box is empty, default to all public domain items
    if (params === "") {
        SelectAllObjects();
    } else {
        // Make an api call with the search terms
        fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?q=' + params)
        .then( function (response){
            return response.json();
        })
        .then(function (data){
            // Compare search terms with public domain list and remove anything outside of PD
            return CheckPD(data.objectIDs, pdObj);
            
        })
        .then(function (result){
            // Save options
            var kv_pair = {'objList': result};

            SaveChanges(kv_pair);
            SendConfirmMsgSearch("Options saved!")
            HideSpinner(searchSpinner);
        })
    }
}

// Removes any non-public domain objects from results
// Currently, the pdArray is generated from the met objects CSV manually
function CheckPD(objArray, pdArray){
    return objArray.filter(item => pdArray.includes(item));
}

// Save changes to local storage
// Most settings could be saved in storage.sync, but object lists are too large
function SaveChanges(pair){
    chrome.storage.local.set(pair, function(){
        console.log("Settings saved");
        settingsChanged = true;
        
    });
}

// Deactivates the fieldset depending on which radio button (dept/search) is selected
function ActivateFieldset(elem){
    if(elem == deptRadio){
        deptFieldset.disabled = false;
        searchFieldset.disabled = true;
    } else if (elem == searchRadio){
        deptFieldset.disabled = true;
        searchFieldset.disabled = false;
    }
}

// Select all functionality
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

// Pulls the last used settings out of memory so the form has your last settings when you load options.html
function CheckSavedSettings (){
    var ss = new Promise(function (resolve, reject){
        chrome.storage.local.get(['radio', 'depts', 'searchTerm'], function(data){
            resolve(data);
        })
    })
    ss.then(function (data){
        if(data.radio == deptRadio.id){

            deptRadio.click();

            for (let i = 0; i < data.depts.length; i++) {
                document.getElementById(data.depts[i]).click();
                
            }
        } else if (data.radio == searchRadio.id) {
            searchRadio.click();
            searchBox.value = data.searchTerm;
        }
    })
}

// Stores the current form selections so they can be recalled when options is opened later
// param allows the window to be closed after saving options if set true
function StoreCurrentOptions (close){
    if(settingsChanged == true){
        // Check to see which radio button was checked, save that value to chrome storage.
        if(deptRadio.checked == true){
            var radioSet = {'radio' : deptRadio.id};
            SaveChanges(radioSet);

            // Get the checkboxes, and save a list of the ones that were checked
            var deptsToSave = Array.from(depts); // depts is an htmlcollection, need to convert to array
            deptsToSave = deptsToSave.filter(item => item.checked == true);
            var dts = [];
            deptsToSave.forEach(item => {
                dts.push(item.id);
            });
            var deptSet = {'depts' : dts};
            SaveChanges(deptSet);

        } else if (searchRadio.checked == true){
            var radioSet = {'radio' : searchRadio.id};
            SaveChanges(radioSet);

            // if search terms, check what the saved text was
            var searchSet = {'searchTerm' : searchBox.value};
            SaveChanges(searchSet);
        } else {
            console.log("Error: radio button not set");
        }
    }
    // Close window if set
    if (close) {
        window.close();
    }
}

// Confirmation message that dept info has been saved
function SendConfirmMsgDept(msg){
    deptConfMsgDisplay.innerHTML = msg;
    setTimeout(function(){
        deptConfMsgDisplay.innerHTML = "";
    }, 2000);
}

// Confirmation that search terms have been saved
function SendConfirmMsgSearch(msg){
    searchConfMsgDisplay.innerHTML = msg;
    setTimeout(function(){
        searchConfMsgDisplay.innerHTML = "";
    }, 2000);
}

// Saves the pd objects list as the list to draw images from
// Used as a default in several places to decrease wait times
function SelectAllObjects() {
    var allDeptObjs = {'objList' : pdObj};
    SaveChanges(allDeptObjs);
}

// show loading spinner
function ShowSpinner(elem){
    elem.style.opacity = 1;
}

// hide loading spinner
function HideSpinner (elem) {
    elem.style.opacity = 0;
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
    deptConfMsgDisplay = document.getElementById("deptConfirm");
    searchConfMsgDisplay = document.getElementById("searchConfirm");
    deptSpinner = document.getElementById('dept-spinner');
    searchSpinner = document.getElementById('search-spinner');

    // Check last saved settings and apply to form
    CheckSavedSettings();

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
        StoreCurrentOptions(true);
    });

    deptSaveBtn.addEventListener("click", function(){
        StoreCurrentOptions(false);
        getDepts();
        ShowSpinner(deptSpinner);
    })

    searchButton.addEventListener("click", function(){
        FetchObjectsBySearch(searchBox.value);
        ShowSpinner(searchSpinner);
    })
});