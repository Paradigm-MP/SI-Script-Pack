
global.veh = 
{
    fs: require('fs'),
    config: require('./config'),
    mysql: require('promise-mysql'),
    utils: require('./utility/utils'),
    vehicle_data: {}, // ALL defaults of vehicles, like handling, seats, name, hash, etc
    client_vehicle_data: {}, // Data we send to clients on ready, like nice names and seats
    spawns: {}, // All default spawns of vehicles
    costs: require('./events/costs'),
    bavarium: require('./data/bavarium'),
    PVehicle: require('./classes/PVehicle'),
    chat: jcmp.events.Call('get_chat')[0],
    vehicle_spawner: require('./events/vehicle_spawner'),
    placing: {}
}

veh.config.database = jcmp.events.Call('GetDatabase')[0]; // Get global database
jcmp.vehicle_bav = veh.bavarium;

require('./events/database');
require('./events/jc');
require('./events/chat');
require('./events/vehicle_data_loader');
require('./events/network');
require('./events/exp');
require('./placing/disabled');

jcmp.veh = veh;

setInterval(() => {}, 500); // If things break because NODEJS, this will make them work again