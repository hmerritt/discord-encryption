# Discord Encryption
An experimental encryption solution for Discord using [BetterDiscord](https://github.com/jiiks/betterdiscordapp)

## Features
Adds ability to encrypt / decrypt messages on discord using a set password
 - Utilizes AES-256 encryption via the [stanford javascript crypto library](https://github.com/bitwiseshiftleft/sjcl)
 - Encrypted messages appear as green
 - Messages that fail to be decrypted (most likely due to an incorrect password) display a message and appear as red

![Context](https://i.imgur.com/aKGUqEn.png) 
![Context](https://i.imgur.com/XB6lcpU.png)

## How to use
### Install
 - Place 'enctyption.plugin.js' in BetterDiscord's plugin folder and then enable it in the settings
 - Open 'enctyption.plugin.js' and set your custom password (receiver of encrypted messages will also need this password). If this password is changed all previous encrypted messages will be lost.
 
![Context](https://i.imgur.com/YZRCAo1.png)
### Usage
 - To encrypt a message simpily right click the textarea (the message) and the message will be replaced in its encrypted form
 - Receved messages are decrypted automatically
 
## IMPORTANT
This plugin is still in early development and noticeable bugs will most likely appear
 - Once a message is encrypted in the textarea you MUST press the space key before sending the message otherwise the unencrypted message will be sent
 - On right click Discord also opens a "paste" option alongside encrypting the message which makes for a less seamless experiance

### Encrypted Message
![Context](https://i.imgur.com/s8CYNJK.png)

### Decrypted Message
![Context](https://i.imgur.com/CCqW5aj.png)
