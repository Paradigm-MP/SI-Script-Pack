
// disable all abilities when the player connects
jcmp.localPlayer.SetAbilityEnabled(0xCB836D80, false); // grapplehook
jcmp.localPlayer.SetAbilityEnabled(0xCEEFA27A, false); // parachute


jcmp.events.AddRemoteCallable('set_dev_mode', (enabled) => 
{
    // Disable wingsuit if dev mode is not enabled
    if (!enabled)
    {
        jcmp.localPlayer.SetAbilityEnabled(0xE060F641, false);
        jcmp.localPlayer.wingsuit.boostDuration = 0;
        jcmp.localPlayer.wingsuit.boostPower = 0;
        jcmp.localPlayer.wingsuit.boostEnabled = false;
    }
    else
    {
        jcmp.localPlayer.SetAbilityEnabled(0xE060F641, true);
        jcmp.localPlayer.wingsuit.boostDuration = 99999999;
        jcmp.localPlayer.wingsuit.boostPower = 999999;
        jcmp.localPlayer.wingsuit.boostEnabled = true;
    }
})

jcmp.events.AddRemoteCallable('itemuse/grapple_toggle', (toggled) => 
{
    jcmp.localPlayer.SetAbilityEnabled(0xCB836D80, toggled);
})

jcmp.events.AddRemoteCallable('itemuse/para_toggle', (toggled) => 
{
    jcmp.localPlayer.SetAbilityEnabled(0xCEEFA27A, toggled);
})

jcmp.events.AddRemoteCallable('itemuse/wingsuit_toggle', (toggled) => 
{
    jcmp.localPlayer.SetAbilityEnabled(0xE060F641, toggled);
})

let grapplehook_change = 0;
let parachute_change = 0;
let wingsuit_change = 0;

jcmp.ui.AddEvent('SecondTick', (seconds) => 
{
    const basestate = jcmp.localPlayer.baseState;
    const bits1 = jcmp.localPlayer.playerStateBits1;
    const bits2 = jcmp.localPlayer.playerStateBits2;

    // If they are grapplehooking
    if ( bits2 == 2013265920 || basestate == 2419532966 || (basestate == 498269113 && bits2 == 67633160)
        || (basestate == 4257988886 && bits1 == 1) || basestate == 3597958171 || basestate == 747097807
        || basestate == 2939912076 || basestate == 218244485 || basestate == 2470919943)
    {

        if (!jcmp.localPlayer.IsAbilityEnabled(0xCB836D80))
        {
            //jcmp.localPlayer.baseState = 29430622; // Reset base state so they stop grappling
        }
        else
        {
            grapplehook_change -= 1;
        }
        
    }

    // If they are parachuting
    if (basestate == 498269113)
    {
        
        if (!jcmp.localPlayer.IsAbilityEnabled(0xCEEFA27A))
        {
            jcmp.localPlayer.baseState = 29430622; // Reset base state so they stop parachuting
        }
        else
        {
            parachute_change -= 1;
        }
        
    }

    // If they are wingsuiting
    if (basestate == 2681816465 || basestate == 4257988886 || basestate == 2681816465)
    {
        if (!jcmp.localPlayer.IsAbilityEnabled(0xE060F641))
        {
            jcmp.localPlayer.baseState = 29430622; // Reset base state so they stop wingsuiting
        }
        else
        {
            wingsuit_change -= 1;
        }
    }

    // If it's time to sync
    if (seconds % 2 == 0) // Every 2 seconds
    {
        if (grapplehook_change < 0)
        {
            jcmp.events.CallRemote('itemuse/grapple_change', grapplehook_change);
            grapplehook_change = 0;
        }

        if (parachute_change < 0)
        {
            jcmp.events.CallRemote('itemuse/para_change', parachute_change);
            parachute_change = 0;
        }

        if (wingsuit_change < 0 && !jcmp.dev_mode)
        {
            jcmp.events.CallRemote('itemuse/wingsuit_change', wingsuit_change);
            wingsuit_change = 0;
        }

    }
    
})