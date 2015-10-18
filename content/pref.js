if (typeof tzcpush === "undefined") {
    var tzcpush = {}
}

var tzcpush = {
calManager : Components.classes["@mozilla.org/calendar/manager;1"].getService(Components.interfaces.calICalendarManager),
calprefs : Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService).getBranch("extensions.tzcpush."),

onopen : function () {
	

var cals = tzcpush.calManager.getCalendars({});
var mycal = cals[0]
for (var calcount in cals) {		
var ab = document.createElement('listitem');
			        ab.setAttribute('label', cals[calcount].name);
			        ab.setAttribute('value', calcount);
			
document.getElementById('localCals').appendChild(ab);
}
//alert("Hello")
},

onclose : function () {},

setselect : function (what) {
	alert(what)
	var cals = tzcpush.calManager.getCalendars({});
	var calname = cals[what].name
	alert(calname)
	tzcpush.calprefs.setCharPref("calID",calname)
	},	
	
	}
