module.exports =
{
    // Tables to create and use
    default_tables:  
    [
        {
            // All OWNED vehicles of players
            name: 'vehicles', 
            structure: `(vehicle_id INTEGER PRIMARY KEY AUTO_INCREMENT, owner_steam_id VARCHAR(20), 
                hash VARCHAR(12), health DECIMAL(10,3), cost INTEGER, x DECIMAL(10,3), y DECIMAL(10,3), z DECIMAL(10,3), 
                x_r DECIMAL(10,3), y_r DECIMAL(10,3), z_r DECIMAL(10,3), color INTEGER)`
        }, // TODO add guards and traps and maybe storage
    ],
    edit_mode: false, // Whether we are adding/removing vehicles right now (DISABLE FOR PUBLIC USAGE)
    quit_remove_time: 5, // How many minutes until the vehicle is removed after owner quits the server DEFAULT 10
    update_interval: 1, // Every x minutes the sql is updated for owned vehicles
    max_vehicles:
    {
        1: 3, // Maximum vehicles at each level
        2: 3,
        3: 4,
        4: 4,
        5: 5,
        6: 5,
        7: 6,
        8: 6,
        9: 7,
        10: 7,
        11: 8,
        12: 8,
        13: 9,
        14: 9,
        15: 10,
        16: 10,
        17: 11,
        18: 11,
        19: 12,
        20: 12,
        21: 13,
        22: 13,
        23: 14,
        24: 14,
        25: 15,
        26: 15,
        27: 16,
        28: 16,
        29: 17,
        30: 17
    }

}