$(document).ready(function() 
{
    //$('.window').draggable({handle: ".title", disabled: false});
    
    let open = false;

    if (!open)
    {
        $('.window').fadeOut(1);
    }

    $('div.received').fadeOut(1);

    $('html').css('visibility', 'visible');
    
    // Make X red when hovered
    $(".close-icon").hover(function()
    {
        $("#close-button").css("color", "red");
    }, function()
    {
        $("#close-button").css("color", "white");
    });

    // Close window when X is pressed
    $(".close-icon").click(function()
    {
        ToggleOpen();
    });

    // Submit was pressed
    $("button").click(function()
    {
        ToggleOpen();

        const option = $('select').val().trim();
        const details = $('textarea').val().trim();

        if (option.length > 3 && details.length > 10)
        {
            jcmp.CallEvent('report/submit', option, details);
        }
        
    });

    function ToggleOpen()
    {
        open = !open;
        if (open) 
        {
            $('.window').css('visibility', 'visible');
            $('.window').fadeIn(1);
            jcmp.ShowCursor(); 
        } 
        else 
        {
            $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden');});
            jcmp.HideCursor();
        }
        jcmp.CallEvent('report/ToggleOpen', open);
    }

    jcmp.AddEvent('report/open', (msg) => 
    {
        $('textarea').val(msg); // Clear text area

        ToggleOpen();
    })

    jcmp.AddEvent('report/success', () => 
    {
        $('div.received').fadeIn(1000);

        setTimeout(function() 
        {
            $('div.received').fadeOut(1000);
        }, 7000);
    })

    jcmp.CallEvent('report/Ready');

})
