import router from "next/router"
import Head from "next/head"

class HomePage extends React.Component {
    constructor(props) {
        super(props)
        var backgrounds = ['blue', 'red', 'green', 'orange']
        this.state = {
            'background': backgrounds[Math.floor(Math.random() * backgrounds.length)]
        }
    }
    startChat(e) {
        e.preventDefault()
        this.setCookie(`nickname`,document.getElementById('nickname').value)
        router.push(`/app`)
    }
    setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    render() {
        return (
            <div style={{ backgroundColor: this.state.background, textAlign: 'center', width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, color: 'white' }}>
                <div style={{ margin: 'auto' }}>
                    <h1 style={{ fontSize: '40px' }}>Bupple</h1>
                    <form onSubmit={this.startChat.bind(this)}>
                        <input type="text" id="nickname" placeholder="Nickname" /><br />
                        <input type="submit" />
                    </form>
                    <style jsx>{`
                    input[type=text]{
                        padding: 10px 10px;
                        outline: none;
                    }
                    input[type=submit]{
                        padding: 5px 5px;
                        cursor: pointer;
                    }
                `}</style>
                </div>
            </div>
        )
    }
}

export default HomePage