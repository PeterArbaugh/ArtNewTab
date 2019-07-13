searchTerm = "dog";

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?q=cat+dog')
  .then(function(response) {
    return response.json();
  })
  .then(function(searchResponse) {
    console.log(searchResponse.total);  
    console.log(getRandomInt(searchResponse.objectIDs.length));
    var randPlace = getRandomInt(searchResponse.objectIDs.length);
    var randID = searchResponse.objectIDs[randPlace];

    fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects/' + randID)
    .then(function(response){
        return response.json();
    })
    .then(function(item){
        console.log(item.primaryImage);
        console.log(item.title);
        console.log(item.objectDate);

        var htmlElem = document.querySelector("html");
        var titleElem = document.querySelector("#titleAnchor");
        var periodElem = document.querySelector("h2");
        var dateElem = document.querySelector("h3");

        htmlElem.style.backgroundImage = 'url('+ item.primaryImage + ')';
        titleElem.innerHTML = item.title;
        dateElem.innerHTML = item.objectDate;
        
    });
  });


// select random object id

// extract title, web link, date, image link, artist, medium, (period/culture??)

// assign extracted values to elements