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

// store the weather data in a local object
// so we don't have to ping an outside server every time
var weather = {};
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
      activeCity = cities[cities.length -1];
     // console.log(activeCity);
      getWeather(activeCity);
    }

    //getWeathers();
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
    weather = {};
    displayCityButtons;
    displayWeather("");
    $("#city-button-block").empty();
    localStorage.setItem("wd-cities", "");

}
var removeCity = function(event) {

  event.stopPropagation();

  cityToRemove = $(event.target).data("id");
  console.log("Removing: " + cityToRemove);

  delete weather[cityToRemove];
  var cityIndex = cities.indexOf(cityToRemove);
  cities.splice(cityIndex, 1);
  console.log("cities: " + cities);
  saveCities();
 
  displayCityButtons();
  if (cities[length-1] > 0) {
    activeCity = cities[length-1];
    displayCity();
  }
}

var chooseCity = function(event) {
  activeCity = $(event.target).data("id");

  //console.log("Active City: " + activeCity);

  displayCity();
}

var displayCity = function() {
 // getWeather( activeCity );
  //console.log("In displayCity, activeCity =" + activeCity);
  //console.log(JSON.stringify(weather));
  if (weather[activeCity]) {
  //  console.log("Found a weather object for this city.");
    displayWeather( activeCity );
  } else {
    getWeather(activeCity);
  }
}
var addCity = function(event) {
   event.preventDefault();

  // grab the city name from the input field
  
   var newCity = $("#city-input").val();
   if (newCity.length > 2) {
      // Start with checking to see if there are more than two chars


      getWeather(newCity);
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

  $("#city-button-block").empty();

  cities.forEach( function(city,index) {
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

var getWeathers = function() {

  cities.forEach( function(city){
    getWeather(city);
  } );
}
var getWeather = function(city) {
  // If we haven't yet grabbed the forecast data from the server,
  if (!weather[city]) {
   
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

    var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q="+revisedCityString+"&appid=196510002b5290425c8c92315ac3753d";

    // Performing an AJAX request with the queryURL
    $.ajax({
      url: forecastURL,
      method: "GET"
    })
      // After data comes back from the request
      .then(collectForecast);

  }
}
// International Space Station`

var collectForecast = function(response) {

  if (response) {


    // NOTE:  We are assuming that this response forecast object is related
    // to the current "ActiveCity".... however, there is no identifier in the
    // data object itself to confirm that....!

    forecasts[activeCity] = response.list;
    displayForecast();
  }
}

var displayForecast = function() {
   var thisForecast = forecasts[activeCity];
   var f_temp, f_humidity, f_main, f_description, f_count, newDate;
   f_count =0;
   $("#5-day-forecast").empty();
   for (var i = 0; f_count < 5; i++ )
   {
    f_date = thisForecast[i].dt_txt;
    f_date_array = f_date.split(" ");
    f_date = f_date_array[0];

      while ((i > 0) && (f_date === thisForecast[i-1].dt_txt.split(" ")[0] ) ) {
        i++;
      }

      f_date = thisForecast[i].dt_txt;
      f_date_array = f_date.split(" ");
      f_date = f_date_array[0];

      newDate = $("<p class=\"forecast-date\">");      
      newDate.html(f_date);


      f_temp = thisForecast[i].main.temp;
      f_humidity = thisForecast[i].main.humidity;
      f_main = thisForecast[i].weather.main;
      f_description = thisForecast[i].weather.description;

      var newCard = $("<div class='forecast-card'>");
    

      var newTemp = $("<p>");
      farenheight = ((f_temp * (9/5) ) - 459.67);

      newTemp.html("Temp: <br>" + farenheight.toFixed(2) + "	&#176;F");
      var newHum = $("<p>");
      newHum.html("<br>Humidity:" + f_humidity + "%");

      newCard.append(newDate);
      newCard.append(newTemp);
      newCard.append(newHum);

      $("#5-day-forecast").append(newCard);
      f_count++;

   }


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
  activeCity = name;

  var newWeather = {"name": name, "full": full, "main":main,"description":description,"farenheight":farenheight,"humidity":humidity,"windspeed":windspeed, "lat": lat, "lon": lon};

  //console.log("Created new weather object");
  weather[name] = newWeather;
  //console.log("All weather objects: " + JSON.stringify(weather) );
  displayWeather(activeCity);
  //$("#city-input").val("");
  document.getElementById("search-form").reset();
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
    var lat = weather[name].lat;
    var lon = weather[name].lon;

    // Constructing a queryURL for the UV-INDEX using the revised city name
    var queryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat="+lat+"&lon="+lon+"&appid=196510002b5290425c8c92315ac3753d";

    // Performing an AJAX request with the queryURL
    $.ajax({
      url: queryURL,
      method: "GET"
    })
      // After data comes back from the request
      .then(collectUV);
  }

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

  uv_indexes[cityName] = UV_index;

  if (Object.keys(weather).length === cities.length)  {

    displayWeather(cities[ cities.length-1 ]);
  }
}

var findCityBasedOnCoords=function(lat,lon) {

  var keys = Object.keys(weather);

  for (var i =0; i < keys.length; i++) {

    // make sure this exists
    if (weather[keys[i]]) {
      if ((weather[keys[i]].lat === lat) && (weather[keys[i]].lon === lon)) {
        return weather[keys[i]].name;
      }
    }
  }
}

var displayWeather = function(city) {

  $("#todays-weather-info").empty();
  
  var city, lat, lon, temp, main, description, temperature, feel, temp_min, temp_max, humidity,
  uv_index; 

  
  //city = cities[activeCity];

  thisWeather = weather[city];

  if (thisWeather) {
      title = $("<h1>");
      title.html(city + " <span class=\"title-date\">(" + date + ")</span>");
      main= $("<p>");
      if (thisWeather.main) {
      main.text(thisWeather.main); }
      if (weatherIcons.includes(thisWeather.main.toLowerCase())) {
       // console.log("We have an icon for that!");
        $("#weather-icon").attr("src","weather_icons/" + thisWeather.main.toLowerCase() + ".png");
      }
      description = $("<p>");
      description.text(thisWeather.description); 
      temperature = $("<p>");
      temperature.html("Temperature: " + thisWeather.farenheight.toFixed(2) + "	&#176;F");
      humidity = $("<p>");
      humidity.text("Humidity: " + thisWeather.humidity + " %");
      windspeed = $("<p>");
      windspeed.text("Wind Speed: " + thisWeather.windspeed + " MPH");
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

  }

}

// In Add New City: {"coord":{"lon":-122.42,"lat":37.77},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"base":"stations","main":{"temp":286.45,"feels_like":280.07,"temp_min":285.37,"temp_max":287.59,"pressure":1009,"humidity":82},"visibility":16093,"wind":{"speed":9.3,"deg":270},"clouds":{"all":75},"dt":1593318802,"sys":{"type":1,"id":5817,"country":"US","sunrise":1593262198,"sunset":1593315334},"timezone":-25200,"id":5391959,"name":"San Francisco","cod":200}


// var display5dayForecast = function(fullForecast) {
//   var days;
//   console.log("FULL: " + JSON.stringify(fullForecast));

//   days = fullForecast.length;
//   console.log("days: " + days);
//   $("#5-day-forecast").empty();

// }