# Discord Encryption
An experimental encryption solution for Discord using [BetterDiscord](https://github.com/rauenzi/BetterDiscordApp/releases)

## Features
Adds ability to encrypt / decrypt messages on discord using a set password
 - Utilizes AES-256 encryption via the [stanford javascript crypto library](https://github.com/bitwiseshiftleft/sjcl)
 - Per-chat PSK
 - PSK saved as md5 (cleartext passwords not present in localStorage)
 - Messages are decrypted the moment they are receved with little to no delay
 - Encrypted messages appear as green
 - Messages that fail to be decrypted (most likely due to an incorrect password) display a message and appear as red

![Context](https://i.imgur.com/aKGUqEn.png)
![Context](https://i.imgur.com/FqfRAAO.png)

## How to use
### Install
 - Install Discord
 - Install BetterDiscord
 - Navigate to Discord Preferences -> BD/Plugins -> Open Plugin Folder 
 - Place 'encryption.plugin.js' in BetterDiscord's plugin folder 
 - Enable encryption in the BD/Plugins preference pane.


![Context](https://i.imgur.com/H2Z7N7I.png)
![Context](https://i.imgur.com/Ea0AdqO.png)
### Usage
 - To toggle the encryption simply click the lock icon. You will be prompted for a password, if none is found for the chat channel.
 - Received messages are decrypted automatically
 - To view or change the encryption password simply right-click the lock icon and an input box will appear - passwords are automatically saved as you type

![Context](https://i.imgur.com/Zumi9SZ.png)

## Bugs


### Encrypted Message
![Context](https://i.imgur.com/s8CYNJK.png)

### Decrypted Message
![Context](https://i.imgur.com/CCqW5aj.png)
