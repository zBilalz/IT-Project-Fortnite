import express from "express";
import ejs from "ejs";
import session from "express-session";
import { log } from "console";
import fetch from "node-fetch";

const SESSION_SECRET = Buffer.from(require('os').userInfo().username).toString('base64');

const app = express();
app.use(session({ secret: SESSION_SECRET, cookie: {httpOnly: false} }))
app.set("view engine", "ejs");
app.set("port",3000);
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended:true}));


let ingelogd:boolean = false;
let modalText:string = "";
let users = [
    {
        username: 'admin',
        password: 'admin'
    }
];

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.get("/", (req:any,res:any) => {
    res.type("text/html");
    if (!req.session.user) {
        ingelogd = false;
        modalText = "Log eerst in";
    }
    else {
        ingelogd = true;
        modalText = "Je hebt geen toegang tot deze project";

        
    }

   
    res.render("index", {modalText:modalText,ingelogd:ingelogd});
});


app.get("/login", (req:any, res:any) => {

    res.type("text/html");
    res.render("login")
});

app.post('/login', (req, res) => {
    //login functionaliteit afkomstig van software secutiry labo
    let username = req.body.username;
    let password = req.body.password;

    for (let user of users) {
        if (user.username == username && user.password == password) {
            req.session.user = {
                username: username,
                password: password,
            }
            res.redirect('/');
           return;
        }
    }
 
    res.send('Authentication failed');

    return;
});

app.post('/registrate', (req:any,res:any) => {

});


app.get("/home", (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");
    res.render("home")
});


app.get("/skin", (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");
    res.render("skin")
});


app.get("/favoriet", (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");
    res.render("favoriet")
});


app.get("/favoriet-overzicht", (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");
    res.render("favoriet-overzicht")
});


app.get("/blacklist", (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");
    res.render("blacklist")
});







app.listen(app.get("port"), () => {
    console.log(`Web application started at http://localhost:${app.get("port")}`)
});