function global_init() {setupGame();}
var connection = {alive : false, peers : {}, streams : {}};
// Game state, this is important
// Do NOT write to this, or you will break everything
var game = {
  locals : {}, // all local information
  //players : sync.newObj(), // userID as a key
  config : null, // game configurations
  entities : null,
  events : null, // All Events performed by the DM
  actions : null, // All the actions objects/players can perform
  components : null, // list of all the ui components a player has access to
  actions : null, // list of all the actions a player has access to
  templates : {}, // data structures specific to game
  version : 4 // the version for the patcher to check against
};

function setupGame() {
  game.entities = game.entities || sync.obj();
  game.entities.data = game.entities.data || {};

  game.config = game.config || sync.obj();
  game.config.data = game.config.data ||{};

  game.events = game.events || sync.obj();
  game.events.data = game.events.data || {};

  game.state = game.state || sync.obj();
  game.state.data = game.state.data || {};

  game.display = game.display || sync.obj();
  game.display.data = game.display.data || {};

  game.players = game.players || sync.obj("players");
  game.players.data = game.players.data || {};

  game.logs = game.logs || sync.obj();
  game.logs.data = game.logs.data || {};

  game.components = {
    "Assets" : {
      _ui : [
        {name : "Asset Manager", ui : "ui_assetManager"}, // first action is the default
        {name : "File Manager", ui : "ui_fileBrowser"}, // first action is the default
        {name : "Character Generator", ui : "ui_charGenerator", basic : "Generate large varieties of characters from formatted text files!", author : "Noobulater", w : 40, h : 70}, // first action is the default
        {name : "Character Importer", ui : "ui_charImporter", basic : "Import Characters in simple text or from XML files from OggDude's tool and PCGen", author : "Noobulater", w : 50, h : 50}, // first action is the default
      ]
    },
    "Inputs" : {
      _ui : [
        {name : "Actions", ui : "ui_actions"},
        {name : "Map Editor", ui : "ui_boardListener"},
        {name : "Dice", ui : "ui_roll"},// basic : "Roll your dice here! Roll stat tests and skill tests, as well as having options for more advanced rolling!"},
        {name : "Event Log", ui : "ui_textBox"},
      ]
    },
    "Game" : {
      _ui : [
        {name : "Resource Page", ui : "ui_resourcePage"},
        {name : "Combat Manager", ui : "ui_combatManager"},// basic : "Manage your combats with the Initiative tracker! It handles suprise rounds, will give you alerts on whose turn it is, and has drag and drop swapping."}, // first action is the default
        {name : "Display", ui : "ui_display"},
        {name : "System Builder", ui : "ui_homebrew", basic : "Tweak and change the layout of your game, including how stats are calculated, what your character sheets look like and much more!", w : 100, h : 100},
        {name : "Tab View", ui : "ui_displayManager"},
      ]
    },
    "Resources" : {
      _ui : [
        {name : "Board", ui : "ui_board"},
        {name : "Game Library", ui : "ui_library", w : 50, h : 50},
        {name : "PDF to Image", ui : "ui_pdf", w : 50, h : 80},
        {name : "Single Page", ui : "ui_editPage"},
      ]
    },
  };
}
