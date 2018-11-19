let combatlog_active = false;
let combatlog_ui;


jcmp.events.Add('character/Loaded', () => 
{
    combatlog_ui = new WebUIWindow('combatlog-icon', 'package://combat/ui/index.html', new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    combatlog_ui.hidden = true;
    combatlog_ui.autoResize = true;

    combatlog_ui.AddEvent('combat/ui_ready', () => 
    {
        jcmp.events.Call('load/package_loaded', 'combat-ui');
    })
})


// Eventually use playerhit events or do this serverside
jcmp.events.Add('LocalPlayerHealthChange', (old_health, new_health) => 
{
    if (!ready) {return;}

    // If they took damage
    if (new_health < old_health)
    {
        /*jcmp.events.CallRemote('combat/combatlog_enable');

        if (!combatlog_active)
        {
            jcmp.notify({
                title: 'Combat Log Active',
                subtitle: 'Leaving the server will have severe consequences while you see this icon',
                preset: 'combat_log'
            })
        }

        combatlog_active = true;
        combatlog_ui.hidden = false;
        combatlog_ui.BringToFront();*/
    }
})

// Called when the server deems that the player is no longer in combat
jcmp.events.AddRemoteCallable('combat/combatlog_disable', (no_show) => 
{
    combatlog_ui.hidden = true;
    combatlog_active = false;

    if (no_show) {return;}

    jcmp.notify({
        title: 'Combat Log Inactive',
        subtitle: 'You can now safely leave the server',
        time: 7500
    })
})