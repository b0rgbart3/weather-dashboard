$(document).ready(function() {

    // respond to user input of city names
    // by generating an ajax get request from the openweathermap API
    // and taking the returned data object and displaying it to the user
    // also, store the user requested city names in local Storage
    // and create buttons for each city

    responseObject = retrieveWeatherForcast("San+Francisco");
    
    $('#add-city').click(function(event) {
      event.preventDefault();

       var newCity = $("#city-input").val();
       createPanelButton(newCity);
    });

});

// Need to refactor this so it uses an array to build all the buttons
// rather than adding a new one each time directly.

var createPanelButton = function(city) {
  var newButton = $("<button>");
  newButton.text(city);
  newButton.addClass("cityButton");
  $("#city-buttons").prepend(newButton);
}

var retrieveWeatherForcast = function(city) {
  
  // revise the city name to make sure it doesn't contain spaces
  var revisedCityString = city.trim().replace(/ /g,"+");

  // Constructing a queryURL using the revised city name

  var queryURL = "https://api.openweathermap.org/data/2.5/weather?q="+revisedCityString+"&appid=196510002b5290425c8c92315ac3753d";

  // Performing an AJAX request with the queryURL
  $.ajax({
    url: queryURL,
    method: "GET"
  })
    // After data comes back from the request
    .then(addNewCity);
}

var addNewCity = function(response) {
  console.log("In Add New City: " + JSON.stringify(response));
}

// In Add New City: {"coord":{"lon":-122.42,"lat":37.77},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"base":"stations","main":{"temp":286.45,"feels_like":280.07,"temp_min":285.37,"temp_max":287.59,"pressure":1009,"humidity":82},"visibility":16093,"wind":{"speed":9.3,"deg":270},"clouds":{"all":75},"dt":1593318802,"sys":{"type":1,"id":5817,"country":"US","sunrise":1593262198,"sunset":1593315334},"timezone":-25200,"id":5391959,"name":"San Francisco","cod":200}


