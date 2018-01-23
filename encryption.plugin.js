//META{"name":"encryption"}*//

class encryption {
    load() {
		//  add crypto lib + some useful functions
        $("head").append(`
			<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/sjcl/1.0.7/sjcl.min.js"></script>
			<script type="text/javascript" src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>
		`);
    }

    stop() {

    }

    start() {

        console.clear();

        //  encryption / decryption password
        window.shared_password = "CHANGE ME!";
		
		//  make encrypted messages appear green
		$("head").append(`
		  <style type="text/css">
		    .decrypted {
			  color: #43b581 !important;
			}
			.not-decrypted {
			  color: #FF2949 !important;
			}
			svg[class*=attachButton] {
			  position: relative;
			  margin-right: 10px;
			}

			.encryptionButton {
			  position: relative;
			  cursor: pointer;
			  padding: 9px 0px;
			  padding-left: 2px;
			  -webkit-transition: all 280ms ease;
			  transition: all 280ms ease;
			}
			.encryptionButton:hover path {
			  fill: #fff;
			}
		  </style>
		`);

    }

    observer({addedNodes}) {
        if (addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('chat') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('markup') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('message') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('hide-overflow') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {

            //  encrypt message using set password - add an encryption prefix for identification
            function msg_enc(msg_original) {
                var msg_enc = sjcl.encrypt(shared_password, msg_original, {count:2048, ks:256}),
                    msg_final = "--aes256-encrypted-message--" + String(msg_enc);
                return msg_final;
            }

            //  decrypt message using set password
            function msg_dec(msg_enc) {
				try {
					return sjcl.decrypt(shared_password, msg_enc, {count:2048, ks:256});
				}
				catch (error) {
					return "<span class='not-decrypted'>Oh no! this message failed to be decrypted</span>";
				}
            }

            //  decrypt all messages
            function decrypt_all_msg() {
                $(".markup").each(function() {
                    var msg = $(this).text().trim();
                    if (msg.substring(0, 28) == "--aes256-encrypted-message--") {
                        var msg_enc = msg.substring(28, msg.lastIndexOf("}") + 1);
                        $(this).html(msg_dec(msg_enc)).addClass("decrypted");
                    }
                });
            }
            decrypt_all_msg();
			
			//  add encryption button - click to encrypt / decrypt message
			function add_encryption_button() {
				if (document.getElementById("encryptionButton") == null || document.getElementById("encryptionButton") == undefined) {
					$('svg[class*=attachButton]').after(`
						<svg id="encryptionButton" class="encryptionButton" style="width:24px;height:24px" viewBox="0 0 24 24">
							<path fill="#888" d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M8.9,6C8.9,4.29 10.29,2.9 12,2.9C13.71,2.9 15.1,4.29 15.1,6V8H8.9V6M16,16H13V19H11V16H8V14H11V11H13V14H16V16Z" />
						</svg>
					`);
	
					$(".encryptionButton").click(function() {
						if ($("textarea").val().substring(0, 28) == "--aes256-encrypted-message--") {
							var msg = $("textarea").val().substring(28),
								textarea = document.querySelector(".channelTextArea-1HTP3C textarea"),
								textareaInstance = BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "name":"ChannelTextAreaForm", "up":true});	
							textareaInstance.setState({textValue:msg_dec(msg)});
						} else {
							var msg = $("textarea").val(),
								textarea = document.querySelector(".channelTextArea-1HTP3C textarea"),
								textareaInstance = BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "name":"ChannelTextAreaForm", "up":true});
							textareaInstance.setState({textValue:msg_enc(msg)});
						}
					});
				}
			}
			add_encryption_button();
			
			$(".channel, .containerDefault-7RImuF").click(function() {
				setTimeout(function(){
					add_encryption_button();
				}, 88);
			});
			
        }
    }

    getName() {
        return 'Encryption';
    }

    getAuthor() {
        return 'HMerritt';
    }

    getVersion() {
        return '1.1.1';
    }

    getDescription() {
        return 'aes-256 encryption';
    }
};
