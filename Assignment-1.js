// Module code: CS5003
// Module: Masters Programming Projects
// Creating "Guess The Cat" Game

// Name of the file is logged to the console, to make sure it is correctly linked
console.log("Assignment-1.js");

// Access the information from the Cat API
// The individual API key for my application was received over e-mail after signing up
const requestOptions = {
  method: "GET",
  headers: {
    "x-api-key":
      "live_FrBFCG06zL2G3ZT9HfS9tz8OkCgiZ8NyYqYdNzmy25UD3WgFgeIC6iLSn1GCjQwi",
  },
};

// Certain variables will need to be accessed seperately of the await function
let cats;
let loading;
let chosenCat;
let countTmp = 0;
let countBreed = 0;

// Get the images of the cats
// The appropriate API was tested and constructed through Postman
const getBreedImage = async (breedId) => {
  const response = await fetch(
    `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=1`,
    requestOptions
  );
  const data = await response.json();

  // There will always be one image since the limit is set to 1
  return data[0];
};

// Reset the count for certain variables each round, since the player can play the game multiple rounds
const resetCounts = () => {
  countTmp = 0;
  countBreed = 0;
  guessedTemperaments = [];
  guessedBreeds = [];

  const countTmpDisplay = document.getElementById("count-tmp-guesses");
  countTmpDisplay.textContent = "Number of temperament guessed: " + countTmp;

  const countBreedDisplay = document.getElementById("count-breed-guesses");
  countBreedDisplay.textContent = "Number of breeds guessed: " + countBreed;
};

// Define variables from local storage for keeping track of the user's best temperament score
const loadHighScoreTmp = () => {
  let highScoreTmp = localStorage.getItem("highScoreTmp");

  // Update the best score in the HTML using the ternary operator.
  document.getElementById(
    "highest-score-tmp"
  ).textContent = `Best score for temperament guesses: ${
    highScoreTmp ? highScoreTmp : "N/A"
  }`;
};

// Define variables from local storage for keeping track of the user's best breed score
const loadHighScoreBreed = () => {
  let highScoreBreed = localStorage.getItem("highScoreBreed");

  // Update the best score in the HTML using the ternary operator.
  document.getElementById(
    "highest-score-breed"
  ).textContent = `Best score for breed guesses: ${
    highScoreBreed ? highScoreBreed : "N/A"
  }`;
};

const startGame = async () => {
  try {
    // Reset count for breed and temperament guesses at the beginning of a new game
    resetCounts();
    // Load the (new) high score for both temperament guesses and breed guesses
    loadHighScoreTmp();
    loadHighScoreBreed();
    await getBreeds();
    const error = document.getElementById("error");
    error.textContent = "";
  } catch (ex) {
    console.log("ex", ex);
    const error = document.getElementById("error");
    error.textContent = "Could not load cats. Please try again later.";
  }
};

// Fetch the information on the cat breeds
const getBreeds = async () => {
  loading = true;

  // Remove the select element if it already exists
  // This is useful for when users press buttons multiple times
  const select = document.getElementById("mySelect");
  const breeds = document.getElementById("breeds");
  const catNameSelect = document.getElementById("catNameSelect");
  const breedButton = document.getElementById("breedNameButton");
  const tempButton = document.getElementById("temperamentButton");

  // If the buttons exist, they will be removed
  select?.remove();
  breeds?.remove();
  catNameSelect?.remove();
  breedButton?.remove();
  tempButton?.remove();

  // Get the information about the cat breeds
  const response = await fetch(
    "https://api.thecatapi.com/v1/breeds",
    requestOptions
  );
  const data = await response.json();

  // Pick 10 random cats, based on the data available
  const randomCats = [];
  for (let i = 0; i < 10; i++) {
    const randomCat = data[Math.floor(Math.random() * data.length)];
    randomCats.push(randomCat);
  }
  console.log("Random cats:", randomCats);

  // Map out the information on the individual cats
  cats = await Promise.all(
    randomCats.map((cat) => {
      return getBreedImage(cat.id);
    })
  );

  // A drop-down menu with all the temperaments is constructed using an empty array
  // Once our cats are loaded, their temperaments are pushed into the array, creating the drop-down menu
  const allTemperaments = [];

  const breedsElement = document.createElement("div");
  breedsElement.id = "breeds";

  // Add the images of the cats to the DOM
  // Create elements to display the breed, and their temperaments
  for (const cat of cats) {
    const imageElement = document.createElement("img");
    const textElement = document.createElement("p");
    const temperament = document.createElement("p");

    imageElement.width = 250;
    imageElement.height = 200;
    imageElement.src = cat.url;

    const catTemperament = cat.breeds[0].temperament;
    textElement.textContent = cat.breeds[0].name;
    temperament.textContent = catTemperament;

    const temperamentArray = catTemperament.split(", ");

    const container = document.createElement("div");
    container.id = "container";

    // Append this information to the DOM, to show image, breed and their temperament
    container.appendChild(imageElement);
    container.appendChild(textElement);
    container.appendChild(temperament);
    breedsElement.appendChild(container);

    // Create an image ID, so that we can find and use it for later
    imageElement.id = cat.breeds[0].id;

    // All breeds are added to the DOM so the user can guess based on them
    for (const tmp of temperamentArray) {
      // Find all temperaments available
      if (!allTemperaments.includes(tmp)) {
        allTemperaments.push(tmp);
      }
    }
  }
  document.body.append(breedsElement);

  // Create select elements for breeds and temperaments
  const selectList = document.createElement("select");
  selectList.id = "mySelect";
  document.getElementById("guess-cat-tmp").appendChild(selectList);

  const catNameList = document.createElement("select");
  catNameList.id = "catNameSelect";
  document.getElementById("guess-breed-name").appendChild(catNameList);

  // Add temperament button
  const temperamentButton = document.createElement("button");
  temperamentButton.id = "temperamentButton";
  temperamentButton.textContent = "Guess temperament";
  document.getElementById("guess-cat-tmp").appendChild(temperamentButton);
  temperamentButton.onclick = () => guessCat();

  // Add breed name button
  const breedNameButton = document.createElement("button");
  breedNameButton.id = "breedNameButton";
  breedNameButton.textContent = "Guess breed name";
  document.getElementById("guess-breed-name").appendChild(breedNameButton);
  breedNameButton.onclick = () => guessBreedName();

  const sortedTemperaments = allTemperaments.sort((a, b) => a.localeCompare(b));
  const sortedCats = cats.sort((a, b) =>
    a.breeds[0].name.localeCompare(b.breeds[0].name)
  );

  // Create and append the options the user can select from, for both select menus
  for (let i = 0; i < sortedTemperaments.length; i++) {
    var option = document.createElement("option");
    option.value = sortedTemperaments[i];
    option.text = sortedTemperaments[i];
    selectList.appendChild(option);
  }

  for (const cat of sortedCats) {
    var option = document.createElement("option");
    option.value = cat.breeds[0].name;
    option.text = cat.breeds[0].name;
    catNameList.appendChild(option);
  }

  // As the user is meant to guess a specific, randomly chosen cat, one must be generated
  chosenCat = randomCats[Math.floor(Math.random() * randomCats.length)];
  // Just for testing, would be removed for the actual game for obvious reasons
  console.log("Chosen cat:", chosenCat);
  console.log("Chosen cat temperaments:", chosenCat.temperament);

  loading = false;
  return data;
};

// Update the high score if a new high score is reached or the user is playing for the first time
const updateHighScoreTmp = () => {
  let highScoreTmp = localStorage.getItem("highScoreTmp");

  if (!highScoreTmp || countTmp < highScoreTmp || highScoreTmp == "N/A") {
    localStorage.setItem("highScoreTmp", countTmp);
    alert(
      "This is a new high score for the number of temperament guesses. Congratulations!"
    );
    highScoreTmp = countTmp;
    document.getElementById(
      "highest-score-tmp"
    ).innerText = `Best score for temperament guesses: ${highScoreTmp}`;
  }
};

// An empty array is declared to store temperaments that have already been guessed
let guessedTemperaments = [];

// Check if the chosen temperament matches the one guessed by the user
// Add opacity and a solid red frame to the cats who do not have this temperament if it is right, and the ones that do if it is wrong
const guessCat = () => {
  const select = document.getElementById("mySelect");
  const selectedTemperament = select.options[select.selectedIndex].value;

  const catTemperament = chosenCat.temperament;
  const temperamentArray = catTemperament.split(", ");

  if (guessedTemperaments.includes(selectedTemperament)) {
    alert(
      "This temperament has already been guessed. Please select a different temperament."
    );
  } else if (temperamentArray.includes(selectedTemperament)) {
    guessedTemperaments.push(selectedTemperament);
    const catsWithOutTemperament = cats.filter((cat) => {
      return !cat.breeds[0].temperament.includes(selectedTemperament);
    });
    // Count for counting the amount of temperament guesses the user has made
    countTmp++;
    for (const cat of catsWithOutTemperament) {
      const imageElement = document.getElementById(cat.breeds[0].id);
      imageElement.style.opacity = 0.5;
      imageElement.style.border = "5px solid red";
    }
  } else {
    const catsWithTemperament = cats.filter((cat) => {
      guessedTemperaments.push(selectedTemperament);
      return cat.breeds[0].temperament.includes(selectedTemperament);
    });
    // Count for counting the amount of temperament guesses the user has made
    countTmp++;
    for (const cat of catsWithTemperament) {
      const imageElement = document.getElementById(cat.breeds[0].id);
      imageElement.style.opacity = 0.5;
      imageElement.style.border = "5px solid red";
    }
  }

  // Displaying the count of guesses the user has made
  const countTmpDisplay = document.getElementById("count-tmp-guesses");
  countTmpDisplay.textContent = "Number of temperament guessed: " + countTmp;
};

// Update the high score if a new high score is reached or the user is playing for the first time
const updateHighScoreBreed = () => {
  let highScoreBreed = localStorage.getItem("highScoreBreed");

  if (
    !highScoreBreed ||
    countBreed < highScoreBreed ||
    highScoreBreed == "N/A"
  ) {
    localStorage.setItem("highScoreBreed", countBreed);
    alert(
      "This is a new high score for the number of breed guesses. Congratulations!"
    );
    highScoreBreed = countBreed;
    document.getElementById(
      "highest-score-breed"
    ).innerText = `Best score for breed guesses: ${highScoreBreed}`;
  }
};

// An empty array is declared to store breeds that have already been guessed
let guessedBreeds = [];

// Check if the chosen breed matches the one guessed by the user
// Add opacity and a solid red frame if this is the wrong breed
const guessBreedName = () => {
  const select = document.getElementById("catNameSelect");
  const selectedCat = select.options[select.selectedIndex].value;

  if (selectedCat === chosenCat.name) {
    const imageElement = document.getElementById(chosenCat.id);
    imageElement.style.border = "5px solid green";
    alert(
      "Nice work! That is the correct cat. You made " +
        countTmp +
        " questions about the temperament, and " +
        countBreed +
        " guesses on the cat breed."
    );
    updateHighScoreTmp();
    updateHighScoreBreed();
    startGame();
  } else if (guessedBreeds.includes(selectedCat)) {
    alert(
      "This breed has already been guessed. Please select a different breed."
    );
  } else {
    const foundCat = cats.find((cat) => {
      return cat.breeds[0].name === selectedCat;
    });
    const imageElement = document.getElementById(foundCat.breeds[0].id);
    imageElement.style.border = "5px solid red";
    imageElement.style.opacity = 0.5;
    countBreed++;
    guessedBreeds.push(selectedCat);
    const countBreedDisplay = document.getElementById("count-breed-guesses");
    countBreedDisplay.textContent = "Number of breeds guessed: " + countBreed;
  }
};

// Let the user to quit the game
// If the user ends the game, display a message before the window is closed
const quitGame = () => {
  let highScoreTmp = localStorage.getItem("highScoreTmp");
  let highScoreBreed = localStorage.getItem("highScoreBreed");
  alert(
    `Thanks for playing! Your lowest score for temperament guesses was ${highScoreTmp} and your lowest score for guesses on the cat breed was ${highScoreBreed}.`
  );
  window.close();
};
