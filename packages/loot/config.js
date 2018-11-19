module.exports = 
{
    edit_mode: jcmp.dev_mode,
    default_add: 10000, // Default "value" of an item (see inventory items for details)
    percentages: // Percentages of certain rarities of loot in tiers of lootboxes
    {
        1: {Common: 0.5, Uncommon: 0.4, Rare: 0.1, Epic: 0.0, Legendary: 0.0, max_amount: 4, min_amount: 1}, // Tier 1 loot
        2: {Common: 0.2, Uncommon: 0.3, Rare: 0.5, Epic: 0.0, Legendary: 0.0, max_amount: 4, min_amount: 1}, // Tier 2 loot
        3: {Common: 0.0, Uncommon: 0.0, Rare: 0.6, Epic: 0.4, Legendary: 0.0, max_amount: 4, min_amount: 2}, // Tier 3 loot
        4: {Common: 0.0, Uncommon: 0.0, Rare: 0.1, Epic: 0.7, Legendary: 0.2, max_amount: 4, min_amount: 3}, // Airdrops
    },
    respawn_times: // Respawn times in minutes
    {
        1: 15, // Base respawn times, respawn decreases the more players are around. Minimum is base / 2
        2: 30,
        3: 60,
        4: 9999 // Airdrop lootboxes don't respawn
    },
    drop_amounts: // Maximum amount that can be in a single stack of items in loot
    {
        min: 1,
        max: 9,
        lootbag_min: 5, // For ammo & other stuff
        lootbag_max: 30
    },
    dropbox_despawn_time: 60,
    min_durability: 0.3, // Minimum durability of items in loot as a proportion
    max_durability: 0.9, // Maximum durability of items in loot 
    lootbags: // Lootbags, however, always give 100% durability items
    {
        'Common Lootbag':
        {
            Common: {min: 2, max: 5}
        },
        'Uncommon Lootbag':
        {
            Common: {min: 1, max: 2},
            Uncommon: {min: 2, max: 3}
        },
        'Rare Lootbag':
        {
            Common: {min: 0, max: 1},
            Uncommon: {min: 1, max: 2},
            Rare: {min: 1, max: 2}
        },
        'Epic Lootbag':
        {
            Common: {min: 0, max: 1},
            Uncommon: {min: 0, max: 2},
            Rare: {min: 0, max: 2},
            Epic: {min: 1, max: 2}
        },
        'Legendary Lootbag':
        {
            Uncommon: {min: 0, max: 1},
            Rare: {min: 0, max: 3},
            Epic: {min: 0, max: 3},
            Legendary: {min: 1, max: 1}
        },
        'Bavarium Lootbag':
        {
            min: 15,
            max: 35
        }
    },
    id: 1, // Incrementing id for lootboxes
    cell_size: 200,
    max_dropboxes_per_cell: 50,
    storages:
    {
        min_y: 1022,
        min_name_length: 1,
        max_name_length: 12,
        default_name: 'Storage',
        default_code: '0000',
        max_keypad_attempts: 15,
        upgrades: 
        {
            'Space Upgrade': {max: 10},
            'Keypad Lock': {max: 1},
            'Identity Lock': {max: 1},
            'Explosive Upgrade': {max: 1},
            'Shield Upgrade': {max: 4},
            'Zap Upgrade': {max: 1}
        },
        hackers: 
        {
            'Hacking Module': true,
            'Disarming Module': true,
            'Trap Detector': true
        },
        blacklisted_areas: 
        [
            {pos: {x: 3527.00830078125, y: 1158.5384521484375, z: 1013.8731689453125}, radius: 600}, // nz
        ],
        types: 
        {
            'Storage': 6
        },
        max: 
        {
            1: 1,
            2: 1,
            3: 2,
            4: 2,
            5: 3,
            6: 3,
            7: 4,
            8: 4,
            9: 5,
            10: 5,
            11: 6,
            12: 6,
            13: 7,
            14: 7,
            15: 8,
            16: 8,
            17: 9,
            18: 9,
            19: 10,
            20: 10,
            21: 11,
            22: 11,
            23: 12,
            24: 12,
            25: 13,
            26: 13,
            27: 14,
            28: 14,
            29: 15,
            30: 15
        }
    },
    hotzones:
    {
        'cursed_zone': 
        {
            pos: new Vector3f(0, 0, 0), 
            radius: 0,
            enabled: false
        },
        'radar_zone1': 
        {
            pos: new Vector3f(12875, 1160, 4901), 
            radius: 275,
            enabled: true
        },
        'radar_zone2': 
        {
            pos: new Vector3f(7747, 1379, 12362), 
            radius: 325,
            enabled: true
        },
        'radar_zone3': 
        {
            pos: new Vector3f(241, 1083, 1950), 
            radius: 275,
            enabled: true
        },
        'radar_zone4': 
        {
            pos: new Vector3f(7964, 2994, 6415), 
            radius: 475,
            enabled: true
        },
        'volcano': 
        {
            pos: new Vector3f(-12379.2382, 0, -12253.1357),  // 2d
            radius: 750,
            enabled: false
        },
        'thor_hammer': 
        {
            pos: new Vector3f(6758.7617, 0, -7224.3393), 
            radius: 150,
            enabled: true
        }
    }
}

/*
Tier 1 - 2-5 tier 1 items
Tier 2 - 2-3 tier 2 items, 1-2 tier 1 items
Tier 3 - 1-2 tier 3 items, 1-2 tier 2 items, 0-1 tier 1 items
Tier 4 - 1 tier 4 item, 0-1 tier 3 items, 0-2 tier 2 items, 0-1 tier 1 items
Tier 5 - 1 tier 5 item, 0-1 tier 4 items, 0-2 tier 3 items, 0-1 tier 2 items


*/