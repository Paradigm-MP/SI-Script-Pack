jcmp.events.Add('character/Loaded', (player) => 
{

    // Send vehicle data, such as nice name, number of seats, and aa box
    jcmp.events.CallRemote('vehicles/init/client_vehicle_data', player, JSON.stringify(veh.client_vehicle_data));

    let data = [];

    jcmp.vehicles.forEach((v) => 
    {
        if (v.pvehicle)
        {
            data[v.networkId] = v.pvehicle.get_sync_data();
        }
    });

    jcmp.events.CallRemote('vehicles/init/sync_vehicle_data', player, JSON.stringify(data));
})

// temp event for testing lel
jcmp.events.Add('spawnmenu/local/vehicleSpawned', (player, vehicle) => 
{
    const cost = veh.costs.GetCost(vehicle.modelHash);

    if (cost)
    {
        jcmp.events.CallRemote('vehicles/sync/update_cost', null, vehicle.networkId, cost);
    }
})

// Remove vehicles that have been destroyed
jcmp.events.Add('VehicleExploded', (vehicle) => 
{
    setTimeout(function() 
    {
        if (vehicle.pvehicle)
        {
            vehicle.pvehicle.destroy();
        }
        else
        {
            vehicle.Destroy();
        }
    }, 20000);

    if (vehicle.pvehicle)
    {
        jcmp.events.Call('log', 'vehicles', 
            `A vehicle exploded with hash ${vehicle.modelHash} and id ${vehicle.pvehicle.id} and owner_steam_id ${vehicle.pvehicle.owner_steam_id}.`);
    }

})

jcmp.events.Add('PlayerVehicleEntered', (player, vehicle, seatIndex) => 
{
    if (vehicle.pvehicle == undefined)
    {
        jcmp.notify(player, {
            title: 'This vehicle is broken',
            subtitle: `Sorry about that. We're working on a fix, just hold tight.`,
            preset: 'warn_red'
        })

        vehicle.SetOccupant(seatIndex, null);
        return;
    }

    if (!player.c || !player.c.inventory)
    {
        jcmp.notify(player, {
            title: 'Something bad happened',
            subtitle: `Try reconnecting. This is reeeeaaal bad. :(`,
            preset: 'warn_red'
        })

        vehicle.SetOccupant(seatIndex, null);
        return;
    }

    if (seatIndex > 0 && vehicle.pvehicle.owner_steam_id !== player.c.general.steam_id 
        && !player.is_friends(vehicle.pvehicle.owner_steam_id))
    {
        jcmp.notify(player, {
            title: 'Cannot purchase vehicle',
            subtitle: `You must enter the vehicle from the driver's side.`,
            preset: 'warn_red'
        })

        //veh.chat.send(player, `You must enter the vehicle from the driver's side!`, new RGBA(255,0,0,255), {timeout: 10});
        vehicle.SetOccupant(seatIndex, null);
        jcmp.events.Call('log', 'vehicles', 
                `${player.c.general.name} tried to buy a vehicle, but they entered on the wrong side.`);
        return;
    }

    // If this vehicle is not owned
    if (vehicle.pvehicle.owner_steam_id == undefined)
    {
        const cost = vehicle.pvehicle.cost;
        const item_data = jcmp.inv.FindItem('Bavarium');
        item_data.amount = cost;
        const item = new jcmp.inv.item(item_data);

        const has_enough = player.c.inventory.has_item(item);

        if (has_enough !== -1)
        {
            if (veh.utils.GetNumOwnedVehicles(player) >= veh.config.max_vehicles[player.c.exp.level])
            {
                jcmp.notify(player, {
                    title: 'Vehicle purchasing failed',
                    subtitle: 'You have too many vehicles already.',
                    preset: 'warn_red'
                })

                //veh.chat.send(player, 'You have too many vehicles already!', new RGBA(255,0,0,255), {timeout: 10});
                vehicle.SetOccupant(seatIndex, null);
                jcmp.events.Call('log', 'vehicles', 
                        `${player.c.general.name} tried to buy a vehicle, but they have too many vehicles already.`);
                return;
            }

            const respawn_data = 
            {
                pos: vehicle.pvehicle.position,
                rot: vehicle.pvehicle.rotation,
                hash: vehicle.modelHash
            }

            setTimeout(function() 
            {
                new veh.PVehicle(respawn_data.hash, respawn_data.pos, respawn_data.rot);
            }, vehicle.pvehicle.respawn_time * 60 * 60 * 1000);

            const num_owned = veh.utils.GetNumOwnedVehicles(player);

            if (!veh.config.edit_mode)
            {
                player.c.inventory.remove_item(item);
            }

            // If it's a drop plane, give it a cost
            if (vehicle.pvehicle.dropplane)
            {
                vehicle.pvehicle.dropplane.enabled = false;
                vehicle.pvehicle.cost = veh.costs.GetCost(hash, health_percent);
                vehicle.pvehicle.update_cost();
            }

            vehicle.pvehicle.owner_steam_id = player.c.general.steam_id;
            vehicle.pvehicle.owner = player;
            vehicle.pvehicle.update_sql();

            const vehicle_name = veh.vehicle_data[vehicle.modelHash].nice_name;

            const stacks = [(new jcmp.inv.stack([item])).to_array_chat()];

            jcmp.notify(player, {
                title: 'Vehicle purchased!',
                subtitle: `You bought ${vehicle_name} for [Bavarium x${cost}] (${num_owned + 1}/${veh.config.max_vehicles[player.c.exp.level]})`,
                preset: 'success',
                time: 7500
            })

            veh.chat.send(player, 
                `<b>You bought [#FFC400]${vehicle_name}[#FFFFFF] for [Bavarium x${cost}] (${num_owned + 1}/${veh.config.max_vehicles[player.c.exp.level]})</b>`, 
                new RGBA(255,255,255,255), 
                {channel: 'Log', stack: JSON.stringify(stacks)});

            jcmp.events.CallRemote('PlayerVehicleEntered', player, vehicle.networkId, vehicle.slots);
            vehicle.inventory.player_enter(player);

            jcmp.events.Call('log', 'vehicles', `${player.c.general.name} bought vehicle hash: ${vehicle.modelHash} id: ${vehicle.pvehicle.id} cost: ${vehicle.pvehicle.cost}.`);

        }
        else
        {
            jcmp.notify(player, {
                title: 'Vehicle purchasing failed',
                subtitle: 'You do not have enough Bavarium to buy this vehicle!',
                preset: 'warn_red'
            })

            // Kick player from vehicle
            //veh.chat.send(player, 'You do not have enough Bavarium to buy this vehicle!', new RGBA(255,0,0,255), {timeout: 10});
            vehicle.SetOccupant(seatIndex, null);
            jcmp.events.Call('log', 'vehicles', 
                    `${player.c.general.name} tried to buy vehicle with id ${vehicle.pvehicle.id} for ${vehicle.pvehicle.cost}, but they do not have enough bavarium.`);
        }
    }
    else // This vehicle is owned by someone
    {
        const owner = vehicle.pvehicle.owner_steam_id;

        // If the player does not own this vehicle and is not friends with the owner
        if (player.c.general.steam_id != owner && !player.is_friends(vehicle.pvehicle.owner_steam_id))
        {
                
            // If there are people in the vehicle, you cannot steal it
            if (vehicle.GetOccupant(0) || vehicle.GetOccupant(1))
            {
                jcmp.notify(player, {
                    title: 'Vehicle stealing failed',
                    subtitle: 'The vehicle must be empty for you to steal it!',
                    preset: 'warn_red'
                })

                return;
            }

            const cost = vehicle.pvehicle.cost;
            const item_data = jcmp.inv.FindItem('Bavarium');
            item_data.amount = Math.round(cost * 1.5); // 150% cost to steal a vehicle
            const item = new jcmp.inv.item(item_data);

            const has_enough = player.c.inventory.has_item(item);

            if (has_enough)
            {
                if (veh.utils.GetNumOwnedVehicles(player) >= veh.config.max_vehicles[player.c.exp.level])
                {
                    jcmp.notify(player, {
                        title: 'Vehicle purchasing failed',
                        subtitle: 'You have too many vehicles already.',
                        preset: 'warn_red'
                    })
                    //veh.chat.send(player, 'You have too many vehicles already!', new RGBA(255,0,0,255), {timeout: 10});
                    vehicle.SetOccupant(seatIndex, null);
                    jcmp.events.Call('log', 'vehicle_steal_fail', 
                            `${player.c.general.name} tried to steal vehicle with id ${vehicle.pvehicle.id}, but they have too many vehicles already.`);
                    return;
                }

                const num_owned = veh.utils.GetNumOwnedVehicles(player);

                if (!veh.config.edit_mode)
                {
                    player.c.inventory.remove_item(item);
                }

                // If the owner is on the server
                if (vehicle.pvehicle.owner && vehicle.pvehicle.owner.c && vehicle.pvehicle.owner.c.vehicles)
                {
                    jcmp.events.CallRemote('vehicles/sync/remove_entry', vehicle.pvehicle.owner, vehicle.pvehicle.id);
                    delete vehicle.pvehicle.owner.c.vehicles[vehicle.pvehicle.id];
                }

                vehicle.pvehicle.owner_steam_id = player.c.general.steam_id;
                vehicle.pvehicle.owner = player;
                vehicle.pvehicle.update_sql(true);

                const vehicle_name = veh.vehicle_data[vehicle.modelHash].nice_name;

                const stacks = [(new jcmp.inv.stack([item])).to_array_chat()];

                jcmp.notify(player, {
                    title: 'Vehicle stolen!',
                    subtitle: `You stole ${vehicle_name} for [Bavarium x${cost}] (${num_owned + 1}/${veh.config.max_vehicles[player.c.exp.level]})`,
                    preset: 'success',
                    time: 7500
                })

                veh.chat.send(player, 
                    `<b>You stole [#FFC400]${vehicle_name}[#FFFFFF] for [Bavarium x${cost}] (${num_owned + 1}/${veh.config.max_vehicles[player.c.exp.level]})</b>`, 
                    new RGBA(255,255,255,255), 
                    {channel: 'Log', stack: JSON.stringify(stacks)});

                jcmp.events.CallRemote('PlayerVehicleEntered', player, vehicle.networkId, vehicle.slots);
                vehicle.inventory.player_enter(player);

                jcmp.events.Call('log', 'vehicles', `${player.c.general.name} stole vehicle with id ${vehicle.pvehicle.id} from ${owner}.`);
            }
            else
            {
                jcmp.notify(player, {
                    title: 'Vehicle stealing failed',
                    subtitle: 'You do not have enough Bavarium to steal this vehicle!',
                    preset: 'warn_red',
                })
                //veh.chat.send(player, 'You do not have enough Bavarium to steal this vehicle!', new RGBA(255,0,0,255), {timeout: 10});
                vehicle.SetOccupant(seatIndex, null);
                jcmp.events.Call('log', 'vehicles', 
                        `${player.c.general.name} tried to steal vehicle with id ${vehicle.pvehicle.id} for ${vehicle.pvehicle.cost}, but they do not have enough bavarium.`);
            }
                
        }
        else // Else if the player does own this vehicle or is a friend of the owner
        {

            jcmp.events.CallRemote('PlayerVehicleEntered', player, vehicle.networkId, vehicle.slots);
            vehicle.inventory.player_enter(player);
        }
    }
})

jcmp.events.Add('PlayerVehicleExited', (player, vehicle, seatIndex) => 
{
    jcmp.events.CallRemote('PlayerVehicleExited', player, vehicle.networkId);

    if (vehicle.pvehicle != undefined)
    {
        vehicle.pvehicle.update_sql();
    }
})


jcmp.events.Add('PlayerDestroyed', (player) => 
{
    if (player.c == undefined || player.c.vehicles == undefined || veh.utils.GetNumOwnedVehicles(player) == 0)
    {
        return;
    }

    for (let id in player.c.vehicles)
    {
        const data = player.c.vehicles[id];

        if (data && data.pvehicle && data.pvehicle.vehicle)
        {
            data.pvehicle.remove_on_quit();
        }
    }

})

jcmp.events.Add('PlayerHijackVehicle', (occupant, vehicle, player) => 
{
    setTimeout(() => 
    {
        vehicle.SetOccupant(0, null);

        setTimeout(function() 
        {
            vehicle.SetOccupant(0, player);
        }, 1000);
    
    }, 1000);
})

jcmp.events.Add('PlayerVehicleSeatChange', (player, vehicle, seatIndex, old_seat) => 
{
    if (vehicle.inventory && seatIndex == 0)
    {
        vehicle.inventory.player_enter(player);
    }
});