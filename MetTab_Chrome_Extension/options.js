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
            SendConfirmMsgDept("Options saved!");
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
            SendConfirmMsgSearch("Options saved!")
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
    var ss = new Promise(function (resolve, reject){
        chrome.storage.local.get(['radio', 'depts', 'searchTerm'], function(data){
            console.log(data);
            resolve(data);
        })
    })
    ss.then(function (data){
        console.log(deptRadio.id);
        if(data.radio == deptRadio.id){

            deptRadio.click();

            for (let i = 0; i < data.depts.length; i++) {
                console.log(data.depts[i]);
                document.getElementById(data.depts[i]).click();
                
            }
        } else if (data.radio == searchRadio.id) {
            searchRadio.click();
            searchBox.value = data.searchTerm;
        }
    })
}

function StoreCurrentOptions (close){
    // check to see if settings were changed since the page was loaded, if false:
    
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

function SendConfirmMsgDept(msg){
    deptConfMsgDisplay.innerHTML = msg;
    setTimeout(function(){
        deptConfMsgDisplay.innerHTML = "";
    }, 2000);
}

function SendConfirmMsgSearch(msg){
    searchConfMsgDisplay.innerHTML = msg;
    setTimeout(function(){
        searchConfMsgDisplay.innerHTML = "";
    }, 2000);
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

    CheckSavedSettings();

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
        StoreCurrentOptions(true);
        //window.close();
    });

    deptSaveBtn.addEventListener("click", function(){
        StoreCurrentOptions(false);
        getDepts();
    })

    searchButton.addEventListener("click", function(){
        FetchObjectsBySearch(searchBox.value);
    })
});