//META{"name":"encryption"}*//
class encryption {
    load() {

        //  add crypto lib + some useful functions
        $("head").append(`
      			<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/sjcl/1.0.7/sjcl.min.js"></script>
      			<script type="text/javascript" src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>
		    `);

    }

    stop() {}

    start() {

        console.clear();

        //  load password from local storage
        function load_password() {
            var localStorageEncryption = localStorage.discordEncryption ? JSON.parse(localStorage.discordEncryption) : {};
            return localStorageEncryption["password"];
        }

        //  set encryption / decryption password
        try {
            window.shared_password = load_password();
            if (shared_password == null || shared_password == undefined) throw "error";
        } catch (error) {
            window.shared_password = "";
        }

        //  inject styles
        $("head").append(`
      		  <style type="text/css">
      		    .decrypted {
      			  color: #43b581 !important;
      			}
      			.decrypted a {
      			  color: #1C9C6D !important;
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
      			#encryptionInput {
      			  position: absolute;
      			  top: -10px;
      			  left: 0px;
      			  width: 280px;
      			  height: 40px;
      			  overflow: hidden;
      			  border-radius: 5px;
      			  background-color: #FF2949;
      			  -webkit-transition: all 280ms ease 10ms;
      					  transition: all 280ms ease 10ms;
      			}
      			#encryptionInput.open {
      				top: -28px;
      			}

      			#encryptionInput svg {
      			  position: absolute;
      			  cursor: pointer;
      			  top: 8px;
      			  left: 10px;
      			  z-index: 1;
      			}

      			#encryptionInput input {
      			  position: absolute;
      			  top: 0px;
      			  left: 34px;
      			  width: 100%;
      			  height: 100%;
      			  border: none;
      			  text-indent: 4px;
      			  border-radius: 5px;
      			  background-color: #FF2949;
      		   	  -webkit-transition: all 280ms ease;
      				      transition: all 280ms ease;
      			  outline: 0px !important;
      			  -webkit-appearance: none;
      			  -webkit-box-shadow: none;
        			          box-shadow: none;
      			  resize: none;
      			  color: #ddd;
      			  font-size: .88em;
      			  padding: 1px 8px;
      			  white-space: nowrap;
      			}
      			#encryptionInput.nice-password,
      			#encryptionInput.nice-password input {
      			  background-color: rgb(67, 181, 129);
      			}

      			@keyframes fadeInUp {
      				from {
      					transform: translate3d(0,-6px,0)
      				}

      				to {
      					transform: translate3d(0,-16px,0);
      					opacity: 1
      				}
      			}
      			@-webkit-keyframes fadeInUp {
      				from {
      					transform: translate3d(0,-6px,0)
      				}

      				to {
      					transform: translate3d(0,-16px,0);
      					opacity: 1
      				}
      			}
      			@keyframes fadeOutDown {
      				from {
      					transform: translate3d(0,-16px,0);
      				}

      				to {
      					transform: translate3d(0,-6px,0);
      					opacity: 0;
      				}
      			}
      			@-webkit-keyframes fadeOutDown {
      				from {
      					transform: translate3d(0,-16px,0);
      				}

      				to {
      					transform: translate3d(0,-6px,0);
      					opacity: 0;
      				}
      			}

      			.animated {
      				animation-duration: 280ms;
      				animation-fill-mode: both;
      				-webkit-animation-duration: 280ms;
      				-webkit-animation-fill-mode: both;
      			}

      			.fadeInUp {
      				opacity: 0;
      				animation-name: fadeInUp;
      				-webkit-animation-name: fadeInUp;
      			}
      			.fadeOutDown {
      				opacity: 1;
      				animation-name: fadeOutDown;
      				-webkit-animation-name: fadeOutDown;
      			}
      		  </style>
		    `);

    }

    observer({addedNodes}) {

        if (addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('chat') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('markup') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('message') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('message-sending') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('hide-overflow') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {

            //  load password from local storage
            function load_password() {
                var localStorageEncryption = localStorage.discordEncryption ? JSON.parse(localStorage.discordEncryption) : {};
                return localStorageEncryption["password"];
            }

            //  encrypt message using set password - add an encryption prefix for identification
            function msg_enc(msg_original) {
                var msg_enc = sjcl.encrypt(shared_password, msg_original, {
                        count: 2048,
                        ks: 256
                    }),
                    msg_final = "--aes256-encrypted-message--" + String(msg_enc);
                return msg_final;
            }

            //  detect URLs in plain text and replace with links
            function replaceURLWithHTMLLinks(text) {
                var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                return text.replace(exp, "<a href='$1' target='_blank'>$1</a>");
            }

            //  decrypt message using set password
            function msg_dec(msg_enc) {
                try {
                    return replaceURLWithHTMLLinks(sjcl.decrypt(shared_password, msg_enc, {
                        count: 2048,
                        ks: 256
                    }));
                } catch (error) {
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

            //  toggle input for encryption password change
            function encryption_input_toggle(toggle) {
                if (toggle == "show" || toggle == "" && $("#encryptionInput").length == 0) {
                    if ($("#encryptionInput").length == 0) {
                        $('form').append(`
              							<div id="encryptionInput" class="encryptionInput animated fadeInUp">
              								<svg style="width:24px;height:24px" viewBox="0 0 24 24">
              									<path fill="#ddd" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
              								</svg>
              								<input placeholder="Encryption password" type="password">
              								<script>
              									$("#encryptionInput input").val(shared_password);

              									//  save password to local storage
              									function save_password(password) {
              										var objPassword = {"password": password};
              										localStorage.discordEncryption = JSON.stringify(objPassword);
              										shared_password = password;
              									}
              									//  load password from local storage
              									function load_password() {
              										var localStorageEncryption = localStorage.discordEncryption ? JSON.parse(localStorage.discordEncryption) : {};
              										return localStorageEncryption["password"];
              									}

              									function encrtption_password_check() {
              										if ($("#encryptionInput input").val().length < 3) {
              											$("#encryptionInput").removeClass("nice-password");
              										} else {
              											$("#encryptionInput").addClass("nice-password");
              											save_password($("#encryptionInput input").val());
              										}
              									}
              									encrtption_password_check();
              									$("#encryptionInput input").keyup(function() {
              										encrtption_password_check();
              									});

              									$("#encryptionInput svg").click(function() {
              										if ($("#encryptionInput input").attr("type") == "password") {
              												$("#encryptionInput input").attr("type", "text");
              												$("#encryptionInput svg path").attr("d", "M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z");
              										} else {
              											$("#encryptionInput input").attr("type", "password");
              											$("#encryptionInput svg path").attr("d", "M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z");
              										}
              									});
              								</script>
              							</div>
          					    `);
                    }
                } else {
                    $("#encryptionInput").removeClass("fadeInUp").addClass("fadeOutDown");
                    setTimeout(function() {
                        $("#encryptionInput").remove();
                    }, 288);
                }
            }

            //  add encryption button - click to encrypt / decrypt message
            function add_encryption_button() {
                if (document.getElementById("encryptionButton") == null || document.getElementById("encryptionButton") == undefined) {
                    $('svg[class*=attachButton]').after(`
            						<svg id="encryptionButton" class="encryptionButton" style="width:24px;height:24px" viewBox="0 0 24 24">
            							<path fill="#888" d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M8.9,6C8.9,4.29 10.29,2.9 12,2.9C13.71,2.9 15.1,4.29 15.1,6V8H8.9V6M16,16H13V19H11V16H8V14H11V11H13V14H16V16Z" />
            						</svg>
                    `);

                    $(".encryptionButton").click(function() {
                        if ($("textarea").val().length < 1) {
                          if ($("#encryptionInput").length < 1) {
                              encryption_input_toggle("show");
                          } else {
                              encryption_input_toggle("hide");
                          }
                        } else {
                            if ($("textarea").val().substring(0, 28) == "--aes256-encrypted-message--") {
                                var msg = $("textarea").val().substring(28),
                                    textarea = document.querySelector("textarea"),
                                    textareaInstance = BDfunctionsDevilBro.getOwnerInstance({
                                        "node": textarea,
                                        "name": "ChannelTextAreaForm",
                                        "up": true
                                    });
                                textareaInstance.setState({
                                    textValue: msg_dec(msg)
                                });
                            } else {
                                var msg = $("textarea").val(),
                                    textarea = document.querySelector("textarea"),
                                    textareaInstance = BDfunctionsDevilBro.getOwnerInstance({
                                        "node": textarea,
                                        "name": "ChannelTextAreaForm",
                                        "up": true
                                    });
                                textareaInstance.setState({
                                    textValue: msg_enc(msg)
                                });
                            }
                        }
                    });

                    if (shared_password.length < 3) {
                        encryption_input_toggle("show");
                    }
                    $(".encryptionButton").bind("contextmenu", function(e) {
                        e.preventDefault();
                        encryption_input_toggle("");
                    });
                }
            }
            add_encryption_button();

            $(".guild, .channel, .containerDefault-1ZnADq").click(function() {
                encryption_input_toggle("hide");
                setTimeout(function() {
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
        return '1.3.0';
    }

    getDescription() {
        return 'aes-256 encryption';
    }
};
