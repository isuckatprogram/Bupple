import { withRouter } from 'next/router'

class Chat extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            loadedWebSocket: false,
            id: undefined
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
    loadWebSocket(){
        window.socket = new WebSocket(`wss://e624eb103653.ngrok.io/${this.state.id}`)

        socket.onmessage = (message)=>{
            message = JSON.parse(message.data)
            console.log(message)
            if(message.name == `text`){
                this.message(`${message.author}: ${message.content}`)
            }
        }
        socket.onerror = (err)=>{
            console.error(err)
            this.message(`An error occured`)
        }
        socket.onclose = ()=>{
            this.message(`WebSocket has been closed`)
        }
        socket.onopen = ()=>{
            this.message(`Connection is opened!`)
            socket.send(JSON.stringify({name: 'chat', id: window.id}))
        }
    }
    sendMessage(e){
        e.preventDefault()
        var message = document.getElementById('message')
        if(window.id == undefined){
            alert('oh oh')
            return
        }
        socket.send(JSON.stringify({name: 'text', content: message.value, author: this.getCookie('nickname'), id: window.id}))
        document.getElementById('message').value = ''
    }
    message(message){
        var div = document.createElement('div')
        var p = document.createElement('p')
        p.innerText = message
        div.append(p)
        document.getElementById('messages').append(div)
        div.scrollIntoView(true)
    }
    componentDidMount(){
        if(this.state.id == undefined){
            window.id = new URL(location).searchParams.get('id')
        }
        this.loadWebSocket()
    }
    render(){
        return (
            <div>
            <div id="messages">
                
            </div>
            <form id="form" onSubmit={this.sendMessage.bind(this)}>
                <input type="text" autoFocus={true} id="message"/>
            </form>
            <style jsx>{`
                #messages{
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: scroll;
                }
                #messages div{
                    display: inline-block;
                    width: 100%;
                }
                form{
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                }
                form input{
                    width: 100%;
                }
            `}</style>
        </div>
        )
    }
}

export default withRouter(Chat)