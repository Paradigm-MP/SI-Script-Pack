# jc3mp-warpgui
Simple GUI to warp to other players.

## Installation
Just drop it in your packages directory, and you're done!

If you want to add yourself as an admin, you can do so in the config.

### Notes
 - Only admins can see and use the `Warp Here` button which warps players to your position.
 - If you want to make it only usable by admins, set `admin_only` to true in the config.
 - You can change the default open key in the config. If you do this, please be sure to edit the chat messages that tell people to open it as well.
 - If a player tries to warp to another player, the other player must accept. Admins do not have to wait for players to accept.
 - Requires [chat](https://gitlab.nanos.io/jc3mp-packages/chat).
