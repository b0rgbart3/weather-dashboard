//   Javascript code by Bart Dority

    // respond to user input of city names
    // by generating an ajax get request from the openweathermap API
    // and taking the returned data object and displaying it to the user
    // also, store the user requested city names in local Storage
    // and create buttons for each city


var cities = [];
// an index to the city name that we are currently viewing
var activeCity = 0;

//  This method could respond to user input in the input field
// as they are typing it -- for now it is not implemented.
$(document).on("keypress", "#city-input", function(e){
  //console.log($(this).val());
  if(e.which == 13){
      var inputVal = $(this).val();
    //  alert("You've entered: " + inputVal);
  }
});

$(document).ready(function() {

    cities = JSON.parse(localStorage.getItem("wd-cities"));
    displayCityButtons();
    getForecast(cities[activeCity]);
    // If the user clicks the add city button (submit) - 
    // Let's add the name of the city they put in the input
    // field to our list of cities.

    $("#add-city").click(addCity);
    $(".city-button").click(chooseCity);

});
var chooseCity = function(event) {
  activeCity = $(event.target).data("id");
  getForecast( cities[activeCity] );
}

var addCity = function(event) {
   event.preventDefault();

  // grab the city name from the input field
  
   var newCity = $("#city-input").val();
   if (newCity.length > 2) {
      // Start with checking to see if there are more than two chars

      // make sure this city is not already in our list
      if (!cities.includes(newCity)) {
        cities.push(newCity);
        activeCity = 0;
        localStorage.setItem("wd-cities", JSON.stringify(cities));
      }
   }
   // we used to create a button every time the user
   // added a new city.
   // But with this refactor -- all the buttons get created at the
   // same time with the same function - displayCityButtons()
  // createPanelButton(newCity);
   displayCityButtons();
   getForecast(cities[activeCity]);
}

// displayCityButtons
// This function wipes clear and displays our full list
// of cities as buttons in the panel

var displayCityButtons = function() {
  $("#city-button-block").empty();

  cities.forEach( function(city,index) {
    createPanelButton(city,index);
  });
  console.log("Done displaying city buttons.");
}
// Need to refactor this so it uses an array to build all the buttons
// rather than adding a new one each time directly.

var createPanelButton = function(city,index) {
  var newButton = $("<button>");
  newButton.text(city);
  newButton.attr("data-id", index);
  newButton.addClass("city-button");
  $("#city-button-block").prepend(newButton);
}

var getForecast = function(city) {
  
  console.log("Getting the forecast for: " + city);
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
    .then(displayForecast);
}

var displayForecast = function(response) {
  //console.log("In Add New City: " + JSON.stringify(response));
  $("#todays-weather-info").empty();
  
  var cityTitle = $("<h1>");
  cityTitle.text(cities[activeCity]);
  console.log("--" + cities[activeCity]);

  $("#todays-weather-info").append(cityTitle);
}

// In Add New City: {"coord":{"lon":-122.42,"lat":37.77},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"base":"stations","main":{"temp":286.45,"feels_like":280.07,"temp_min":285.37,"temp_max":287.59,"pressure":1009,"humidity":82},"visibility":16093,"wind":{"speed":9.3,"deg":270},"clouds":{"all":75},"dt":1593318802,"sys":{"type":1,"id":5817,"country":"US","sunrise":1593262198,"sunset":1593315334},"timezone":-25200,"id":5391959,"name":"San Francisco","cod":200}


