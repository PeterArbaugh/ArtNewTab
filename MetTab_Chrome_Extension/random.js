searchTerm = "dog";

// simple random integer definition
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

// first call to Met API to get list of object IDs
fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?q=cat+dog')
  .then(function(response) {
    return response.json();
  })
  // select random object from returned object ids
  .then(function(searchResponse) {
    console.log(searchResponse.total);  
    console.log(getRandomInt(searchResponse.objectIDs.length));
    var randPlace = getRandomInt(searchResponse.objectIDs.length);
    var randID = searchResponse.objectIDs[randPlace];

    // second call to Met API for object details
    fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects/' + randID)
    .then(function(response){
        return response.json();
    })
    .then(function(item){
        //console.log(item.primaryImage);
        //console.log(item.title);
        //console.log(item.objectDate);

        // grab the DOM elements
        var htmlElem = document.querySelector("html");
        var titleElem = document.querySelector("#titleAnchor");
        var dateElem = document.querySelector("h2");

        // find the image size
        // via https://stackoverflow.com/questions/6575159/get-image-dimensions-with-javascript-before-image-has-fully-loaded
        var img = document.createElement('img');

        img.src = item.primaryImage;

        var nw
        var nh

        var poll = setInterval(function () {
            if (img.naturalWidth) {
            clearInterval(poll);
            // set image size variables
            console.log(img.naturalWidth, img.naturalHeight);
            nw = img.naturalWidth;
            nh = img.naturalHeight;

            // decide image display based on image width x height
            // default is to set the image size to 100%
            if((nw + 200) < nh){
                htmlElem.style.backgroundSize = 'contain';
            }
            }
        }, 10);

        htmlElem.style.backgroundImage = 'url('+ img.src + ')';

        img.onload = function () { 
            document.querySelector(".lds-ripple").style.display = "none";
        }

        
        titleElem.innerHTML = item.title;
        titleElem.href = item.objectURL;
        dateElem.innerHTML = item.objectDate;
        
    });
  });


// select random object id

// extract title, web link, date, image link, artist, medium, (period/culture??)

// assign extracted values to elements