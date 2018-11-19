global.friends = 
{
	config: require('./config'),
    mysql: require('promise-mysql'),
	chat: jcmp.events.Call('get_chat')[0]
}

friends.config.database = jcmp.events.Call('GetDatabase')[0];

require('./events/database');
require('./events/network');
require('./events/character');
require('./events/jc')

setInterval(() => {}, 500); // If things break because NODEJS, this will make them work again