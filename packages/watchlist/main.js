global.watchlist = 
{
    config: require('./config'),
    mysql: require('promise-mysql'),
    util: require('./utility/utility')
}

// Assign database from character
watchlist.config.database = jcmp.events.Call('GetDatabase')[0];

require('./events/add');
require('./events/database');

setInterval(() => {}, 500); // If things break because NODEJS, this will make them work again