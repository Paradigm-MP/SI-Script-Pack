module.exports = 
{
    default_inventory:
    [
        {
            name: 'Zhejiang Crackers',
            amount: 3
        },
        {
            name: 'Zhejiang Water',
            amount: 5
        },
        {
            name: 'U-55S Pozhar',
            amount: 1
        },
        {
            name: 'Pistol Ammo',
            amount: 50
        },
        {
            name: 'Grapplehook',
            amount: 1,
            durability: 300
        },
        {
            name: 'Bavarium',
            amount: 7
        },
    ],
    default_slots:
    {
        1: 
        {Utility: 6, Weaponry: 3, Survival: 6, Cosmetics: 2},
        2: // +1 Weaponry, +1 Cosmetics
        {Utility: 6, Weaponry: 4, Survival: 6, Cosmetics: 3},
        3: // +1 Weaponry, +1 Cosmetics
        {Utility: 6, Weaponry: 5, Survival: 6, Cosmetics: 4},
        4: // +1 Survival
        {Utility: 6, Weaponry: 5, Survival: 7, Cosmetics: 4},
        5: // +1 Utility
        {Utility: 7, Weaponry: 5, Survival: 7, Cosmetics: 4},
        6: // +1 Weaponry, +1 Cosmetics
        {Utility: 7, Weaponry: 6, Survival: 7, Cosmetics: 5},
        7: // +1 Survival
        {Utility: 7, Weaponry: 6, Survival: 8, Cosmetics: 4},
        8: // +1 Utility
        {Utility: 8, Weaponry: 6, Survival: 8, Cosmetics: 4},
        9: // +1 Weaponry, +1 Cosmetics
        {Utility: 8, Weaponry: 7, Survival: 8, Cosmetics: 5},
        10: // +1 Survival
        {Utility: 8, Weaponry: 7, Survival: 9, Cosmetics: 5},
        11: // +1 Utility
        {Utility: 9, Weaponry: 7, Survival: 9, Cosmetics: 5},
        12: // +1 Weaponry, +1 Cosmetics
        {Utility: 9, Weaponry: 8, Survival: 9, Cosmetics: 6},
        13: // +1 Survival
        {Utility: 9, Weaponry: 8, Survival: 10, Cosmetics: 6},
        14: // +1 Utility
        {Utility: 10, Weaponry: 8, Survival: 10, Cosmetics: 6},
        15: // +1 Cosmetics
        {Utility: 10, Weaponry: 8, Survival: 10, Cosmetics: 7},
        16: // +1 Cosmetics
        {Utility: 10, Weaponry: 8, Survival: 10, Cosmetics: 8},
        17: // +1 Weaponry
        {Utility: 10, Weaponry: 9, Survival: 10, Cosmetics: 8},
        18: // +1 Cosmetics
        {Utility: 10, Weaponry: 9, Survival: 10, Cosmetics: 9},
        19: // +1 Weaponry
        {Utility: 10, Weaponry: 10, Survival: 10, Cosmetics: 9},
        20: // +1 Survival
        {Utility: 10, Weaponry: 10, Survival: 11, Cosmetics: 9},
        21: // +1 Cosmetics
        {Utility: 10, Weaponry: 10, Survival: 11, Cosmetics: 10},
        22: // +1 Cosmetics
        {Utility: 10, Weaponry: 10, Survival: 11, Cosmetics: 11},
        23: // +1 Utility
        {Utility: 11, Weaponry: 10, Survival: 11, Cosmetics: 11},
        24: // +1 Cosmetics
        {Utility: 11, Weaponry: 10, Survival: 11, Cosmetics: 12},
        25: // +1 Weaponry
        {Utility: 11, Weaponry: 11, Survival: 11, Cosmetics: 12},
        26: // +1 Survival
        {Utility: 11, Weaponry: 11, Survival: 12, Cosmetics: 12},
        27: // +1 Utility
        {Utility: 12, Weaponry: 11, Survival: 12, Cosmetics: 12},
        28: // +1 Weaponry
        {Utility: 12, Weaponry: 12, Survival: 12, Cosmetics: 12},
        29: // +1 Survival
        {Utility: 12, Weaponry: 12, Survival: 13, Cosmetics: 12},
        30: // +1 Utility
        {Utility: 13, Weaponry: 12, Survival: 13, Cosmetics: 12}
    },
    slot_expanders:
    {
        'Backpack':
        {Utility: 2, Weaponry: 1, Survival: 2, Cosmetics: 0}, // Expands each slot by this amount
        'Large Backpack':
        {Utility: 3, Weaponry: 2, Survival: 3, Cosmetics: 1},
        'Weapons Pack':
        {Utility: 1, Weaponry: 4, Survival: 0, Cosmetics: 0},
        'Survival Pack':
        {Utility: 1, Weaponry: 1, Survival: 3, Cosmetics: 0},
        'Small Backpack':
        {Utility: 1, Weaponry: 0, Survival: 1, Cosmetics: 0},
        'Pocketed Vest':
        {Utility: 1, Weaponry: 1, Survival: 1, Cosmetics: 0},
        'Admin Ring':
        {Utility: 50, Weaponry: 50, Survival: 50, Cosmetics: 50},
        'Ring of Many Slots':
        {Utility: 2, Weaponry: 2, Survival: 2, Cosmetics: 2}
    },
    death_drops:
    {
        1: {min_per_stack: 1, min_stacks: 1, max_stacks: 3, min_percent: 0.3, max_percent: 0.5},
        2: {min_per_stack: 1, min_stacks: 1, max_stacks: 3, min_percent: 0.31, max_percent: 0.525},
        3: {min_per_stack: 1, min_stacks: 2, max_stacks: 4, min_percent: 0.32, max_percent: 0.55},
        4: {min_per_stack: 1, min_stacks: 2, max_stacks: 4, min_percent: 0.33, max_percent: 0.575},
        5: {min_per_stack: 1, min_stacks: 2, max_stacks: 5, min_percent: 0.34, max_percent: 0.6},
        6: {min_per_stack: 1, min_stacks: 3, max_stacks: 5, min_percent: 0.35, max_percent: 0.625},
        7: {min_per_stack: 1, min_stacks: 3, max_stacks: 6, min_percent: 0.36, max_percent: 0.65},
        8: {min_per_stack: 1, min_stacks: 3, max_stacks: 6, min_percent: 0.37, max_percent: 0.675},
        9: {min_per_stack: 1, min_stacks: 4, max_stacks: 7, min_percent: 0.38, max_percent: 0.7},
        10: {min_per_stack: 1, min_stacks: 4, max_stacks: 8, min_percent: 0.39, max_percent: 0.725},
        11: {min_per_stack: 1, min_stacks: 4, max_stacks: 10, min_percent: 0.40, max_percent: 0.75},
        12: {min_per_stack: 1, min_stacks: 5, max_stacks: 11, min_percent: 0.41, max_percent: 0.775},
        13: {min_per_stack: 1, min_stacks: 5, max_stacks: 12, min_percent: 0.42, max_percent: 0.8},
        14: {min_per_stack: 1, min_stacks: 6, max_stacks: 13, min_percent: 0.43, max_percent: 0.825},
        15: {min_per_stack: 1, min_stacks: 6, max_stacks: 14, min_percent: 0.44, max_percent: 0.85},
        16: {min_per_stack: 1, min_stacks: 7, max_stacks: 15, min_percent: 0.45, max_percent: 0.875},
        17: {min_per_stack: 1, min_stacks: 7, max_stacks: 16, min_percent: 0.46, max_percent: 0.9},
        18: {min_per_stack: 1, min_stacks: 8, max_stacks: 17, min_percent: 0.47, max_percent: 0.925},
        19: {min_per_stack: 1, min_stacks: 8, max_stacks: 18, min_percent: 0.48, max_percent: 0.95},
        20: {min_per_stack: 1, min_stacks: 9, max_stacks: 19, min_percent: 0.49, max_percent: 0.975},
        21: {min_per_stack: 1, min_stacks: 9, max_stacks: 20, min_percent: 0.50, max_percent: 1.0},
        22: {min_per_stack: 1, min_stacks: 10, max_stacks: 21, min_percent: 0.50, max_percent: 1.0},
        23: {min_per_stack: 1, min_stacks: 10, max_stacks: 22, min_percent: 0.50, max_percent: 1.0},
        24: {min_per_stack: 1, min_stacks: 11, max_stacks: 23, min_percent: 0.50, max_percent: 1.0},
        25: {min_per_stack: 1, min_stacks: 11, max_stacks: 24, min_percent: 0.50, max_percent: 1.0},
        26: {min_per_stack: 1, min_stacks: 12, max_stacks: 25, min_percent: 0.50, max_percent: 1.0},
        27: {min_per_stack: 1, min_stacks: 12, max_stacks: 26, min_percent: 0.50, max_percent: 1.0},
        28: {min_per_stack: 1, min_stacks: 13, max_stacks: 27, min_percent: 0.50, max_percent: 1.0},
        29: {min_per_stack: 1, min_stacks: 13, max_stacks: 28, min_percent: 0.50, max_percent: 1.0},
        30: {min_per_stack: 1, min_stacks: 14, max_stacks: 29, min_percent: 0.50, max_percent: 1.0}
    }
}