const fs = require('fs');

// Loads loot spawns from data
function LoadLootSpawns()
{
    let filename = __dirname + '/../data/lootspawns.json';
    let files_needed = 1;

    fs.readFile(filename, 'utf8', function (err, data)
    {
        if (err) throw err;
        loot.spawn_data = JSON.parse(data);
        files_needed--;
    });

    const load_interval = setInterval(() => 
    {
        if (files_needed == 0)
        {
            clearInterval(load_interval);
            console.log(`[Loot] Loaded ${loot.spawn_data.length} loot spawns.`);
            loot.generator.Generate(); // Generate loot
        }
    }, 100);
}

// Saves loot spawns
function SaveLootSpawns()
{
    console.log('[Loot] Saving loot spawns...');
    let filename = __dirname + '/../data/lootspawns.json';
    
    fs.writeFileSync(filename, JSON.stringify(loot.spawn_data, null, '\t'));

    console.log(`[Loot] Saved ${loot.spawn_data.length} loot spawns.`);
}

module.exports = 
{
    LoadLootSpawns,
    SaveLootSpawns
}