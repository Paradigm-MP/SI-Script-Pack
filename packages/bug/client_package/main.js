let ui;

jcmp.events.Add('load/ready', () => 
{
    ui = new WebUIWindow("bug_display", `${jcmp.resource_path}bug/ui/index.html${jcmp.GRPQ()}`, new Vector2(625, 416));
    ui.autoRenderTexture = false;
})

let m = new Matrix().Translate(new Vector3f(3520, 1085, 865.25));
m = m.Rotate(-0.785, new Vector3f(0, 1, 0));

jcmp.events.Add("GameUpdateRender", (renderer) => {
    if (!ui) {return;}
    renderer.SetTransform(m);
    renderer.DrawTexture(ui.texture, new Vector3f(6.5, -0.7, -2.33), new Vector2f(12, 4));
});