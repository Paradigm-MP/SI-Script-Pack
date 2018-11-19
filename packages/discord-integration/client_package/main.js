const keycatch_ui = new WebUIWindow("discord-keycatch", "package://discord-integration/ui/index.html", new Vector2(1,1));
keycatch_ui.hidden = true;

let ui = null;
const size = 200;

keycatch_ui.AddEvent('open-discord', (toggle) => 
{
	jcmp.localPlayer.controlsEnabled = !toggle;
	//jcmp.localPlayer.frozen = toggle;
	jcmp.events.Call('disable_menus', !toggle);

	if (toggle)
	{
		const ui_size = new Vector2(Math.round(jcmp.viewportSize.x - size), Math.round(jcmp.viewportSize.y - size));
		const ui_position = new Vector2(Math.round(size / 2), Math.round(size / 2));

		ui = new WebUIWindow(`discord-join`, "https://discord.gg/z9Q8KPJ", ui_size);
		ui.position = ui_position;
		ui.autoResize = true;
		ui.BringToFront();
	} 
	else 
	{
		if (ui) 
		{
			ui.Destroy();
			ui = null;
		}
	}
});
