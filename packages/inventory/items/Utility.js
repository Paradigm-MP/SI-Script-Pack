/*
REQUIRED PROPERTIES
- name
- rarity
- stacklimit

OPTIONAL PROPERTIES
- can_use (for usable items, eg food)
- can_equip (for equippable items, eg Grapplehook)
    - IMPORTANT! If an item is equippable, it must have a secondary property
        equip_type
        This is a string that determines the type of equipped item so people can't equip multiple 
        of the same item, such as grapplehooks.
- durable (for durable items, eg Parachute)
- max_loot (maximum amount that can be in one stack of loot)
- value (additional rarity within a rarity tier)
    - Default: 1000
    - Increase to make it more common in loot (less rare), decrease to make less common (more rare)
- nodrop
    - default: false
    - Set to true to stop it from dropping on death
- in_loot
    - default: true
    - Set to false to disable this item in loot spawns
- max_durability
    - default: 100
    - Increase/decrease depending on item and how it is handled

*/

module.exports = 
[
    {
        name: 'Grapplehook',
        rarity: 'Uncommon',
        stacklimit: 3,
        can_equip: true,
        durable: true,
        equip_type: 'grapplehook',
        max_durability: 500,
        value: 0.3,
        description: "The classic grapplehook. Equip it and experience freedom of movement as you climb skyscrapers."
    },
    {
        name: 'DuraGrapple',
        rarity: 'Epic',
        stacklimit: 3,
        can_equip: true,
        durable: true,
        equip_type: 'grapplehook',
        max_durability: 2000,
        value: 0.04,
        description: "An upgraded grapplehook with 4x the durability of a regular grapplehook."
    },
    {
        name: 'Wingsuit',
        rarity: 'Epic',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'wingsuit',
        max_durability: 1500,
        value: 0.03,
        description: "The classic wingsuit. Equip it and glide through the skies. Bavarium boosters not included."
    },
    {
        name: 'Parachute',
        rarity: 'Epic',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'parachute',
        value: 0.08,
        max_durability: 1800,
        description: "The classic parachute. DEATH FROM ABOVE!"
    },
    {
        name: 'Bavarium',
        rarity: 'Uncommon',
        stacklimit: 99,
        value: 1.2,
        max_loot: 4,
        description: "A weirdly magnetic and highly explosive mineral. Used to purchase vehicles, oddly enough."
    },
    {
        name: 'Ping (1km)',
        rarity: 'Rare',
        stacklimit: 10,
        can_use: true,
        value: 0.3,
        in_loot: false,
        description: "Sends out a ping that reveals the position of players within 1km."
    },
    {
        name: 'Ping (2km)',
        rarity: 'Epic',
        stacklimit: 10,
        can_use: true,
        value: 0.2,
        in_loot: false,
        description: "Sends out a ping that reveals the position of players within 2km."
    },
    {
        name: 'Ping (5km)',
        rarity: 'Epic',
        stacklimit: 10,
        can_use: true,
        value: 0.04,
        in_loot: false,
        description: "Sends out a ping that reveals the position of players within 5km."
    },
    {
        name: 'Pong Decoy', // gives player position + random when someone hits them with ping
        rarity: 'Epic',
        stacklimit: 3,
        durable: true,
        max_durability: 100,
        can_equip: true,
        equip_type: 'pong',
        value: 0.07,
        in_loot: false,
        description: "A small device that slightly scrambles your position when detected by a Ping."
    },
    {
        name: 'Upgraded Pong Decoy',
        rarity: 'Legendary',
        stacklimit: 3,
        durable: true,
        max_durability: 300,
        can_equip: true,
        equip_type: 'pong',
        value: 0.3,
        in_loot: false,
        description: "A small device that scrambles your position when detected by a Ping."
    },
    {
        name: 'Vehicle Repair',
        rarity: 'Rare',
        stacklimit: 5,
        can_use: true,
        value: 0.25,
        description: "Used to repair vehicles. Get in your vehicle and then use it to repair."
    },
    {
        name: 'ING',
        rarity: 'Rare',
        stacklimit: 5,
        can_use: true,
        value: 0.5,
        description: "Used to flip vehicles over. Stand next to your vehicle and use it to flip your vehicle. WARNING: May cause explosions."
    },
    {
        name: 'Bone Key',
        rarity: 'Epic',
        stacklimit: 1,
        can_use: true,
        value: 0.005,
        in_loot: false,
        description: "A small key that has a skull engraved on it."
    },
    {
        name: 'Death Drop Finder',
        rarity: 'Epic',
        stacklimit: 3,
        can_use: true,
        value: 0.1,
        description: "Used to mark the location where you last died."
    },
    {
        name: 'Radar', // Takes batteries but is also durable itself    
        rarity: 'Epic',
        stacklimit: 1,
        max_durability: 500,
        durable: true,
        can_equip: true,
        equip_type: 'radar',
        value: 0.05,
        in_loot: false,
        region: ['radar_zone1', 'radar_zone2', 'radar_zone3', 'radar_zone4'],
        description: "Opens up a radar view that shows nearby players within 500m. Batteries required."
    },
    {
        name: 'Upgraded Radar', // Takes batteries but is also durable itself    
        rarity: 'Legendary',
        stacklimit: 1,
        max_durability: 1000,
        durable: true,
        can_equip: true,
        equip_type: 'radar',
        value: 0.1,
        in_loot: false,
        region: ['radar_zone1', 'radar_zone2', 'radar_zone3', 'radar_zone4'],
        description: "Opens up a radar view that shows nearby players within 1km. Batteries required."
    },
    {
        name: 'Batteries',
        rarity: 'Rare',
        max_durability: 200,
        stacklimit: 6,
        durable: true,
        value: 0.3,
        in_loot: false,
        description: "Used to power a Radar."
    },
    {
        name: 'Escort',
        rarity: 'Epic',
        stacklimit: 3,
        can_use: true,
        value: 0.1,
        in_loot: false,
        description: "Escorts you to a location."
    },
    {
        name: 'Fake Player',
        rarity: 'Epic',
        stacklimit: 5,
        can_use: true,
        value: 0.09,
        in_loot: false,
        description: "A small device that shows up as a player to Pings and Radars."
    },
    {
        name: 'Pistol Ammo',
        rarity: 'Common',
        stacklimit: 99,
        value: 2.1,
        description: "Ammo for pistols."
    },
    {
        name: 'SMG Ammo',
        rarity: 'Uncommon',
        stacklimit: 99,
        value: 2.1,
        description: "Ammo for submachine guns."
    },
    {
        name: 'Assault Ammo',
        rarity: 'Rare',
        value: 1.5,
        stacklimit: 99,
        description: "Ammo for assault rifles."
    },
    {
        name: 'Shotgun Ammo',
        rarity: 'Rare',
        value: 1.1,
        stacklimit: 30,
        description: "Ammo for shotguns. Technically shells."
    },
    {
        name: 'Sniper Ammo',
        rarity: 'Rare',
        stacklimit: 50,
        value: 0.8,
        description: "Ammo for sniper rifles."
    },
    {
        name: 'Grenade Munitions',
        rarity: 'Epic',
        stacklimit: 25,
        value: 0.3,
        description: "Ammo for grenade launchers. I think there's only one in the game, and it's the Negotiator."
    },
    {
        name: 'Rockets',
        rarity: 'Epic',
        stacklimit: 10,
        value: 0.1,
        description: "Ammo for rocket launchers. These guys HURT."
    },
    {
        name: 'Heavy Ammo',
        rarity: 'Epic',
        stacklimit: 200,
        value: 1.2,
        description: "Ammo for the Urga Vdova 89. That thing is WILD."
    },
    {
        name: 'Binoculars',
        rarity: 'Epic',
        stacklimit: 1,
        value: 0.1,
        durable: true,
        can_use: true,
        in_loot: false,
        description: "Used for seeing things that are far away."
    },
    {
        name: 'Black Pen',
        rarity: 'Uncommon',
        stacklimit: 6,
        durable: true,
        in_loot: false,
        value: 0.12,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Blue Pen',
        rarity: 'Uncommon',
        stacklimit: 6,
        durable: true,
        value: 0.1,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Red Pen',
        rarity: 'Uncommon',
        stacklimit: 6,
        durable: true,
        value: 0.09,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Orange Pen',
        rarity: 'Uncommon',
        stacklimit: 6,
        durable: true,
        value: 0.09,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Yellow Pen',
        rarity: 'Uncommon',
        stacklimit: 6,
        durable: true,
        value: 0.09,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Green Pen',
        rarity: 'Uncommon',
        stacklimit: 6,
        durable: true,
        value: 0.09,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Purple Pen',
        rarity: 'Uncommon',
        stacklimit: 6,
        durable: true,
        value: 0.09,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Pink Pen',
        rarity: 'Uncommon',
        stacklimit: 6,
        durable: true,
        value: 0.09,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Gray Pen',
        rarity: 'Uncommon',
        stacklimit: 6,
        durable: true,
        value: 0.09,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Brown Pen',
        rarity: 'Uncommon',
        stacklimit: 6,
        durable: true,
        value: 0.09,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Lawngreen Pen',
        rarity: 'Rare',
        stacklimit: 6,
        durable: true,
        value: 0.09,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Turquoise Pen',
        rarity: 'Uncommon',
        stacklimit: 6,
        durable: true,
        value: 0.09,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Magic Eraser Pen',
        rarity: 'Rare',
        stacklimit: 6,
        durable: true,
        value: 0.07,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Rainbow Pen',
        rarity: 'Rare',
        stacklimit: 6,
        durable: true,
        value: 0.07,
        description: "A type of pen. Used to draw on Paper."
    },
    {
        name: 'Paper',
        rarity: 'Rare',
        stacklimit: 6,
        can_use: true,
        durable: true,
        value: 99,
        hide_dura: true, // Hide durability from being shown
        description: "A piece of paper. Use it to draw on it, name it, and even give to other players to show off your artwork!"
    },
    {
        name: 'DDP',
        rarity: 'Common',
        stacklimit: 1,
        in_loot: false
    },
    {
        name: 'SCUBA Tank',
        rarity: 'Epic',
        stacklimit: 2,
        can_equip: true,
        equip_type: 'backpack',
        durable: true,
        in_loot: false,
        value: 0.01,
        description: "A tank filled with oxygen that enables players to stay underwater for extended periods of time."
    },
    {
        name: 'Space Upgrade',
        rarity: 'Rare',
        stacklimit: 6,
        can_use: true,
        value: 0.075,
        color: 'lightblue',
        description: "Adds an extra slot to a storage."
    },
    {
        name: 'Explosive Upgrade',
        rarity: 'Rare',
        stacklimit: 5,
        can_use: true,
        value: 0.05,
        color: 'lightblue',
        description: "Causes a storage to explode when broken into, destroying all the items within."
    },
    {
        name: 'Shield Upgrade',
        rarity: 'Rare',
        stacklimit: 5,
        can_use: true,
        value: 0.08,
        color: 'lightblue',
        description: "Prevents one hacking attempt of a storage."
    },
    {
        name: 'Disguise Upgrade',
        rarity: 'Epic', 
        stacklimit: 5,
        can_use: true,
        value: 0.02,
        color: 'lightblue',
        in_loot: false,
        description: "Disguises a storage to appear like something else."
    },
    {
        name: 'Zap Upgrade',
        rarity: 'Epic',
        stacklimit: 5,
        can_use: true,
        value: 0.02,
        color: 'lightblue',
        description: "Causes the storage to zap anyone who hacks into it."
    },
    {
        name: 'Keypad Lock',
        rarity: 'Epic',
        stacklimit: 3,
        can_use: true,
        value: 0.06,
        color: 'lightblue',
        description: "Locks a storage and adds a 4 digit combination lock to it."
    },
    {
        name: 'Identity Lock',
        rarity: 'Epic',
        stacklimit: 5,
        can_use: true,
        value: 0.01,
        color: 'lightblue',
        description: "Locks a storage and allows only certain people to access it."
    },
    {
        name: 'Hacking Module',
        rarity: 'Epic',
        stacklimit: 5,
        can_use: true,
        durable: true,
        value: 0.03,
        color: 'red',
        description: "A hacking device that unlocks storages."
    },
    {
        name: 'Disarming Module',
        rarity: 'Epic',
        stacklimit: 5,
        can_use: true,
        durable: true,
        value: 0.03,
        color: 'red',
        description: "A device that disarms explosive traps on storages."
    },
    {
        name: 'Trap Detector',
        rarity: 'Epic',
        stacklimit: 5,
        can_use: true,
        durable: true,
        value: 0.02,
        color: 'red',
        description: "A device that can be used to scan a storage for explosive traps."
    },
]