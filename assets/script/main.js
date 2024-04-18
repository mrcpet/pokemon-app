// query selectors elements
const pokedexDropDown = document.querySelector("#pokedexDropDown");
const pokemonContainers = document.querySelectorAll(".pokemon-container");
const compareMsg = document.querySelector("#compareMsg");
const combatLog = document.querySelector("#combatLog");

// query selectors buttons
const addPokemonBtn = document.querySelector("#addPokemonBtn");
const compareBtn = document.querySelector("#compareBtn");
const startBattleBtn = document.querySelector("#startBattleBtn");
const resetBtn = document.querySelector("#resetBtn");

// array for selected pokemons
let selectedPokemons = [];

// api call to get data for 151 pokemons
const getPokemons = async () => {
  try {
    const response = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=151"
    );
    return response.data.results;
  } catch (error) {
    console.error("There was an error: ", error);
  }
};

// api call for individual pokemon data
const getPokeData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("There was an error: ", error);
  }
};

// function to render 151 pokemons to dropdown lists
const showPokemons = async () => {
  const data = await getPokemons();
  data.forEach((pokemon) => {
    const option = document.createElement("option");
    option.setAttribute("value", pokemon.name);
    let name = capitalizeFirstLetter(pokemon.name);
    option.innerHTML = name;
    pokedexDropDown.append(option);
  });
  return data;
};
showPokemons();

// pokemon class
class Pokemon {
  constructor(name, image, type, weight, height, stats, move) {
    this.name = name;
    this.image = image;
    this.type = type;
    this.weight = weight;
    this.height = height;
    this.stats = {
      hp: stats[0].base_stat,
      attack: stats[1].base_stat,
      defense: stats[2].base_stat,
      "special attack": stats[3].base_stat,
      "special defense": stats[4].base_stat,
      speed: stats[5].base_stat,
    };
    this.move = move;
    this.originalhp = stats[0].base_stat;
  }

  compare(pokemon) {
    let higherStats = {};
    let poke1Wins = 0;
    let poke2Wins = 0;
    // Compare weight
    if (this.weight > pokemon.weight) {
      higherStats.weight = this.name;
      poke1Wins++;
    } else if (this.weight === pokemon.weight) {
      higherStats.weight = "equal";
    } else {
      higherStats.weight = pokemon.name;
      poke2Wins++;
    }

    // Compare height
    if (this.height > pokemon.height) {
      higherStats.height = this.name;
      poke1Wins++;
    } else if (this.height === pokemon.height) {
      higherStats.height = "equal";
    } else {
      higherStats.height = pokemon.name;
      poke2Wins++;
    }

    // Compare stats
    higherStats.stats = {};
    for (let statName in this.stats) {
      if (this.stats[statName] > pokemon.stats[statName]) {
        higherStats.stats[statName] = this.name;
        poke1Wins++;
      } else if (this.stats[statName] === pokemon.stats[statName]) {
        higherStats.stats[statName] = "equal";
      } else {
        higherStats.stats[statName] = pokemon.name;
        poke2Wins++;
      }
    }
    if (poke1Wins > poke2Wins) {
      higherStats.winner = this.name;
    } else if (poke1Wins === poke2Wins) {
      higherStats.winner = "equal";
    } else {
      higherStats.winner = pokemon.name;
    }
    return higherStats;
  }
  attack(pokemon) {
    let attack = this.stats.attack + this.stats["special attack"];
    let defense = pokemon.stats.defense + pokemon.stats["special defense"];
    let damage = attack - defense * 0.8;
    // if damage is less than 10, make it 10
    if (damage < 10) {
      damage = 10;
    }
    return damage;
  }
}
// function to make first letter of names uppercase
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
// random number function for effect images
const getRandomNumber = () => {
  return Math.floor(Math.random() * 7) + 1;
};
// coin flip
const coinFlip = () => {
  return Math.random() < 0.5;
};
// update stats after battle
const updateStats = (pokemon) => {
  pokemon.stats.hp = pokemon.originalhp;
  if (selectedPokemons.length === 2) {
    renderBattleMode(selectedPokemons, pokemonContainers);
  } else {
    renderPokemon(selectedPokemons, pokemonContainers);
  }
};
// shake frame function
const shakeElement = (element) => {
  // Apply the shake effect
  element.style.transition = "transform 0.05s linear";
  element.style.transform = "translateY(-15px)";
  setTimeout(() => {
    element.style.transform = "translateX(15px)";
    setTimeout(() => {
      element.style.transform = "translateY(-15px)";
      setTimeout(() => {
        element.style.transform = "translateX(15px)";
        setTimeout(() => {
          element.style.transform = "translateX(0)";
        }, 50); // Adjust the duration between shakes as needed
      }, 50);
    }, 50);
  }, 50); // Adjust the total duration of the shake as needed
};
// create health bar
const createHPBar = (hpValue, originalHpValue) => {
  const hpBar = document.createElement("progress");
  hpBar.classList.add("hp-bar");
  hpBar.value = hpValue;
  hpBar.max = originalHpValue;
  return hpBar;
};
// toggle explosion effect function
const toggleExplosion = (element) => {
  let random = getRandomNumber();
  element.src = `assets/img/effects/${random}.svg`;
  setTimeout(() => {
    element.style.display = "block";
    shakeElement(element);
    setTimeout(() => {
      element.style.display = "none";
    }, 750);
  }, 100);
};

// function to render pokemons to DOM
const renderPokemon = (pokemonArray, containerArray, higherStats) => {
  containerArray.forEach((container) => {
    container.innerHTML = "";
  });
  pokemonArray.forEach((pokemon, index) => {
    const container = containerArray[index];
    const pokemonDiv = document.createElement("div");
    pokemonDiv.classList.add("pokemon-card");
    const mainType = pokemon.type[0].type.name;
    pokemonDiv.classList.add(mainType);
    if (pokemon.type.length > 1) {
      const subType = pokemon.type[1].type.name;
      pokemonDiv.classList.add(`${subType}-secondary`);
    }
    if (higherStats && higherStats.winner === pokemon.name) {
      pokemonDiv.classList.add("higher");
      shakeElement(pokemonDiv);
    }
    // Render name
    const nameElement = document.createElement("h2");
    nameElement.textContent = pokemon.name;
    pokemonDiv.append(nameElement);

    // Render image
    const imageElement = document.createElement("img");
    imageElement.src = pokemon.image;
    pokemonDiv.append(imageElement);

    // Render types
    const typesElement = document.createElement("span");
    const types = pokemon.type.map((typeObj) => typeObj.type.name).join(", ");
    typesElement.textContent = `Type(s): ${types}`;

    // Render weight
    const weightElement = document.createElement("span");
    weightElement.textContent = `Weight: ${pokemon.weight} kg`;
    if (higherStats && higherStats.weight === pokemon.name) {
      weightElement.classList.add("higher");
    }
    // pokemonDiv.append(weightElement);

    // Render height
    const heightElement = document.createElement("span");
    heightElement.textContent = `Height: ${pokemon.height} m`;
    if (higherStats && higherStats.height === pokemon.name) {
      heightElement.classList.add("higher");
    }
    // pokemonDiv.append(heightElement);

    // Create info element
    const infoElement = document.createElement("div");
    infoElement.classList.add("info-element");
    // Create info wrapper elements
    const infoWrapper1 = document.createElement("div");
    const infoWrapper2 = document.createElement("div");
    infoWrapper1.classList.add("info-wrapper-1");
    infoWrapper2.classList.add("info-wrapper-2");
    infoWrapper1.append(typesElement);
    infoWrapper2.append(weightElement, heightElement);
    infoElement.append(infoWrapper1, infoWrapper2);
    pokemonDiv.append(infoElement);
    // Render stats
    const statsElement = document.createElement("div");
    const statsHeader = document.createElement("h3");
    statsHeader.textContent = "Stats";
    statsElement.classList.add("stats");
    // pokemon.stats.forEach((stat) => {
    //   const statSpan = document.createElement("span");
    //   statSpan.textContent = `${stat.stat.name}: ${stat.base_stat}`;
    //   statsElement.append(statSpan);
    // });
    const stats = pokemon.stats;
    Object.keys(stats).forEach((statName) => {
      const statWrapper = document.createElement("div");
      const statNameElement = document.createElement("span");
      const statValueElement = document.createElement("span");
      statNameElement.textContent = `${statName}:`;
      statValueElement.textContent = `${Math.round(stats[statName])}`;
      if (
        higherStats &&
        higherStats.stats &&
        higherStats.stats[statName] === pokemon.name
      ) {
        statWrapper.classList.add("higher");
      }
      statWrapper.append(statNameElement, statValueElement);
      statsElement.append(statWrapper);
    });
    statsElement.prepend(statsHeader);
    pokemonDiv.append(statsElement);

    // Rest button
    const restBtn = document.createElement("button");
    restBtn.textContent = "Rest";
    pokemonDiv.append(restBtn);
    restBtn.addEventListener("click", () => {
      updateStats(selectedPokemons[index]);
    });

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    pokemonDiv.append(removeBtn);
    const indexToRemove = index;
    removeBtn.addEventListener("click", () => {
      selectedPokemons.splice(indexToRemove, 1);
      renderPokemon(selectedPokemons, pokemonContainers);
    });

    // Append pokemon container
    container.append(pokemonDiv);
  });
};

// function to render battle mode poke cards
const renderBattleMode = (pokemonArray, containerArray) => {
  containerArray.forEach((container) => {
    container.innerHTML = "";
  });
  pokemonArray.forEach((pokemon, index) => {
    const container = containerArray[index];
    const pokemonDiv = document.createElement("div");
    pokemonDiv.classList.add("pokemon-card");
    const mainType = pokemon.type[0].type.name;
    pokemonDiv.classList.add(mainType);
    if (pokemon.type.length > 1) {
      const subType = pokemon.type[1].type.name;
      pokemonDiv.classList.add(`${subType}-secondary`);
    }
    // Render name
    const nameElement = document.createElement("h2");
    nameElement.textContent = pokemon.name;
    pokemonDiv.append(nameElement);

    // Render image
    const imageElement = document.createElement("img");
    imageElement.src = pokemon.image;
    pokemonDiv.append(imageElement);
    // Render explosion
    if (index === 0) {
      const explosionImgOne = document.createElement("img");
      explosionImgOne.src = "assets/img/effects/1.svg";
      explosionImgOne.alt = "effect";
      explosionImgOne.className = "explosion-one";
      pokemonDiv.append(explosionImgOne);
    } else if (index === 1) {
      const explosionImgTwo = document.createElement("img");
      explosionImgTwo.src = "assets/img/effects/1.svg";
      explosionImgTwo.alt = "effect";
      explosionImgTwo.className = "explosion-two";
      pokemonDiv.append(explosionImgTwo);
    }
    // Render HP (Hit Points) progress bar
    const hpBar = createHPBar(pokemon.stats.hp, pokemon.originalhp);
    pokemonDiv.append(hpBar);
    // attach hp bar to object
    pokemon.hpBar = hpBar;
    // render hp text under bar
    const hpText = document.createElement("p");
    hpText.textContent = `${Math.round(pokemon.stats.hp)} / ${
      pokemon.originalhp
    }`;
    pokemonDiv.append(hpText);
    pokemon.hpText = hpText;

    // Create info element
    const infoElement = document.createElement("div");
    infoElement.classList.add("info-element");
    // Create info wrapper elements
    const infoWrapper1 = document.createElement("div");
    infoWrapper1.classList.add("info-wrapper-1");
    // Append info wrappers to info element
    infoElement.append(infoWrapper1);
    // Append info element to pokemon div
    pokemonDiv.append(infoElement);

    // Rest button
    const restBtn = document.createElement("button");
    restBtn.textContent = "Rest";
    pokemonDiv.append(restBtn);
    restBtn.addEventListener("click", () => {
      updateStats(selectedPokemons[index]);
    });

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    pokemonDiv.append(removeBtn);
    const indexToRemove = index;
    removeBtn.addEventListener("click", () => {
      selectedPokemons.splice(indexToRemove, 1);
      renderPokemon(selectedPokemons, pokemonContainers);
    });

    // Append pokemon container
    container.append(pokemonDiv);
  });
};

// battle simulation functions
const readyCheck = (attacker, defender) => {
  let notReady;
  if (attacker.stats.hp !== attacker.originalhp) {
    notReady = attacker;
  } else if (defender.stats.hp !== defender.originalhp) {
    notReady = defender;
  }
  if (notReady) {
    combatMessage(
      `${capitalizeFirstLetter(
        notReady.name
      )} is tired, rest to regenerate hit points!`
    );
    return false;
  } else {
    return true;
  }
};

// function to print combat message
const combatMessage = (string) => {
  // if (combatLog.children.length > 2) {
  //   combatLog.innerHTML = "";
  // }
  if (!string.includes("wins the fight!")) {
    combatLog.innerHTML = "";
  }
  const message = document.createElement("p");
  message.innerHTML = string;
  switch (string) {
    case "1":
      message.classList.add("countdown");
      message.style.color = "green";
      break;
    case "2":
      message.classList.add("countdown");
      message.style.color = "yellow";
      break;
    case "3":
      message.classList.add("countdown");
      message.style.color = "red";
      break;
    case "FIGHT!":
      message.classList.add("countdown");
      message.style.color = "green";
      break;
  }
  combatLog.append(message);
};

//function for a single attack returning a promise
const singleAttack = (attacker, defender) => {
  //update defender hp
  let damage = attacker.attack(defender);
  defender.stats.hp -= damage;
  if (defender.stats.hp < 0) {
    defender.stats.hp = 0;
  }
  return new Promise((res, rej) => {
    setTimeout(() => {
      if (damage) {
        let msg = `${capitalizeFirstLetter(attacker.name)} uses ${
          attacker.move
        } and hits ${capitalizeFirstLetter(defender.name)} for ${Math.round(
          damage
        )} damage! <br><br>${capitalizeFirstLetter(
          defender.name
        )} remaining hp: ${Math.round(defender.stats.hp)}`;
        combatMessage(msg);
        defender.hpBar.value = defender.stats.hp;
        // show explosion image
        let defenderExplosion;
        if (defender === selectedPokemons[0]) {
          defenderExplosion = document.querySelector(".explosion-one");
          toggleExplosion(defenderExplosion);
          defender.hpText.textContent = `${Math.round(defender.stats.hp)} / ${
            defender.originalhp
          }`;
        } else {
          defenderExplosion = document.querySelector(".explosion-two");
          toggleExplosion(defenderExplosion);
          defender.hpText.textContent = `${Math.round(defender.stats.hp)} / ${
            defender.originalhp
          }`;
        }
        res("Round complete");
      } else {
        rej("Game bug, please refresh and retry");
      }
    }, 2000);
  });
};

const battleFinished = (winner) => {
  setTimeout(() => {
    const msg = `${capitalizeFirstLetter(winner.name)} wins the fight!`;
    combatMessage(msg);
    renderPokemon(selectedPokemons, pokemonContainers);
    if (winner.name === selectedPokemons[0].name) {
      shakeElement(pokemonContainers[0]);
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 45,
        origin: { x: 0.3 },
      });
    } else {
      shakeElement(pokemonContainers[1]);
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 45,
        origin: { x: 0.7 },
      });
    }
  }, 750);
};

//function to start a fight
const startBattle = async () => {
  let pokemonOne = selectedPokemons[0];
  let pokemonTwo = selectedPokemons[1];
  if (!pokemonOne || !pokemonTwo) {
    combatMessage("Pick your fighters!");
    return;
  } else {
    combatMessage("The fight is about to start!");
  }
  let attacker;
  let defender;
  let isEveryoneReady = readyCheck(pokemonOne, pokemonTwo);
  const pokeCards = document.querySelectorAll(".pokemon-card");
  if (isEveryoneReady) {
    //slide test
    pokeCards[0].classList.add("slide-in-left");
    pokeCards[1].classList.add("slide-in-right");
    setTimeout(() => {
      combatMessage("3");
      setTimeout(() => {
        combatMessage("2");
        setTimeout(() => {
          combatMessage("1");
          setTimeout(() => {
            combatMessage("FIGHT!");
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  }
  // make fastest pokemon the attacker for the first round
  if (pokemonOne.stats.speed > pokemonTwo.stats.speed) {
    attacker = pokemonOne;
    defender = pokemonTwo;
  } else if (pokemonOne.stats.speed === pokemonTwo.stats.speed) {
    //flip a coin if both pokemons have same speed
    let flipResult = coinFlip();
    if (flipResult) {
      attacker = pokemonOne;
      defender = pokemonTwo;
    } else {
      attacker = pokemonTwo;
      defender = pokemonOne;
    }
  } else {
    attacker = pokemonTwo;
    defender = pokemonOne;
  }
  setTimeout(async () => {
    while (
      pokemonOne.stats.hp > 0 &&
      pokemonTwo.stats.hp > 0 &&
      isEveryoneReady
    ) {
      await singleAttack(attacker, defender);
      let swap = attacker;
      attacker = defender;
      defender = swap;
      if (pokemonOne.stats.hp <= 0) {
        battleFinished(pokemonTwo);
      } else if (pokemonTwo.stats.hp <= 0) {
        battleFinished(pokemonOne);
      }
    }
  }, 3000);
};

// event listeners
addPokemonBtn.addEventListener("click", async () => {
  const data = await getPokemons();
  const selectedPokemon = pokedexDropDown.value;
  const pokeObject = data.filter((pokemon) => pokemon.name === selectedPokemon);
  const pokeData = await getPokeData(pokeObject[0].url);
  if (selectedPokemons.length < 2) {
    const createPokemon = new Pokemon(
      pokeData.name,
      pokeData.sprites.other["official-artwork"].front_default,
      pokeData.types,
      pokeData.weight,
      pokeData.height,
      pokeData.stats,
      pokeData.moves[0].move.name
    );
    // prevent the same pokemon being added twice
    const createdPokemon = selectedPokemons.map((pokemon) => pokemon.name);
    if (createdPokemon[0] === createPokemon.name) {
      combatMessage(
        "The pokemons can't hurt themselves, they exist in a fantasy world free from the shackles of our modern society."
      );
    } else {
      combatMessage(
        `A wild ${capitalizeFirstLetter(createPokemon.name)} appears!`
      );
      selectedPokemons.push(createPokemon);
    }
  } else {
    combatMessage(
      "The battlefield is too crowded, remove a pokémon to add another!"
    );
  }
  console.log("array of created pokemons", selectedPokemons);
  renderPokemon(selectedPokemons, pokemonContainers);
});

compareBtn.addEventListener("click", () => {
  if (selectedPokemons.length === 2) {
    let pokemonOne = selectedPokemons[0];
    let pokemonTwo = selectedPokemons[1];
    let higherStats = pokemonOne.compare(pokemonTwo);
    combatLog.innerHTML = "";
    let compareMsg;
    if (higherStats.winner === pokemonOne.name) {
      compareMsg = `
        ${capitalizeFirstLetter(
          pokemonOne.name
        )} is stronger than ${capitalizeFirstLetter(pokemonTwo.name)}!`;
    } else if (higherStats.winner === pokemonTwo.name) {
      compareMsg = `
        ${capitalizeFirstLetter(
          pokemonTwo.name
        )} is stronger than ${capitalizeFirstLetter(pokemonOne.name)}!`;
    } else {
      compareMsg = "The pokémons are equal!";
    }
    combatMessage(compareMsg);
    renderPokemon(selectedPokemons, pokemonContainers, higherStats);
  } else {
    combatMessage("Compare to who?");
  }
});

startBattleBtn.addEventListener("click", () => {
  combatLog.innerHTML = "";
  renderBattleMode(selectedPokemons, pokemonContainers);
  startBattle();
  compareMsg.innerHTML = "";
});

resetBtn.addEventListener("click", () => {
  selectedPokemons = [];
  renderPokemon(selectedPokemons, pokemonContainers);
  combatLog.innerHTML = "";
  compareMsg.innerHTML = "";
});
