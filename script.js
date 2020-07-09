//   Javascript code by Bart Dority

    // respond to user input of city names
    // by generating an ajax get request from the openweathermap API
    // two two different endpoints -- one for today's weather
    // and the other for the 5 day forecast
    // Take the returned data object and display it to the user
    // also, create buttons for each city and
    // store the user requested city names in local Storage

var date;
var weatherIcons = ["clouds","drizzle","flurries","hail","heavyrain","rain","snow","storm","clear","scatteredshowers","lightsnow","lightning","partlycloudy","overcast_night","clearnight"];
var cities = [];
// an index to the city name that we are currently viewing
var activeCity = 0;
// this is the version of the current city name without spaces
// that we can pass to the API endpoints
var revisedCityString = "";

// store the weather data in a local object
// so we don't have to ping an outside server every time
// this was a nice idea -- but didn't seem to work correctly
// in implementation
var weather = {};
var forecasts = {};
var uv_indexes = {};


$(document).ready(function() {

    // get the current date from Moment.js
    date = moment().format("MM/DD/YYYY");

    // get the list of cities from Local storage if there are any
    retrieveCitiesFromLocalStorage();

    // setup button handlers
    addButtonHandlers();
  
});

var addButtonHandlers = function() {
      // add a city
      $("#add-city").click(addCity);
  
      // clear all
      $("#clear-all").click(clearAll);
}

var retrieveCitiesFromLocalStorage = function() {
  var cityList = localStorage.getItem("wd-cities");
  if (cityList) {
    cities = JSON.parse(cityList);
    activeCity = cities.length -1;
    displayCityButtons();
    getWeather();
  }
}

var clearAll = function(event) {
    cities = [];
    weather = {};
    displayCityButtons;
    //displayWeather();
    clearDisplay();
    $("#city-button-block").empty();
    localStorage.setItem("wd-cities", "");
}

var removeCity = function(event) {

  event.stopPropagation();

  cityToRemove = $(event.target).data("id");
  console.log("Removing: " + cityToRemove);

  console.log(cities);
  console.log (cities.indexOf(cityToRemove));
  console.log(cities[cities.indexOf(cityToRemove) ]);
  var cityIndex = cities.indexOf(cityToRemove);

  cities.splice(cityIndex, 1);
  // //console.log("cities: " + cities);

  saveCities();
 
  if (activeCity === cityIndex) {
    console.log("removing the active city.");
    activeCity = 0;
  } else {
    if (activeCity > cityIndex) {
      activeCity = activeCity -1;
    }
  }


  console.log("Active City is now: " + activeCity);
  displayCityButtons();
  getWeather();
}

var chooseCity = function(event) {
  activeCity = $(event.target).data("id");
  activeCity = cities.indexOf(activeCity);
  //console.log("Active City: " + activeCity);

  getWeather();
}

var addCity = function(event) {
   event.preventDefault();

  // grab the city name from the input field
  
   var newCity = $("#city-input").val();
   
   // Validate by checking to see if there are more than two chars
   if (newCity.length > 2) {

      // clear the text in the input field so they can enter another city
      document.getElementById("search-form").reset();

      // make sure this city is not already in our list
      if (!cities.includes(newCity)) {

        // add the new city to the list
        cities.push(newCity);
        activeCity = cities.length-1;
        saveCities();
        displayCityButtons();
        getWeather();
      }
   }
  
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
  delButton.click(removeCity);
  delButton.attr("data-id", cities[index]);
  newButton.append(delButton);
  
  $("#city-button-block").prepend(newButton);
}

var clearDisplay=function() {
  $("#todays-weather-info").empty();
  $("#5-day-forecast").empty();
  $("#weather-icon").css({"display":"none"});
}

var getWeather = function() {

  clearDisplay();

  if ( (activeCity!=null) && cities[activeCity] ) {
   // console.log("Getting Weather");
   
  
    revisedCityString = cities[activeCity].trim().replace(/ /g,"+");
   // console.log("revised city string: " + revisedCityString);

    // Constructing a queryURL using the revised city name

    var weatherQueryURL = "https://api.openweathermap.org/data/2.5/weather?q="+revisedCityString+"&appid=196510002b5290425c8c92315ac3753d";

    // Performing an AJAX request with the queryURL
    $.ajax({
      url: weatherQueryURL,
      method: "GET"
    }).then(collectWeather);
      // After data comes back from the request
     
  }
}


var collectWeather = function(response) {
  var full, main, description, farenheight, feel, temp_min, temp_max, humidity, windspeed, lat, lon, name; 

  if (response) {
   // console.log("Collecting Weather");
      full = response.weather;
      main = response.weather[0].main;
      description = response.weather[0].description; 
      farenheight = ((response.main.temp * (9/5) ) - 459.67);
      humidity = response.main.humidity;
      windspeed = response.wind.speed;
      lat = response.coord.lat;
      lon = response.coord.lon;

      name = response.name;
      activeCity = cities.indexOf(name);  // we want an index
   //   console.log("Active City: "+ activeCity);
     // console.log("Response name: " + name);

      var newWeather = {"name": name, "full": full, "main":main,"description":description,"farenheight":farenheight,"humidity":humidity,"windspeed":windspeed, "lat": lat, "lon": lon};

      // our weather object is indexed by the key of the city name
      weather[name] = newWeather;
      
      // Get the Lat and Lon from our Forecasts aray
      var lat = weather[name].lat;
      var lon = weather[name].lon;

      // Constructing a queryURL for the UV-INDEX using the lat and lon values
      // Note: This is the UVI Endpoint
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


var collectUV = function(response) {
  var UV_index = response[0].value;
  var lat = response[0].lat;
  var lon = response[0].lon;

  // Use the lat and lon values to match to our Forecasts aray
  var cityName = findCityBasedOnCoords(lat,lon);

  uv_indexes[cityName] = UV_index;



  // Constructing a queryURL for the FORECAST using the revised city name
  // Note: This is the Forecast Endpoint

  revisedCityString = cityName.trim().replace(/ /g,"+");

  var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q="+revisedCityString+"&appid=196510002b5290425c8c92315ac3753d";

  // Performing an AJAX request with the queryURL
  $.ajax({
    url: forecastURL,
    method: "GET"
  })
    // After data comes back from the request
    .then(collectForecast);

}




var collectForecast = function(response) {

  if (response) {


    // NOTE:  We are assuming that this response forecast object is related
    // to the current "ActiveCity".... however, there is no identifier in the
    // data object itself to confirm that....!

    forecasts[cities[activeCity]] = response.list;
    displayWeather();
    displayForecast();
  //  console.log(forecasts);
   

  }
}

var displayForecast = function() {
   var thisForecast = forecasts[cities[activeCity]];
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

      newIcon = $("<img class='forecast-icon'>");
      if (thisForecast[i].main) {
        //newIcon.text(thisForecast[i].main); }
       // console.log("forecast main: " + thisForecast[i].weather[0].main );
        var mainString = thisForecast[i].weather[0].main + "";
        if (weatherIcons.includes(mainString.toLowerCase())) {
         // console.log("We have an icon for that!");
         newIcon.attr("src","weather_icons/" + mainString.toLowerCase() + ".png");
         $("#weather-icon").css({"display":"inline-block"});
          //$("#weather-icon").attr("src","weather_icons/" + thisWeather.main.toLowerCase() + ".png");
        }
      }
      newCard.append(newIcon);
      newCard.append(newTemp);
      newCard.append(newHum);

      $("#5-day-forecast").append(newCard);
      f_count++;

   }


}


var saveCities = function() {
  localStorage.setItem("wd-cities", JSON.stringify(cities));

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

var displayWeather = function() {

  //console.log("Displaying the weather.");
  //console.log(uv_indexes);
  
  
  var city, lat, lon, temp, main, description, temperature, feel, temp_min, temp_max, humidity,
  uv_index; 

  
  city = cities[activeCity];

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

      uv_index_label = $("<span>");
      uv_index_label.text ("UV-Index:");
      uv_index_value = $("<span class='uv '>");
      uv_index_value.html("&nbsp; "+uv_indexes[city]);

      
   
  
      var thisUVvalue = parseInt(uv_indexes[city]);
      var thisUVclass="";
      if (thisUVvalue) {
          switch(thisUVvalue) {
            case 0: thisUVclass="uv-low";break;
            case 1: thisUVclass="uv-low";break;
            case 2: thisUVclass="uv-low";break;
            case 3: thisUVclass="uv-med";break;
            case 4: thisUVclass="uv-med";break;
            case 5: thisUVclass="uv-med";break;
            case 6: thisUVclass="uv-hi";break;
            case 7: thisUVclass="uv-hi";break;
            case 8: thisUVclass="uv-vhi";break;
            case 9: thisUVclass="uv-vhi";break;
            case 10: thisUVclass="uv-vhi";break;
            case 11: thisUVclass="uv-ex";break;

            default:break;
          }
          uv_index_value.addClass(thisUVclass);
     
      }

      uv_index.append(uv_index_label);
      uv_index.append(uv_index_value);
 
      
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


