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
- max_loot (maximum amount that can be in one stack of loot) (default 8, see loot module)
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
- region
    - default: [] (none)
    - Put names of regions in to make the item only appear in that region in loot
    - Regions must be defined in the loot module in order to work
    eg. region: ['volcano', 'city']

*/

module.exports = 
[
    {
        name: 'CamelBak',
        rarity: 'Epic',
        stacklimit: 1,
        can_use: true,
        durable: true,
        color: 'blue',
        value: 0.4,
        description: "A type of hydration system built as a backpack or waistpack containing a reservoir commonly made of flexible plastic. Use to take a drink."
    },
    {
        name: 'Mini Water Bottle',
        rarity: 'Common',
        stacklimit: 10,
        can_use: true,
        value: 0.8,
        color: 'blue'
    },
    {
        name: 'Water Bottle',
        rarity: 'Uncommon',
        stacklimit: 5,
        can_use: true,
        value: 0.8,
        color: 'blue'
    },
    {
        name: 'Large Water Bottle',
        rarity: 'Rare',
        stacklimit: 3,
        can_use: true,
        value: 0.6,
        color: 'blue'
    },
    {
        name: 'Cookie',
        rarity: 'Uncommon',
        stacklimit: 10,
        can_use: true,
        value: 0.2,
        color: 'blue'
    },
    {
        name: 'Milk',
        rarity: 'Uncommon',
        stacklimit: 5,
        can_use: true,
        value: 0.2,
        color: 'blue'
    },
    {
        name: 'Nutella',
        rarity: 'Legendary',
        stacklimit: 5,
        can_use: true,
        value: 0.8,
        color: 'blue'
    },
    {
        name: 'Bandage',
        rarity: 'Uncommon',
        stacklimit: 8,
        can_use: true,
        value: 0.8,
        color: 'green'
    },
    {
        name: 'Medkit',
        rarity: 'Rare',
        stacklimit: 5,
        can_use: true,
        value: 0.7,
        color: 'green'
    },
    {
        name: 'Medpack',
        rarity: 'Epic',
        stacklimit: 3,
        can_use: true,
        value: 0.7,
        color: 'green'
    },
    {
        name: 'Full Restore',
        rarity: 'Legendary',
        stacklimit: 3,
        can_use: true,
        value: 0.8,
        color: 'green'
    },
    {
        name: 'Small Rations',
        rarity: 'Uncommon',
        stacklimit: 5,
        can_use: true,
        value: 0.5,
        color: 'blue'
    },
    {
        name: 'Medium Rations',
        rarity: 'Rare',
        stacklimit: 5,
        can_use: true,
        value: 0.5,
        color: 'blue'
    },
    {
        name: 'Large Rations',
        rarity: 'Epic',
        stacklimit: 5,
        can_use: true,
        value: 0.5,
        color: 'blue'
    },
    {
        name: 'Granola Bar',
        rarity: 'Common',
        stacklimit: 10,
        can_use: true,
        value: 0.9,
        color: 'blue'
    },
    {
        name: 'Zhejiang Crackers',
        rarity: 'Rare',
        stacklimit: 10,
        can_use: true,
        color: 'blue',
        value: 0.005
    },
    {
        name: 'Zhejiang Water',
        rarity: 'Rare',
        stacklimit: 10,
        can_use: true,
        color: 'blue',
        value: 0.005
    },
    {
        name: 'Scrap Metal',
        rarity: 'Common',
        stacklimit: 25,
        can_use: true,
        color: 'uglyyellow',
        value: 0.0001
    },
    {
        name: 'Backpack',
        rarity: 'Epic',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'backpack',
        value: 0.125,
        color: 'yellow'
    },
    {
        name: 'Large Backpack',
        rarity: 'Legendary',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'backpack',
        color: 'yellow'
    },
    {
        name: 'Small Backpack',
        rarity: 'Rare',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'backpack',
        value: 0.3,
        color: 'yellow'
    },
    {
        name: 'Weapons Pack',
        rarity: 'Legendary',
        stacklimit: 1,
        can_use: true,
        color: 'yellow'
    },
    {
        name: 'Survival Pack',
        rarity: 'Legendary',
        stacklimit: 1,
        can_use: true,
        color: 'yellow'
    },
    {
        name: 'Ballistic Vest', // resistant against everything
        rarity: 'Legendary',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'vest',
        durable: true,
        in_loot: false
    },
    {
        name: 'Kevlar Vest', // resistant against pistols and less against assault rifles
        rarity: 'Epic',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'vest',
        durable: true,
        value: 0.08,
        in_loot: false
    },
    {
        name: 'Pocketed Vest', // very little resistance to guns, but adds 1 slot to each category except cosmetics
        rarity: 'Epic',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'vest',
        durable: true,
        value: 0.1,
        in_loot: false
    },
    {
        name: 'Common Lootbag',
        rarity: 'Common',
        stacklimit: 5,
        can_use: true,
        value: 0.0001,
        color: 'pink'
    },
    {
        name: 'Uncommon Lootbag',
        rarity: 'Uncommon',
        stacklimit: 5,
        can_use: true,
        value: 0.0001,
        color: 'pink'
    },
    {
        name: 'Rare Lootbag',
        rarity: 'Rare',
        stacklimit: 5,
        can_use: true,
        value: 0.0001,
        color: 'pink'
    },
    {
        name: 'Epic Lootbag',
        rarity: 'Epic',
        stacklimit: 5,
        can_use: true,
        value: 0.0001,
        color: 'pink'
    },
    {
        name: 'Legendary Lootbag',
        rarity: 'Legendary',
        stacklimit: 5,
        can_use: true,
        value: 0.01,
        color: 'pink'
    },
    {
        name: 'Bavarium Lootbag',
        rarity: 'Epic',
        stacklimit: 5,
        can_use: true,
        value: 0.0001,
        color: 'pink'
    },
    {
        name: 'Crafting Table',
        rarity: 'Legendary',
        stacklimit: 1,
        can_use: true,
        value: 0.25,
        in_loot: false
    },
    {
        name: 'Rainwater Collector',
        rarity: 'Rare',
        stacklimit: 1,
        can_use: true,
        durable: true,
        value: 0.25
    },
    {
        name: 'Fresh Water',
        rarity: 'Uncommon',
        stacklimit: 10,
        can_use: true,
        in_loot: false,
        color: 'blue'
    },
    {
        name: 'A Rock',
        rarity: 'Legendary',
        stacklimit: 1,
        value: 0.0001,
        color: 'brown'
    },
    {
        name: 'A Shiny Rock',
        rarity: 'Epic',
        stacklimit: 1,
        value: 0.0001,
        color: 'brown'
    },
    {
        name: 'A Smooth Rock',
        rarity: 'Rare',
        stacklimit: 1,
        value: 0.0001,
        color: 'brown'
    },
    {
        name: 'A Sharp Rock',
        rarity: 'Uncommon',
        stacklimit: 1,
        value: 0.0001,
        color: 'brown'
    },
    {
        name: 'A Metamorphic Rock',
        rarity: 'Common',
        stacklimit: 1,
        value: 0.0001,
        color: 'brown'
    },
    {
        name: 'Cursed Shard',
        rarity: 'Rare',
        stacklimit: 10,
        value: 0.03,
        color: 'cursed',
        region: ['cursed_zone'],
        in_loot: false
    },
    {
        name: 'Emberstone',
        rarity: 'Epic',
        stacklimit: 5,
        value: 0.01,
        color: 'cursed',
        region: ['volcano'],
        in_loot: false
    },
    {
        name: 'Storage',
        rarity: 'Rare',
        stacklimit: 5,
        can_use: true,
        value: 99
    },
    {
        name: 'Infinity Stone',
        rarity: 'Epic',
        stacklimit: 1,
        value: 0.001,
        region: ['thor_hammer'],
        in_loot: false
    },
    {
        name: 'Landclaim',
        rarity: 'Epic',
        stacklimit: 1,
        usable: true,
        value: 0.025
    }
]