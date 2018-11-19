$(document).ready(function() 
{
    //jcmp.CallLocalEvent('ready');
    $('div.container').css('animation', 'none');
    jcmp.AddEvent('show', () => 
    {
        $('div.container').css('animation', 'flash 1s ease-in-out infinite');
    })

    jcmp.AddEvent('hide', () => 
    {
        $('div.container').css('animation', 'none');
    })
})
