

// map max to min: -16,384, 16,384

//this is the bounds we use on the server math::Vector3f(-30000, -950, -30000), math::Vector3f(30000, 15000, 30000)

const PImage = require('pureimage');
const fs = require('fs');

function CreateImage(positions, file_name)
{
    return new Promise((resolve, reject) => 
    {
        PImage.decodeJPEGFromStream(fs.createReadStream(__dirname + '/../imgs/base.jpg')).then((img) =>
        {
            const c = img.getContext('2d');

            for (let i = 0; i < positions.length; i++)
            {
                const point = ConvertIngame2Img(positions[i]);

                c.fillStyle = '#3AE877';
                c.beginPath();
                c.arc(point.x, point.y, 4, 0, Math.PI * 2);
                c.closePath();
                c.fill();
            }

            const stream = fs.createWriteStream(__dirname + `/../imgs/${file_name}.jpg`); // IMPORTANT!!!
            PImage.encodeJPEGToStream(img, stream).then(() => 
            {
                stream.end(); // IMPORTANT!!!
                resolve();
            });
        })
    });

}

function ConvertIngame2Img(pos)
{
    return {
        x: ((pos.x + 16384) / 32768) * 1024, 
        y: ((pos.z + 16384) / 32768) * 1024 
        //r: (radius / 32768) * 1024
    };
}

module.exports = 
{
    CreateImage
}