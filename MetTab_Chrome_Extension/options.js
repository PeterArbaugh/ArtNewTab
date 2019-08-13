var closeButton;

/* 
fetch('MetObjects.json')
    .then(res => res.json())
    .then(data => 
        console.log(data))
     
    .then(function(response){
        console.log("return json");
        return response.json;
    })
    
  
    .then(function(items){
        console.log(items.id);

        var queryResult = jsonArray.
            filter(function (x){ return x.})
            
    })
*/

d3.csv("MetObjects.csv").then(function(data){
    console.log(data[0]);
});

document.addEventListener("DOMContentLoaded", function(){
    closeButton = document.getElementById("close");

    closeButton.addEventListener("click", function(){
        window.close();
    });
});