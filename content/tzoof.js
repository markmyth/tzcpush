/* Copyright (c) 2012 Mark Nethersole
   See the file LICENSE.txt for licensing information. */

if (typeof tzoof == "undefined") {
    var tzoof ={}
}

var tzoof = {

    


onMenuItemCommand: function() {
    window.open(
		"chrome://tzoof/content/pref.xul",
		"", 
		"chrome,centerscreen,resizable,toolbar", 
		null, null
	);
    
  },

get : function() {
Components.utils.import("chrome://tzoof/content/towbxml.js");
Components.utils.import("chrome://tzoof/content/toxml.js");
Components.utils.import("chrome://tzoof/content/send.js");

getstatusxml = '<?xml version="1.0"?>\
<!DOCTYPE ActiveSync PUBLIC "-//MICROSOFT//DTD ActiveSync//EN" "http://www.microsoft.com/">\
<Settings xmlns="Settings:">\
<Oof xmlns="Settings:">\
<Get>\
<BodyType>Text</BodyType>\
</Get>\
</Oof>\
</Settings>'



getstatuswbxml = towbxml(getstatusxml) //the above xml as wbxml


function back(retwbxml) {

retxml = toxml(retwbxml) // the returned wbxml converted to xml
var parser = new DOMParser()
var xmlDoc = parser.parseFromString(retxml, "application/xml"); // load xml to parser
oofstate = xmlDoc.getElementsByTagName("OofState")[0].childNodes[0].nodeValue // get the oof state
oofmessage = xmlDoc.getElementsByTagName("ReplyMessage")[0].childNodes[0].nodeValue //get the oof message
document.getElementById('oofmessage').value = oofmessage //insert sever oof message into xul box

if (oofstate === "1") { //if out of office set xul radio to "out of office"
   document.getElementById('oofstatus').selectedIndex = 1
}

else{ //set to "in office"
document.getElementById('oofstatus').selectedIndex = 0
}
}
// next line sent on opening
Send(getstatuswbxml,back,"Settings") // send wbxml to server. process results in callback(function back())
    
    

 },                     

 set : function() {
Components.utils.import("chrome://tzoof/content/towbxml.js");
Components.utils.import("chrome://tzoof/content/toxml.js");
Components.utils.import("chrome://tzoof/content/send.js");



function  back1(retwbxml) {
    retxml = toxml(retwbxml)
    var parser = new DOMParser()
    var xmlDoc = parser.parseFromString(retxml, "application/xml");
    retstatus = xmlDoc.getElementsByTagName("Status")
    if (retstatus[0].childNodes[0].nodeValue === "1" && retstatus[1].childNodes[0].nodeValue === "1") {
		//do not need to do anything everything ok. will add some sort of ok indicator
	 }
    else {alert(retxml)} //something wrong (this has not happend yet so will convert to error message)
    
}



if (document.getElementById('oofstatus').selectedIndex === 1) { // if set status as "out of office" do this

setstatusxml = '<?xml version="1.0"?>\
<Settings xmlns="Settings:">\
<Oof>\
<Set>\
<OofState>1</OofState>\
<OofMessage>\
<AppliesToInternal/>\
<Enabled>1</Enabled>\
<ReplyMessage>'
+ document.getElementById('oofmessage').value // your message entered in xul box
+ '</ReplyMessage>\
<BodyType>Text</BodyType>\
</OofMessage>\
<OofMessage>\
<AppliesToExternalKnown/>\
<Enabled>0</Enabled>\
<ReplyMessage></ReplyMessage>\
<BodyType>Text</BodyType>\
</OofMessage>\
<OofMessage>\
<AppliesToExternalUnknown/>\
<Enabled>0</Enabled>\
<ReplyMessage></ReplyMessage>\
<BodyType>Text</BodyType>\
</OofMessage>\
</Set>\
</Oof>\
</Settings>'

setstatuswbxml = towbxml(setstatusxml) //convert to xml
Send(setstatuswbxml,back1,"Settings") //send and process resylts in callback(function back1())
}
else { //set status as in office
setstatusxml = '<?xml version="1.0"?>\
<Settings xmlns="Settings:">\
<Oof>\
<Set>\
<OofState>0</OofState>\
</Set>\
</Oof>\
</Settings>'
setstatuswbxml = towbxml(setstatusxml)
//alert("sending in " + setstatusxml)
Send(setstatuswbxml,back1,"Settings")
}

    
 }
 
}






