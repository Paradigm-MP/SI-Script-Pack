module.exports = 
{
    usables: // Usage time in seconds
    {
        'Bandage': {restore_hp: 10, usage_time: 2.5}, // % health restored
        'Medkit': {restore_hp: 25, usage_time: 5},
        'Medpack': {restore_hp: 40, usage_time: 7.5},
        'Full Restore': {restore_hp: 100, usage_time: 10},
        'Rainwater Collector': {usage_time: 30, item: 'Fresh Water', max_amt: 3, durability: 7},
        'Death Drop Finder': {usage_time: 10},
        'Ping (250m)': {usage_time: 2, durability: 20}, // how much durability it takes off pong decoy
        'Ping (500m)': {usage_time: 4, durability: 20},
        'Ping (1km)': {usage_time: 8, durability: 20},
        'Fake Player': {usage_time: 15},
        'Binoculars': {usage_time: 3},
        'Vehicle Repair': {usage_time: 30, vehicle: true}, // If the item requires you to be in a vehicle to use it
        'Storage': {usage_time: 5}, // 
        'Space Upgrade': {usage_time: 3, storage: true}, // If the item requires you to have a storage open
        'Explosive Upgrade': {usage_time: 3, storage: true}, // 
        'Zap Upgrade': {usage_time: 3, storage: true}, // 
        'Shield Upgrade': {usage_time: 3, storage: true}, // 
        'Disguise Upgrade': {usage_time: 3, storage: true}, // 
        'Keypad Lock': {usage_time: 5, storage: true}, // 
        'Identity Lock': {usage_time: 7, storage: true}, // 
        'Hacking Module': {usage_time: 15, storage: true, durability: 20, hacker: true}, // 
        'Disarming Module': {usage_time: 10, storage: true, durability: 20, hacker: true}, // 
        'Trap Detector': {usage_time: 10, storage: true, durability: 10, hacker: true}, // 
        'ING': {usage_time: 3}, // 
        'Detonator': {usage_time: 5, usage_time_after: 1, flag: 'link_id'}
    },
    weapons:
    {
        'U-55S Pozhar': {hash: 4040374394, ammo_type: 'Pistol Ammo'},
        'CS44 Peacebringer': {hash: 2144721124, ammo_type: 'Pistol Ammo'},
        'CS Spectre Mark V': {hash: 3944301769, ammo_type: 'Pistol Ammo'},
        'The Little General': {hash: 3305603558, ammo_type: 'Pistol Ammo'},
        'Prizrak U4': {hash: 1709033370, ammo_type: 'SMG Ammo'},
        'CS Wraith 225R': {hash: 89410586, ammo_type: 'SMG Ammo'},
        'CS9 PDW-K': {hash: 2470879546, ammo_type: 'SMG Ammo'},
        'U9 Plechovka': {hash: 2307691279, ammo_type: 'Assault Ammo'},
        'CS Predator': {hash: 2621157955, ammo_type: 'Assault Ammo'},
        'CS27 Misfortune': {hash: 1394636892, ammo_type: 'Assault Ammo'},
        'UPM61': {hash: 3681410946, ammo_type: 'Assault Ammo'},
        'Automat U12': {hash: 1549148855, ammo_type: 'Shotgun Ammo'},
        'U-24 Zabijak': {hash: 2219364824, ammo_type: 'Shotgun Ammo'},
        'U-96 Kladivo': {hash: 4091120604, ammo_type: 'Shotgun Ammo'},
        'CS110 Archangel': {hash: 37039781, ammo_type: 'Sniper Ammo'},
        'USV 45 Sokol': {hash: 3923877588, ammo_type: 'Sniper Ammo'},
        'CS Negotiator': {hash: 2042423840, ammo_type: 'Grenade Munitions'},
        'UPU 210': {hash: 3759082339, ammo_type: 'Grenade Munitions'},
        'Urga Stupka-210': {hash: 1440484885, ammo_type: 'Grenade Munitions'},
        'UVK-13': {hash: 3913913650, ammo_type: 'Rockets'},
        'Fire Leech': {hash: 68160093, ammo_type: 'Rockets'},
        'Capstone Hydra': {hash: 3070823687, ammo_type: 'Rockets'},
        'Urga Vdova 89': {hash: 3413507878, ammo_type: 'Heavy Ammo'}
    },
    pens: 
    [
        'Black Pen', 'Blue Pen', 'Red Pen', 'Orange Pen', 'Yellow Pen', 'Green Pen', 'Purple Pen', 'Pink Pen', 
        'Lawngreen Pen', 'Magic Eraser Pen', 'Rainbow Pen'
    ],
    cosmetics:
    {
        'Pixel Thug Glasses': {type: 'texture'},
        'Disguise Glasses': {type: 'texture'},
        'Googly Eyes': {type: 'texture'}
    },
    healtheffects:
    {
        'default': {regenRate: 20, regenCooldown: 120, maxRegen: 600},
        'Ring of Regeneration': {regenRate: 100, regenCooldown: 10, maxRegen: 800, equipped: true}
    }
}