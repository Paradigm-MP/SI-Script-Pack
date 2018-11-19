
jcmp.events.Add('character/Loaded', (player, id) => {

    const data = {
        id: player.networkId,
        name: player.c.general.name,
        color: player.c.general.color,
        steam_id: player.c.general.steam_id,
        tagname: (typeof player.tag != 'undefined') ? player.tag.name : null,
        tagtextcolor: (typeof player.tag != 'undefined') ? player.tag.textcolor : null,
        tagcolor: (typeof player.tag != 'undefined') ? player.tag.color : null
    };

    jcmp.events.CallRemote("nametags/Nametags_add", null, JSON.stringify(data));

})


jcmp.events.AddRemoteCallable('nametags/Init_Nametags', (player) => 
{

    const datas = [];

    jcmp.players.forEach(function(p) 
    {
        if (p.c && p.c.ready)
        {
            datas.push({
                id: p.networkId,
                name: p.c.general.name,
                color: p.c.general.color,
                steam_id: p.c.general.steam_id,
                tagname: (p.tag) ? p.tag.name : null,
                tagtextcolor: (p.tag) ? p.tag.textcolor : null,
                tagcolor: (p.tag) ? p.tag.color : null
            });
            

        }
    });

    jcmp.events.CallRemote("nametags/Nametags_init", player, JSON.stringify(datas));

})

jcmp.events.Add('PlayerDestroyed', (player) => 
{
    jcmp.events.CallRemote('nametags/remove', null, player.networkId);
})