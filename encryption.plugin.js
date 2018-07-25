//META{"name":"encryption"}*//
class encryption {



    load() {


        //  add crypto lib + some useful functions
        $("head").append(`
      			<script type="text/javascript" src="https://harrymerritt.me/custom_styles/sjcl.php"></script>
      			<script type="text/javascript" src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>
		    `);


        //  load local storage
        window.encryptionStorage = localStorage.discordEncryption ? JSON.parse(localStorage.discordEncryption) : {};


    }



    stop() {}



    start() {


//        console.clear();
        this.attachHandler();


        //  get encryption password
        //  if any errors - set to nothing
        try {

            //  get password from storage
            window.password = encryptionStorage['password'];

            //  if empty - throw an error
            if (password == null || password == undefined) throw 'Password is empty';

        } catch (error) {

            //  set password to nothing
            window.password = '';

            //  log any errors
            console.error('[Encryption] Error retrieving password (' + error + ')');

        }

        //  get encryption state
        //  if empty - set to off
        window.encryptionState = encryptionStorage['state'];
    		if (encryptionState == null || encryptionState == undefined) encryptionState = 'off';



        //  inject styles
        $('head').append(`
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

              .encryptionButton[state=on] path {
                fill: #43b581;
              }
              .encryptionButton[state=off] path {
                fill: #888;
              }

              .encryptionButton[state=on]:hover path {
                fill: #1C9C6D;
              }
              .encryptionButton[state=off]:hover path {
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



        //  icon

        function setButtonState() {
            //  toggle encryption state
            if (encryptionState == 'on') {
                $('.encryptionButton').attr('state', 'on').find('path').attr('fill', '#43b581');
            } else {
                $('.encryptionButton').attr('state', 'off').find('path').attr('fill', '#888');
            }
        }


        //  add encryption button - click to encrypt / decrypt message
        function addButton() {
            if (document.getElementById('encryptionButton') == null ||
                document.getElementById('encryptionButton') == undefined) {

                //  add button to html
                $('button.da-attachButton').after(`
                    <svg id="encryptionButton" class="encryptionButton" state="${encryptionState}" style="width:24px;height:24px;padding-right:8px;" viewBox="0 0 24 24">
                      <path fill d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M8.9,6C8.9,4.29 10.29,2.9 12,2.9C13.71,2.9 15.1,4.29 15.1,6V8H8.9V6M16,16H13V19H11V16H8V14H11V11H13V14H16V16Z" />
                    </svg>

                    <script type='text/javascript'>
                        //  save password to local storage
                        window.localStorageSave = function(encryptionStorage) {
                            try {
                                localStorage.discordEncryption = JSON.stringify(encryptionStorage);
                            } catch (error) {
                                console.error('[Encryption] Error saving to local storage (' + error + ')');
                            }
                        }
                    </script>
                `);

                setButtonState();

                //  if Encryption password is empty - show input
                if (password.length < 3) {
                    toggleInput('show');
                }

            }
        }

        //  toggle input for encryption password change
        function toggleInput(action) {
            if (action == 'show' ||
                action == '' &&
                $('#encryptionInput').length == 0) {
                $('form').append(`
                    <div id="encryptionInput" class="encryptionInput animated fadeInUp">
                        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                            <path fill="#ddd" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                        </svg>
                        <input placeholder="Encryption password" type="password">
                    </div>
                `);
            } else {
                $('#encryptionInput').removeClass('fadeInUp').addClass('fadeOutDown');
                setTimeout(function() {
                    $('#encryptionInput').remove();
                }, 288);
            }
        }


        $(document).on('click', '.guild, .channel, .containerDefault-1ZnADq', function() {
            toggleInput('hide');
            setTimeout(function() {
                addButton();
            }, 88);
        });

        function checkPassword() {
            //  if password is less than 3 - turn red
            if ($('#encryptionInput input').val().length < 3) {
                $('#encryptionInput').removeClass('nice-password');
            } else {
                $('#encryptionInput').addClass('nice-password');
            }
        }

        //  toggle between **** and text for the password
        $(document).on('click contextmenu', '#encryptionInput svg', function(e) {
            e.preventDefault();
            if ($('#encryptionInput input').attr('type') == 'password') {
                $('#encryptionInput input').attr('type', 'text');
                $('#encryptionInput svg path').attr('d', 'M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z');
            } else {
                $('#encryptionInput input').attr('type', 'password');
                $('#encryptionInput svg path').attr('d', 'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z');
            }
        });

        //  bind right click to adding encryption input
        $(document).on('contextmenu', '.encryptionButton', function(e) {
            e.preventDefault();
            toggleInput('');
            $('#encryptionInput input').val(password);
            checkPassword();
        });

        //  change encryption state
        $(document).on('click', '.encryptionButton', function() {
            if (encryptionState == 'on') {
                encryptionState = 'off';
                encryptionStorage['state'] = 'off';
                localStorageSave(encryptionStorage);
                $('.encryptionButton').attr('state', 'off').find('path').attr('fill', '#888');
            } else {
                encryptionState = 'on';
                encryptionStorage['state'] = 'on';
                localStorageSave(encryptionStorage);
                $('.encryptionButton').attr('state', 'on').find('path').attr('fill', '#43b581');
            }
        });

        //  change password on typing
        $(document).on('keyup', '#encryptionInput input', function() {

            //  set password and save in storage
            password = $(this).val();
            encryptionStorage['password'] = password;
            localStorageSave(encryptionStorage);
            checkPassword();

        });



        //  decrypt messages already on screen at start
        addButton();
        //  decrypt message using set password
        function decrypt(message) {
            try {
                return restoreLinks(sjcl.decrypt(password, message, {
                    count: 2048,
                    ks: 256
                }));
            } catch (error) {
                return '<span class="not-decrypted">Oh no! this message failed to be decrypted</span>';
            }
        }
        //  detect URLs in plain text and replace with links
        function restoreLinks(text) {
            var link = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            return text.replace(link, '<a href="$1" target="_blank">$1</a>');
        }
        //  decrypt all messages
        function decryptAll() {
            //  loop messages
            $('.da-markup').each(function() {
                var message = $(this).text().trim();
                //  separate id from message
                if (message.substring(0, 28) == '--aes256-encrypted-message--') {
                    //  decrypt messages and add them into ui
                    var encrypted = message.substring(28, message.lastIndexOf('}') + 1);
                    $(this).html(decrypt(encrypted)).addClass('decrypted');
                }
            });
        }
        //  decrypt all messages
        decryptAll();



    }


    observer({addedNodes}) {

        if (addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('chat') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('da-markup') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('da-message') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('hide-overflow') ||
            addedNodes.length && addedNodes[0].classList && addedNodes[0].classList.contains('messages-wrapper')) {


                //  decrypt message using set password
                function decrypt(message) {
                    try {
                        return restoreLinks(sjcl.decrypt(password, message, {
                            count: 2048,
                            ks: 256
                        }));
                    } catch (error) {
                        return '<span class="not-decrypted">Oh no! this message failed to be decrypted</span>';
                    }
                }

                //  detect URLs in plain text and replace with links
                function restoreLinks(text) {
                    var link = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                    return text.replace(link, '<a href="$1" target="_blank">$1</a>');
                }


                //  decrypt all messages
                function decryptAll() {
                    //  loop messages
                    $('.da-markup').each(function() {
                        var message = $(this).text().trim();
                        //  separate id from message
                        if (message.substring(0, 28) == '--aes256-encrypted-message--') {
                            //  decrypt messages and add them into ui
                            var encrypted = message.substring(28, message.lastIndexOf('}') + 1);
                            $(this).html(decrypt(encrypted)).addClass('decrypted');
                        }
                    });
                }

                //  decrypt all messages
                decryptAll();


            }

    }


    onSwitch() {
  	     this.attachHandler();
  	}



    //  add handler for sending message
    attachHandler() {

        //  encrypt message using set password
        //  add an encryption prefix for identification
        function encrypt(message) {
            var encrypted = sjcl.encrypt(password, message, {
                count: 2048,
                ks: 256
            });
            return '--aes256-encrypted-message--' + String(encrypted);
        }

    		var el = $('form textarea');

    		//  get auth token
    		if (bdStorage.get('token') == '') {
            var DiscordLocalStorageProxy = document.createElement('iframe');
            DiscordLocalStorageProxy.style.display = 'none';
            DiscordLocalStorageProxy.id = 'DiscordLocalStorageProxy';
            document.body.appendChild(DiscordLocalStorageProxy);
            var token = DiscordLocalStorageProxy.contentWindow.localStorage.token.replace(/"/g, "");
            bdStorage.set('token',token);
        }

    		var token = bdStorage.get('token');

    		function sendMessage(message) {

            //  create message payload
        		var channelID = window.location.pathname.split('/').pop();
        		var data = JSON.stringify({content : message});

            //  send message
        		$.ajax({
        			type : 'POST',
        			url : 'https://discordapp.com/api/channels/' + channelID + '/messages',
        			headers : {
        				'authorization': token
        			},
        			dataType : 'json',
        			contentType : 'application/json',
        			data: data,
        			error: (req, error, exception) => {
        				  console.log('[Encryption] Message failed to send (' + req.responseText + ')');
        			}
	          });

    		}


        //  encrypt message automatically on enter
        this.handleKeypress = function (e) {
            if (e.which == 13) {

                if (encryptionState == 'on' &&
        				    $('form textarea').val().substring(0, 28) !== '--aes256-encrypted-message--' &&
        				    $('form textarea').val().length > 0) {

          					e.preventDefault();
          					e.stopPropagation();

                    var message = $('textarea').val();
          					sendMessage(encrypt(message));

          					$('form textarea').val('');
          					var textareaInstance = BDfunctionsDevilBro.getOwnerInstance({
          							'node': el[0],
          							'name': 'ChannelTextAreaForm',
          							"up": true
          						});
          					textareaInstance.setState({
          						textValue: ''
          					});

                }

            }
        };

        //  add try catch incase user it not on a message page
        try {
            //  bind keypress event
            el[0].addEventListener('keydown', this.handleKeypress, false);
        } catch (err) {}

    }



    getName() {
        return 'Encryption';
    }

    getAuthor() {
        return 'HMerritt';
    }

    getVersion() {
        return '1.8.0';
    }

    getDescription() {
        return 'aes-256 encryption';
    }



};
