var detailsElem;
var optionsLink;

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

// GET MET OBJECT
function GetMetObject(){

  // I'm pretty sure I'm not doing this part right...
  var ao = new Promise(function(resolve, reject){
    chrome.storage.local.get('objList', function(data){
    var randPlace = getRandomInt(data.objList.length);
    console.log(data.objList[randPlace]);
    resolve(data.objList[randPlace]); 
  })
});
    ao.then(function(randID){
      console.log("Rand ID = " + randID);
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
        // changed to test applying image to the body
        var htmlElem = document.querySelector("#content");
        // var titleElem = document.querySelector("#titleAnchor");
  
        var detailsElem = document.querySelector("#detailsList");
  
        function fadeIn(elem){
          elem.style.transition = "opacity 1.5s cubic-bezier(0.390, 0.575, 0.565, 1.000)";
          elem.style.opacity = "1";
        }
  
        // find the image size
        // via https://stackoverflow.com/questions/6575159/get-image-dimensions-with-javascript-before-image-has-fully-loaded
        var img = document.createElement('img');
  
        img.src = item.primaryImage;
  
        htmlElem.style.backgroundImage = 'url('+ img.src + ')';
        htmlElem.style.opacity = "0";
        
        img.onload = function (){
  
  
          fadeIn(htmlElem);
        }
  
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
    /*
        // TO DO: Link up with existing CSS so the animation code is not replicated
        // THIS WORKS
        var objectImage = document.querySelector('#object-image');
        objectImage.addEventListener("load", fadeIn);
        objectImage.style.opacity = "0";
        objectImage.src = img.src;
        
        function fadeIn(){
          this.style.transition = "opacity 1.5s cubic-bezier(0.390, 0.575, 0.565, 1.000)";
          this.style.opacity = "1";
        }
    /*
        var htmlElem = document.createElement(div);
        htmlElem.id = "content";
        htmlElem.classList = "fade-in";
        htmlElem.style.backgroundImage = 'url('+ img.src + ')';
        detailsElem.insertBefore(htmlElem);
  
        
        img.onload = function () { 
            document.querySelector(".lds-ripple").style.display = "none";
        }
  
        function OnImageLoaded (img) {
      alert ("The image has been loaded: " + img.src);
    }
  
        function PreloadImage (src) {
            var img = new Image ();
      img.onload = function () {OnImageLoaded (this)};
            img.src = src;
        }
  
    PreloadImage ("image1.png");
    PreloadImage ("image2.png");
  
  
  
  
  
        
        
        
  
        htmlElem.style.backgroundImage = 'url('+ img.src + ')';
        htmlElem.addEventListener("load", fadeIn);
        htmlElem.style.opacity = "0";
  
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
    })
    
}

document.addEventListener("DOMContentLoaded", function(){
  // Handler when the DOM is fully loaded
  detailsElem = document.getElementById("details");

  detailsElem.addEventListener("mouseover", function(){
    detailsElem.classList.add("show-menu");
    if(detailsElem.classList.contains("hide-menu")){
      detailsElem.classList.remove("hide-menu")
    }
  });

  detailsElem.addEventListener("mouseout", function(){
    detailsElem.classList.remove("show-menu");
    detailsElem.classList.add("hide-menu");
  });

  // Get object and object details for display:
  GetMetObject();
});