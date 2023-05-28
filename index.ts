import express from "express";
import ejs from "ejs";
import session from "express-session";
import fetch from "node-fetch";
import {ObjectId} from "mongodb";
import { User, Account, Favoriet, Blacklist } from "./interfaces";
const {MongoClient} = require("mongodb");

const uri:string = "mongodb+srv://s122572:8nH4X9ljX3qnju4D@cluster0.kxgul8a.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri, {useUnifiedTopology: true});

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


const createUser = async (name:string,pass:string) => {
    let user : User = {username:name,password:pass};
   
    
    try {
        await client.connect();
        await client.db("Fortnite").collection("Users").insertOne(user);
    } catch (error) {
        console.log(error);
        
    }
    finally {
        await client.close();
    }
}

const createAccountUser = async (name:string) => {
    let account : Account = {username:name};
    try {
        await client.connect();
        await client.db("Fortnite").collection("Accounts").insertOne(account);
    } catch (error) {
        console.log(error);
        
    }
    finally {
        await client.close();
    }
}

const getUsers = async () => {
    let users : User[] = [  ];
    try {
        await client.connect();
        users = await client.db("Fortnite").collection("Users").find({}).toArray();
    } catch (error) {
        console.log(error);
        
    }
    finally {
        await client.close();
    }
    return users;
}

const fetchApiChracters = async () => {
    let data;
    let characters;
    let response = await fetch("https://fortnite-api.com/v2/cosmetics/br");
    data = await response.json();
    characters = data.data.filter((item: { type: { value: any; }; }) => item.type.value === 'outfit');
    return characters;
}



app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.get("/", (req:any,res:any) => {
    let redirect :string = "";
    res.type("text/html");
    if (!req.session.user) {
        ingelogd = false;
        modalText = "Log eerst in";
        redirect="#";
    }
    else {
        ingelogd = true;
        modalText = "Je hebt geen toegang tot deze project";
        redirect="/home";

        
    }

   
    res.render("index", {modalText:modalText,ingelogd:ingelogd, redirect:redirect});
});


app.get("/login", (req:any, res:any) => {

    res.type("text/html");
    res.render("login")
});

app.post('/login', async (req, res) => {
    //login functionaliteit afkomstig van software secutiry labo
    let username = req.body.username;
    let password = req.body.password;
    let users = await getUsers();
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

app.post('/registrate', async (req:any,res:any) => {
    if (!req.body.username || !req.body.password) {
        res.redirect("/");
        return;
    }
    let username = req.body.username;
    let pass = req.body.password;
    await createUser(username,pass);
    await createAccountUser(username);
    res.redirect('/');
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

app.get("/data", async (req:any, res:any) => {
    let characters = await fetchApiChracters();
    res.type("application/json");

    for (const character of characters ) {
        if (character.name=="Koi Striker Envoy")
        res.json(character);
    }

});

app.get("/logout", (req:any,res:any) => { 
    req.session.user = null;
    res.redirect('/');} ) 
   


app.listen(app.get("port"), async () => {
    
    console.log(`Web application started at http://localhost:${app.get("port")}`)
});