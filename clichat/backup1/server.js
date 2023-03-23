const net  = require("net");
const fs = require('fs');

class Response
{
constructor()
{
this.action="";
this.success=false;
this.error = null;
this.result =null;
}
}

class DataModel
{
constructor()
{
this.users= []
this.userID = 0 // counter variable for alloting id to logged in user
}
getUserByUsername(username)
{
var user = this.users.find(function(user){
return user.username==username;
});
return user;
}
getLoggedInUsers()
{
var loggedInUsers = [];
for(var e=0; e<=this.users.length;e++)
{
if(this.users[e].loggedIn)
{
loggedInUsers.push(this.users[e].username);
}
}
return loggedInUsers;
}
}



var model = new DataModel();
function populateDataStructure()
{
var usersJSONString= fs.readFileSync('users.data', 'utf-8');
var users = JSON.parse(usersJSONString).users;
users.forEach(function(user){
user.loggedIn=false;
user.id =0;
model.users.push(user);
});
}

function processRequest(requestObject)
{
 if(requestObject.action=='login')
{
let username = requestObject.username;
let password =requestObject.password;
let user= model.getUserByUsername(username);
var success=false;
if(user)
{
if(password==user.password) success=true;
}
let response = new Response();
response.action = requestObject.action;
response.success =success;
if(success) 
{
response.error="";
model.userID++;
requestObject.socket.userId = model.userID; // to know which user this socket represents
user.id = model.userID;
user.loggedIn=true;
response.result = {
"username": user.username,
"id": user.id
};
}
else
{
response.error="Invalid username/password";
response.result="";
}
requestObject.socket.write(JSON.stringify(response));
}

if(requestObject.action=='logout')
{
}

if(requestObject.action=='getUsers')
{
var response = new Response();
response.action= requestObject.action;
response.result= model.getLoggedInUsers();
requestObject.socket.write(JSON.stringify(response));
}

}



populateDataStructure();
var server = net.createServer(function(socket){
socket.on('data', function(data){
var requestObject = JSON.parse(data);
requestObject.socket = socket; 
try{
processRequest(requestObject);
}catch(e)
{
console.log(e);
}
});
socket.on('end', function(){
console.log('Client client connection.');
});
socket.on('error',function(){
console.log('There was some problem on client side.');
});
});

server.listen(5500, 'localhost');
console.log('Chat server is ready to accept request on port 5500.');