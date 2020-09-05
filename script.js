
var systemStatus = 0;


function display_func(id, validate) {
    if ( validate==true) {
        if (systemStatus == 0) {
            alert("please initialize system to continue...");
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
}


function setHeading() {
    if (systemStatus == 0) {
        document.getElementById('sys_status').innerHTML = "System Not Initialized";
        document.getElementById('sys_status').style.color = "#B53009"
    } else {
        document.getElementById('sys_status').innerHTML = "System Initialized";
        document.getElementById('sys_status').style.color = "#2C552F"
    }
}


function initilizeSystem( element) {
    systemStatus = 0;
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
    systemStatus = 1;
    setHeading()
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