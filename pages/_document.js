import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document{
    static async getInitialProps(a) {
        const initialProps = await Document.getInitialProps(a)
        return { ...initialProps }
    }
    render(){
        return (
            <Html>
              <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
                <link rel="shortcut icon" type="image/png" href="/static/Bupple.png"/>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/light.min.css"></link>
                <style jsx>{`
                    *{
                        font-family: Arial;
                    }
                `}</style>
              </Head>
              <body>
                <Main />
                <NextScript />
              </body>
            </Html>
          )
    }
}

export default MyDocument