
global.iu = 
{
    config: require('./config'),
    mysql: require('promise-mysql'),
    chat: jcmp.events.Call('get_chat')[0],
    utils: require('./utility/utility'),
    fakeplayer: require('./items/fakeplayer'),
    jc: require('./events/jc'),
    sqlstring: require('sqlstring'),
}

iu.config.database = jcmp.events.Call('GetDatabase')[0];

jcmp.iu_config = iu.config;

require('./items/grapple_para');
require('./items/healing');
require('./items/watercollector');
require('./items/deathdropfinder');
require('./items/pings');
require('./items/radar');
require('./items/paper');
require('./items/weapons');
require('./items/binoculars');
require('./items/vehiclerepair');
require('./items/ing');
require('./items/cosmetics');
require('./items/healtheffects');
require('./items/hackers');
require('./events/network');
require('./events/inventory');

setInterval(() => {}, 500); // If things break because NODEJS, this will make them work again