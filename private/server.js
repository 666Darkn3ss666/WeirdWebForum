const fs = require("fs")
const express = require("express")
const app = express()

app.set("view engine", "ejs")
app.set("views", "../views")

app.use(express.json())

let requests = 0
let started = true

let userList = {}
fs.readFile("./users/users.txt", (err, data) => {
    userList = JSON.parse(data.toString())
    console.log(userList)
})

app.get("/", (req, res) => {
    if (started === true) {
    res.redirect("/login")
    requests++
    } else {
        res.redirect("/404")
    }
})

app.get("/login", (req, res) => {
    if (started === true) {
    console.log("login page accessed")
    requests++
    res.render("./login/login")
    } else {
    res.redirect("/404")
    }
})

app.get("/signup", (req, res) => {
    if (started === true) {
    console.log("signup page accessed")
    requests++
    res.render("./signup/signup")
    } else {
    res.redirect("/404")
    }
})

app.get("/home", (req, res) => {
    if (started === true) {
    console.log("home page accessed")
    requests++
    res.render("./home/home")
    } else {
    res.redirect("/404")
    }
})

app.get("/friends", (req, res) => {
    if (started === true) {
    console.log("friends page accessed")
    requests++
    res.render("./friends/friends")
    } else {
    res.redirect("/404")
    }
})

app.get("/account", (req, res) => {
    if (started === true) {
    console.log("account page accessed")
    requests++
    res.render("./account/account")
    } else {
    res.redirect("/404")
    }
})

app.get("/dev", (req, res) => {
    console.log("dev page accessed")
    requests++
    res.render("./dev/dev", {requests})
})

app.get("/404", (req, res) => {
    if (started === false) {
    res.render("./404/404")
    } else {
    res.redirect("/")
    }
})

app.post("/users/login", (req, res) => {
    if (started === true) {
    console.log("user login request recieved")
    requests++
    const data = req.body
    let found = false
    userList.users.forEach((user) => {
        if ((user.username === data.username) && (user.password === data.password)) {
            res.send(JSON.stringify({foundUser: true}))
            found = true
            console.log("user found")
        }
    })
    if (found === false) {
        res.send(JSON.stringify({foundUser: false}))
        console.log("user not found")
    }
    } else {
    res.redirect("/404")
    }
})

app.post("/users/signup", (req, res) => {
    if (started === true) {
    console.log("user signup request recieved")
    requests++
    const data = req.body
    let userExists = false
    userList.users.forEach((user) => {
        if (user.username === data.username) {
            userExists = true
        }
    })
    if (userExists === false) {
        res.send(JSON.stringify({createdUser: true}))
        console.log("creating user")
        userList.users.push({username: data.username, password: data.password})
        save()
    } else {
        res.send(JSON.stringify({createdUser: false}))
        console.log("user already exists")
    }
    } else {
    res.redirect("/404")
    }
})

app.post("/dev/admin", (req, res) => {
    const data = req.body
    if (data.pswrd == "060405050604050") {
        if (data.action === "stop") {
            started = false
            res.send(JSON.stringify({result: "stopped"}))
        } else if (data.action === "start") {
            started = true
            requests = 0
            res.send(JSON.stringify({result: "started"}))
        }
    }
})

app.listen(3000, () => {
    console.log("Example server listening on port 3000")
})

function save() {
    fs.writeFile("./users/users.txt", JSON.stringify(userList), (err) => {console.log("users saved")})
}
