// Global inventory object
global.inv = 
{
    config: require('./config'),
    con: null,
    mysql: require('promise-mysql'),
    utils: require('./utility/utility'), // Utility functions
    inventory: require('./classes/inventory'), // Inventory class
    vinventory: require('./classes/v_inventory'), // Inventory class
    item: require('./classes/item'), // Item class
    stack: require('./classes/stack'), // Stack of items class
    sqlstring: require('sqlstring'),
    chat: jcmp.events.Call('get_chat')[0],
    models: require('./utility/models'),
    GetLandclaimSize: require('./utility/landclaim_size'),
    items: 
    {
        Cosmetics: require('./items/Cosmetics'),
        Survival: require('./items/Survival'),
        Utility: require('./items/Utility'),
        Weaponry: require('./items/Weaponry'),
    }
}

inv.config.database = jcmp.events.Call('GetDatabase')[0];
inv.db = require('./events/database');

require('./events/chat');
require('./events/network');
require('./events/vnetwork');
require('./events/exp');
require('./events/jc');

jcmp.inv = {}
jcmp.inv.FindItem = inv.utils.FindItem;
jcmp.inv.item = inv.item;
jcmp.inv.stack = inv.stack;
jcmp.inv.v_inv = inv.vinventory;
jcmp.inv.items = inv.items;
jcmp.inv.inventory = inv.inventory;

setInterval(() => {}, 500); // If things break because NODEJS, this will make them work again