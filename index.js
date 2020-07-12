const express = require('express')
const next = require('next')
const port = process.env.PORT || 3000
var http = require('http')

const ws = require('ws')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })

var handle = app.getRequestHandler()

app.prepare().then(() => {
    var server = express()

    server.use(express.static('public'))

    http = http.createServer(server)

    server.get('/app/:id',(req,res)=>{
        app.render(req,res,'/app', req.query)
    })

    server.get('/chat/:id',(req,res)=>{
        app.render(req,res,'/chat', req.query)
    })

    server.get('*', (req, res) => {
        handle(req, res)
    })

    http.listen(port, () => {
        console.log(`Listening on port ${port}`)
    })

    const wss = new ws.Server({
        server: http,
        keepAlive: {
            interval: 0001
        }
    })

    var rooms = {}
    var clients = []
    var chat = {}

    wss.getUniqueID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
    }

    wss.on('connection', (ws, req) => {
        ws.id = wss.getUniqueID()
        clients.push(ws)
        console.log(`New websocket from ${req.origin}`)
        ws.on('message', (message) => {
            console.log(message)
            message = JSON.parse(message)
            if (message.name == `id`) {
                var keys = Object.keys(rooms)
                if (keys[0] == undefined) {
                    var id = Math.floor(Math.random() * 9999) + 1000
                    rooms[id] = {
                        id: id,
                        users: [{ 'ws': ws, name: message.id }]
                    }
                    ws.send(JSON.stringify({ name: 'id', value: id }))
                } else {
                    var room = rooms[keys[Math.floor(Math.random() * keys.length)]]
                    room.users.forEach((user) => {
                        if(user.id == ws.id){
                            return
                        }
                        user.ws.send(JSON.stringify({ name: 'newUser', value: message.name, id: ws.id}))
                    })
                    room.users.push({ 'ws': ws, name: message.name })
                    ws.send(JSON.stringify({ name: 'id', value: room.id }))
                }
            } else if (message.name == 'videoStart') {
                clients.forEach((client)=>{
                    if(client.id == ws.id){
                        return
                    }
                    client.send(JSON.stringify({name: 'video', offer: message.offer}))
                })
            }else if(message.name == `video-answer`){
                clients.forEach((client)=>{
                    client.send(JSON.stringify({name: 'video-answer', answer: message.answer}))
                })
            }else if(message.name == `chat`){
                if(chat[message.id] == undefined){
                    chat[message.id] = {
                        id: message.id,
                        users: [ws]
                    }
                }else{
                    chat[message.id].users.append(ws)
                }
            }else if(message.name == `text`){
                room = chat[message.id]
                room.users.forEach((user)=>{
                    user.send(JSON.stringify({name: 'text', author: message.author, content: message.content}))
                })
            }
        })
    })

    setInterval(() => {
        var keys = Object.keys(rooms)
        if (keys[0] == undefined) {
            return
        }
        keys.forEach((key) => {
            object = rooms[key]
            object.users.forEach((user, index) => {
                if (user.ws.readyState != ws.OPEN) {
                    object.users.splice(index, 1)
                    object.users.forEach((user) => {
                        if (user.ws.readyState == ws.OPEN) {
                            user.ws.send(JSON.stringify({ name: 'removeUser', id: user.ws.id }))
                        }
                    })
                }
            })
            rooms[key] = object
        })
    }, 01)
})