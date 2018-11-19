module.exports =
{
    // This is the database the entire server will use.
    // Change as needed, like for the test server or for the main server.
    database: 
    {
        host: '127.0.0.1',
        user: 'DATABASE_USERNAME_HERE',
        name: 'DATABASE_NAME_HERE',
        password: 'DATABASE_PASSWORD_HERE'
    },

    // Tables to create and use
    // All steam_id keys are STEAMID_CHAR# because we support multiple characters
    default_tables:  
    [
        {
            // Save x,y,z positions of each character
            // Also save respawn position here
            name: 'positions', 
            structure: `(steam_id VARCHAR(20) PRIMARY KEY, x DECIMAL(10,3), y DECIMAL(10,3), z DECIMAL(10,3),
                x_r DECIMAL(10,3), y_r DECIMAL(10,3), z_r DECIMAL(10,3), dimension INTEGER)`
        }, // TODO store and use dimension
        {
            // General character information
            // Color is in hex format
            // Players can access these stats somewhere?
            name: 'general', 
            structure: `(steam_id VARCHAR(20) PRIMARY KEY, name VARCHAR(30), model VARCHAR(30), boxes_looted INTEGER, time_online INTEGER,
                last_played VARCHAR(10), items_crafted INTEGER, deaths INTEGER, last_login_ip VARCHAR(20),
                color VARCHAR(7), kills INTEGER, objects_placed INTEGER, health INTEGER, chat_banned INTEGER)`
        },
        {
            // Characters that have special tags
            name: 'tags', 
            structure: `(steam_id VARCHAR(20) PRIMARY KEY, tagname VARCHAR(20), tagcolor VARCHAR(7))`
        },
        {
            // Experience/levels information
            name: 'exp', 
            structure: `(steam_id VARCHAR(20) PRIMARY KEY, experience INTEGER, level INTEGER)`
        },
        {
            // Characters that are banned until a certain date (or indefinitely banned)
            name: 'banned', 
            structure: `(steam_id VARCHAR(20) PRIMARY KEY, ban_date VARCHAR(10))`
        },
        {
            // Hunger/thirst info
            name: 'hungerthirst', 
            structure: `(steam_id VARCHAR(20) PRIMARY KEY, hunger DECIMAL(10,3), thirst DECIMAL(10,3))`
        }
    ],
    // Default spawn location in case of: no bed or new character
    default_spawn:
    {
        x: 3422,
        y: 1036,
        z: 1315
    },
    exp:
    {
        max_level: 30,
        lootbox:
        {
            1: 6,
            2: 20,
            3: 70,
            4: 200
        },
        kill: 50
    },
    hunger:
    {
        hunger_decrease: 0.4, // How much hunger decreases per minute DEFAULT 0.2
        hunger_death: 75, // What hunger resets to on death
        hunger_health_decrease: 5, // How much health is taken away each second if they have 0 hunger
        thirst_decrease: 1.1, // How much thirst decreases per minute DEFAULT 0.35
        thirst_death: 75, // What thirst resets to on death
        thirst_health_decrease: 5, // How much health is taken away each second if they have 0 thirst
        items:
        {
            'CamelBak': {thirst: 15, hunger: 0, durability: 10},
            'Mini Water Bottle': {thirst: 7, hunger: 0},
            'Water Bottle': {thirst: 15, hunger: 0},
            'Large Water Bottle': {thirst: 30, hunger: 0},
            'Small Rations': {thirst: 3, hunger: 8},
            'Medium Rations': {thirst: 6, hunger: 15},
            'Large Rations': {thirst: 10, hunger: 30},
            'Granola Bar': {thirst: 0, hunger: 6},
            'Zhejiang Crackers': {thirst: 0, hunger: 40},
            'Zhejiang Water': {thirst: 40, hunger: 0},
            'Cookie': {thirst: -3, hunger: 10},
            'Milk': {thirst: 20, hunger: 0},
            'Nutella': {thirst: 30, hunger: 30},
            'Scrap Metal': {thirst: 74, hunger: 74},
            'Fresh Water': {thirst: 20, hunger: 0},
        }
    }

}