
// Fires when a player equips or unequips an item
jcmp.events.Add('inventory/events/equip_item', (player, item) => 
{
    const item_name = item.name;
    const equipped = item.equipped;

    if (iu.config.weapons[item_name] && iu.config.weapons[item_name].hash && iu.config.weapons[item_name].ammo_type)
    {
        iu.utils.RemoveWeapons(player);

        
        // If we are equipping the item
        if (equipped)
        {
            const ammo_data = jcmp.inv.FindItem(iu.config.weapons[item_name].ammo_type);
            ammo_data.amount = 1;
            const ammo = new jcmp.inv.item(ammo_data);

            let ammo_amount = 0;

            for (let i = 0; i < player.c.inventory.contents[ammo.category].length; i++)
            {
                const check_item = player.c.inventory.contents[ammo.category][i];

                if (check_item.prop('name') === iu.config.weapons[item_name].ammo_type)
                {
                    ammo_amount += parseInt(check_item.get_amount());
                }
            }

            player.GiveWeapon(iu.config.weapons[item_name].hash, ammo_amount, true);
        }
    }


})

