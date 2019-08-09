var detailsElem;
var optionsLink;

document.addEventListener("DOMContentLoaded", function(){
  // Handler when the DOM is fully loaded
  detailsElem = document.getElementById("details");

  detailsElem.addEventListener("mouseover", function(){
    detailsElem.classList.remove("hidden");
  });

  detailsElem.addEventListener("mouseout", function(){
    detailsElem.classList.add("hidden");
  });
});

// simple random integer definition
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  };

// via stackexchange: https://stackoverflow.com/a/45129760
// although api is only getting public domain images, need to avoid tainted canvas
function loadImage(src, callback) {
  var img = new Image();

  img.onload = callback;
  img.setAttribute('crossOrigin', 'anonymous'); // works for me

  img.src = src;

  return img;
}


//  via https://davidwalsh.name/convert-image-data-uri-javascript
// convert image to data uri so it can be saved to chrome.storage
function getDataUri(url, callback) {
  var image = new Image();

  image.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
    canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

    canvas.getContext('2d').drawImage(this, 0, 0);

    // Get raw image data
    // callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

    // ... or get as Data URI
    callback(canvas.toDataURL('image/jpeg'));
    };

  image.src = url;
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
      //convert image to data uri
      /*
      var imageUri;
      
      getDataUri(item.primaryImage, function(dataUri) {
        // Do whatever you'd like with the Data URI!
        imageUri = dataUri;
      });
      */
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

        /*
        img.onload = function () { 
            document.querySelector(".lds-ripple").style.display = "none";
        }
        */
       
        // Set footer
        // titleElem.innerHTML = item.title;
        // titleElem.href = item.objectURL;

        // Set details

        var titleIcon = "icon/infoSmall.svg";
        var nameIcon = "icon/artistName.svg";
        var dateIcon = "icon/Date.svg";
        var countryIcon = "icon/Globe.svg";

        var details = [[titleIcon, item.title], [nameIcon, item.artistDisplayName], [dateIcon, item.objectDate], [countryIcon, item.country]];
/*
        if(item.title != ""){
          var li = document.createElement('li');
          detailsElem.appendChild(li);
          li.innerHTML += "<img src='icon/infoSmall.svg' alt=''>";
          li.innerHTML += item.title;
        }
*/
        details.forEach(element => {
          if(element[1] != ""){
            var li = document.createElement('li');
            detailsElem.appendChild(li);
            var img = "<img class='info-icon' src='" + element[0] + "' alt=''> ";
            var text = "<span class='obj-info'>" + element[1] + "</span>";
            // li.innerHTML = "<img src='";
            // li.innerHTML += element[0];
            // li.innerHTML +=  "' alt=''> ";
            li.innerHTML = img;
            li.innerHTML += text;
          }
        });

        // This whole section needs to either live in the HTML or needs to be loaded more efficiently.

        var collectionLi = document.createElement('li');
        collectionLi.innerHTML = "<a id='collectionLink' href='" + item.objectURL + "' target='_blank'><img class='info-icon' src='icon/Link.svg' alt=''> <span class='obj-info'>View in collection</span></a>";
        detailsElem.appendChild(collectionLi);

        var museumLi = document.createElement('li');
        museumLi.innerHTML = "<a id=''  href='https://metmuseum.org' target='_blank'><img class='info-icon' src='icon/Museum.svg' alt=''> <span class='obj-info'>The Met Museum</span></a>";
        detailsElem.appendChild(museumLi);

        var settingsLi = document.createElement('li');
        settingsLi.innerHTML = "<a id='options'  href='#'><img class='info-icon' src='icon/Settings.svg' alt=''> <span class='obj-info'>Options</span></a>";
        detailsElem.appendChild(settingsLi);

        optionsLink = document.getElementById("options");

        optionsLink.addEventListener("click", function(){
          if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
          } else {
            window.open(chrome.runtime.getURL('options.html'));
          }
        });
    });
  });