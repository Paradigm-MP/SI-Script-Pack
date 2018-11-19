
// Dimension 0 is main
// Dimension 1 is cursed

const chat = jcmp.events.Call('get_chat')[0];

jcmp.events.Add('chat_command', (player, message) => {
    if (message == "/cursed")
    {
        switch(player.dimension)
        {
            case 0: 
            {
                player.dimension = 1;
                jcmp.events.CallRemote('CursedWorldEnter', player);
                chat.send(player, "You have entered the CURSED DIMENSION.", new RGB(200,0,0));
                jcmp.events.Call('DimensionChange', (player))
                break;
            }
            case 1:
            {
                player.dimension = 0;
                jcmp.events.CallRemote('CursedWorldExit', player);
                chat.send(player, "You have returned to the normal world.", new RGB(255,255,255));
                jcmp.events.Call('DimensionChange', (player))
                break;
            }
        }
    }
})