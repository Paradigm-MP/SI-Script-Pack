// Global loot object
global.loot = 
{
    config: require('./config'),
    mysql: require('promise-mysql'),
    items: 
    {
        Common: [],
        Uncommon: [],
        Rare: [],
        Epic: [],
        Legendary: []
    },
    chat: jcmp.events.Call('get_chat')[0],
    utils: require('./utility/utility'),
    generator: 
    {
        GetLoot: require('./events/getloot'),
        GetLootBagLoot: require('./events/getlootbag'),
        Generate: require('./events/lootgen')
    },
    CreateStorage: require('./storages/createstorage'),
    cells: {}, // 2D array of lootboxes, dropboxes, and storages in cells
    players_in_cells: {}, // 2D array of players in cells
    lootbox: require('./classes/lootbox'),
    storage: require('./classes/storage'),
    LoadStorages: require('./storages/loadstorages'),
    spawn_data: [],
    spawns: [],
    storages: [],
    jsonutils: require('./utility/jsonutils'),
    CallRemoteCell: require('./events/callremotecell'),
    CreateDropbox: require('./events/inventory')
}

// Assign database from character
loot.config.database = jcmp.events.Call('GetDatabase')[0];
jcmp.lootbox = loot.lootbox;

loot.cell = require('./utility/cells'),
require('./utility/placeloot');
require('./events/character');
require('./events/jc');
require('./sorting/sort');
require('./events/uselootbag');
require('./storages/placestorage');
require('./storages/database');
require('./storages/network');
require('./storages/exp');
require('./storages/upgrades');

setInterval(() => {}, 500); // If things break because NODEJS, this will make them work again

