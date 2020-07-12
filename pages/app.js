import { useRouter } from 'next/router'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            websocketStarted: false,
            members: []
        }
    }
    getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    async startWebSocket() {
        if (window.id) {
            window.socket = new WebSocket(`wss://e624eb103653.ngrok.io/${window.id}`)
        } else {
            window.socket = new WebSocket(`wss://e624eb103653.ngrok.io/`)
        }

        socket.onopen = () => {
            // this.startVideoCall()
            socket.send(JSON.stringify({ name: 'id', id: this.getCookie('nickname') }))
        }

        socket.onmessage = async (message) => {
            message = message.data
            message = JSON.parse(message)
            if (message.name == 'id') {
                this.setState({ id: message.value })
            } else if (message.name == `newUser`) {
                var user = document.createElement('div')
                user.className = `user`
                user.id = message.id
                user.style.border = `2px solid`
                user.style.borderRadius = `50%`
                user.style.width = `190px`
                user.style.height = `190px`
                user.style.cursor = `pointer`
                user.style.position = `absolute`
                user.style.bottom = `${Math.floor(Math.random() * 50) + 2}%`
                user.style.left = `${Math.floor(Math.random() * 50) + 2}%`
                user.title = message.value
                var img = document.createElement('img')
                img.src = `/static/profile.svg`
                img.style.border = `0px solid`
                img.style.borderRadius = `50%`
                img.style.width = `100%`
                img.style.height = `100%`
                user.append(img)
                document.getElementById('users').append(user)
            } else if (message.name == `removeUser`) {
                document.getElementById(message.id).hidden = true
            } else if (message.name == `error`) {
                this.error(message.error)
            } else if (message.name == `video`) {
                var offer = message.offer
                window.clientConnection = new RTCPeerConnection()
                clientConnection.setRemoteDescription(new RTCSessionDescription(offer))
                var a = await clientConnection.createAnswer()
                await clientConnection.setLocalDescription(new RTCSessionDescription(a))
                clientConnection.ontrack = ({ stream })=>{
                    var videoDiv = document.createElement('div')
                    videoDiv.style.position = `absolute`
                    videoDiv.style.bottom = `${Math.floor(Math.random() * 50) + 2}%`
                    videoDiv.style.left = `${Math.floor(Math.random() * 50) + 2}%`
                    videoDiv.style.border = `2px solid`
                    videoDiv.style.width = `190px`
                    videoDiv.style.height = `190px`
                    videoDiv.style.cursor = `pointer`
                    var video = document.createElement('video')
                    video.srcObject = stream
                    video.autoPlay = true
                    video.style.border = `0px solid`
                    video.style.width = `100%`
                    video.style.height = `100%`
                    videoDiv.append(video)
                    document.getElementById('users').append(videoDiv)
                }
                socket.send(JSON.stringify({ name: 'video-answer', answer: a }))
            } else if (message.name == `video-answer` && window.recording) {
                await connection.setRemoteDescription(new RTCSessionDescription(message.answer))
            }
        }
        socket.onerror = (err) => {
            console.log(` [websocket] An error occured`)
            this.error(`Could not connect to websocket please reload the page`)
        }

        socket.onclose = () => {
            console.log(` [websocket] WebSocket closed`)
        }
    }
    async startVideoCall() {
        try {
            var stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            document.getElementsByClassName('video')[0].hidden = false
            document.getElementById('you').srcObject = stream
            window.recording = true
            window.connection = new RTCPeerConnection()
            stream.getTracks().forEach(track => connection.addTrack(track, stream))
            var offer = await connection.createOffer()
            await connection.setLocalDescription(new RTCSessionDescription(offer))
            socket.send(JSON.stringify({ name: 'videoStart', offer: offer }))
        }
        catch(err){
            this.error(`Couldn't start video call`)
        }
    }
    error(text) {
        var error = document.getElementsByClassName('error')[0]
        error.innerText = text
        error.hidden = false
    }
    componentDidMount() {
        if (this.state.id) {
            window.id = this.state.id
        } else {
            window.id = location.pathname.split('/')[2]
        }
        this.startWebSocket()
    }
    render() {
        return (
            <div style={{ textAlign: 'center' }} id="users">
                <iframe id="chat" src={`/chat?id=${this.state.id}`}></iframe>
                <div className="user you" style={{ position: 'absolute', bottom: '42%', left: '15%' }} draggable={true}>
                    <img src="/static/profile.svg" />
                </div>
                <div className="video" style={{ position: 'absolute', bottom: '32%', left: '33%' }} hidden>
                    <video autoPlay muted id="you"></video>
                </div>
                <div className="error" hidden>Error</div>
                <style jsx>{`
                    .user{
                        border: 2px solid;
                        border-radius: 50%;
                        width: 190px;
                        height: 190px;
                        cursor: pointer;
                    }
                    .user img{
                        border: 0px solid;
                        border-radius: 50%;
                        width: 100%;
                        height: 100%;
                    }
                    .video{
                        border: 2px solid;
                        width: 190px;
                        height: 190px;
                        cursor: pointer;
                    }
                    .video video{
                        border: 0px solid;
                        width: 100%;
                        height: 100%;
                    }
                    .error{
                        width: fit-content;
                        height: fit-content;
                        background-color: red;
                        border: 2px solid red;
                        border-radius: 10px 10px;
                        padding: 10px 10px;
                        position: absolute;
                        bottom: 0;
                        right: 50%;
                    }
                    .error *{
                        display: inline-block;
                    }
                `}</style>
            </div>
        )
    }
}

export default App