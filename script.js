//   Javascript code by Bart Dority

    // respond to user input of city names
    // by generating an ajax get request from the openweathermap API
    // and taking the returned data object and displaying it to the user
    // also, store the user requested city names in local Storage
    // and create buttons for each city

var weatherIcons = ["clouds","drizzle","flurries","hail","heavyrain","rain","snow","storm","clear","scatteredshowers","lightsnow","lightning","partlycloudy","overcast_night","clearnight"];
var cities = [];
// an index to the city name that we are currently viewing
var activeCity = 0;

// store the forecast data in a local object
// so we don't have to ping an outside server every time
var forecasts = {};
var uv_indexes = {};


//  This method could respond to user input in the input field
// as they are typing it -- for now it is not implemented.
$(document).on("keypress", "#city-input", function(e){

  if(e.which == 13){
      var inputVal = $(this).val();
    //  alert("You've entered: " + inputVal);
  }
});

var date;

$(document).ready(function() {

    date = moment().format("MM/DD/YYYY");
    var cityList = localStorage.getItem("wd-cities");
    if (cityList) {
      cities = JSON.parse(cityList);
    }

    getForecasts();
    displayCityButtons();

   // getForecast(cities[activeCity]);
    // If the user clicks the add city button (submit) - 
    // Let's add the name of the city they put in the input
    // field to our list of cities.

    $("#add-city").click(addCity);
    $(".city-button").click(chooseCity);
    $(".del-button").click(removeCity);
    $("#clear-all").click(clearAll);
  

});

var clearAll = function(event) {

    cities = [];
    forecasts = [];
    displayCityButtons;
    displayForecast("");
    $("#city-button-block").empty();
    localStorage.setItem("wd-cities", "");

}
var removeCity = function(event) {

  console.log("Removing");
  cityToRemove = $(event.target).data("id");
 
  //var thisCity = cities[cityToRemove];
  console.log("In removeCity: " + cityToRemove);
  console.log(forecasts);
  console.log(cities);
  delete forecasts[cityToRemove];
  cities.splice(cityToRemove, 1);
  saveCities();
  console.log(forecasts);
  console.log(cities);  
  displayCityButtons();
  if (cities[length-1] > 0) {
    activeCity = cities[length-1];
    displayCity();
  }
}

var chooseCity = function(event) {
  activeCity = $(event.target).data("id");

  // console.log("Active City: " + activeCity);
  // console.log(cities[activeCity]);
  displayCity();
}

var displayCity = function() {
  getForecast( activeCity );
  if (forecasts[activeCity]) {
    displayForecast( activeCity );
  }
}
var addCity = function(event) {
   event.preventDefault();

  // grab the city name from the input field
  
   var newCity = $("#city-input").val();
   if (newCity.length > 2) {
      // Start with checking to see if there are more than two chars


      getForecast(newCity);
   }
   // we used to create a button every time the user
   // added a new city.
   // But with this refactor -- all the buttons get created at the
   // same time with the same function - displayCityButtons()
  // createPanelButton(newCity);
  // displayCityButtons();
  
}

// displayCityButtons
// This function wipes clear and displays our full list
// of cities as buttons in the panel

var displayCityButtons = function() {
  //console.log("In display");
  $("#city-button-block").empty();

  cities.forEach( function(city,index) {
  //  console.log(forecasts);
 
    createPanelButton(city,index);

  });

}
// Need to refactor this so it uses an array to build all the buttons
// rather than adding a new one each time directly.

var createPanelButton = function(city,index) {
  var newButton = $("<button>");
  newButton.text(city);
  newButton.attr("data-id", cities[index]);
  newButton.addClass("city-button");
  newButton.click(chooseCity);
  var delButton = $("<button>");
  delButton.text("del");
  delButton.addClass("del-button");
  delButton.attr("data-id", cities[index]);
  newButton.append(delButton);
  
  $("#city-button-block").prepend(newButton);
}

var getForecasts = function() {

  cities.forEach( function(city){
    console.log("Getting forecast for: "+city);
    getForecast(city);
  } );
}
var getForecast = function(city) {
  // If we haven't yet grabbed the forecast data from the server,
  if (!forecasts[city]) {
   
    //console.log("sending a get for: " + city);
    // revise the city name to make sure it doesn't contain spaces
    var revisedCityString = city.trim().replace(/ /g,"+");

    // Constructing a queryURL using the revised city name

    var weatherQueryURL = "https://api.openweathermap.org/data/2.5/weather?q="+revisedCityString+"&appid=196510002b5290425c8c92315ac3753d";

    // Performing an AJAX request with the queryURL
    $.ajax({
      url: weatherQueryURL,
      method: "GET"
    })
      // After data comes back from the request
      .then(collectWeather);

    var forecastURL = "https://api.openweathermap.org/data/2.5/forecast/daily?q="+revisedCityString+"&appid=62eccb5941f413a5e06f6c5f0bdba432";

    // Performing an AJAX request with the queryURL
    $.ajax({
      url: forecastURL,
      method: "GET"
    })
      // After data comes back from the request
      .then(collectForecast);

  }
}

var collectForecast = function(response) {
  console.log("Got forecast: " + JSON.stringify(response));
}

var collectWeather = function(response) {
  var full, main, description, farenheight, feel, temp_min, temp_max, humidity, windspeed, uv_index, lat, lon, name; 

  full = response.weather;
  main = response.weather[0].main;
  description = response.weather[0].description; 
  farenheight = ((response.main.temp * (9/5) ) - 459.67);
  humidity = response.main.humidity;
  windspeed = response.wind.speed;
  lat = response.coord.lat;
  lon = response.coord.lon;

  name = response.name;

  var newForecast = {"name": name, "full": full, "main":main,"description":description,"farenheight":farenheight,"humidity":humidity,"windspeed":windspeed, "lat": lat, "lon": lon};

  forecasts[name] = newForecast;
  // console.log(newForecast);
  //console.log(forecasts);
  // make sure this city is not already in our list
  if (!cities.includes(name)) {
    cities.push(name);
    activeCity = cities.length-1;
    saveCities();
    displayCityButtons();
  }

  if (!uv_indexes[name]) {
   
    // Get the Lat and Lon from our Forecasts aray
    var lat = forecasts[name].lat;
    var lon = forecasts[name].lon;
    // Constructing a queryURL using the revised city name

    //http://samples.openweathermap.org/data/2.5/uvi/forecast?lat=37.75&lon=-122.37&appid=439d4b804bc8187953eb36d2a8c26a02

    var queryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat="+lat+"&lon="+lon+"&appid=196510002b5290425c8c92315ac3753d";

    // Performing an AJAX request with the queryURL
    $.ajax({
      url: queryURL,
      method: "GET"
    })
      // After data comes back from the request
      .then(collectUV);
  }


   // displayForecast(name);
}

var saveCities = function() {
  localStorage.setItem("wd-cities", JSON.stringify(cities));

}

var collectUV = function(response) {
  var UV_index = response[0].value;
  var lat = response[0].lat;
  var lon = response[0].lon;

  // Use the lat and lon values to match to our Forecasts aray
  var cityName = findCityBasedOnCoords(lat,lon);
   //console.log(lat + ", " + lon);
   //console.log("Found a corresponding city name: " + cityName);
  // console.log("Got into collectUV: " + UV_index);
  uv_indexes[cityName] = UV_index;

  if (Object.keys(forecasts).length === cities.length)  {
   // console.log('about to display latest');
    displayForecast(cities[ cities.length-1 ]);
  }
}

var findCityBasedOnCoords=function(lat,lon) {
 // console.log("In findCity: "+ JSON.stringify(forecasts ));
  var keys = Object.keys(forecasts);

  for (var i =0; i < keys.length; i++) {
   // console.log(forecasts[keys[i]]);
    if ((forecasts[keys[i]].lat === lat) && (forecasts[keys[i]].lon === lon)) {
      return forecasts[keys[i]].name;
    }
  }
}

var displayForecast = function(city) {

  $("#todays-weather-info").empty();
  
  var city, lat, lon, forecast, temp, main, description, temperature, feel, temp_min, temp_max, humidity,
  uv_index; 

  
  //city = cities[activeCity];

  forecast = forecasts[city];

  if (forecast) {
      title = $("<h1>");
      title.html(city + " <span class=\"title-date\">(" + date + ")</span>");
      main= $("<p>");
      if (forecast.main) {
      main.text(forecast.main); }
      if (weatherIcons.includes(forecast.main.toLowerCase())) {
        console.log("We have an icon for that!");
        $("#weather-icon").attr("src","weather_icons/" + forecast.main.toLowerCase() + ".png");
      }
      description = $("<p>");
      description.text(forecast.description); 
      temperature = $("<p>");
      temperature.html("Temperature: " + forecast.farenheight.toFixed(2) + "	&#176;F");
      humidity = $("<p>");
      humidity.text("Humidity: " + forecast.humidity + " %");
      windspeed = $("<p>");
      windspeed.text("Wind Speed: " + forecast.windspeed + " MPH");
      uv_index = $("<p>");
      uv_index.text("UV - Index: " + uv_indexes[city]);
      
      // uv_index = $("<p>");
      // uv_index.text("UV Index: " + response.wind.speed + " MPH¸");

      $("#todays-weather-info").append(title);
      $("#todays-weather-info").append(main);
      $("#todays-weather-info").append(description);
      $("#todays-weather-info").append(temperature);
      $("#todays-weather-info").append(humidity);
      $("#todays-weather-info").append(windspeed);
      $("#todays-weather-info").append(uv_index);

      if (forecast.full) {
        display5dayForecast(forecast.full);
        // $("#5-day-forecast").append(title);

      }
  }

}

// In Add New City: {"coord":{"lon":-122.42,"lat":37.77},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"base":"stations","main":{"temp":286.45,"feels_like":280.07,"temp_min":285.37,"temp_max":287.59,"pressure":1009,"humidity":82},"visibility":16093,"wind":{"speed":9.3,"deg":270},"clouds":{"all":75},"dt":1593318802,"sys":{"type":1,"id":5817,"country":"US","sunrise":1593262198,"sunset":1593315334},"timezone":-25200,"id":5391959,"name":"San Francisco","cod":200}


var display5dayForecast = function(fullForecast) {
  var days;
  console.log("FULL: " + JSON.stringify(fullForecast));

  days = fullForecast.length;
  console.log("days: " + days);
  $("#5-day-forecast").empty();

}