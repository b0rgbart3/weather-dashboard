$(document).ready(function() {
  // Constructing a queryURL using the animal name
var queryURL = "api.openweathermap.org/data/2.5/weather?q=san+francisco&appid=196510002b5290425c8c92315ac3753d";

// Performing an AJAX request with the queryURL
$.ajax({
  url: queryURL,
  method: "GET"
})
  // After data comes back from the request
  .then(function(response) {
    console.log(response);
    }
  );

});
