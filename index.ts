import express from "express";
import ejs from "ejs";
import session from "express-session";
import fetch from "node-fetch";
import {ObjectId} from "mongodb";
import { User, Account, Favoriet, Blacklist, Fortnite, Images } from "./interfaces";
const csurf = require("csurf");
const CryptoJS = require('crypto-js');
const {MongoClient} = require("mongodb");
const uri:string = "mongodb+srv://s122572:8nH4X9ljX3qnju4D@cluster0.kxgul8a.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri, {useUnifiedTopology: true});
const SESSION_SECRET = Buffer.from(require('os').userInfo().username).toString('base64');

//standaard heeft de sessiondata de property "user" niet, hieronder wordt de originele sessiondata overschreven met een property user
declare module 'express-session' {
     interface SessionData {
      user: {[username: string]: User };
    }
  }

const app = express();
app.use(session({ secret: SESSION_SECRET, cookie: {httpOnly: false} }))
app.set("view engine", "ejs");
app.set("port",3000);
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended:true}));
app.use(csurf());

let salt = CryptoJS.lib.WordArray.random();

  
let ingelogd:boolean = false;
let modalTextIndex:string = "";
let favStatus:string="";    
let favGevonden:boolean=false;
let registratieStatus: boolean = false;
let favChanged:boolean=false;
let favText:string="";
let items:Fortnite[]=[];
let itemTypes:string[] = [];
let errorRegistratie:boolean=false;
let characters:Fortnite[]=[];
let characterNames:string[]=[];

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
    let account : Account = {username:name, favoriet:[],blacklist:[]};
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
    let data:any;
    
    let response = await fetch("https://fortnite-api.com/v2/cosmetics/br");
    data = await response.json();
    characters = data.data.filter((item: Fortnite) => item.type.value === 'outfit');
   characters = characters.slice(0,50); 
   for (const charact of characters) {
    characterNames.push(charact.name)
}
}

fetchApiChracters();

const fetchOneApiChracter = async (naam:string) => {
    let characters:any;
    let character:any;
    let response = await fetch("https://fortnite-api.com/v2/cosmetics/br");
    characters = await response.json();
    for (const char of characters.data) {
        if (char.name == naam && char.type.value == "outfit") {
            character = char;
        }
    }
    return character;
}

const getCurrentAccount = async (username:string) => {
    let account : Account = {username:"", favoriet:[],blacklist:[]};
    try {
        await client.connect();
        account = await client.db("Fortnite").collection("Accounts").findOne({username:username});
    } catch (error) {
        console.log(error);
        
    }
    finally {
        await client.close();
    }
    return account;
}

const getRarityCharact = (character:Fortnite) : string => {
    let rarity:string = character.rarity.value;
    if (rarity != "epic" && rarity != "legendary" && rarity != "rare"  && rarity != "uncommon" ) {
        rarity = "unique";
    }   

    return rarity;
}

const getCurrentFav = async (account:Account, characterName:string) => {
    if (account.favoriet == undefined) {
        return;
    }
    let fav:Favoriet={naam:"", notitie:"",item1:"",item2:"", wins:0,loses:0};
        for (const favo of account.favoriet) {
            if (favo.naam == characterName) {
                fav=favo;
            }
        }
        return fav;
}

const getItem = (list:Fortnite[],itemname:string) : string => {
    for (const index of list) {
        if (index.name == itemname) {
            return index.images.icon;
        }
    }
    return "";
}

const blacklistCharacter = async(name:string, reason:string, username:string) => {
    try {
        let acc:Account = await getCurrentAccount(username);
      
        let deleteFav:Favoriet={naam:"",notitie:"",item1:"",item2:"",wins:0,loses:0};
        for (const fav of acc.favoriet) {
            if (fav.naam == name) {
                deleteFav = fav;
            }
        }
        let filteredFavoriet = acc.favoriet.filter((fav) => fav != deleteFav);
        acc.favoriet = filteredFavoriet
        let character:Fortnite = await fetchOneApiChracter(name);
        let rarity:string =  getRarityCharact(character);
        acc.blacklist.push({naam:name, reden:reason,img:character.images.icon,rarity:rarity})
        await client.connect();
        await client.db("Fortnite").collection("Accounts").replaceOne({username:acc.username}, acc);
    
} catch (error) {
    console.log(error);
}
finally {
    await client.close();
}
}

const loadItemTypes = async () => {
   
    let response = await fetch("https://fortnite-api.com/v2/cosmetics/br");
    let data = await response.json();
    for (const item of data.data) {
        if (item.type.value !="outfit" && item.type.value != "loadingscreen" && item.type.value !="banner" && item.type.value != "music" && item.type.value != "pet" && item.type.value != "emote") {
           if (itemTypes.indexOf(item.type.value) === -1) {
            itemTypes.push(item.type.value)
           }
                items.push(item);
        }
    }
    
    
    let sortedItems:Fortnite[]=[];
    let counter:number=0;
    for (let i = 0; i < itemTypes.length; i++) {
        
        do {
            for (let j = 0; j < items.length; j++) {
                
                if (sortedItems.indexOf(items[j]) == -1 && items[j].type.value == itemTypes[i] && items[j].name.includes("Test") ==false  && items[j].name.includes("Personal") ==false) {
                    sortedItems.push(items[j])
                        counter++;
                        
                        break;
                }
              
                
            }
        } while (counter <=10);
        counter =0;

    }
    items = sortedItems;   
}

loadItemTypes();

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.get("/",  async (req:any,res:any) => {
    let redirect :string = "";
    res.type("text/html");
    if (!req.session.user) {
        ingelogd = false;
        modalTextIndex = "Log eerst in";
        redirect="#";
    }
    else {
        ingelogd = true;
        modalTextIndex = "Je hebt geen toegang tot deze project";
        
        redirect="/home";

        
    }

   
    res.render("index", {modalText:modalTextIndex,ingelogd:ingelogd, redirect:redirect});
});


app.get("/login", (req:any, res:any) => {

    res.type("text/html");
    
    res.render("login", {registratie:registratieStatus, error:errorRegistratie, csrfToken: req.csrfToken()});
    registratieStatus=false;
    errorRegistratie =false;
});

app.post('/login', async (req, res) => {
    //login functionaliteit afkomstig van software secutiry labo
    let username = req.body.username;
    let password = req.body.password;
    let users = await getUsers();
    let hash = CryptoJS.PBKDF2(password, salt, {
        iterations: 10000,
      }).toString();
    for (let user of users) {
        if (user.username == username && user.password == hash) {
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
    try {
        await client.connect();
        let resultaat = await client.db("Fortnite").collection("Users").findOne({username:username});
        if (resultaat != null) {
            errorRegistratie = true;
            res.redirect('/login');
            return;
        }
        console.log();
        
    } catch (error) {
        console.log(error);
        
    }
    finally {
        await client.close();
    }
    let hash = CryptoJS.PBKDF2(pass, salt, {
        iterations: 10000,
      }).toString();
    await createUser(username,hash);
    await createAccountUser(username);
    registratieStatus = true;
    res.redirect('/login');
});


app.get("/home", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");
    let acc = await getCurrentAccount(req.session.user.username);
    let blacklistNames:string[]=[];
    
    if (acc.blacklist.length > 0) {
        for (const blacklist of acc.blacklist) {
            blacklistNames.push(blacklist.naam);
        }
    }


    res.render("home", {characters:characters, account: await getCurrentAccount(req.session.user.username), blacklistNames:blacklistNames})
});

app.get("/skin/:name", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }

    if (characterNames.includes(req.params.name) == false) {
        res.redirect("/home");
        return;
    }
    res.type("text/html");

    let character:Fortnite = await fetchOneApiChracter(req.params.name); 
    let acc : Account = await getCurrentAccount(req.session.user.username);

    if (acc.favoriet == undefined) {
        return;
    }
    favStatus = "Add to";
    
    for (const fav of acc.favoriet) {
       
        
        if (character.name == fav.naam) {
            favStatus = "Delete from";
        }
        
    }
    
  
    res.render("skin", {csrfToken: req.csrfToken(), favChanged:favChanged,favText:favText ,skinName:character.name,skinBackstory:character.description,skinImage:character.images.icon, introduction:character.introduction.text, account: await getCurrentAccount(req.session.user.username), rarity:getRarityCharact(character), favStatus:favStatus})
    favChanged = false;
    favText = "";
});

app.get("/skin/:name/:type", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");
    
    if (characterNames.includes(req.params.name) == false) {
        res.redirect("/home");
        return;
    }
    try {
       
    if (req.params.type == "pfp") {
           
            let character:Fortnite = await fetchOneApiChracter(req.params.name);
                       await client.connect();
                       await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username}, {$set:{profielfoto:character.images.icon}});
                    
            
            
            
        }
        else if (req.params.type == "fav") {
            favChanged = true;
            let acc : Account = await getCurrentAccount(req.session.user.username);
            
            if (acc.favoriet == undefined) {
                return;
            }
            for (const fav of acc.favoriet) {
                    
                    if (req.params.name == fav.naam) {
                        favText="Character deleted from favorite list";
                        await client.connect();
                        favGevonden = true;
                        let filteredFavoList:Favoriet[] = acc.favoriet.filter((fav) => fav.naam != req.params.name);
                        acc.favoriet = filteredFavoList;
                        await client.db("Fortnite").collection("Accounts").replaceOne({username:req.session.user.username}, acc);
                    }
                }
  
            
            if (favGevonden == false) {
                favText="Character added to favorite list";
                await client.connect();
                acc.favoriet.push({naam:req.params.name, notitie:"",item1:"",item2:"", wins:0,loses:0})
                await client.db("Fortnite").collection("Accounts").replaceOne({username:req.session.user.username}, acc);
            }
        }
       
        } catch (error) {
            console.log(error);
           
        }
        finally {
            await client.close();
        }
    
    favGevonden = false;
    res.redirect(`/skin/${req.params.name}`)
    }
);

app.post("/skin/:name/:type", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    
    let acc:Account = await getCurrentAccount(req.session.user.username);

    if (req.params.type == "blacklist") {

        await blacklistCharacter(req.params.name,req.body.reasonBlacklist, req.session.user.username);
    }

    
    
    res.redirect(`/home`)
})



app.get("/favoriet", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }

    res.type("text/html");
    let acc:Account = await getCurrentAccount(req.session.user.username);
    let favCharacters : Fortnite[] = [];
    if (acc.favoriet == undefined) {
        return;
    }
    for (const character of acc.favoriet) {
        for (let i = 0; i < characters.length; i++) {
            if (character.naam == characters[i].name) {
                favCharacters.push(characters[i])
            }
        }
    }
    
    res.render("favoriet", {characters: favCharacters, account: await getCurrentAccount(req.session.user.username)})
});




app.get("/favoriet-overzicht/:name", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/"); 
        return;
    }
    res.type("text/html");
    let gevonden:boolean = false;
    let acc:Account = await getCurrentAccount(req.session.user.username)
    for (const fav of acc.favoriet) {
        if (fav.naam == req.params.name) {
            gevonden = true;
        }
    }
    let blacklisted:boolean = false;
    for (const blacklist of acc.blacklist) {
        if (blacklist.naam == req.params.name) {
            blacklisted = true;
        }
    }
    if (!gevonden || blacklisted) {
        res.redirect("/favoriet");
        return;
    }
    let character:Fortnite = await fetchOneApiChracter(req.params.name)
    let rarity = getRarityCharact(character);
    let huidigeFav = await getCurrentFav(acc,req.params.name);
    if (huidigeFav == undefined) {
        return;
    }
    let filteredItems:Fortnite[] = [];

    for (const item of items) {
       if(item.name != huidigeFav.item1 &&item.name != huidigeFav.item2 ){
            filteredItems.push(item)
        }
    }
    
    res.render("favoriet-overzicht", {csrfToken: req.csrfToken(), account: acc, character: character, rarity:rarity, notitie:huidigeFav.notitie, items:filteredItems, item1:getItem(items,huidigeFav.item1),item2:getItem(items,huidigeFav.item2), wins:huidigeFav.wins, loses:huidigeFav.loses})
});



app.get("/favoriet-overzicht/:name/:type", async (req:any,res:any) => {
    if (!req.session.user) {
        res.redirect("/"); 
        return;
    }
         
         if (req.params.type == "Win") {
            let acc: Account = await getCurrentAccount(req.session.user.username);
            let currentFav = await getCurrentFav(acc, req.params.name);
            if (currentFav == undefined || currentFav.wins == undefined) {
                return;
            }
            currentFav.wins += 1;
            try {
                await client.connect();
                await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username, "favoriet.naam": req.params.name}, {$set:{"favoriet.$.wins":currentFav.wins}});
            } catch (error) {
                console.log(error);
                
            }
            finally {
                await client.close();
            }
        }

        else if (req.params.type == "Loss") {
            let acc: Account = await getCurrentAccount(req.session.user.username);
            let currentFav = await getCurrentFav(acc, req.params.name);
            if (currentFav == undefined || currentFav.loses == undefined) {
                return;
            }
            currentFav.loses += 1;
            if (currentFav.wins == 0 && currentFav.loses >= 3) {
                await blacklistCharacter(currentFav.naam,"personage trekt op niets", req.session.user.username);
                res.redirect("/favoriet");
                return;
            }
            else if (currentFav.wins != 0 && currentFav.loses >= currentFav.wins * 3) {
                await blacklistCharacter(currentFav.naam,"personage trekt op niets", req.session.user.username);
                res.redirect("/favoriet");
                return;

            }
          
            try {
                await client.connect();
                await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username, "favoriet.naam": req.params.name}, {$set:{"favoriet.$.loses":currentFav.loses}});
            } catch (error) {
                console.log(error);
                
            }
            finally {
                await client.close();
            }
        }

        else if (req.params.type == "deleteItem") {
            try {
                await client.connect();
                let stringFavItem : string = `favoriet.$.${req.query.item}`;
                
                await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username, "favoriet.naam": req.params.name}, {$set:{[stringFavItem]:""}});
            } catch (error) {
                console.log(error);
                
            }
            finally {
                await client.close();
            }
        }
           
    res.redirect(`/favoriet-overzicht/${req.params.name}`)
})



app.post("/favoriet-overzicht/:name/:type", async (req:any,res:any) => {
    if (!req.session.user) {
        res.redirect("/"); 
        return;
    }
            if (req.params.type == "addNote") {
                if (req.body.notitie.length > 0) {
                    try {
                        await client.connect();
                        await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username, "favoriet.naam": req.params.name}, {$set:{"favoriet.$.notitie":req.body.notitie}});
                    } catch (error) {
                        console.log(error);
                        
                    }
                    finally {
                        await client.close();
                    }
                 
                }
            }
            else if (req.params.type == "deleteNote") {
                try {
                    await client.connect();
                    await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username, "favoriet.naam": req.params.name}, {$set:{"favoriet.$.notitie":""}});
                } catch (error) {
                    console.log(error);
                    
                }
                finally {
                    await client.close();
                }
             
            }
           
    res.redirect(`/favoriet-overzicht/${req.params.name}`)
})

app.get("/favoriet-overzicht/:name/:type/:item", async (req:any,res:any) => {
    if (!req.session.user) {
        res.redirect("/"); 
        return;
    }

    if (req.params.type == "addItem")
    {    
        try {
            await client.connect();
            let stringFavItem : string = `favoriet.$.${req.params.item}`
            await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username, "favoriet.naam": req.params.name}, {$set:{[stringFavItem]:req.query.name}});
        } catch (error) {
            console.log(error);
            
        }
        finally {
            await client.close();
        }
    }
    

    res.redirect(`/favoriet-overzicht/${req.params.name}`)
});

app.get("/blacklist", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");

    res.render("blacklist", {account: await getCurrentAccount(req.session.user.username), csrfToken: req.csrfToken()})
}); 

app.get("/blacklist/:name/:type", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
     
    if (characterNames.includes(req.params.name) == false) {
        res.redirect("/blacklist");
        return;
    }
    res.type("text/html");
    if (req.params.type == "delete") {
        try {
            let acc:Account = await getCurrentAccount(req.session.user.username);
          
            let deleteChar:Blacklist={naam:"",reden:"", rarity:"",img:""};
            for (const char of acc.blacklist) {
                if (char.naam == req.params.name) {
                    deleteChar = char;
                }
            }
            let filteredBlacklist = acc.blacklist.filter((fav) => fav != deleteChar);
            acc.blacklist = filteredBlacklist;
            await client.connect();
            await client.db("Fortnite").collection("Accounts").replaceOne({username:acc.username}, acc);
        
    } catch (error) {
        console.log(error);
    }
    finally {
        await client.close();
    }
    }
    res.redirect("/blacklist");
}); 

app.post("/blacklist/:id/:type", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }

    if (req.params.type == "change") {
        let acc:Account = await getCurrentAccount(req.session.user.username);
        acc.blacklist[req.params.id].reden = req.body.changeReason;
        try {
            await client.connect();
            await client.db("Fortnite").collection("Accounts").replaceOne({username:acc.username}, acc);
        
    } catch (error) {
        console.log(error);
    }
    finally {
        await client.close();
    }

    }
    res.redirect("/blacklist")
    
})


app.get("/logout", (req:any,res:any) => { 
    req.session.user = null;
    res.redirect('/');} 
    ) 

app.use((req, res) => {
    if (!req.session.user) {
        res.redirect("/"); 
        return;
    }
        res.type("text/html");
        res.status(404);
        res.send("404 - Not Found");
        }
    );
   


app.listen(app.get("port"), async () => {
    
    console.log(`Web application started at http://localhost:${app.get("port")}`)
});