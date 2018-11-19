module.exports = class Lootbox
{
    /**
     * Creates a lootbox in the game world. This can be a dropbox, lootbox, or storage.
     * 
     * @param {object} position - The position in the game world of the lootbox.
     * @param {object} rotation - The rotation of the lootbox.
     * @param {number} type - The type/tier of lootbox. 1 = tier 1 (lowest), 2 = tier 2, 
     * 3 = tier 3 (highest) 4 = airdrop, 5 = dropbox, 6 = unlocked storage. This only affects respawn times and model.
     * @param {boolean} demo - True if this is a demo lootbox that can't be looted (aka in the safezone)
     */
    constructor (position, rotation, type, demo)
    {
        this.position = position;
        this.rotation = rotation;
        this.type = type;
        this.demo = demo == true;
        this.dimension = 0;

        this.cell = loot.cell.GetCell(this.position);
        this.dropbox = type == 5;
        this.is_storage = type == 6; // TODO add more checks here for other types of storages

        if (this.dropbox) // If this is a dropbox
        {
            this.contents = [];
            this.despawn_timer = setTimeout(() => 
            {
                this.remove();
            }, loot.config.dropbox_despawn_time * 1000 * 60);
        }
        else if (this.is_storage) // If this is a storage
        {
            this.contents = [];
        }
        else // Otherwise, this is a normal loot box
        {
            this.contents = loot.generator.GetLoot(this.type, this.position);
            this.respawn_time = 0;
        }

        
        this.opened = this.demo || this.is_storage; // Whether or not the lootbox has been opened before (use demo because demos dont give exp)
        this.is_open = false; // If this lootbox is currently open by someone
        this.active = true; // Whether or not this lootbox exists or is being refreshed 

        this.id = ++loot.config.id;

        this.wait = false;
        this.players_opened = []; // Array of players who have this lootbox open

        // Apparently AddRemoteCallable doesn't return an EventInstance
        jcmp.events.AddRemoteCallable('lootbox/sync/open' + this.id, (player, id) => 
            {this.open(player, parseInt(id))});
        
        jcmp.events.AddRemoteCallable('lootbox/sync/take' + this.id, (player, s, index, id) => 
            {this.take(player, s, index, parseInt(id))});

        jcmp.events.AddRemoteCallable('lootbox/sync/close_key' + this.id, (player) => 
            {this.remove_player_opened(player)});
    }

    /**
     * Called when a player tries to open the lootbox.
     * @param {object} player - The player who tried to open the lootbox.
     */

    open (player, id)
    {
        if (id !== this.id || player.vehicle || this.removed) {return;}
        if (player.health <= 0 || (player.dimension != player.desired_dimension && !player.tutorial)) {return;}

        if (player.position.sub(this.position).length > 3) {return;} // Too far
        if (this.is_storage && !this.storage.can_open(player)) 
        {
            jcmp.events.CallRemote('loot/sync/init', player, 'Locked', this.id, JSON.stringify({}));

            player.looting_box = this.id;
            if (!this.players_opened.find((p) => p.networkId == player.networkId))
            {
                this.players_opened.push(player);
            }
            
            player.current_box = this;
            
            return;
        } // Not allowed to open storage, so just send them dummy info

        player.looting_box = this.id;
        if (!this.players_opened.find((p) => p.networkId == player.networkId))
        {
            this.players_opened.push(player);
        }
        player.current_box = this;
        this.is_open = true;

        // Unlock when a player opens it
        if (this.is_storage)
        {
            this.storage.unlock(player);
        }

        jcmp.events.CallRemote('loot/sync/init', player, JSON.stringify(this.to_array()), this.id, 
            JSON.stringify(this.is_storage ? this.storage.get_extra_sync_data() : {}));
        jcmp.events.Call('loot/open_box', player, this.contents, this.id, this.opened, this.type);

        if (this.dropbox || this.demo || this.is_storage) {return;}

        if (this.respawn_time == 0)
        {
            this.respawn_time = this.get_respawn_time();
        }

        if (!this.opened)
        {
            setTimeout(() => 
            {
                this.refresh();
            }, this.respawn_time * 60 * 1000);
        }

        this.opened = true;

    }

    /**
     * Called when a player tries to take something from the lootbox.
     * @param {object} player - The player who tried to take something from the lootbox.
     * @param {object} stack - The stack that the client has of the lootbox. MUST MATCH.
     * @param {index} index - The index of the stack in the lootbox.
     */

    take (player, s, index, id)
    {
        if (id !== this.id || this.demo || this.removed) {return;}
        if (player.position.sub(this.position).length > 5) {return;} // Too far
        if (player.health <= 0 || (player.dimension != player.desired_dimension && !player.tutorial)) {return;}
        if (!this.players_opened.find((p) => p.networkId == player.networkId)) {return;}
        if (this.is_storage && !this.storage.can_open(player)) {return;} // Not allowed to take from storage

        if (!player || !s || index == undefined || index < 0 || !this.contents[index])
        {
            //console.log(`Cannot take from lootbox, something is bad.`);
            jcmp.events.Call('log', 'loot', `Player ${player.c.general.name} tried to take something 
                from a lootbox, but something went wrong.`);
            return;
        }

        s = JSON.parse(s);

        if (this.is_storage)
        {
            // Let the storage handle taking items
            this.storage.click_item(s, index, player);
            return;
        }

        const stack = this.contents[index];
        let client_stack;

        let items = [];

        for (let i = 0; i < s.contents.length; i++)
        {
            items.push(new jcmp.inv.item(s.contents[i]));
        }

        client_stack = new jcmp.inv.stack(items);

        if (!stack.equals(client_stack))
        {
            //console.log(`Tried to take item from lootbox, but client stack did not match! BAD BAD BAD`);
            //console.log(client_stack);
            //console.log(stack);
            //console.log(index);
            jcmp.events.Call('log', 'loot', `Tried to take, but stacks did not match. no Strike added. 
                steam_id: ${player.c.general.steam_id}`);
            //jcmp.events.Call('watchlist/AddStrike', player.c.general.steam_id, `Player tried to take item from lootbox, 
            //    but client stack did not match server stack.`, player);
            return;
        }

        jcmp.events.Call('log', 'loot', 
            `${player.c.general.name} took ${stack.prop('name')} x${stack.get_amount()} from lootbox ${this.id} type ${this.type}`);
        const return_stack = player.c.inventory.add_stack(stack);

        if (return_stack && return_stack.contents && return_stack.contents[0].amount > 0)
        {
            this.contents[index] = return_stack;
            this.update('loot/sync/update', JSON.stringify(return_stack.to_array()), index, this.id);
            //jcmp.events.CallRemote('loot/sync/update', player, JSON.stringify(return_stack.to_array()), index, this.id);
            jcmp.events.Call('log', 'loot', 
                `${player.c.general.name} was not able to take all of the stack from lootbox ${this.id} type ${this.type}.
                Return stack: ${return_stack.prop('name')} x${return_stack.get_amount()}`);
        }
        else // Everything in the stack was taken
        {
            this.contents.splice(index, 1);
            this.update('loot/sync/remove', index, this.id);

            if (this.contents.length == 0 && !this.is_storage) // If everything was taken and it's not a storage
            {
                this.update('loot/sync/close', this.id);
                this.empty();

                for (let i = 0; i < this.players_opened.length; i++)
                {
                    this.players_opened[i].current_box = null;
                }

                this.players_opened = [];
            }
        }
    }

    close_for_player (player)
    {
        jcmp.events.CallRemote('loot/sync/close', player);

        this.remove_player_opened(player);
    }

    /**
     * Removes a player from the players_opened array
     * @param {*} player 
     */
    remove_player_opened (player)
    {
        player.current_box = null;
        player.unlocked_storage = null;
        this.players_opened = this.players_opened.filter((p) => p.networkId != player.networkId);
        this.is_open = this.players_opened.length != 0;
    }

    /**
     * CallRemote but for everyone who has the lootbox open.
     */
    update (name, ...args)
    {
        this.players_opened.forEach((player) => 
        {
            if (this.is_storage)
            {
                if (player.unlocked_storage == this.storage.id && this.storage.can_open(player))
                {
                    jcmp.events.CallRemote(name, player, ...args);
                }
            }
            else
            {
                jcmp.events.CallRemote(name, player, ...args);
            }
        });
    }

    to_array ()
    {
        const data = [];

        for (let i = 0; i < this.contents.length; i++)
        {
            const s = {contents: []};
            if (this.contents[i] && this.contents[i].to_array())
            {
                s.contents = this.contents[i].to_array();
                data.push(s);
            }
        }

        return data;
    }

    /**
     * Refreshes/recycles the contents of the lootbox. Removes all old items, and get completely new ones.
     * 
     * Called automatically after the lootbox is opened once after set respawn time, otherwise it is used 
     * when respawning.
     */

    refresh ()
    {
        // If someone has it open, don't refresh
        if (!this.is_open)
        {
            this.contents = loot.generator.GetLoot(this.type, this.position);
            this.active = true;
            this.opened = false;
            this.sync_nearby();
            this.respawn_time = 0;
            jcmp.events.Call('log', 'loot', 
                `Lootbox ${this.id} type ${this.type} refreshed.`);
        }
        else // Try again in 15 seconds to refresh.
        {
            setTimeout(() =>
            {
                this.refresh();
            }, 15 * 1000);
        }
    }

    /**
     * Called when the contents of the lootbox are empty. Removes the lootbox object and refreshes the 
     * contents, then respawns the lootbox after the set respawn time.
     */

    empty ()
    {
        this.active = false;
        this.is_open = false; // No one can have it open because it will close when it is empty

        loot.CallRemoteCell('loot/sync/set_active', this.cell.x, this.cell.y, this.id, this.active);

        jcmp.events.Call('loot/lootbox_emptied', this.id);

        if (this.dropbox)
        {
            this.remove();
            return;
        }

        this.respawn_time = this.get_respawn_time();

        setTimeout(() => 
        {
            // respawn lootbox object
            this.refresh();
        }, this.respawn_time * 60 * 1000);

    }

    /**
     * Removes a lootbox completely. Will not respawn. Used for airdrop loot (and placing) and dropboxes and storages.
     */
    remove ()
    {
        this.contents = [];
        this.removed = true;
        loot.CallRemoteCell('loot/sync/remove_total', this.cell.x, this.cell.y, this.id);
        loot.cells[this.cell.x][this.cell.y] = loot.cells[this.cell.x][this.cell.y].filter((box) => box.id !== this.id);
    }

    /**
     * Called by the cell that this is in when a player enters the cell or an adjacent one
     * @param {*} player 
     */
    sync (player)
    {
        // Only sync lootboxes in the same dimension as the player

        // If they are loading or desynced, don't sync the box yet
        if (player.dimension == 77 || player.dimension == 50)
        {
            setTimeout(() => {
                if (player && player.name)
                {
                    this.sync(player);
                }
            }, 5000);
        }

        // If the player is in the same dimension as the lootbox
        if (player.dimension == this.dimension)
        {
            jcmp.events.CallRemote('loot/sync/basic', player, JSON.stringify(this.get_basic_sync_data()));
        }
    }

    /**
     * Syncs the lootbox to people in nearby cells. Used mainly for dropboxes to make them appear.
     */
    sync_nearby ()
    {
        loot.CallRemoteCell('loot/sync/basic', this.cell.x, this.cell.y, JSON.stringify(this.get_basic_sync_data()));
    }

    get_basic_sync_data ()
    {
        return {
            pos: {x: this.position.x, y: this.position.y, z: this.position.z},
            rot: {x: this.rotation.x, y: this.rotation.y, z: this.rotation.z},
            type: this.type,
            active: this.active,
            storage: (this.is_storage) ? this.storage.get_basic_sync_data() : {},
            id: this.id,
            demo: this.demo == true,
            is_storage: this.is_storage == true
        };
    }

    /**
     * Returns the respawn time in minutes for this lootbox, depending on how many players are nearby.
     */
    get_respawn_time ()
    {
        let num_nearby = loot.players_in_cells[this.cell.x][this.cell.y].length;
        const adjacent_cells = loot.cell.GetAdjacentCells(this.cell.x, this.cell.y);

        // Get number of players near the lootbox
        for (let i = 0; i < adjacent_cells.length; i++)
        {
            num_nearby += loot.players_in_cells[adjacent_cells[i].x][adjacent_cells[i].y].length;
        }


        return Math.max(loot.config.respawn_times[this.type] / 2, loot.config.respawn_times[this.type] - (num_nearby * this.type * 0.5));
    }

}