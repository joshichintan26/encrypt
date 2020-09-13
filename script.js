
var profile = null;
var op = 0;

function getSystemStatus() {
    if (WASMGo == null ) {
        return 0
    } else {
        return WASMGo.getState();
    }
}

function display_element(id) {
    maind = document.getElementById("main-div");
    ch = maind.firstChild;
    while (ch != null) {
        if ( ch.style != null) {
            ch.style.display = "none";
        }
        ch = ch.nextSibling;
    }
    document.getElementById(id).style.display = "block";
}

function display_func(id, validate, openlogin) {

    systemStatus = getSystemStatus()

    if ( validate==true) {
        if (systemStatus == 0) {
            alert("please insert master key to continue...");
            return;
        }
    }
    maind = document.getElementById("main-div");
    ch = maind.firstChild;
    while (ch != null) {
        if ( ch.style != null) {
            ch.style.display = "none";
        }
        ch = ch.nextSibling;
    }
    document.getElementById(id).style.display = "block";
    setHeading();
    if (systemStatus == 0) {
        document.getElementById("logout").style.display="none";
        document.getElementById("login").style.display="block";

        if (openlogin) {
            const link = document.getElementById("loginLink");
            // this is necessary as link.click() does not work on the latest firefox
            link.dispatchEvent(
                new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                })
            );
        }
    } else {
        document.getElementById("logout").style.display="block";
        document.getElementById("login").style.display="none";
    }

}


function setHeading() {
    systemStatus = getSystemStatus()
    if (systemStatus == 0) {
        document.getElementById('sys_status').innerHTML = "System Not Initialized";
        document.getElementById('sys_status').style.color = "#B53009"
        document.getElementById('sidebarCollapse').style.backgroundColor = "#B53009"
    } else {
        document.getElementById('sys_status').innerHTML = "System Initialized";
        document.getElementById('sys_status').style.color = "#2C552F"
        document.getElementById('sidebarCollapse').style.backgroundColor = "#6d7fcc"
    }
}


function initilizeSystemWithProfile( jwt, opentray) {
    systemStatus = getSystemStatus()
    err = WASMGo.instantiateWithJWT(jwt);
    if (err != null) {
        display_func("master_key",false);
        return;
    }

   setHeading();
   if (opentray) {
        const link = document.getElementById("sidebarCollapse");
        // this is necessary as link.click() does not work on the latest firefox
        link.dispatchEvent(
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            })
        );
    }
    display_func("encrypt_data",true);
    systemStatus = getSystemStatus()
}



function initilizeSystem( element, opentray) {
    systemStatus = getSystemStatus()
    password = element.value
    if ( password.length == 0) {
        alert("Password cannot be zero length");
        return;
    }
    err = WASMGo.instantiate(password);
    if (err != null) {
        alert(err);
        return;
    }
    element.value = ""
    setHeading();

    if (opentray) {
        const link = document.getElementById("sidebarCollapse");
        // this is necessary as link.click() does not work on the latest firefox
        link.dispatchEvent(
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            })
        );
    }
    systemStatus = getSystemStatus()
    display_func("encrypt_data",true);

}


function onFailure(error) {
    WASMGo.reset();
    console.log(error);
}

function onSignIn(googleUser) {
    WASMGo.reset();
    initilizeSystemWithProfile(googleUser.getAuthResponse(true).id_token, true);
};
function signOut() {
    WASMGo.reset();
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut();
    display_func("master_key",false)
};

var local_client = '27307749121-8ha68mleqi4kqhlvj3rgugg8mc615e1r.apps.googleusercontent.com';
var git_client = `1069934900773-fn61ukfjudqa9medkn4sms9902ik9mtd.apps.googleusercontent.com`;

function startApp() {
    gapi.load('auth2', function(){
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        auth2 = gapi.auth2.init({
            client_id: git_client,
            cookiepolicy: 'single_host_origin',
            // Request scopes in addition to 'profile' and 'email'
            //scope: 'additional_scope'
        });
        attachSignin(document.getElementById('customBtn'));
        attachSignin(document.getElementById('customBtnBody'));
    });
}

function attachSignin(element) {
    auth2.attachClickHandler(element, {},
        function(googleUser) {
            onSignIn(googleUser)
        }, function(error) {
        });
}


function crypto_local( data, encrypt) {
    out = "";
    if (encrypt == true) {
        out = WASMGo.encrypt(data);
    } else {
        out = WASMGo.decrypt(data);
    }
    if (encrypt) {
        document.getElementById("encrypted_text").value = out;
    } else {
        document.getElementById("plain_text").value = out;
    }
}

function dataURItoBlob(dataURI, callback) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var bb = new Blob([ab]);
    return bb;
}

function fileCrypto( encrypt ) {
    var file = document.getElementById("enc_file_name").files[0];
    if (file) {
        var reader = new FileReader();
        if (encrypt) {
            reader.readAsDataURL(file)
        } else {
            reader.readAsText(file)
        }

        reader.onload = function (evt) {

            var out = "",out1 = "";
            if (encrypt) {
                out = WASMGo.encrypt(evt.target.result);
            } else {
                out = WASMGo.decrypt(evt.target.result);
            }

            var jsonBlob = null
            if (encrypt) {
                jsonBlob = new Blob([out]);
            } else {
                jsonBlob = dataURItoBlob(out);
            }
            const data = window.URL.createObjectURL(jsonBlob);
            const link = document.createElement('a');
            link.href = data;
            link.download = file.name;

            // this is necessary as link.click() does not work on the latest firefox
            link.dispatchEvent(
                new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                })
            );

            setTimeout(() => {
                // For Firefox it is necessary to delay revoking the ObjectURL
                window.URL.revokeObjectURL(data);
                link.remove();
            }, 100);
        }
        reader.onerror = function (evt) {
            console.log("error reading file");
        }
    } else {
        alert("select file to encrypt");
    }
}

function initCSV( obj ) {
    var file = document.getElementById("csv_file_name").files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file)
        reader.onload = function (evt) {
            str = evt.target.result.split(/\r?\n/)[0];
            str = str.split(",");
            ckbox = ""
            for (i = 0;i<str.length;i++) {
                ckbox += "<input name=\"csv_checkbox\" type=\"checkbox\" id=\""+i +"\" value=\"" + str[i]+ "\"> <label style=\"margin-right: 15px\" >"+ "column: " + i +"</label>";
            }
            document.getElementById("cols_csv").innerHTML = ckbox
        }
        reader.onerror = function (evt) {
            console.log("error reading file");
        }
    }
}

function csvCrypto( encrypt, columns, delimiter ) {
    var file = document.getElementById("csv_file_name").files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function (evt) {

            var checkedBoxes = document.querySelectorAll('input[name=csv_checkbox]:checked');

            index = "";
            for (i = 0;i<checkedBoxes.length;i++) {
                index += checkedBoxes[i].getAttribute("id");
                if ( i != checkedBoxes.length-1 ) {
                    index += ",";
                }
            }
            var out = "",out1 = "";
            if (encrypt) {
                out = WASMGo.tokenizecsv(evt.target.result,index,"");
            } else {
                out = WASMGo.detokenizecsv(evt.target.result,index,"");
            }
            var jsonBlob = null
            jsonBlob = new Blob([out],{type:file.type.toString()})
            const data = window.URL.createObjectURL(jsonBlob);
            const link = document.createElement('a');
            link.href = data;
            link.download = file.name;

            // this is necessary as link.click() does not work on the latest firefox
            link.dispatchEvent(
                new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                })
            );

            setTimeout(() => {
                // For Firefox it is necessary to delay revoking the ObjectURL
                window.URL.revokeObjectURL(data);
                link.remove();
            }, 100);
        }
        reader.onerror = function (evt) {
            console.log("error reading file");
        }
    } else {
        alert("select file to tokenize");
    }
}