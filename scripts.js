var numPics = 0, numSecs = 0;
var rowColPair = [], shuffledPics = [];
const picsCollection = ["buck","dokkaebi","ela","frost","fuze","hibana","iq","kapkan","lesion","smoke","twitch","valkyrie"];
var interval = 0, countdown;

// variables for flipping tiles
var clickCount = 0;
var selectedTiles = [];
var tilesMatching = false;

function startGame() {
  $("p#instructions").hide(400);
  $("#newGame").val("new game");
  $("#newGame").removeClass("input-end-state");
  $("div.container").attr("class","container");
  clickCount = 0;
  selectedTiles = [];
  tilesMatching = false;
  // retrieve selected options
  getDropdownVals();

  // reset timer on button click
  clearInterval(interval);
  var countdownTimer = document.getElementById("countdown");
  countdownTimer.innerHTML = "ready?";


  // generate table based on selected amount of pairs
  findRowsCols(numPics*2);
  shuffledPics = sortPictures(numPics);
  generateTable();

  // show pictures face up for selected amount of seconds
  showPictures();

  // begin countdown
  setTimeout(function(){
    gameCountdown(numPics);
  },numSecs*1000);
}

// set up tiles
function generateTable() {
  // remove existing table if exists
  if(document.contains(document.getElementById("tiles-table"))) {
    document.getElementById("tiles-table").remove();
  }

  // create new table
  var tilesTable = document.createElement("table");
  tilesTable.setAttribute("id","tiles-table");

  // create columns and rows
  for(i=0; i<rowColPair[0]; i++) {
    var newTR = document.createElement("tr");
    for(j=0; j<rowColPair[1]; j++) {
      var newTD = document.createElement("td");

      // create tile container
      var flipInnerDiv = document.createElement("div");
      flipInnerDiv.setAttribute("class","flip-inner");
      var operatorIcon = shuffledPics.pop();
      flipInnerDiv.setAttribute("id",operatorIcon);


      // create front of tile
      var frontDiv = document.createElement("div");
      frontDiv.setAttribute("class","flip-front");
      frontDiv.innerHTML = "<img src='img/r6-logo.jpg' />";
      flipInnerDiv.appendChild(frontDiv);

      // create back of tile
      var backDiv = document.createElement("div");
      backDiv.setAttribute("class","flip-back");
      backDiv.innerHTML = "<img src='img/"+ operatorIcon +".svg' />";
      flipInnerDiv.appendChild(backDiv);

      // append tile to td
      newTD.appendChild(flipInnerDiv);
      // append td to tr
      newTR.appendChild(newTD);
    }
    // append tr to table
    tilesTable.appendChild(newTR);
  }

  document.getElementById("tableContainer").appendChild(tilesTable);

}

// retrieve the selected options for pairs of pictures and number of seconds
function getDropdownVals() {
  var picsDropdown = document.getElementById("numberPairs");
  numPics = picsDropdown.options[picsDropdown.selectedIndex].text;

  var secondsDropdown = document.getElementById("numberSeconds");
  numSecs = secondsDropdown.options[secondsDropdown.selectedIndex].text;
}

// decide the best layout for table based on quantity of pictures
function findRowsCols(num) {
  rowColPair = [2,num/2];
  var newRow,newCol;
  var sqrtPics = Math.sqrt(num);
  // checking if number is a perfect square
  if(sqrtPics%1==0) {
    rowColPair = [sqrtPics,sqrtPics];
  } else {
    // if not a perfect square, proceed with algorithm
    newRow = 3;
    var flag = false;
    while(!flag) {
      if(num%newRow==0) {
        newCol = num/newRow;
        if(newRow==rowColPair[1] && newCol==rowColPair[0]) {
          flag = true;
        } else {
          rowColPair = [newRow,newCol];
        }
      }
      newRow++;
    }
  }
}

// determine order of pictures for generated table
function sortPictures(num) {
  // select picture file names from picsCollection array and insert them twice
  var chosenPics = [];
    for(i=0; i<num; i++) {
      chosenPics.push(picsCollection[i],picsCollection[i]);
  }

  // shuffle the chosenPics array to create random order of pictures in table
  var currentIndex = chosenPics.length, tempVal, randomIndex;
  while(currentIndex!==0) {
    randomIndex = Math.floor(Math.random()*currentIndex);
    currentIndex -= 1;
    tempVal = chosenPics[currentIndex];
    chosenPics[currentIndex] = chosenPics[randomIndex];
    chosenPics[randomIndex] = tempVal;
  }

  return chosenPics;
}

// show pictures to user for selected amount of seconds
// then flip face down again
function showPictures() {
  var selectedTile;
  setTimeout(function(){
    selectedTile = $(".flip-inner").addClass("flipped");
  },500);
  setTimeout(function(){
    selectedTile.removeClass("flipped");
  },numSecs*1000);
  clickCount = 0;
}

$(document).ready(function(){
  $("#tableContainer").on("click", ".flip-inner", function(){
    // keep track of clicks and
    // prevent flipping more than 2 tiles at a time
      // flip tiles if clickCount < 2
    if(clickCount<2 && !$(this).hasClass("flipped")) {
      clickCount++;
      var clickedTile = $(this);
      clickedTile.addClass("flipped");
      selectedTiles.push(clickedTile.attr("id"));
    }

    // keep tiles flipped if they match
    // flip back over if not a match
    if(clickCount==2) {
      clickCount++;
      tilesMatching = checkTilesMatching(selectedTiles);
      selectedTiles = [];
      if(tilesMatching) {
        $(".flipped").addClass("matched");
        setTimeout(function(){
          clickCount = 0;
        },500);
      } else {
        var notMatched = $(".flipped:not(.matched)");
        notMatched.addClass("not-matched");
        if(countdown!=0) {
          setTimeout(function(){
            notMatched.removeClass("flipped").removeClass("not-matched");
          },1200);
          setTimeout(function(){
            clickCount = 0;
          },1300);
        }
      }
    }

    // stops timer once player has found all pairs
    if($(".matched").length == numPics*2) {
      youWin();
    }

  });
});

// compare ids to see if tiles match
function checkTilesMatching(array) {
  var firstTile = array[0];
  var secondTile = array[1];
  if(firstTile == secondTile) {
    return true;
  } else {
    return false;
  }
}

// sets timer depending on number of tiles
// flips over remaining tiles if timer hits zero
function gameCountdown(x) {
  countdown = x*15;
  interval = setInterval(function() {
    document.getElementById("countdown").innerHTML = countdown;
    countdown--;
    if (countdown < 0) {
      clearInterval(interval);
      clickCount = 3;
      youLose();
    }
  }, 1000);
}

function youWin() {
  clearInterval(interval);
  $("div.container").addClass("victory");
  $("#newGame").val("play again?");
  $("#newGame").addClass("input-end-state");
  setTimeout(function(){
    document.getElementById("countdown").innerHTML = "hard fought victory";
  },100);
}

function youLose() {
  clearInterval(interval);
  $("div.container").addClass("defeat");
  $("#newGame").val("play again?");
  $("#newGame").addClass("input-end-state");
  $(".flip-inner:not(.matched)").addClass("flipped").addClass("not-matched");
  setTimeout(function(){
    document.getElementById("countdown").innerHTML = "heartbreaking defeat";
  },100);
}
