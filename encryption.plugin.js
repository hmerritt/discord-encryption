//META{"name":"encryption"}*//

class encryption {
	load() {
        $("head").append('<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/sjcl/1.0.7/sjcl.min.js"></script>');
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
		  </style>
		`);

	}

	observer({ addedNodes }) {
		if(addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('chat')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('markup')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('message')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('hide-overflow')
		|| addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {

			//  encrypt message using set password - add an encryption prefix for identification
			function msg_enc(msg_original) {
			    var msg_enc = sjcl.encrypt(shared_password, msg_original, {count: 2048, ks: 256}),
			        msg_final = "--aes256-encrypted-message--" + String(msg_enc);
			    return msg_final;
			}

			//  decrypt message using set password
			function msg_dec(msg_enc) {
			    return sjcl.decrypt(shared_password, msg_enc, {count: 2048, ks: 256});
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

            		//  encrypt message by right click of the textarea
            		$('textarea').on('contextmenu', function(e) {
                	    if ($("textarea").val().length > 0) {
                    	        e.preventDefault();
                    	        if ($("textarea").val().substring(0, 28) == "--aes256-encrypted-message--") {
                                    var msg = $("textarea").val().substring(28);
                        	    $("textarea").val(msg_dec(msg));
                    	        } else {
                        	    var msg = $("textarea").val();
                        	    $("textarea").val(msg_enc(msg));
                                }
                            }
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
		return '0.0.7';
	}

	getDescription() {
		return 'aes-256 encryption - beta state';
	}
};
