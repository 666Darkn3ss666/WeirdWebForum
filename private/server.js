const fs = require("fs")
const express = require("express")
const app = express()

app.set("view engine", "ejs")
app.set("views", "../views")

app.use(express.json())

let requests = 0
let started = true

let userList = {}
let postList = {}
let info = {}
fs.readFile("./users/users.txt", (err, data) => {
    userList = JSON.parse(data.toString())
})

fs.readFile("./posts/currentPosts.txt", (err, data) => {
    postList = JSON.parse(data.toString())
})

fs.readFile("./info.txt", (err, data) => {
    info = JSON.parse(data.toString())
})

app.get("/", (req, res) => {
    if (started === true) {
    res.redirect("/home")
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

app.get("/feed", (req, res) => {
    if (started === true) {
    console.log("feed page accessed")
    requests++
    res.render("./feed/feed")
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
    res.redirect("/home")
    }
})

app.post("/users/login", (req, res) => {
    if (started === true) {
    console.log("user login request recieved")
    requests++
    const data = req.body
    let found = false
    userList.users.forEach((user) => {
        if ((user.id == data.id) && (user.password == data.password)) {
            res.send(JSON.stringify({foundUser: true, username: user.username}))
            found = true
            console.log("user found")
        }
    })
    if (found === false) {
        res.send(JSON.stringify({foundUser: false}))
        console.log("user not found")
    }
    }
})

app.post("/users/signup", (req, res) => {
    if (started === true) {
    console.log("user signup request recieved")
    requests++
    const data = req.body
    const id = userList.nextID
    res.send(JSON.stringify({id: id}))
    userList.users.push({username: data.username, password: data.password, id: id})
    userList.nextID = id + 1
    console.log("user created")
    }
})

app.post("/account/changeUsername", (req, res) => {
    if (started === true) {
    const data = req.body
    let updated = false
    userList.users.forEach((user) => {
        if (user.id == data.id) {
            user.username = data.newUsername
            updated = true
            res.send(JSON.stringify({result: "Username updated"}))
        }
    })
    if (updated === false) {
        res.send(JSON.stringify({result: "Update not successful"}))
    }
}})

app.post("/account/deleteUser", (req, res) => {
    if (started === true) {
    const data = req.body
    let deleted = false
    userList.users.forEach((user) => {
        if (user.id == data.id) {
            userList.users.splice(user.id, 1)
            deleted = true
            res.send(JSON.stringify({result: "Account deleted"}))
        }
    })
    if (deleted === false) {
        res.send(JSON.stringify({result: "Something went wrong"}))
    }
}})

app.post("/feed/getPosts", (req, res) => {
    if (started === true) {
    const data = req.body
    let postsToSend = []
    if (data.lastPostId == postList.currentPostNum) {
        res.send(JSON.stringify({result: "up to date"}))
    } else {
        postList.posts.forEach((post) => {
            if (post.id >= data.lastPostId) {
                postsToSend.push(post)
            }
        })
        res.send(JSON.stringify(postsToSend))
    }
}})

app.post("/feed/createPost", (req, res) => {
    if (started === true) {
    const data = req.body
    const userID = Number(data.userID)
    const user = data.username
    const text = data.text
    const postID = postList.currentPostNum
    postList.currentPostNum++
    postList.posts.push({id: postID, userID: userID, username: user, text: text})
    res.send(JSON.stringify({result: "Post created"}))
    if (postList.currentPostNum === (postList.currentBatch * 100)) {
        archivePosts()
    }
}})

app.post("/dev/admin", (req, res) => {
    const data = req.body
    if (data.pswrd == "060405050604050") {
        if (data.action === "stop") {
            started = false
            save()
            res.send(JSON.stringify({result: "stopped"}))
            console.log("Server stopped")
        } else if (data.action === "start") {
            started = true
            requests = 0
            save()
            res.send(JSON.stringify({result: "started"}))
            console.log("Server started")
        }
    } else {
        res.send("Wrong password")
    }
})

app.post("/dev/createAnnouncement", (req, res) => {
    const data = req.body
    if (data.pswrd == "060405050604050") {
        info.posts.push({id: info.currentInfoNum, text: data.msg})
        info.currentInfoNum++
        fs.writeFile("./info.txt", JSON.stringify(info), (err) => {if (err != null) {console.log(err)} else {console.log("Saved info")}})
    } else {
        res.send("Wrong password")
    }
})

app.post("/home/getInfo", (req, res) => {
    if (started === true) {
    let infoPack = []
    info.posts.forEach((post) => {
        infoPack.push(post)
    })
    res.send(JSON.stringify(infoPack))
}})

function archivePosts() {
    let APosts = postList.posts
    let date = new Date()
    let y = date.getFullYear()
    let m = date.getMonth() + 1
    let d = date.getDate()
    let h = date.getHours()
    let min = date.getMinutes()
    let ADate = (y + "-" + m + "-" + d + "_" + h + "-" + min)
    fs.writeFile("./posts/archive/" + ADate + ".txt", JSON.stringify(APosts), (err) => {if (err != null) {console.log(err)} else {console.log("Posts archived")}})
    postList.currentBatch++
    postList.posts = [postList.posts[49]]
    savePosts()
}

function saveUsers() {
    if (userList != "{}") {
        fs.writeFile("./users/users.txt", JSON.stringify(userList), (err) => {if (err != null) {console.log(err)}})
    }
}

function savePosts() {
    if (userList != "{}") {
        fs.writeFile("./posts/currentPosts.txt", JSON.stringify(postList), (err) => {if (err != null) {console.log(err)}})
    }
}

function save() {
    saveUsers()
    savePosts()
    console.log("SAVED")
}

setInterval(() => {save()}, 60000)

app.listen(3000, () => {
    console.log("Server listening on port 3000")
})
