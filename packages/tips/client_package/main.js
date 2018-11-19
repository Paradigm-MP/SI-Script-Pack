const INTERVAL = 5;
let enabled = false;

const tips = [
    {
        title: 'Press G to open your inventory',
        subtitle: 'Your inventory contains all of your supplies necessary for survival.'
    },
    {
        title: 'Press T to open the chat',
        subtitle: 'The chat is a great way to interact with players and set up trades.'
    },
    {
        title: 'Purchasing Vehicles',
        subtitle: 'To purchase a vehicle, enter it when you have enough Bavarium.'
    },
    {
        title: 'If you die...',
        subtitle: `You'll lose some experience and drop some items from your inventory.`
    }
]

jcmp.ui.AddEvent('MinuteTick', (minutes) => 
{
    if (minutes % INTERVAL == 0 && jcmp.loading == 0 && enabled)
    {
        const tip = tips[Math.floor(Math.random() * tips.length)];
        jcmp.notify({
            title: tip.title,
            subtitle: tip.subtitle,
            preset: 'tip'
        })
    }
})

jcmp.events.AddRemoteCallable('tips/enable_beginner', () => 
{
    enabled = true;
})