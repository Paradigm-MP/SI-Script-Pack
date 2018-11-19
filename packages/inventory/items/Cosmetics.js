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
        name: 'Cool Hat',
        rarity: 'Epic',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'hat',
        in_loot: false
    },
    {
        name: 'Admin Ring',
        rarity: 'Legendary',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'adminring',
        nodrop: true,
        in_loot: false
    },
    {
        name: 'Gas Mask',
        rarity: 'Rare',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'helmet',
        value: 1000,
        in_loot: false,
        description: "A mask that filters toxins out of the air."
    },
    {
        name: 'Sand Goggles',
        rarity: 'Rare',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'glasses',
        value: 0.1,
        in_loot: false,
        description: "A mask that covers the eyes. Used for sandstorms, because sand is coarse, rough, and gets everywhere."
    },
    {
        name: 'Dogtag',
        rarity: 'Rare',
        stacklimit: 5,
        can_equip: true,
        equip_type: 'dogtag',
        in_loot: false,
        description: "A small necklace with a player's name on it. Sometimes drops from players when they are killed."
    },
    {
        name: 'Pixel Thug Glasses',
        rarity: 'Epic',
        stacklimit: 2,
        can_equip: true,
        equip_type: 'glasses',
        value: 0.02,
        description: "A pair of pixel thug glasses that look really cool."
    },
    {
        name: 'Googly Eyes',
        rarity: 'Epic',
        stacklimit: 2,
        can_equip: true,
        equip_type: 'glasses',
        value: 0.02,
        description: "Googly eyes that look funny."
    },
    {
        name: 'Ring of Regeneration',
        rarity: 'Epic',
        stacklimit: 1,
        can_equip: true,
        durable: true,
        max_durability: 800,
        equip_type: 'ring',
        value: 0.0025,
        description: "This ring is imbued with magical power. After a brief delay, it will regenerate your health back to full after taking damage."
    },
    {
        name: 'Ring of Many Slots',
        rarity: 'Epic',
        stacklimit: 1,
        can_equip: true,
        equip_type: 'ring',
        value: 0.0025,
        description: "This ring is imbued with magical power. It increases the amount of items you can hold in each category by two."
    },
    {
        name: 'SCUBA Mask',
        rarity: 'Epic',
        stacklimit: 2,
        can_equip: true,
        equip_type: 'glasses',
        durable: true,
        value: 0.005,
        description: "A mask used for diving underwater."
    },
    {
        name: 'Model Change',
        rarity: 'Rare',
        stacklimit: 15,
        durable: true,
        can_use: true,
        value: 0.08,
        hide_dura: true,
        description: "Use this item to change your appearance. There are over 200 variations to find!"
    },
]