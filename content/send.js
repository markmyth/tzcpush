/* Copyright (c) 2012 Mark Nethersole
   See the file LICENSE.txt for licensing information. */
   
var EXPORTED_SYMBOLS = ["Send","callback"];

    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService).getBranch("extensions.tzpush.")
    
    var calprefs = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService).getBranch("extensions.tzcpush.")
    
function myDump(what,aMessage) {
      var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
     consoleService.logStringMessage(what + " : " + aMessage);
}

function decode_utf8(s) {return decodeURIComponent(escape(s))};

Components.utils.import("chrome://tzcpush/content/toxml.js");
   
function Send (wbxml, callback, command) {
	myDump("send","insend")
	const XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1", "nsIXMLHttpRequest"); 
	var SSL = prefs.getBoolPref("https")
    var host = prefs.getCharPref("host")
	var hthost
	var SERVER
	var USER = prefs.getCharPref("user")
	var PASSWORD = getpassword()
	var deviceType = "thunderbird"
	var deviceId = prefs.getCharPref("deviceId")
	var polkey = prefs.getCharPref("polkey")
	var req = new XMLHttpRequest()
	var LastSyncTime
	
        if (SSL === true) {hthost = "https://" + host}
else {hthost = "http://" + host}
        if (SSL === true) {SERVER = "https://" + host + "/Microsoft-Server-ActiveSync"}
else {SERVER = "http://" + host + "/Microsoft-Server-ActiveSync"}
       
        function getpassword() {
	
        var myLoginManager = Components.classes["@mozilla.org/login-manager;1"]
	.getService(Components.interfaces.nsILoginManager);
       
        var logins = myLoginManager.findLogins({}, hthost, SERVER, null);
        var password = ''
        for (var i = 0; i < logins.length; i++) {
            if (logins[i].username === USER) {
                password = logins[i].password;
                break;
            }
       
        }
        return password
    }
        PASSWORD = getpassword()
        req.mozBackgroundRequest = true; 
	    //req.open("POST", SERVER + '?Cmd=' + command + '&User=' + USER + '&DeviceType=Thunderbird' + '&DeviceId=oof', true);
	    var cmdline = SERVER + '?Cmd=' + command + '&User=' + USER + '&DeviceType=Thunderbird' + '&DeviceId=' + deviceId
	    //req.open("POST", SERVER + '?Cmd=' + command + '&User=' + USER + '&DeviceType=Thunderbird' + '&DeviceId=' + deviceId, true);
	    if (prefs.getCharPref("debugwbxml") === "1") {
			myDump("SSL = ",SSL)
			myDump("POST = ",cmdline)
			myDump("USER", USER)
			myDump("PASSWORD" , PASSWORD)
			myDump("Server", SERVER)
			//writewbxml(wbxml)
			//myDump("sending",decode_utf8(toxml(wbxml)))
			}
	    req.open("POST", cmdline, true)
	    req.overrideMimeType('text/plain'); 
        req.setRequestHeader("User-Agent", deviceType + ' ActiveSync');
	    req.setRequestHeader("Content-Type", 'application/vnd.ms-sync.wbxml');
	    req.setRequestHeader("Authorization", 'Basic ' + btoa(USER + ':' + PASSWORD));
	    req.setRequestHeader("MS-ASProtocolVersion", '2.5');
	    req.setRequestHeader("Content-Length", wbxml.length);
        if (prefs.getBoolPref("prov")) {
            req.setRequestHeader("X-MS-PolicyKey", polkey);
        }
	
        req.onreadystatechange = function ()
    { 
                if (req.readyState === 4 && req.status === 200)
        {
	                wbxml = req.responseText
			        if (wbxml.substr(0, 4) !== String.fromCharCode(0x03, 0x01, 0x6A, 0x00)) {myDump("tzoof","expecting wbxml but got - " + req.responseText)}
                    if (prefs.getCharPref("debugwbxml") === "1") {myDump("recieved",decode_utf8(toxml(wbxml)).split('><').join('>\n<'))}
                    callback(req.responseText);
	            }
	else if (req.readyState === 4) {
		if (req.status === 0) {
		myDump("tzoof request status","0 -- No connection - check server address")
		}
		else if (req.status === 401) {
		myDump("tzoof request status","401 -- Auth error - check username and password")
		}
		else if (req.status === 449) {
		myDump("tzoof request status","449 -- Insufficient information - retry with provisioning")
		}
		
		else { myDump("tzoof request status","reported -- " + req.status)}
		}
	        }
	if (prefs.getCharPref("debugwbxml") === "1") {myDump("sending",decode_utf8(toxml(wbxml).split('><').join('>\n<')))}
        try {req.sendAsBinary(wbxml)}
	catch (e) { myDump("tzoof error",e)
	    
	    }
    }
