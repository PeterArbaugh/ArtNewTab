var detailsElem;

document.addEventListener("DOMContentLoaded", function(){
  // Handler when the DOM is fully loaded
  detailsElem = document.getElementById("details");

  detailsElem.addEventListener("mouseover", function(){
    detailsElem.classList.remove("hidden");
  });

  detailsElem.addEventListener("mouseout", function(){
    detailsElem.classList.add("hidden");
  })
});

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

        // grab the DOM elements
        var htmlElem = document.querySelector("html");
        var titleElem = document.querySelector("#titleAnchor");

        var detailsElem = document.querySelector("#detailsList");

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

        // Set footer
        titleElem.innerHTML = item.title;
        titleElem.href = item.objectURL;

        // Set details

        var details = [item.title, item.artistDisplayName, item.objectDate, item.country];

        details.forEach(element => {
          if(element != ""){
            var li = document.createElement('li');
            detailsElem.appendChild(li);
            li.innerHTML += element;
          }
        });
        
        var collectionLi = document.createElement('li');
        collectionLi.innerHTML = "<a id='collectionLink' href='" + item.objectURL + "' target='_blank'><img src='icon/Link.svg' alt=''> View in collection</a>";
        detailsElem.appendChild(collectionLi);
    });
  });