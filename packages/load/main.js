const LOAD_DIMENSION = 77;

jcmp.events.AddRemoteCallable('load/StartLoad', (player) => {

    if (!player) {return;}

    player.loading = true;
    player.invulnerable = true;
    // Put the players in a different dimension so that people dont see them loading
    player.dimension = LOAD_DIMENSION;
})

jcmp.events.AddRemoteCallable('load/StopLoad', (player) => {
    if (!player) {return;}

    player.loading = false;
    player.invulnerable = false;

    // If they are in the character screen, keep them in dimension 77
    if (player.c && !player.c.ready)
    {
        player.dimension = LOAD_DIMENSION;
    }
    else
    {
        player.loaded_in = true;
        player.dimension = player.desired_dimension; // This is the only place in load that we set the real dim
    }
})

jcmp.events.Add('PlayerReady', (player) => 
{
    player.dimension = LOAD_DIMENSION;
})

// Add advanced TP method to lower crashes
jcmp.events.AddRemoteCallable('load/uiready', (player) => 
{
    if (!player) {return;}
    player.AdvancedTeleport = function(pos)
    {
        if (this.a_tping) {return;}
        player.loading = true;
        jcmp.events.CallRemote('load/set_cam');

        //jcmp.events.CallRemote('advancedtp/begin', this, pos.x, pos.y, pos.z);

        //this.a_tping = true;
        this.dimension = LOAD_DIMENSION;

        setTimeout(() => {
            this.position = pos;
        }, 1000);
        
        this.loaded_recently = true;


        setTimeout(() => 
        {
            this.loaded_recently = false;
        }, 1000 * 60 * 5);

        /*setTimeout(() => 
        {
            if (!this || !this.name) {return;}
            this.a_tping = false;
            //jcmp.events.CallRemote('advancedtp/end', this);

            setTimeout(() => {
                this.position = pos;
            }, 1500);
            player.loading = true;

        }, 5000);*/
    }
})

jcmp.events.Add('chat_command', (player, msg, channel) => 
{
    if (msg == '/unstuck')
    {
        if (!player.loaded_recently) {return;}

        player.position = player.position;

        return false;
    }
})