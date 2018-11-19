$(document).ready(function() 
{
    let show = false;

    $(window).keyup(function (e) 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == 115) // F4
        {
            show = !show;
            
            jcmp.CallLocalEvent("open-discord", show);

            if (show)
            {
                jcmp.ShowCursor();
            }
            else
            {
                jcmp.HideCursor();
            }
        }
    });

    jcmp.AddEvent('toggle-cursor', (showing) => 
    {
        if (showing)
        {
            jcmp.ShowCursor();
        }
        else
        {
            jcmp.HideCursor();
        }
    })
});