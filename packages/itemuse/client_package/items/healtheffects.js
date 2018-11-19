jcmp.current_healtheffects = null;

const healtheffects_ring = 
{
    dura_per_sec: 0.1, // How much durability is taken from the ring each second
    equipped: false,
    dura_mod: 0,
    old_health: 0,
    new_health: 0
}

jcmp.events.AddRemoteCallable('itemuse/healtheffects/set', (healthEffects) => 
{
    jcmp.current_healtheffects = JSON.parse(healthEffects);

    jcmp.localPlayer.healthEffects.regenCooldown = jcmp.current_healtheffects.regenCooldown;
    jcmp.localPlayer.healthEffects.regenRate = jcmp.current_healtheffects.regenRate;

    healtheffects_ring.equipped = jcmp.current_healtheffects.equipped;
})

jcmp.events.Add('LocalPlayerHealthChange', (old_health, new_health) => 
{
    healtheffects_ring.old_health = old_health;
    healtheffects_ring.new_health = new_health;

    if (!jcmp.current_healtheffects)
    {
        return;
    }

    if (new_health >= jcmp.current_healtheffects.maxRegen)
    {
        jcmp.localPlayer.healthEffects.regenRate = 0;
    }
    else if (new_health < jcmp.current_healtheffects.maxRegen)
    {
        jcmp.localPlayer.healthEffects.regenRate = jcmp.current_healtheffects.regenRate;

        if (healtheffects_ring.equipped 
            && new_health > old_health
            && new_health < old_health + jcmp.current_healtheffects.regenRate)
        {
            healtheffects_ring.dura_mod += healtheffects_ring.dura_per_sec;
        }

    }
})

jcmp.ui.AddEvent('SecondTick', (s) => 
{
    // Sync dura every 3 seconds
    if (s % 3 == 0 && healtheffects_ring.dura_mod > 0 && healtheffects_ring.equipped)
    {
        jcmp.events.CallRemote('itemuse/healtheffects/mod_ring_dura', Math.ceil(healtheffects_ring.dura_mod));
        healtheffects_ring.dura_mod = 0;
    }
})