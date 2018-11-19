let num_afks = 0;
const MAX_AFKS = 10; // Minutes of afk until they are kicked

jcmp.ui.AddEvent('KeyPress', () => 
{
    num_afks = 0;
})

jcmp.ui.AddEvent('MinuteTick', (minutes) => 
{
    num_afks++;

    if (num_afks >= MAX_AFKS)
    {
        jcmp.events.CallRemote('afk/kick');
    }
    else if (num_afks == MAX_AFKS - 1)
    {
        jcmp.notify({
            title: 'AFK Warning',
            subtitle: 'You are going to be kicked from the server if you do not move soon.',
            preset: 'warn_red',
            time: 45000
        })
    }
    else if (num_afks == MAX_AFKS - 2)
    {
        jcmp.notify({
            title: 'AFK Warning',
            subtitle: 'Are you still there? Let us know by moving around.',
            preset: 'warn',
            time: 45000
        })
    }
})