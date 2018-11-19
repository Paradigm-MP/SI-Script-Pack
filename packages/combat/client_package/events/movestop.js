
let localplayer = jcmp.players.find((p) => p.networkId == jcmp.localPlayer.networkId);
let current_health;

let ready = false;

jcmp.events.AddRemoteCallable('combat/set_ready', () => 
{
    ready = true;
})

jcmp.events.Add('Render', () => 
{
    if (!ready) {return;}

    if (!localplayer)
    {
        localplayer = jcmp.players.find((p) => p.networkId == jcmp.localPlayer.networkId);

        if (localplayer)
        {
            current_health = localplayer.health;
        }
        return;
    }

    if (!current_health)
    {
        current_health = localplayer.health;
    }

    if (localplayer && localplayer.health != current_health)
    {
        const basestate = jcmp.localPlayer.baseState;
        const bits1 = jcmp.localPlayer.playerStateBits1;
        const bits2 = jcmp.localPlayer.playerStateBits2;

        if (localplayer.health <= 0) // They died
        {

        }
        else if (current_health > localplayer.health) // They took damage
        {
            StopGrapple(basestate, bits1, bits2);
            StopParachute(basestate, bits1, bits2);
            StopWingsuit(basestate, bits1, bits2);
        }
        else if (current_health < localplayer.health) // They healed
        {
            // do nothing
        }

        // old_health, new_health
        jcmp.events.Call('LocalPlayerHealthChange', current_health, localplayer.health);

        current_health = localplayer.health;
    }
})

function StopGrapple(basestate, bits1, bits2)
{
    // If they are grapplehooking
    if ( bits2 == 2013265920 || basestate == 2419532966 || (basestate == 498269113 && bits2 == 67633160)
    || (basestate == 4257988886 && bits1 == 1) || basestate == 3597958171 || basestate == 747097807
    || basestate == 2939912076 || basestate == 218244485 || basestate == 2470919943)
    {
        jcmp.localPlayer.baseState = 498269113; // Put base state to parachute, then to grapple to stop
        jcmp.localPlayer.baseState = 29430622; // Reset base state so they stop grappling
    }
}

function StopParachute(basestate, bits1, bits2)
{
    // If they are parachuting
    if (basestate == 498269113)
    {
        jcmp.localPlayer.baseState = 29430622; // Reset base state so they stop parachuting
    }
}

function StopWingsuit(basestate, bits1, bits2)
{
    if ((basestate == 2681816465 && bits1 == 1) || (basestate == 4257988886 && bits1 == 1)
    || (basestate == 3408730610 && bits1 == 9))
    {
        jcmp.localPlayer.baseState = 29430622; // Reset base state so they stop wingsuiting
    }
}