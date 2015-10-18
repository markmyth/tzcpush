if (typeof tzcpush === "undefined") {
    var tzcpush = {}
}

var tzcpush = {

 calprefs : Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService).getBranch("extensions.tzcpush."),

    onMenuItemCommand: function () {
        window.open(
		"chrome://tzcpush/content/pref.xul",
		"", 
		"chrome,centerscreen,resizable,toolbar", 
		null, null
	);
    
    },

go : function () {
	
Components.utils.import("chrome://tzcpush/content/toxml.js");
Components.utils.import("chrome://tzcpush/content/towbxml.js");
Components.utils.import("chrome://tzcpush/content/send.js");
	try   {
		lastsynctime = tzcpush.calprefs.getCharPref("lastSyncTime")
       thissynctime = Date.now()
   }
   catch(e) { 
   lastsynctime = -1
   thissynctime = Date.now()
   }
//wbxml = String.fromCharCode(0x03,0x01,0x6A,0x00,0x45,0x5C,0x4F,0x50,0x03,0x43,0x61,0x6C,0x65,0x6E,0x64,0x61,0x72,0x00,0x01,0x4B,0x03,0x30,0x00,0x01,0x52,0x03,0x49,0x64,0x32,0x52,0x65,0x70,0x6C,0x61,0x63,0x65,0x00,0x01,0x01,0x01,0x01)
var synckey = tzcpush.calprefs.getCharPref("synckey")
var folderID = tzcpush.calprefs.getCharPref("folderID")
//wbxml = wbxml = wbxml.replace('Id2Replace', folderID)


if (folderID === "") {tzcpush.GetFolderId()}
else if (synckey === "0") {tzcpush.SyncZero()}
else {tzcpush.FromCal()}
},

GetFolderId : function () {
	
wbxml = String.fromCharCode(0x03,0x01,0x6a,0x00,0x00,0x07,0x56,0x52,0x03,0x30,0x00,0x01,0x01)
        Send(wbxml,callback,"FolderSync")

function callback(retwbxml) {

var folderID = tzcpush.FindFolder(retwbxml)


tzcpush.SyncZero(folderID)
}
},

SyncZero : function (folderID) {
	
	//folderID = tzcpush.calprefs.getCharPref("folderID")
	var outerwbxml = String.fromCharCode(0x03,0x01,0x6A,0x00,0x45,0x5C,0x4F,0x50,0x03,0x43,0x61,0x6C,0x65,0x6E,0x64,0x61,0x72,0x00,0x01,0x4B,0x03,0x30,0x00,0x01,0x52,0x03,0x49,0x64,0x32,0x52,0x65,0x70,0x6C,0x61,0x63,0x65,0x00,0x01,0x01,0x01,0x01)
    var wbxml = outerwbxml.replace('Id2Replace', folderID)
	Send(wbxml,callback,"Sync")
	
	function callback(retwbxml) {
	//alert(toxml(retwbxml))
	synckey = tzcpush.FindKey(retwbxml)
	//alert(synckey)
	tzcpush.calprefs.setCharPref("synckey",synckey)
	
	tzcpush.FromCal()
}
	
	},

addtocal : function (wbxml,callback) {
function myDump(what,aMessage) {
      var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
     consoleService.logStringMessage(what + " : " + aMessage);
}	
var calManager = Components.classes["@mozilla.org/calendar/manager;1"].getService(Components.interfaces.calICalendarManager);
var cals = calManager.getCalendars({});
var calname = tzcpush.calprefs.getCharPref("calID")

for ( calcount in cals) {
	 if (cals[calcount].name === calname) {break}
	 }
mycal = cals[calcount]	
Components.utils.import("chrome://tzcpush/content/toxml.js");
var xmlstring = toxml(wbxml)	
var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
             .createInstance(Components.interfaces.nsIDOMParser);
var xml = parser.parseFromString(xmlstring, "application/xml");
var event = Components.classes["@mozilla.org/calendar/event;1"].createInstance(Components.interfaces.calIEvent)
var sdate = Components.classes["@mozilla.org/calendar/datetime;1"].createInstance(Components.interfaces.calIDateTime)
var edate = Components.classes["@mozilla.org/calendar/datetime;1"].createInstance(Components.interfaces.calIDateTime)
 Components.utils.import("resource://calendar/modules/calUtils.jsm")          
            recInfo = cal.createRecurrenceInfo(event)
            recRule = cal.createRecurrenceRule()
 try {           
 tzcpush.calprefs.setCharPref("TimeZone",xml.getElementsByTagName("Timezone")[0].childNodes[0].nodeValue) 
}
catch(e){}        
 function download(addorchange,ischange) {           
for (j=0;j<addorchange.length;j++) {

ServerId = addorchange[j].getElementsByTagName("ServerId")[0].childNodes[0].nodeValue
myDump( "serverid = ",  ServerId )
ApplicationData = addorchange[j].getElementsByTagName("ApplicationData")[0]
event.id = ServerId
 if (ischange) { holder = mycal.getItem(ServerId,tzcpush.getListener) }

x = ApplicationData.childNodes;
for (i=0;i<x.length;i++)
{ 
if (x[i].nodeType==1)
  {//Process only element nodes (type 1) 
myDump( x[i].nodeName,  x[i].childNodes[0].nodeValue );
       switch (x[i].nodeName) {
      case "Subject":
	        event.title = x[i].childNodes[0].nodeValue
            break;
      case "StartTime":
            sdate.icalString = x[i].childNodes[0].nodeValue
            //event.startDate = sdate
            //alert(x[i].childNodes[0].nodeValue)
            break;
      case "EndTime":
            edate.icalString = x[i].childNodes[0].nodeValue
            //event.endDate = edate
            //alert(x[i].childNodes[0].nodeValue)
            break;  
      case "Location":
            event.setProperty("LOCATION",x[i].childNodes[0].nodeValue)
            break; 
      case "Body":
            event.setProperty("DESCRIPTION",x[i].childNodes[0].nodeValue)
            break;            
      case "ServerId":
            if (this.inmodify) {
            y = mycal.getItem(x[i].childNodes[0].nodeValue,tzcpush.getListener1)
            event = oldevent.clone()}
            event.id = x[i].childNodes[0].nodeValue
            break;
            
      case "AllDayEvent": 
           if (x[i].childNodes[0].nodeValue === "1") {         
          sdate.icalString = sdate.icalString.substring(0,8)
          edate.icalString = edate.icalString.substring(0,8)
            }
          
           
            break; 
      
      case "Reminder":
            myOffset = Components.classes["@mozilla.org/calendar/duration;1"].createInstance(Components.interfaces.calIDuration);
            myOffset.minutes = parseInt(x[i].childNodes[0].nodeValue);
            myOffset.isNegative = true 
            Components.utils.import("resource://calendar/modules/calUtils.jsm");
            alarm = cal.createAlarm();
            alarm.related = Components.interfaces.calIAlarm.ALARM_RELATED_START;
            alarm.offset = myOffset
            alarm.action = "DISPLAY"
            event.addAlarm(alarm);
            break; 
            
      
          
          case "Recurrence":
    week = false
    month = false
    Wom = ""
    hasWom = false
    Dow = ""
    hasMoy = false
          Recurrence = ApplicationData.getElementsByTagName("Recurrence")[0]
RecurrenceNodes = Recurrence.childNodes;
for (RecurrenceNode=0;RecurrenceNode<RecurrenceNodes.length;RecurrenceNode++)
{ 
if (RecurrenceNodes[RecurrenceNode].nodeType==1) {
value = RecurrenceNodes[RecurrenceNode].childNodes[0].nodeValue
alert("node name " + RecurrenceNodes[RecurrenceNode].nodeName + " " + value)
switch (RecurrenceNodes[RecurrenceNode].nodeName) {
      case "Type":
           
            Components.utils.import("resource://calendar/modules/calUtils.jsm");
            recInfo = cal.createRecurrenceInfo(event)
            recRule = cal.createRecurrenceRule()
             switch (RecurrenceNodes[RecurrenceNode].childNodes[0].nodeValue) {
		    case "0":
		    recRule.type = "DAILY"
		    break;
			case "1":	 
            recRule.type = "WEEKLY"
            this.week = true
            break;
            case "2":
            recRule.type = "MONTHLY"
            this.month = true
            break;
            case "3":
            recRule.type = "MONTHLY"
            this.month = true
            break;
            case "5":
            recRule.type = "YEARLY"
            break;
            case "6":
            recRule.type = "YEARLY"
            break;
		}
		  break;
		  
          case "WeekOfMonth":
          hasWom = true
          Wom = value
          
          break;
          
          case "DayOfWeek":
          Dow = value
          //Dow = x[i].childNodes[0].nodeValue
          alert(Dow)

          break;
          case "MonthOfYear":
          this.month = true
          recRule.setComponent("BYMONTH", 1, [value])
          break;		  
		  
		  
		  
		  
		  case "Interval":
		  recRule.interval = parseInt(value)
		  
          break;		  
		  	
	
}
}
}
          alert(sdate)
              var daynum = sdate.weekday
              alert("dow = " + Dow + " daynum = " + Math.pow(2,daynum))
              if (hasWom && Dow !== "127") {
			  //alert(this.Wom)
			  //var days = x[i].childNodes[0].nodeValue + (this.Wom * 8)
			  var days = []
			  for (var i=0;i<7;i++)
             {
              x = Math.pow(2,i)
              //alert(Math.pow(2,i))
              y = Dow & x
              if (y !== 0) {days.push(i + 1 + (Wom * 8))}
               }
			 
			  recRule.setComponent("BYDAY", days.length, days)
			  
			  }
			  else if (hasWom && Dow == "127" && recRule.type !== "YEARLY")
			  {
				  alert(Wom)
				  recRule.setComponent("BYMONTHDAY", 1, [Wom])
				  
				  }
			else if (this.month === true && Dow == "127")
			{
				recRule.setComponent("BYMONTHDAY", 1, [-1])
				}	  
			  
			  else if (Dow === "127"){
				  
				  recRule.setComponent("BYMONTHDAY", 1, [-1])
				  }
			            
              else if (Math.pow(2,daynum) !== Dow) { 
          		  
			  if (week) {
			  var days = []
			  for (var i=0;i<7;i++)
             {
              x = Math.pow(2,i)
              //alert(Math.pow(2,i))
              y = Dow & x
              if (y !== 0) {days.push(i + 1)}
               }
			  alert(days + " " + days.length)
			  recRule.setComponent("BYDAY", days.length, days)
			  }
			  }
          
          
          recInfo.insertRecurrenceItemAt(recRule, 0)
          event.recurrenceInfo = recInfo
          break;
          

        
}
 
  } 
}    if (ischange) { }
     event.startDate = sdate
     event.endDate = edate
     event.setProperty("sync","yes")
     event.setProperty("thissync","yes")
	 mycal.addItem(event, null)
}
}

add = xml.getElementsByTagName("Add")
addlength = xml.getElementsByTagName("Add").length 
download(add,false)
Change = xml.getElementsByTagName("Change")
download(Change,true)
Delete = xml.getElementsByTagName("Delete")
Deletelength = xml.getElementsByTagName("Delete").length 	
for (j=0;j<Delete.length;j++) {
var ServerId = Delete[j].getElementsByTagName("ServerId")[0].childNodes[0].nodeValue
alert(ServerId)
y = mycal.getItem(ServerId,tzcpush.getListener)	
}
callback()
	},

FromCal : function () {
	folderID = tzcpush.calprefs.getCharPref("folderID")
	synckey = tzcpush.calprefs.getCharPref("synckey")
	wbxmlwkey = String.fromCharCode(0x03,0x01,0x6A,0x00,0x45,0x5C,0x4F,0x50,0x03,0x43,0x61,0x6C,0x65,0x6E,0x64,0x61,0x72,0x00,0x01,0x4B,0x03,0x53,0x79,0x6E,0x63,0x4B,0x65,0x79,0x52,0x65,0x70,0x6C,0x61,0x63,0x65,0x00,0x01,0x52,0x03,0x49,0x64,0x32,0x52,0x65,0x70,0x6C,0x61,0x63,0x65,0x00,0x01,0x1E,0x13,0x55,0x03,0x31,0x30,0x30,0x00,0x01,0x57,0x58,0x03,0x35,0x00,0x01,0x01,0x01,0x01,0x01)
	var wbxml = wbxmlwkey.replace('SyncKeyReplace', synckey);
	
    wbxml = wbxml = wbxml.replace('Id2Replace', folderID)
	Send(wbxml,callback,"Sync")
	
	function callback(retwbxml) {
	alert(toxml(retwbxml))
	synckey = tzcpush.FindKey(retwbxml)
	//alert(synckey)
	tzcpush.calprefs.setCharPref("synckey",synckey)
	tzcpush.addtocal(retwbxml,tzcpush.upload)
	}
	},

upload : function() {
	alert("in upload")
	var calManager = Components.classes["@mozilla.org/calendar/manager;1"].getService(Components.interfaces.calICalendarManager);
var cals = calManager.getCalendars({});
var calname = tzcpush.calprefs.getCharPref("calID")

for ( calcount in cals) {
	 if (cals[calcount].name === calname) {break}
	 }
mycal = cals[calcount]	
	const cIC = Components.interfaces.calICalendar

var allitems = mycal.getItems([cIC.ITEM_FILTER_ALL_ITEMS], 0, null, null,tzcpush.getListener3)

	
	},

FindFolder : function (wbxml) {
	
	Components.utils.import("chrome://tzcpush/content/toxml.js");
	
    var start = 0
	var end
	var folderID
        var Scontact = String.fromCharCode(0x4A, 0x03) + '8' + String.fromCharCode(0x00, 0x01)
        var contact = wbxml.indexOf(Scontact)
       
        while (wbxml.indexOf(String.fromCharCode(0x48, 0x03), start) < contact)
{         
            start = wbxml.indexOf(String.fromCharCode(0x48, 0x03), start) + 2
            if (start === 1) {break} 
           
            end = wbxml.indexOf(String.fromCharCode(0x00), start)
            folderID = wbxml.substring(start, end)
            
        }
        
        tzcpush.calprefs.setCharPref("folderID",folderID)
        return folderID
    },

FindKey : function (wbxml) {
            var x = String.fromCharCode(0x4b, 0x03) //<SyncKey> Code Page 0
            if (wbxml.substr(5, 1) === String.fromCharCode(0x07))
{
                x = String.fromCharCode(0x52, 0x03) //<SyncKey> Code Page 7
            }
	    
            var start = wbxml.indexOf(x) + 2
            var end = wbxml.indexOf(String.fromCharCode(0x00), start)
            var synckey = wbxml.substring(start, end)
            return synckey

        },

getListener : {
        onOperationComplete: function(mycal, aStatus, aOperationType, aId, aDetail)
        {

        },
        onGetResult: function(mycal, aStatus, aItemType, aDetail, aCount, aItems)
        {
            
            if (!Components.isSuccessCode(aStatus)) {
                aborted = true;
                return;
            }
            if (aCount) {
                   for (var i=0; i<aCount; ++i) {
                    
                   //alert(aItems[i].title) //do all the zpush stuff here
                   //itemtodel = aItems[i]
                   z = mycal.deleteItem(aItems[i],null)
                
                }  
           }
        }
    },
    
getListener1 : {
        onOperationComplete: function(mycal, aStatus, aOperationType, aId, aDetail)
        {

        },
        onGetResult: function(mycal, aStatus, aItemType, aDetail, aCount, aItems)
        {
            
            if (!Components.isSuccessCode(aStatus)) {
                aborted = true;
                return;
            }
            if (aCount) {
                   for (var i=0; i<aCount; ++i) {
                    
                   alert(aItems[i].title) //do all the zpush stuff here
                   //itemtodel = aItems[i]
                   //mycal.modifyItem(modevent,aItems[i],null)
                oldevent = aItems[i]
                }  
           }
        }
    },

getListener3 : {
        onOperationComplete: function(mycal, aStatus, aOperationType, aId, aDetail)

        {
alert("done")
        },
        onGetResult: function(mycal, aStatus, aItemType, aDetail, aCount, aItems)
        {
            
            if (!Components.isSuccessCode(aStatus)) {
                aborted = true;
                return;
            }
            if (aCount) {
				function getxml(url) {
url ="chrome://tzcpush/content/" + url
var req = new XMLHttpRequest();
req.onload = function() {
   xmlDoc = req.responseXML;
   //alert(oSerializer.serializeToString(xmlDoc))
}
req.open("GET", url, false);
req.send(null);
}
var oSerializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"]
                            .createInstance(Components.interfaces.nsIDOMSerializer);
getxml("addsend.xml")
var textNode = xmlDoc.createTextNode (tzcpush.calprefs.getCharPref("synckey"))
synckeyvalue = xmlDoc.getElementsByTagName("SyncKey")[0]
synckeyvalue.appendChild(textNode)
textNode = xmlDoc.createTextNode (tzcpush.calprefs.getCharPref("folderID"))
CollectionId = xmlDoc.getElementsByTagName("CollectionId")[0]
CollectionId.appendChild(textNode)
var count = 0

                   for (var i=0; i<aCount; ++i) {

                    ApplicationData = xmlDoc.createElementNS("AirSync:","ApplicationData")
                    //timezone = "xP///ygARwBNAFQAKwAwADEAOgAwADAAKQAgAEEAbQBzAHQAZQByAGQAYQBtACwAIABCAGUAcgBsAGkAbgAsACAAQgAAAAoABQAAAAMAAAAAAAAAAAAAACgARwBNAFQAKwAwADEAOgAwADAAKQAgAEEAbQBzAHQAZQByAGQAYQBtACwAIABCAGUAcgBsAGkAbgAsACAAQgAAAAMABQAAAAIAAAAAAAAAxP///w=="
                    TimeZone = xmlDoc.createTextNode(tzcpush.calprefs.getCharPref("TimeZone"))
                    TimeZonetag = xmlDoc.createElementNS("Calendar:","Timezone")
                    TimeZonetag.appendChild(TimeZone)
                    ApplicationData.appendChild(TimeZonetag)
                    DtStamptag = xmlDoc.createElementNS("Calendar:","DtStamp")
                    var created = xmlDoc.createTextNode(aItems[i].creationDate.icalString)
                    DtStamptag.appendChild(created)
                    ApplicationData.appendChild(DtStamptag)
                    StartTimetag = xmlDoc.createElementNS("Calendar:","StartTime")
                    
                    var icalstring = aItems[i].startDate.icalString
                    
                    if (icalstring.lastIndexOf("Z") === -1) {icalstring = icalstring + "Z"}
                    StartTime = xmlDoc.createTextNode(icalstring)
                    
                    StartTimetag.appendChild(StartTime)
                    ApplicationData.appendChild(StartTimetag)
                    EndTimetag = xmlDoc.createElementNS("Calendar:","EndTime")
                    icalstring = aItems[i].endDate.icalString
                    
                    if (icalstring.lastIndexOf("Z") === -1) {icalstring = icalstring + "Z"}
                    EndTime = xmlDoc.createTextNode(icalstring)
                    EndTimetag.appendChild(EndTime)
                    ApplicationData.appendChild(EndTimetag)
                    Subjecttag = xmlDoc.createElementNS("Calendar:","Subject")
                    Subject = xmlDoc.createTextNode(aItems[i].title)
                    Subjecttag.appendChild(Subject)
                    ApplicationData.appendChild(Subjecttag)
                    Locationtag = xmlDoc.createElementNS("Calendar:","Location")
                    Location = xmlDoc.createTextNode(aItems[i].getProperty("LOCATION"))
                    Locationtag.appendChild(Location)
                    ApplicationData.appendChild(Locationtag)                   
                    Remindertag = xmlDoc.createElementNS("Calendar:","Reminder")
                    try {
                    Mins = (aItems[i].getAlarms({})[0].offset.days * 60 * 24) + (aItems[i].getAlarms({})[0].offset.hours * 60) + aItems[i].getAlarms({})[0].offset.minutes
                    Reminder = xmlDoc.createTextNode(Mins)
                    Remindertag.appendChild(Reminder) 
                    ApplicationData.appendChild(Remindertag) }
                    catch(e){} 
                    try {
					var ritems = aItems[i].recurrenceInfo.getRecurrenceItems({});
                    var rules = [];
                    var exceptions = [];
                    for each (var r in ritems) {
                    if (r.isNegative) { exceptions.push(r)}
                    else {rules.push(r)}	
                    alert(rules[0].type)
                    RecurrenceTag = xmlDoc.createElementNS("Calendar:","Recurrence")
 					IntervalTag = xmlDoc.createElementNS("Calendar:","Interval")
					interval = xmlDoc.createTextNode(rules[0].interval)
					IntervalTag.appendChild(interval)  
					RecurrenceTag.appendChild(IntervalTag)                
                    
                
                    
                    
                    
                    switch (rules[0].type) {
							    case "DAILY":
		                        ASrecure = "0"
		                        break;							
						
							    case "WEEKLY":
		                        ASrecure = "1"
		                        break;	
		                        
							    case "MONTHLY":
		                        if (rules[0].getComponent("BYDAY",{}).length === 0) {ASrecure = "2"}
		                        else {ASrecure = "3"}
		                        break;	

							    case "YEARLY":
							    if (rules[0].getComponent("BYDAY",{}).lengh != 0)
							    
		                        {ASrecure = "6"}
		                        else {ASrecure = "5"}
		                        month = xmlDoc.createTextNode(rules[0].getComponent("BYMONTH",{})[0])
		                        MonthOfYearTag = xmlDoc.createElementNS("Calendar:","MonthOfYear")
		                        MonthOfYearTag.appendChild(month)
		                        break;			                        		                        
						
					}
					TypeTag = xmlDoc.createElementNS("Calendar:","Type")
					Type = xmlDoc.createTextNode(ASrecure)
					TypeTag.appendChild(Type)
                    RecurrenceTag.appendChild(TypeTag)

                    
					}
					alert("BYDAY = " + rules[0].getComponent("BYDAY",{}))
					if (rules[0].getComponent("BYDAY",{}).length !== 0)
                    {
					dayz = rules[0].getComponent("BYDAY",{})
					alldayz = 0
					WeekOfMonthNum = 0
					if (dayz = -1) {
						alldayz = 127
						WeekOfMonthNum = 5
						
						}
						else {
                    for (dcount in dayz) {
					if (dayz[dcount] > 6) {alldayz = alldayz | Math.pow(2,((dayz[dcount] % 8) -1))
					WeekOfMonthNum = Math.floor(dayz[dcount]/8)
					}
					else {
                    alldayz = alldayz | Math.pow(2,(dayz[dcount] -1)) 
                   
				  }
				   alert("alldayz = " + alldayz)
                      }}
                    if (alldayz == -1) {alldayz = 127}
					DayOfWeek = xmlDoc.createTextNode(alldayz)	
					DayOfWeekTag = xmlDoc.createElementNS("Calendar:","DayOfWeek")
					//DayOfWeekTag.appendChild(DayOfWeek)
					//RecurrenceTag.appendChild(DayOfWeekTag)
					if (WeekOfMonthNum.length != 0 || rules[0].getComponent("BYMONTHDAY",{}) == -1 ) {
					if (WeekOfMonthNum.length == 0) {
						 WeekOfMonthNum = 5
						 DayOfWeek = xmlDoc.createTextNode(127)
						  }
					DayOfWeekTag.appendChild(DayOfWeek)
					RecurrenceTag.appendChild(DayOfWeekTag)	  
                    WeekOfMonth = xmlDoc.createTextNode(WeekOfMonthNum)
                    WeekOfMonthTag = xmlDoc.createElementNS("Calendar:","WeekOfMonth")
                    WeekOfMonthTag.appendChild(WeekOfMonth)
                    RecurrenceTag.appendChild(WeekOfMonthTag)
				}
						}
					if (rules[0].getComponent("BYMONTHDAY",{}).length !== 0 || ASrecure == "2")
                    { 
					if (rules[0].getComponent("BYMONTHDAY",{}).length !== 0)
				    { dayz = rules[0].getComponent("BYMONTHDAY",{})
				    if (dayz !== -1) {
                    DayOfMonth = xmlDoc.createTextNode(dayz[0])
                    DayOfMonthTag = xmlDoc.createElementNS("Calendar:","DayOfMonth")
					DayOfMonthTag.appendChild(DayOfMonth)	
					RecurrenceTag.appendChild(DayOfMonthTag)
                     }
                    else  {DayOfMonth = xmlDoc.createTextNode(aItems[i].startDate.day)                
					DayOfMonthTag = xmlDoc.createElementNS("Calendar:","DayOfMonth")
					DayOfMonthTag.appendChild(DayOfMonth)	
					RecurrenceTag.appendChild(DayOfMonthTag)
						}
						}
					if (ASrecure == "5" || ASrecure == "6") {RecurrenceTag.appendChild(MonthOfYearTag)}						
					}
						
						
						
					ApplicationData.appendChild(RecurrenceTag)
				        }
					catch(e) {alert(e)}                 
                    
                    alert(aItems[i].getProperty("sync"))
                    if (aItems[i].getProperty("sync") === "yes") {
						var AorC = "Change"
						var CorS = "ServerId"
						}
					else { var AorC = "Add"
					       var CorS = "ClientId" }
						
                    AddorChange = xmlDoc.createElementNS("AirSync:",AorC)
                    ClientIdtag = xmlDoc.createElementNS("AirSync:",CorS)
                    var ClientId = xmlDoc.createTextNode(aItems[i].id)
                    ClientIdtag.appendChild(ClientId)
                    AddorChange.appendChild(ClientIdtag)
                    AddorChange.appendChild(ApplicationData)
                    var lastmodtime = aItems[i].lastModifiedTime.nativeTime /1000
                    //alert(aItems[i].lastModifiedTime.nativeTime/1000)
                    //alert(lastmodtime)
                    //alert("lastmodtime = " + lastmodtime + "lastsynctime = " + lastsynctime + "thissynctime = " + thissynctime)
                    
                                                
                    if (lastmodtime > lastsynctime && lastmodtime < thissynctime) {
                    xmlDoc.getElementsByTagName("Commands")[0].appendChild(AddorChange)
                    count = count + 1

				}
				

                 alert(oSerializer.serializeToString(xmlDoc))
//alert(aItems[i].id + " " + aItems[i].title + " " + aItems[i].startDate.icalString + " " +  aItems[i].getProperty("Description"))

       
              }
              function callback(returnwbxml) { 
				  retxml = toxml(returnwbxml)
				  alert(retxml)
				  var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
             .createInstance(Components.interfaces.nsIDOMParser);
             var retxmldom = parser.parseFromString(retxml, "application/xml");
             	//ServerId = retxmldom.getElementsByTagName("ServerId")[0].childNodes[0].nodeValue
	            synckey = retxmldom.getElementsByTagName("SyncKey")[0].childNodes[0].nodeValue
	            alert(synckey)
	            tzcpush.calprefs.setCharPref("synckey",synckey)
	            var add = retxmldom.getElementsByTagName("Add")
                var addlength = retxmldom.getElementsByTagName("Add").length 
                for (var j=0;j<addlength;j++) { 
					if (add[j].getElementsByTagName("Status")[0].childNodes[0].nodeValue == "1") { 
					ClientId = add[j].getElementsByTagName("ClientId")[0].childNodes[0].nodeValue
					ServerId = add[j].getElementsByTagName("ServerId")[0].childNodes[0].nodeValue
              alert (ClientId +"\n" + ServerId )
               var holder = mycal.getItem(ClientId,tzcpush.getListener1)
               
               eventnew = oldevent.clone()
               eventnew.id = ServerId
               eventnew.setProperty("sync","yes")
               holder = mycal.getItem(ClientId,tzcpush.getListener) //delete event
               
               mycal.addItem(eventnew, null) //re add with updated server info
               
              
               
              }
              else {alert("status = " + add[j].getElementsByTagName("Status")[0].childNodes[0].nodeValue)}
              }
               tzcpush.calprefs.setCharPref("lastSyncTime",(Date.now()))
               }
               alert("count = " + count)
               if (count > 0) {
              Send(towbxml(oSerializer.serializeToString(xmlDoc)),callback,"Sync") 
		  }
           }
        }
    }

}
