// suicide client main.js

jcmp.timer_active = false; // if the player is 'suiciding'
let activate_on_next_tick = false; // whether or not to start the timer on the next secondtick
let seconds = 10; // the seconds until death
let start_time;
let last_suicide = new Date().getSeconds();
let last_damage = 0;

const BG_COLOR = new RGBA(0,0,0,127);
const OUTLINE_COLOR = new RGBA(255,255,255,255);
const TEXT_COLOR = new RGBA(255,255,255,255);
const TEXT_SHADOW_COLOR = new RGBA(0,0,0,100);

jcmp.events.Add('LocalPlayerHealthChange', (old_health, new_health) => 
{
    if (new_health < old_health && jcmp.timer_active)
    {
        jcmp.timer_active = false;
        activate_on_next_tick = false;
        jcmp.localPlayer.controlsEnabled = true;
    }

    if (new_health < old_health)
    {
        last_damage = new Date().getSeconds();
    }
})

jcmp.events.Add('LocalPlayerChat', (msg) => 
{
    if (msg == "/suicide")
    {   
        const network_player = jcmp.players.find((p) => p.networkId == jcmp.localPlayer.networkId);
        const new_time = new Date().getSeconds();
        
        if (new_time - last_damage < 15)
        {
            jcmp.notify({
                title: 'Cannot suicide',
                subtitle: 'You have taken damage recently. Please wait.',
                time: 5000,
                preset: 'warn'
            })
            return;
        }

        if (network_player.health == 0) {return false;}
        

        if (jcmp.timer_active == true) // player is cancelling suicide
        {
            jcmp.timer_active = false;
            activate_on_next_tick = false;
            jcmp.localPlayer.controlsEnabled = true;
        }
        else if (Math.abs(new_time - last_suicide) > 5) // player is beginning suicide + 5 second cooldown so players cant suicide while they just died from suicide
        {
            activate_on_next_tick = true;
            jcmp.localPlayer.controlsEnabled = false;
        }

        return false;
    }
});

jcmp.events.Add('Render', (r) => 
{
    // Draw a red rectangle to the screen
    //scriptingRenderer.DrawRect(new Vector2f(100, 100), new Vector2f(300, 300), new RGBA(255, 0, 0, 255));

    if (jcmp.timer_active == true) // if the timer is active
    {
        const text = seconds.toString();
        const dimensions = r.MeasureText(text, 75, "Arial");
        const rect_measure = r.MeasureText('10', 75, "Arial");
        const RECT_DIMENSIONS = new Vector2f(rect_measure.x + Math.round(rect_measure.x * 0.3), rect_measure.y + Math.round(rect_measure.x * 0.3));
        
        r.DrawRect(
            new Vector2f(Math.round(jcmp.viewportSize.x * .5) - (RECT_DIMENSIONS.x * 0.5), 
            Math.round(jcmp.viewportSize.y * .35) - (RECT_DIMENSIONS.y * 0.5)),
            RECT_DIMENSIONS,
            BG_COLOR
        )
        
        // Top
        r.DrawLine(
            new Vector2f(Math.round(jcmp.viewportSize.x * .5) - (RECT_DIMENSIONS.x * 0.5), 
            Math.round(jcmp.viewportSize.y * .35) - (RECT_DIMENSIONS.y * 0.5)),
            new Vector2f(Math.round(jcmp.viewportSize.x * .5) + (RECT_DIMENSIONS.x * 0.5), 
            Math.round(jcmp.viewportSize.y * .35) - (RECT_DIMENSIONS.y * 0.5)),
            OUTLINE_COLOR
        )

        // Left
        r.DrawLine(
            new Vector2f(Math.round(jcmp.viewportSize.x * .5) - (RECT_DIMENSIONS.x * 0.5), 
            Math.round(jcmp.viewportSize.y * .35) - (RECT_DIMENSIONS.y * 0.5)),
            new Vector2f(Math.round(jcmp.viewportSize.x * .5) - (RECT_DIMENSIONS.x * 0.5), 
            Math.round(jcmp.viewportSize.y * .35) + (RECT_DIMENSIONS.y * 0.5)),
            OUTLINE_COLOR
        )

        // Right
        r.DrawLine(
            new Vector2f(Math.round(jcmp.viewportSize.x * .5) + (RECT_DIMENSIONS.x * 0.5), 
            Math.round(jcmp.viewportSize.y * .35) - (RECT_DIMENSIONS.y * 0.5)),
            new Vector2f(Math.round(jcmp.viewportSize.x * .5) + (RECT_DIMENSIONS.x * 0.5), 
            Math.round(jcmp.viewportSize.y * .35) + (RECT_DIMENSIONS.y * 0.5)),
            OUTLINE_COLOR
        )

        // Bottom
        r.DrawLine(
            new Vector2f(Math.round(jcmp.viewportSize.x * .5) - (RECT_DIMENSIONS.x * 0.5), 
            Math.round(jcmp.viewportSize.y * .35) + (RECT_DIMENSIONS.y * 0.5)),
            new Vector2f(Math.round(jcmp.viewportSize.x * .5) + (RECT_DIMENSIONS.x * 0.5), 
            Math.round(jcmp.viewportSize.y * .35) + (RECT_DIMENSIONS.y * 0.5)),
            OUTLINE_COLOR
        )
        
        r.DrawText(
            text, 
            new Vector3f(Math.round(jcmp.viewportSize.x * .5) - (dimensions.x / 2) + dimensions.x * 0.005, 
            Math.round(jcmp.viewportSize.y * .35) - (dimensions.y / 2) + dimensions.x * 0.005, .5), 
            new Vector2f(10000, 10000), 
            TEXT_SHADOW_COLOR, 75, "Arial");

        r.DrawText(
            text, 
            new Vector3f(Math.round(jcmp.viewportSize.x * .5) - (dimensions.x / 2), 
            Math.round(jcmp.viewportSize.y * .35) - (dimensions.y / 2), .5), 
            new Vector2f(10000, 10000), 
            TEXT_COLOR, 75, "Arial");
    

        //r.DrawRect(new Vector2f(0, 0), new Vector2f(jcmp.viewportSize.x, jcmp.viewportSize.y), new RGBA(255, 0, 0, 175 - (seconds * 15)));
        //r.DrawRect(new Vector2f(0, 0), new Vector2f(jcmp.viewportSize.x, jcmp.viewportSize.y), new RGBA(seconds * 25, 0, 0, 255));
    }

});

jcmp.ui.AddEvent('SecondTick', () => 
{
    if (activate_on_next_tick == true) // start the countdown
    {
        activate_on_next_tick = false;
        seconds = 10;
        jcmp.timer_active = true;
        start_time = new Date().getSeconds();
    }
    else if (jcmp.timer_active == true)
    {
        seconds = seconds - 1;

        if (seconds == 0)
        {
            //jcmp.debug("Death");
            jcmp.timer_active = false;
            jcmp.localPlayer.controlsEnabled = true;

            const end_time = new Date().getSeconds();

            if (Math.abs(end_time - start_time) < 6)
            {
                // add a strike?
            }
            else
            {
                jcmp.events.CallRemote('SuicideDeath'); // let the server kill the player
                last_suicide = new Date().getSeconds();
            }
            
        }
    }
    
});

//const player_pos = jcmp.localPlayer.position;
//close_vehicles = [];
//for (let i = 0; i < jcmp.vehicles.length; i++)
//{
    //if (dist(jcmp.vehicles[i].position, player_pos) < 25)
    //{
    //      close_vehicles[i] = jcmp.vehicles[i];
    //}
//}