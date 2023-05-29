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

//standaard heeft de sessiondata de property "user" niet, hieronder wordt de originele sessiondata overschreven met een property user
declare module 'express-session' {
     interface SessionData {
      user: {[key: string]: User };
    }
  }

const app = express();
app.use(session({ secret: SESSION_SECRET, cookie: {httpOnly: false} }))
app.set("view engine", "ejs");
app.set("port",3000);
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended:true}));


let ingelogd:boolean = false;
let modalText:string = "";
let currentUserName : string = "";
let rarity:string = "";
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

const getCurrentAccount = async () => {
    let account : Account = {username:""};
    try {
        await client.connect();
        account = await client.db("Fortnite").collection("Accounts").findOne({username:currentUserName});
    } catch (error) {
        console.log(error);
        
    }
    finally {
        await client.close();
    }
    return account;
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
            currentUserName = username;
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


app.get("/home", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");

    res.render("home", {characters:await fetchApiChracters(), account: await getCurrentAccount()})
});


let skinName:string;
let skinBackstory:string;
let skinImage:string;
let introduction:string;

app.get("/skin/:name", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    let getSkinName: string = req.params.name;
    res.type("text/html");
    let characters = await fetchApiChracters();
    for (const character of characters) {
        if (character.name == getSkinName) {
            skinName = character.name;
            skinBackstory = character.description;
            skinImage = character.images.icon;
            introduction = character.introduction.text;
            rarity = character.rarity.value;
            if (rarity != "epic" && rarity != "legendary" && rarity != "rare"  && rarity != "uncommon" ) {
                rarity = "unique";
            }
            
        }
    }    
    
    res.render("skin", {skinName:skinName,skinBackstory:skinBackstory,skinImage:skinImage, introduction:introduction, account: await getCurrentAccount(), rarity:rarity.toUpperCase()})

});

app.get("/skin/:type/:name", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");
    let getType: string = req.params.type;
    let getName: string = req.params.name;

    
    if (getType == "pfp") {
        try {
            await client.connect();
            let characters = await fetchApiChracters();
            for (const character of characters) {
                    if (character.name == getName) {
                       await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username}, {$set:{profielfoto:character.images.icon}});
                    }
            }
            
            
            
        } catch (error) {
            console.log(error);
            
        }
        finally {
            await client.close();
        }
       
    }
    res.redirect(`/skin/${skinName}`)
    }
);



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
    

        res.json(characters);
  

});

app.get("/logout", (req:any,res:any) => { 
    req.session.user = null;
    res.redirect('/');} ) 
   


app.listen(app.get("port"), async () => {
    
    console.log(`Web application started at http://localhost:${app.get("port")}`)
});