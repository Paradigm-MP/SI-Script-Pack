const center = new Vector3f(3422.76318359375, 1033.217041015625, 1329.4124755859375);
const radius = 100;
const height = 100;
const max_height = height + center.y;

const nz_pos = new Vector3f(3527.00830078125, 1158.5384521484375, 1013.8731689453125);
const nz_radius = 600;

const safezone_expulsion_multiplier = 10;
let backward = new Vector3f(0, 0, 1);

// Do not drop items or lose exp while in neutralzone or safezone
jcmp.in_neutralzone = function(player)
{
    if (dist(nz_pos, player.position) < nz_radius)
    {
        return true;
    }
}

const watchlist = [];

jcmp.events.AddRemoteCallable('safezone/enter', (player) => 
{
    const player_pos = player.position;
    const d = dist(player_pos, center);

    if (d < radius * 1.1 && player_pos.y < max_height * 1.1)
    {
        player.invulnerable = true;
		player.in_safezone = true;
		player.safezone_timestamp = new Date().getSeconds();
		if (player.vehicle)
		{
			player.enter_velocity = player.vehicle.linearVelocity;
		}
		
		if (player.vehicle)
		{
			player.vehicle_linear_velocity = player.vehicle.linearVelocity;
		}
		
    }

    watchlist[player.networkId] = player;

})

jcmp.events.AddRemoteCallable('safezone/exit', (player) => 
{
    const player_pos = player.position;
    const d = dist(player_pos, center);

    if (d > radius || player_pos.y > max_height)
    {
        player.invulnerable = false;
		player.in_safezone = false;

        if (watchlist[player.networkId])
        {
            delete watchlist[player.networkId];
        }
    }

})

setInterval(function(){
	watchlist.forEach(function(player)
	{
		if (player && player.c && player.name && player.in_safezone && player.vehicle)
		{
			let v = player.vehicle;
			if (!player.enter_velocity) {player.enter_velocity = v.linearVelocity;}
			
			const current_time = new Date().getSeconds();
			let elapsed_time = Math.abs(current_time - player.safezone_timestamp)
			let max_speed = Math.pow(2, 15); //Max safe integer
			let enter_velocity = player.vehicle_linear_velocity || player.vehicle.linearVelocity;
			
			//create vector in direction of movement with length 1
			//let v_in_dir = new Vector3f(enter_velocity.x / v.linearVelocity.length, 
			//							enter_velocity.y / v.linearVelocity.length, // this arg could also be 0 if no y-axis movement
			//							-enter_velocity.z / v.linearVelocity.length); // just changed this to -
			//create new movement vector
			//let v_new = new Vector3f(enter_velocity.x + (v_in_dir.x * (safezone_expulsion_multiplier * elapsed_time)),
			//						enter_velocity.y + (v_in_dir.y * (safezone_expulsion_multiplier * elapsed_time)),
			//						-enter_velocity.z + (v_in_dir.z * (safezone_expulsion_multiplier * elapsed_time)));
			//check if vector length is in maxSpeed range to avoid overflow/loss of accuracy
			
			//let angle = angle_from_vectors(player.vehicle.position, center);
			
			//let backward_vector = new Vector3f(0, 0, -safezone_expulsion_multiplier * elapsed_time);
			
			//let linear_velocity = vq(backward_vector, angle);
			let vel = v.linearVelocity;
			
			let linear_velocity = new Vector3f(vel.x / vel.length, vel.y / vel.length, vel.z / vel.length);
			
			if (same_sign(linear_velocity.x, enter_velocity.x)) {linear_velocity.x = linear_velocity.x * -1;}
			if (same_sign(linear_velocity.z, enter_velocity.z)) {linear_velocity.z = linear_velocity.z * -1;}
			
			linear_velocity = normalize(linear_velocity);
			
			let dist = center.sub(player.position).length
			if (dist < 0 )
			{
				//console.log("dist < 0, adjust values")
			}
			linear_velocity.x = linear_velocity.x * (150 - dist);
			linear_velocity.y = (player.position.y - center.y) > 0 ? player.position.y - center.y : 0;
			linear_velocity.z = linear_velocity.z * (150 - dist);

			
			v.linearVelocity = linear_velocity;
			
			//jcmp.debug("linear velocity set to: (" + linear_velocity.x + ", " + linear_velocity.y + ", " + linear_velocity.z + ")");
		}
	})
}, 450); // ????????????????????????????????? change?

function same_sign(n1, n2)
{
	if (n1 > 0 && n2 > 0) return true;
	if (n1 < 0 && n2 < 0) return true;
	return false;
}


function angle_from_vectors(v1, v2)
{
	//return Math.acos(dot_product(normalize(v1), normalize(v2)));
	let direction = new Vector3f();
	direction = v1.sub(v2); // subtract the vectors  -- or is it the other way around?
	return normalize(direction); // normalize it
}

function dot_product(v1, v2)
{
	return ((v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z));
}

function vq(v,q)
{
    return vx(vy(v, q), q);
}

function vy(v,q)
{
    return new Vector3f(v.x * Math.cos(q.y) + v.z * Math.sin(q.y),
        v.y,
        -v.x * Math.sin(q.y) + v.z * Math.cos(q.y));
}

function vx(v,q)
{
    return new Vector3f(v.x,
        v.y * Math.cos(q.x) + v.z * Math.sin(q.x),
        v.y * Math.sin(q.x) - v.z * Math.cos(q.x));
}

function normalize(v)
{
	return new Vector3f(v.x / v.length, v.y / v.length, v.z / v.length);
}

setInterval(function() 
{
    watchlist.forEach(function(player) 
    {
        if (!player || !player.c || !player.name)
        {
            delete watchlist[player.networkId];
            return;
        }

        const player_pos = player.position;
        const d = dist(player_pos, center);

        if (d < radius && player_pos.y < max_height)
        {
            player.invulnerable = true;
        }
        else if (d > radius || player_pos.y > max_height)
        {
            player.invulnerable = false;
            delete watchlist[player.networkId];
        }
    });
}, 500);


// Vector 2 distance
function dist(v1, v2)
{
    const vec1 = new Vector3f(v1.x, 0, v1.z);
    const vec2 = new Vector3f(v2.x, 0, v2.z);
    return vec1.sub(vec2).length;
}

