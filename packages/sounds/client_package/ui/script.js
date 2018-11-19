$(document).ready(function() 
{
    //const base_path = 'MY RESOURCE PATH/resources/sounds/ui/';
    const base_path = '';

    jcmp.AddEvent('sound/Play', (soundname, volume) => 
    {
        const audio = new Audio(base_path + soundname);
        audio.volume = volume;
        audio.play();

        setTimeout(() => {
            audio.remove();
        }, audio.duration * 1000);
    })
})
