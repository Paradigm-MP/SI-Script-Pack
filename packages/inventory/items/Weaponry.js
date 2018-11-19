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
        name: 'U-55S Pozhar',
        rarity: 'Uncommon',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.4
    },
    {
        name: 'CS44 Peacebringer',
        rarity: 'Uncommon',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.35
    },
    {
        name: 'CS Spectre Mark V',
        rarity: 'Uncommon',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.35
    },
    {
        name: 'The Little General',
        rarity: 'Legendary',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.025
    },
    {
        name: 'Prizrak U4',
        rarity: 'Uncommon',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.3
    },
    {
        name: 'CS Wraith 225R',
        rarity: 'Uncommon',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.35
    },
    {
        name: 'CS9 PDW-K',
        rarity: 'Uncommon',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.35
    },
    {
        name: 'U9 Plechovka',
        rarity: 'Rare',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.4
    },
    {
        name: 'CS Predator',
        rarity: 'Rare',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.3
    },
    {
        name: 'CS27 Misfortune',
        rarity: 'Rare',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.5
    },
    {
        name: 'UPM61',
        rarity: 'Rare',
        stacklimit: 2,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.4
    },
    {
        name: 'Automat U12',
        rarity: 'Legendary',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.05
    },
    {
        name: 'U-24 Zabijak',
        rarity: 'Rare',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.2
    },
    {
        name: 'U-96 Kladivo',
        rarity: 'Uncommon',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.125
    },
    {
        name: 'CS110 Archangel',
        rarity: 'Rare',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.1
    },
    {
        name: 'USV 45 Sokol',
        rarity: 'Epic',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.01
    },
    {
        name: 'CS Negotiator',
        rarity: 'Epic',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.05
    },
    {
        name: 'UPU 210',
        rarity: 'Legendary',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.01
    },
    {
        name: 'Urga Stupka-210',
        rarity: 'Rare',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.11
    },
    {
        name: 'UVK-13',
        rarity: 'Legendary',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.025
    },
    {
        name: 'Fire Leech',
        rarity: 'Legendary',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.01
    },
    {
        name: 'Capstone Hydra',
        rarity: 'Legendary',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.02
    },
    {
        name: 'Urga Vdova 89',
        rarity: 'Legendary',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        equip_type: 'weapon',
        value: 0.2
    },
    {
        name: 'Suicide Vest', // when equipped, you explode when you die
        rarity: 'Epic',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'vest',
        durable: true,
        value: 0.08,
        in_loot: false
    },
    {
        name: 'Mine',
        rarity: 'Epic',
        stacklimit: 10,
        can_use: true,
        in_loot: false
    },
    {
        name: 'EMP',
        rarity: 'Epic',
        stacklimit: 3,
        can_use: true,
        value: 0.2,
        in_loot: false
    },
    {
        name: 'Detonator',
        rarity: 'Epic',
        stacklimit: 3,
        can_use: true,
        in_loot: false,
        value: 0.2
    }
]