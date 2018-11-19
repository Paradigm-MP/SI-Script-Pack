jcmp.events.AddRemoteCallable('vehicles/ready', (player) => 
{
    player.c.vehicles = [];

    const steam_id = player.c.general.steam_id;

    const sql = `SELECT * FROM vehicles WHERE owner_steam_id = '${steam_id}'`;
    veh.pool.query(sql).then((result) =>
    {
        if (result.length > 0)
        {
            const vehicles = [];

            for (let i = 0; i < result.length; i++)
            {
                const hash = result[i].hash;
                vehicles.push({
                    vehicle_id: result[i].vehicle_id,
                    name: veh.vehicle_data[hash].nice_name,
                    health: result[i].health,
                    max_health: veh.vehicle_data[hash].default_health,
                    position: {x: result[i].x, y: result[i].y, z: result[i].z},
                    model_name: veh.vehicle_data[hash].name,
                })
                player.c.vehicles[result[i].vehicle_id] = JSON.parse(JSON.stringify(result[i]));
            }

            for (let i = 0; i < jcmp.vehicles.length; i++)
            {
                // if the vehicle already exists
                const v = jcmp.vehicles[i];
                if (v.pvehicle && v.pvehicle.owner_steam_id == steam_id)
                {
                    for (let j = 0; j < vehicles.length; j++)
                    {
                        if (vehicles[j].vehicle_id === v.pvehicle.id)
                        {
                            vehicles[j].spawned = true;
                            clearTimeout(v.pvehicle.remove_timeout);
                            v.pvehicle.remove_timeout = null;

                            v.pvehicle.owner = player;
                            jcmp.events.CallRemote('vehicles/sync/send_networkid', player, v.pvehicle.id, v.networkId);
                        }
                    }
                }
            }

            jcmp.events.CallRemote('vehicles/sync/init', player, JSON.stringify(vehicles));

        }
    })

    jcmp.events.CallRemote('vehicles/sync/update_max', player, veh.config.max_vehicles[player.c.exp.level]);
})

jcmp.events.AddRemoteCallable('vehicles/network/spawn', (player, vehicle_id) => 
{
    if (!vehicle_id || !player.c.vehicles[vehicle_id])
    {
        return;
    }

    player.c.vehicles[vehicle_id].spawned = true;
    const v_data = player.c.vehicles[vehicle_id];
    const pvehicle = new veh.PVehicle(v_data.hash, new Vector3f(v_data.x, v_data.y, v_data.z), 
        new Vector3f(v_data.x_r, v_data.y_r, v_data.z_r), player.c.general.steam_id, v_data.vehicle_id,
        v_data.health, v_data.cost, player, player.c.vehicles[vehicle_id].color);
    player.c.vehicles[vehicle_id].pvehicle = pvehicle;

    jcmp.events.Call('log', 'vehicles', 
        `Player ${player.c.general.name} spawned a vehicle with id ${vehicle_id}.`);
})

jcmp.events.AddRemoteCallable('vehicles/network/remove', (player, vehicle_id) => 
{
    if (!vehicle_id || !player.c.vehicles[vehicle_id])
    {
        jcmp.notify(player, {
            title: 'Error',
            subtitle: 'An error occurred while trying to remove vehicle.',
            preset: 'warn_red',
            time: 5000
        })

        /*veh.chat.send(player, `An error occurred while trying to remove vehicle.`, new RGBA(255,0,0,255),
            {timeout: 10});*/
        return;
    }

    if (player.c.vehicles[vehicle_id].pvehicle)
    {
        player.c.vehicles[vehicle_id].pvehicle.remove();
        delete player.c.vehicles[vehicle_id];

        jcmp.notify(player, {
            title: 'Vehicle removed',
            subtitle: 'Your vehicle was successfully removed.',
            preset: 'success',
            time: 5000
        })

        /*veh.chat.send(player, `Vehicle removed.`, new RGBA(0,255,0,255),
            {timeout: 10});*/
    }
    else
    {
        let sql = `DELETE FROM vehicles WHERE vehicle_id='${vehicle_id}'`;

        veh.pool.query(sql).then((result) => 
        {
            jcmp.events.CallRemote('vehicles/sync/remove_entry', player, vehicle_id);

            if (player.c.vehicles[vehicle_id].pvehicle)
            {
                player.c.vehicles[vehicle_id].pvehicle.vehicle.Destroy();
            }

            delete player.c.vehicles[vehicle_id];
            
            jcmp.notify(player, {
                title: 'Vehicle removed',
                subtitle: 'Your vehicle was successfully removed.',
                preset: 'success',
                time: 5000
            })

            /*veh.chat.send(player, `Vehicle removed.`, new RGBA(0,255,0,255),
                {timeout: 10});*/
        })
    }

    
    jcmp.events.Call('log', 'vehicles', 
        `Player ${player.c.general.name} removed a vehicle with id ${vehicle_id}.`);
})

jcmp.events.AddRemoteCallable('vehicles/network/transfer', (player, vehicle_id, target_name) => 
{
    if (vehicle_id == undefined || !target_name || target_name.length < 3)
    {
        return;
    }

    if (target_name == player.c.general.name)
    {
        jcmp.notify(player, {
            title: 'Vehicle transfer failed',
            subtitle: 'You cannot transfer a vehicle to yourself.',
            preset: 'warn_red',
            time: 5000
        })
        /*veh.chat.send(player, `<b>Vehicle transfer failed. You cannot transfer a vehicle to yourself.</b>`, 
            new RGBA(255,0,0,255));*/
        jcmp.events.Call('log', 'vehicles', 
            `${player.c.general.name} tried to transfer vehicle with id ${vehicle_id} to ${target_name}, but failed 
            because they are trying to transfer to themself.`);
        return;
    }

    if (player.vehicle != undefined)
    {
        jcmp.notify(player, {
            title: 'Vehicle transfer failed',
            subtitle: 'You cannot be in a vehicle while transferring a vehicle.',
            preset: 'warn_red',
            time: 5000
        })
        /*veh.chat.send(player, `<b>Vehicle transfer failed. You cannot be in a vehicle while transferring a vehicle.</b>`, 
            new RGBA(255,0,0,255));*/
        jcmp.events.Call('log', 'vehicles', 
            `${player.c.general.name} tried to transfer vehicle with id ${vehicle_id} to ${target_name}, but failed 
            because the player is in a vehicle.`);
        return;
    }

    const vehicle_data = player.c.vehicles[vehicle_id];
    let name = (vehicle_data != undefined) ? vehicle_data.name : 'Unknown';

    if (vehicle_data != undefined && veh.vehicle_data[vehicle_data.hash] && veh.vehicle_data[vehicle_data.hash].nice_name)
    {
        name = veh.vehicle_data[vehicle_data.hash].nice_name; // does not work for unspawned vehicles
    }

    // If the player actually owns the vehicle currently
    if (vehicle_data != undefined)
    {
        const target = jcmp.players.find((p) => p.c && p.c.general && p.c.general.name === target_name);

        // If the player is on the server currently
        if (target != undefined && target.name)
        {
            // If they don't have any more slots for vehicles
            if (veh.utils.GetNumOwnedVehicles(target) >= veh.config.max_vehicles[target.c.exp.level])
            {
                jcmp.notify(player, {
                    title: 'Vehicle transfer failed',
                    subtitle: 'Player does not have enough vehicle space.',
                    preset: 'warn_red',
                    time: 5000
                })
                /*veh.chat.send(player, `<b>Vehicle transfer failed. Player does not have enough vehicle space.</b>`, 
                    new RGBA(255,0,0,255));*/
                jcmp.events.Call('log', 'vehicles', 
                    `${player.c.general.name} tried to transfer vehicle with id ${vehicle_id} to ${target_name}, but failed 
                    because the target does not have enough vehicle space.`);
                return;
            }

            vehicle_data.owner_steam_id = target.c.general.steam_id;

            // If the vehicle is spawned
            if (vehicle_data.pvehicle)
            {
                target.c.vehicles[vehicle_id] = vehicle_data;
                target.c.vehicles[vehicle_id].pvehicle = vehicle_data.pvehicle;

                target.c.vehicles[vehicle_id].pvehicle.owner_steam_id = target.c.general.steam_id;
                target.c.vehicles[vehicle_id].pvehicle.owner = target;
                target.c.vehicles[vehicle_id].pvehicle.update_sql(true);

                // Update to everyone
                jcmp.events.CallRemote('vehicles/sync/update', null, JSON.stringify(target.c.vehicles[vehicle_id].pvehicle.get_sync_data()));
            }
            else // The vehicle has not been spawned
            {
                target.c.vehicles[vehicle_id] = vehicle_data;

                
                const sql = `UPDATE vehicles SET owner_steam_id = '${target.c.general.steam_id}' 
                    WHERE vehicle_id = '${vehicle_id}'`;

                veh.pool.query(sql).then((result) =>
                {
                    const data = {
                        vehicle_id: vehicle_id,
                        name: veh.vehicle_data[vehicle_data.hash].nice_name,
                        health: vehicle_data.health,
                        max_health: veh.vehicle_data[vehicle_data.hash].default_health,
                        position: {x: vehicle_data.x, y: vehicle_data.y, z: vehicle_data.z},
                        model_name: veh.vehicle_data[vehicle_data.hash].name
                    }

                    const data_str = JSON.stringify(data);
                    jcmp.events.CallRemote('vehicles/sync/add_entry', target, data_str);
                });

            }

            jcmp.notify(target, {
                title: 'Vehicle transfer',
                subtitle: `${player.c.general.name} transferred ${name} to you.`,
                preset: 'success',
                time: 7500
            })

            veh.chat.send(target, 
                `${player.c.general.name} transferred ${name} to you.`,
                new RGBA(0,255,0,255), {channel: 'Log'});

            jcmp.notify(player, {
                title: 'Vehicle transfer',
                subtitle: `Successfully transferred ${name} to ${target.c.general.name}.`,
                preset: 'success',
                time: 7500
            })

            veh.chat.send(player, 
                `Successfully transferred ${name} to ${target.c.general.name}.`,
                new RGBA(0,255,0,255), {channel: 'Log'});

            jcmp.events.CallRemote('vehicles/sync/remove_entry', player, vehicle_id);
            delete player.c.vehicles[vehicle_id];
                
            jcmp.events.Call('log', 'vehicles', 
                `${player.c.general.name} transferred vehicle with id ${vehicle_id} to ${target_name}.`);

        }
        else // Otherwise, try the database
        {
            let target_data;
            let target_vehicles;
            let target_exp;
            let failed = false;

            let sql = `SELECT * FROM general WHERE name = '${target_name}'`;
            veh.pool.query(sql).then((result) =>
            {
                target_data = result[0];

                if (target_data == undefined)
                {
                    jcmp.notify(player, {
                        title: 'Vehicle transfer failed',
                        subtitle: 'Player does not exist.',
                        preset: 'warn_red',
                        time: 5000
                    })

                    /*veh.chat.send(player, `<b>Vehicle transfer failed. Player does not exist.</b>`, 
                        new RGBA(255,0,0,255));*/
                    jcmp.events.Call('log', 'vehicles', 
                        `${player.c.general.name} tried to transfer vehicle with id ${vehicle_id} to ${target_name}, but failed 
                        because player does not exist.`);
                    failed = true;
                    return;
                }
                else if (target_data.name !== target_name)
                {
                    jcmp.notify(player, {
                        title: 'Vehicle transfer failed',
                        subtitle: 'Player does not exist.',
                        preset: 'warn_red',
                        time: 5000
                    })
                    /*veh.chat.send(player, `<b>Vehicle transfer failed. Player does not exist.</b>`, 
                        new RGBA(255,0,0,255));*/
                    jcmp.events.Call('log', 'vehicles', 
                        `${player.c.general.name} tried to transfer vehicle with id ${vehicle_id} to ${target_name}, but failed 
                        because the player does not exist.`);
                    failed = true;
                    return;
                }

                sql = `SELECT * FROM vehicles WHERE owner_steam_id = '${target_data.steam_id}'`;
                
                return  veh.pool.query(sql);
            }).then((result) =>
            {
                if (failed) {return;}

                target_vehicles = result;

                sql = `SELECT * FROM exp WHERE steam_id = '${target_data.steam_id}'`;
                return veh.pool.query(sql);
            }).then((result) =>
            {
                if (failed) {return;}

                target_exp = result[0];

                if (!target_vehicles || !target_exp)
                {
                    jcmp.notify(player, {
                        title: 'Vehicle transfer failed',
                        subtitle: 'Error code: 782',
                        preset: 'warn_red',
                        time: 5000
                    })
                    /*veh.chat.send(player, `<b>Vehicle transfer failed. Error: 782.</b>`, 
                        new RGBA(255,0,0,255));*/
                    jcmp.events.Call('log', 'vehicles', 
                        `${player.c.general.name} tried to transfer vehicle with id ${vehicle_id} to ${target_name}, but failed 
                        because error 782.`);
                    failed = true;
                    return;
                }

                if (target_vehicles && target_vehicles.length >= veh.config.max_vehicles[target_exp.level])
                {
                    jcmp.notify(player, {
                        title: 'Vehicle transfer failed',
                        subtitle: 'Player does not have enough vehicle space.',
                        preset: 'warn_red',
                        time: 5000
                    })
                    /*veh.chat.send(player, `<b>Vehicle transfer failed. Player does not have enough vehicle space.</b>`, 
                        new RGBA(255,0,0,255));*/
                    jcmp.events.Call('log', 'vehicles', 
                        `${player.c.general.name} tried to transfer vehicle with id ${vehicle_id} to ${target_name}, but failed 
                        becausye the target does not have enough vehicle space.`);
                    failed = true;
                    return;
                }

                vehicle_data.owner_steam_id = target_data.steam_id;

                jcmp.events.CallRemote('vehicles/sync/remove_entry', player, vehicle_id);
                delete player.c.vehicles[vehicle_id];

                
                sql = `UPDATE vehicles SET owner_steam_id = '${target_data.steam_id}' 
                    WHERE vehicle_id = '${vehicle_id}'`;

                return veh.pool.query(sql);
            }).then((result) =>
            {
                if (!failed)
                {
                    jcmp.notify(player, {
                        title: 'Vehicle transfer',
                        subtitle: `Successfully transferred ${name} to ${target_data.name}.`,
                        preset: 'success',
                        time: 7500
                    })

                    /*veh.chat.send(player, 
                    `Successfully transferred ${name} to ${target_data.name}.`,
                    new RGBA(0,255,0,255), {channel: 'Log'});*/
                    
                    jcmp.events.Call('log', 'vehicles', 
                        `${player.c.general.name} transferred vehicle with id ${vehicle_id} to ${target_name}.`);
                }
                
            });
        }
    }
    else
    {
        jcmp.notify(player, {
            title: 'Vehicle transfer failed',
            subtitle: 'Error code: 721',
            preset: 'warn_red',
            time: 5000
        })

        /*veh.chat.send(player, `Vehicle transferring failed.`,
            new RGBA(255,0,0,255), {timeout: 30});*/
        jcmp.events.Call('log', 'vehicles', 
            `${player.c.general.name} tried to transfer vehicle with id ${vehicle_id} to ${target_name}, but failed 
            because the player does not appear to own the vehicle.`);
    }
})