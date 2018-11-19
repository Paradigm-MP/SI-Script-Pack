module.exports = 

/**
 * Class for every vehicle on the server. Contains the actual Vehicle, as well as other properties such as 
 * cost, owner, owner steam id, etc.
 */
class PVehicle
{
    /**
     * Creating a PVehicle automatically spawns the vehicle, so no need to use new Vehicle().
     * 
     * Only has a unique ID if owned. You must assign other properties (owner, owner_id, id, cost) after 
     * instantiation yourself.
     */
    constructor (hash, position, rotation, owner_steam_id, id, health, cost, owner, color)
    {
        hash = parseInt(hash);

        this.vehicle = new Vehicle(hash, position, rotation);
        this.position = position;
        this.rotation = rotation;
        this.hash = hash;

        this.vehicle.slots = jcmp.vehicle_bav[this.hash].inventory_slots;
        this.vehicle.inventory = new jcmp.inv.v_inv(veh.bavarium[this.hash].inventory_slots, this.vehicle);

        this.vehicle.max_health = veh.vehicle_data[this.vehicle.modelHash].default_health

        if (owner_steam_id && id && health && cost)
        {
            this.owner_steam_id = owner_steam_id;
            this.id = id;
            this.health = health;
            this.cost = cost;
            this.owner = owner;
            setTimeout(() => 
            {
                if (this.vehicle)
                {
                    this.vehicle.health = health;
                    this.vehicle.primaryColor = color;
                    if (this.owner != undefined && this.owner != null)
                    {
                        jcmp.events.CallRemote('vehicles/sync/send_networkid', this.owner, this.id, this.vehicle.networkId);
                    }
                }
            }, 5000);

            this.save_interval = setInterval(() => 
            {
                if (this && this.update_sql)
                {
                    this.update_sql();
                }
            }, veh.config.update_interval * 60 * 1000); // Every x minutes

        }
        else
        {
            const random = Math.random() * 10 * 60 * 1000; // Stagger distance checks for vehicles
            const health_percent = Math.random() * 0.5 + 0.5;
            this.vehicle.health = Math.round(veh.vehicle_data[`${hash}`].default_health * (health_percent));
            this.cost = veh.costs.GetCost(hash, health_percent);
            this.respawn_time = veh.bavarium[hash].respawn_time;
            this.vehicle.name = veh.vehicle_data[hash].nice_name;

            // todo stop checking distance once it has been bought
            setInterval(() => 
            {
                this.check_distance();
            }, 1000 * 60 * 30 + random);
        }
        

        jcmp.events.CallRemote('vehicles/sync/update_cost', null, this.vehicle.networkId, this.cost);
        jcmp.events.CallRemote('vehicles/sync/update', null, JSON.stringify(this.get_sync_data()));
        this.vehicle.pvehicle = this;

        // Fix free vehicles?
        setTimeout(() => 
        {
            jcmp.events.CallRemote('vehicles/sync/update_cost', null, this.vehicle.networkId, this.cost);
            jcmp.events.CallRemote('vehicles/sync/update', null, JSON.stringify(this.get_sync_data()));
            this.vehicle.pvehicle = this;
        }, 5000);

    }

    /**
     * Updates SQL with all current properties of the PVehicle. If this entry did not previously exist in SQL 
     * (such as someone just bought the vehicle), then a new entry will be added instead. Also updates owners if 
     * the owner changed. Also syncs to all clients with new information.
     * 
     * @param {bool} add - If the vehicle has been transferred and we need to add an entry to the new owner.
     */

    update_sql (add)
    {
        if (this.owner_steam_id == undefined || this.vehicle.health <= 0 || this.vehicle.health == undefined)
        {
            if (this.vehicle.health <= 0)
            {
                this.remove();
            }
            return;
        }

        if (this.id != undefined) // This vehicle existed before in the database, so just update it
        {

            const sql = `UPDATE vehicles SET owner_steam_id = '${this.owner_steam_id}', health = '${this.vehicle.health}',
                cost = '${this.cost}', x = '${this.vehicle.position.x}', y = '${this.vehicle.position.y}',
                z = '${this.vehicle.position.z}', x_r = '${this.vehicle.rotation.x}', y_r = '${this.vehicle.rotation.y}',
                z_r = '${this.vehicle.rotation.z}' WHERE vehicle_id = '${this.id}'`;

            veh.pool.query(sql).then((result) =>
            {
                if (add)
                {
                    const pos = this.vehicle.position;
                    const data = {
                        vehicle_id: this.id,
                        name: veh.vehicle_data[this.vehicle.modelHash].nice_name,
                        health: this.vehicle.health,
                        max_health: veh.vehicle_data[this.vehicle.modelHash].default_health,
                        position: {x: pos.x, y: pos.y, z: pos.z},
                        model_name: veh.vehicle_data[this.vehicle.modelHash].name,
                        spawned: true
                    }

                    const data_str = JSON.stringify(data);
                    jcmp.events.CallRemote('vehicles/sync/add_entry', this.owner, data_str);

                    jcmp.events.CallRemote('vehicles/sync/send_networkid', this.owner, this.id, this.vehicle.networkId);
                }
            });
        }
        else // This vehicle was just purchased
        {
            const sql = `INSERT INTO vehicles (owner_steam_id, hash, health, cost, x, y, z, x_r, y_r, z_r, color) 
                VALUES ('${this.owner_steam_id}', '${this.vehicle.modelHash}', '${this.vehicle.health}', 
                '${this.cost}', '${this.vehicle.position.x}', '${this.vehicle.position.y}', 
                '${this.vehicle.position.z}', '${this.vehicle.rotation.x}', '${this.vehicle.rotation.y}', 
                '${this.vehicle.rotation.z}', '${this.vehicle.primaryColor}')`

            veh.pool.query(sql).then((result) =>
            {
                this.id = result.insertId;
                this.add_for_player();

                jcmp.events.CallRemote('vehicles/sync/send_networkid', this.owner, this.id, this.vehicle.networkId);
            });
        }

        jcmp.events.CallRemote('vehicles/sync/update', null, JSON.stringify(this.get_sync_data()));
        
        // check if owner changed, eg from no owner to an owner, or from one owner to another
    }

    /**
     * Does all the stuff that should be in the SQL above.
     */

    add_for_player ()
    {

        const pos = this.vehicle.position;
        const data = {
            vehicle_id: this.id,
            name: veh.vehicle_data[this.vehicle.modelHash].nice_name,
            health: this.vehicle.health,
            max_health: veh.vehicle_data[this.vehicle.modelHash].default_health,
            position: {x: pos.x, y: pos.y, z: pos.z},
            model_name: veh.vehicle_data[this.vehicle.modelHash].name,
            spawned: true
        }

        const data_str = JSON.stringify(data);
        jcmp.events.CallRemote('vehicles/sync/add_entry', this.owner, data_str);

        this.owner.c.vehicles[this.id] = data;
        this.owner.c.vehicles[this.id].pvehicle = this;

        this.save_interval = setInterval(() => 
        {
            if (this && this.update_sql)
            {
                this.update_sql();
            }
        }, veh.config.update_interval * 60 * 1000); // Every x minutes

    }

    /**
     * Gets all data to be synced to the client, such as cost and owner. 
     * 
     * @returns {object} - An object of all data we want the client to have/use.
     */

    get_sync_data ()
    {
        const data = {};

        data.cost = this.cost;

        if (this.id)
        {
            data.id = this.id;
        }

        if (this.owner_steam_id)
        {
            data.owner_steam_id = this.owner_steam_id;
        }

        data.networkId = this.vehicle.networkId;

        return data;
        
    }



    /**
     * Called when the vehicle explodes. Removes the vehicle and updates SQL entries if they exist.
     * 
     * If the vehicle was unowned, it respawns it.
     */

    destroy ()
    {
        if (this.vehicle && this.vehicle.modelHash)
        {
            this.vehicle.Destroy();
            this.vehicle = null;

            // If this is an unowned vehicle that was destroyed
            if (!this.id && !this.owner_steam_id && !this.command_spawned)
            {
                // Respawn it
                setTimeout(() => 
                {
                    this.vehicle = new Vehicle(this.hash, this.position, this.rotation);
                }, this.respawn_time * 60 * 60 * 1000);
            }
            else if (this.id && this.owner_steam_id)
            {
                this.remove();
            }
        }

    }

    /**
     * If the vehicle is too far from its spawn position, respawn it.
     */

    check_distance ()
    {
        if (this.vehicle && this.vehicle.modelHash && !this.id && !this.owner_steam_id && !this.command_spawned)
        {
            const dist = veh.utils.Distance(this.vehicle.position, this.position);

            if (dist > 100)
            {
                this.vehicle.Destroy();
                this.vehicle = null;

                // Respawn it
                setTimeout(() => 
                {
                    this.vehicle = new Vehicle(this.hash, this.position, this.rotation);
                }, this.respawn_time * 60 * 60 * 1000);
            }

        }

        if (this.save_interval != undefined)
        {
            clearInterval(this.save_interval);
            this.save_interval = null;
        }

    }

    /**
     * Removes a vehicle after the amount of time set in config after the owner disconnects.
     * 
     */

    remove_on_quit ()
    {
        clearInterval(this.save_interval);
        this.save_interval = undefined;

        this.remove_timeout = setTimeout(() => 
        {
            if (this.vehicle && this.vehicle.health != undefined)
            {
                this.update_sql();
                this.vehicle.Destroy();
            }
        }, veh.config.quit_remove_time * 60 * 1000);
    }

    /**
     * Removes vehicle from game and removes from database.
     */

    remove ()
    {
        clearInterval(this.save_interval);
        this.save_interval = undefined;

        if (this.vehicle)
        {
            this.vehicle.Destroy();
        }
        

        
        let sql = `DELETE FROM vehicles WHERE vehicle_id='${this.id}'`;

        veh.pool.query(sql).then((result) => 
        {
            if (this.owner && this.owner.name)
            {
                jcmp.events.CallRemote('vehicles/sync/remove_entry', this.owner, this.id);
                delete this.owner.c.vehicles[this.id];
            }
        })
    }

    /**
     * Updates cost of vehicle for all clients.
     */
    update_cost ()
    {
        jcmp.events.CallRemote('vehicles/sync/update_cost', null, this.vehicle.networkId, this.cost);
    }

}