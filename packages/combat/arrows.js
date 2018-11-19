const REMOVE_TIME = 30; // 30 seconds to remove
let arrow_ids = 1;
const arrows = {};

class Arrow
{
    constructor (name, pos, steam_id)
    {
        this.name = name;
        this.pos = pos;
        this.id = arrow_ids++;
        this.steam_id = steam_id;

        setTimeout(() => {
            this.destroy();
        }, REMOVE_TIME * 1000);
    }

    sync (player)
    {
        jcmp.events.CallRemote('combat/arrow/sync', player || null, 
            JSON.stringify({name: this.name, pos: {x: this.pos.x, y: this.pos.y, z: this.pos.z}, id: this.id}));
    }

    destroy ()
    {
        jcmp.events.CallRemote('combat/arrow/remove', null, this.id);
        delete arrows[this.steam_id];
    }
}

jcmp.events.Add('PlayerDestroyed', (player) => 
{
    if (!player.c || !player.c.active || player.a_tping || player.loading || !player.loaded_in)
    {
        return;
    }

    if (arrows[player.c.general.steam_id])
    {
        arrows[player.c.general.steam_id].destroy();
    }

    arrows[player.c.general.steam_id] = new Arrow(player.c.general.name, player.position, player.c.general.steam_id);
    arrows[player.c.general.steam_id].sync();
})

// Sync arrows on join
jcmp.events.Add('character/Loaded', (player) => 
{
    for (const steam_id in arrows)
    {
        arrows[steam_id].sync(player);
    }
})