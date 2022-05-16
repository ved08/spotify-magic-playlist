const express = require("express")
const crypto = require("crypto")
const cookieParser = require("cookie-parser")
const querystring = require("query-string")
const request = require("request")
const cors = require("cors")
const app = express()
require("dotenv").config()

app.use(cookieParser())
app.use(cors())
app.use(express.json())

const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const redirect_uri = "https://magic-playlist-frontend.vercel.app/dashboard"
const scope =  ['playlist-modify-public', 'user-read-email', 'user-read-private'].join(" ") 

app.get("/", (req, res) => {
    res.send("Hello world CORS enabled")
})
app.get("/login", (req, res) => {
    crypto.randomBytes(8, (err, buffer) => {
        if (err) {
            console.log(err)
        }
        const state = buffer.toString("hex")
        const loginUrl = "https://accounts.spotify.com/authorize?" + 
        querystring.stringify({
            response_type: 'code',
            client_id,
            scope,
            redirect_uri,
            state
        })
        res.json({loginUrl, state})
    })
})
app.post("/user", (req, res) => {
    const {code, state, cookieState} = req.body
    console.log(code, state)
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: "authorization_code",
            code,
            redirect_uri
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
        };
    request.post(authOptions, (err, response, body) => {
        const { access_token, refresh_token } = body
        res.json({access_token, refresh_token})

        // WORKING EXAMPLE
        // axios({
        //     method: 'put',
        //     url: 'https://api.spotify.com/v1/me/following?type=artist&ids=2sjFmfxifbUo2A25xuQOp0',
        //     headers: {
        //         'Authorization': 'Bearer ' + access_token
        //     }
        // }).then(res => {
        //     console.log("followed artist!")
        // }).catch(err => console.log("error occured"))

        // axios({
        //     method: 'put',
        //     url: 'https://api.spotify.com/v1/me/player/pause',
        //     headers: {
        //         'Authorization': 'Bearer ' + access_token
        //     }
        // }).then(res => {
        //     console.log(res.data)
        // }).catch(err => console.log("error", err)) 
        
    })
})

app.listen(process.env.PORT || 5000, () => {
    console.log("Server started")
})