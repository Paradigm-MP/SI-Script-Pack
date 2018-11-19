global.c = 
{
    config: require('./config'),
    mysql: require('promise-mysql'),
    weapons: require('./utility/weapons'),
    util: require('./utility/utility'),
    tags: require('./events/tags'),
    randomcolor: require('randomcolor'),
    exp: require('./events/exp'), // Experience/levels related events and stuff
    chat: jcmp.events.Call('get_chat')[0],
    hunger: require('./events/hunger'),
    names: [],
    ban: require('./events/ban') // Managing bans
}

jcmp.dev_mode = JSON.parse(jcmp.server.config).name.toLower().includes('dev');

/*

What the heck does this module do?

Literally everything, including levels/experience and position.

*/

require('./events/database'); // Initializes databases
require('./events/jc'); // Default JC3MP events
require('./events/network'); // Custom character network events
require('./events/character'); // Character based events, such as recording data on intervals
require('./events/survival-hud'); // Once the survival hud loads, send infos here
require('./events/chat'); // Once the survival hud loads, send infos here
require('./events/loot'); // Exp from looting
require('./events/names'); // Get names event

setInterval(() => {}, 500); // If things break because NODEJS, this will make them work again