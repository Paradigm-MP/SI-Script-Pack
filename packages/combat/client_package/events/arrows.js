jcmp.events.AddRemoteCallable('combat/arrow/sync', (data) => 
{
    data = JSON.parse(data);
    data.pos = new Vector3f(data.pos.x, data.pos.y, data.pos.z);
    arrows.push(data);
})

jcmp.events.AddRemoteCallable('combat/arrow/remove', (id) => 
{
    arrows = arrows.filter((arrow) => arrow.id != id);
})

let arrows = [];
const size2 = new Vector2f(20, 20);

const arrow_tex = new Texture(`package://combat/events/arrow.png`);
const size = new Vector2f(2.5, 3);
const up = new Vector3f(0, 0, 0);
const up2 = new Vector3f(0, 1, 0);
const up3 = new Vector3f(0, size.y + 0.2, 0);
const rotate = new Vector3f(1, 0, 0);
const rotate2 = new Vector3f(0, 1, 0);
const adj = new Vector3f(0,0,0);
const red = new RGBA(255,0,0,255);
const zero = new Vector3f(0,0,0);
const max_size = new Vector2f(10000, 10000);
const pos_adj = new Vector3f(-size.x / 2, 0, 0);
const font_size = 75;
const scale = new Vector3f(0.005, 0.005, 0.005);

jcmp.events.Add('GameUpdateRender', (r) => 
{
    const cam = jcmp.localPlayer.camera.position;

    for (let i = 0; i < arrows.length; i++)
    {
        const arrow = arrows[i];
        RenderArrow(r, arrow, cam);
    }
})

function RenderArrow(r, arrow, cam)
{
    if (!arrow.matrix)
    {
        arrow.matrix = new Matrix().Translate(arrow.pos.add(up).add(pos_adj)).Rotate(Math.PI, rotate);
        arrow.text_matrix = new Matrix().Translate(arrow.pos.add(up3));
        arrow.text_size = r.MeasureText(arrow.name, font_size, 'Arial');
        arrow.text_translate = new Vector3f((-arrow.text_size.x / 2) * scale.x, (arrow.text_size.y / 2) * scale.x, 0);
    }

    const text_matrix = arrow.text_matrix.LookAt(arrow.text_matrix.position, cam, up2).Translate(arrow.text_translate).Scale(scale);

    r.SetTransform(text_matrix);
    r.DrawText(arrow.name, zero, max_size, red, font_size, 'Arial');

    r.SetTransform(arrow.matrix);
    r.DrawTexture(arrow_tex, adj, size);
}