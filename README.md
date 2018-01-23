# Discord Encryption
An experimental encryption solution for Discord using [BetterDiscord](https://github.com/jiiks/betterdiscordapp)

## Features
Adds ability to encrypt / decrypt messages on discord using a set password
 - Utilizes AES-256 encryption via the [stanford javascript crypto library](https://github.com/bitwiseshiftleft/sjcl)
 - Messages are decrypted the moment they are receved with little to no delay
 - Encrypted messages appear as green
 - Messages that fail to be decrypted (most likely due to an incorrect password) display a message and appear as red

![Context](https://i.imgur.com/aKGUqEn.png) 
![Context](https://i.imgur.com/FqfRAAO.png)

## How to use
### Install
 - Place 'enctyption.plugin.js' in BetterDiscord's plugin folder and then enable it in the settings
 - Open 'enctyption.plugin.js' and set your custom password (receiver of encrypted messages will also need this password). If this password is changed all previous encrypted messages will be lost.
 
![Context](https://i.imgur.com/YZRCAo1.png)
### Usage
 - To encrypt a message simpily click the added lock button in the message bar and the message will be replaced in its encrypted form
 - Receved messages are decrypted automatically
 
![Context](https://i.imgur.com/Zumi9SZ.png)
 
## IMPORTANT
This plugin is still in early development and noticeable bugs will most likely appear
 - On start the lock button may not appear - to solve this just open another channel and reopen the desired chat and the button should reinitialize 

### Encrypted Message
![Context](https://i.imgur.com/s8CYNJK.png)

### Decrypted Message
![Context](https://i.imgur.com/CCqW5aj.png)
