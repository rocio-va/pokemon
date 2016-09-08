if (window.PokemonApp === undefined) {
  window.PokemonApp = {};
}

PokemonApp.init = function () {
  console.log("PokemonApp Online");
};

PokemonApp.Pokemon = function (id) {
  this.id = id;
};

PokemonApp.Pokemon.prototype.render = function() {
  console.log("Rendering pokemon: #" + this.id);
  $.ajax({
    url: 'http://pokeapi.co/api/v2/pokemon/' + this.id,
    //si la petición sale bien hacemos otra para description
    success: function(response){
      console.log(response);
      var pokemon = response;
      $.ajax({
        url: 'http://pokeapi.co/api/v2/pokemon-species/' + pokemon.id,
        success: function(response){
          var preEvolve = response.evolves_from_species;
          //console.log(response.evolves_from_species.name);
          var description = response['flavor_text_entries'][3]['flavor_text'];
          createCard(pokemon, description, preEvolve);
        }
      });
    }
  });
};

function searchType(id) {
  console.log("searchin type:");
  $.ajax({
    url: 'http://pokeapi.co/api/v2/type/' + id,
    success: function (response){
      //conseguimos el array de pokemon de ese tipo
      var pokemonOfType = response.pokemon;
      if (pokemonOfType.length > 10){
        pokemonOfType = pokemonOfType.slice(0, 10);
        console.log(pokemonOfType.length);
      }
      pokemonOfType.forEach(function(item){
        var url = item.pokemon.url;
        var id = PokemonApp.idFromUri(url);
        console.log(id);
        var pokemon = new PokemonApp.Pokemon(id);
        pokemon.render();
      });
    }
  });
}

PokemonApp.idFromUri = function (pokemonUri) {
  var uriSegments = pokemonUri.split("/"); //["fdvh", "ofhvo", "3", ""]
  var secondLast = uriSegments.length - 2;
  //console.log(uriSegments[secondLast]);
  return uriSegments[secondLast];
}

function createCard (pokemon, description, preEvolve) {
  var name = pokemon.name;
  var types = pokemon.types.reduce(function(sum, item){
    return sum + item.type.name + " ";
  }, "");

  console.log(types);
  var img = pokemon.sprites.front_default;
  // append
  console.log(preEvolve);
  var htmlCard = `<div class="js-card"><div class="js-img-front"><img src="${img}"></div><p class="js-poke-name">Name: ${name}</p><p class="js-poke-types">Type/s: ${types}</p><p class="js-poke-desc">${description}</p>`;
  if (preEvolve !== null){
    htmlCard = htmlCard + `<a class="js-evolves-from" href="#" data-id="${preEvolve.url}">Evolves from: ${preEvolve.name}</a>`;
  }
  htmlCard = htmlCard + '</div>'
  $('.js-cards').append(htmlCard);
};

$(document).ready (function (){
  PokemonApp.init();
  $('.js-btn-id').on('click', function (event){
    var $input = $('.js-input-id');
    var id = $input.val();
    console.log(id);
    var pokemon = new PokemonApp.Pokemon(id);
    pokemon.render();
  });

  $('.js-a-type').on('click', function (event) {
    event.preventDefault();
    $type = $(event.currentTarget);
    var id = $type.data('id');
    searchType(id);
  });

  $('.js-evolves-from').on('click', function (event) {
    event.preventDefault();
    $('.my-modal').modal();
  });

});