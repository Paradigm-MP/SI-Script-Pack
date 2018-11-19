// Sorts the items into loot tables

let amt = 0;

for (let category in jcmp.inv.items)
{
    for (let i = 0; i < jcmp.inv.items[category].length; i++)
    {
        const item = jcmp.inv.items[category][i];
        item.category = category;
        const add_amt = (item.value == undefined) ? loot.config.default_add : item.value * loot.config.default_add;
        // Percentages out of 1

        if (loot.items[item.rarity] != null)
        {
            //if (item.in_loot !== false) // Let loot gen handle this
            //{
                // Add it to the loot table as many times as the value, so lower value = more rare
                // Yes, the tables have thousands of values, but we can set rarities to the .1 percent
                for (let j = 0; j < add_amt; j++)
                {
                    loot.items[item.rarity].push(item);
                }

            //}
        }
        else
        {
            console.log('Could not add item to loot tables.');
            console.log(item);
        }

        amt++;
    }
}

console.log(`[Loot] Finished sorting ${amt} items.`);
loot.jsonutils.LoadLootSpawns(); // After sorting, load loot spawns