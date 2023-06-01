import express from "express";
import ejs from "ejs";
import session from "express-session";
import fetch from "node-fetch";
import {ObjectId} from "mongodb";
import { User, Account, Favoriet, Blacklist, Fortnite, Images } from "./interfaces";
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
let modalTextIndex:string = "";
let currentUserName : string = "";
let favStatus:string="";    
let favGevonden:boolean=false;
let registratieStatus: boolean = false;
let favChanged:boolean=false;
let favText:string="";
let items:Fortnite[]=[];

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
    let characters:Fortnite[];
    let response = await fetch("https://fortnite-api.com/v2/cosmetics/br");
    data = await response.json();
    characters = data.data.filter((item: Fortnite) => item.type.value === 'outfit');
    return characters;
}

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

const getCurrentAccount = async () => {
    let account : Account = {username:"", favoriet:[],blacklist:[]};
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

const blacklistCharacter = async(name:string, reason:string) => {
    try {
        let acc:Account = await getCurrentAccount();
        await client.connect();
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
        await client.db("Fortnite").collection("Accounts").replaceOne({username:acc.username}, acc);
    
} catch (error) {
    console.log(error);
}
finally {
    await client.close();
}
}

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
    
    res.render("login", {registratie:registratieStatus});
    registratieStatus=false;
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
    registratieStatus = true;
    res.redirect('/login');
});


app.get("/home", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");
    let acc = await getCurrentAccount();
    let blacklistNames:string[]=[];
    
    if (acc.blacklist.length > 0) {
        for (const blacklist of acc.blacklist) {
            blacklistNames.push(blacklist.naam);
        }
    }


    res.render("home", {characters:await fetchApiChracters(), account: await getCurrentAccount(), blacklistNames:blacklistNames})
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

    let character:Fortnite = await fetchOneApiChracter(getSkinName); 
    skinName = character.name;
    skinBackstory = character.description;
    skinImage = character.images.icon;
    introduction = character.introduction.text;
    let rarity = getRarityCharact(character);

    let acc : Account = await getCurrentAccount();

    if (acc.favoriet == undefined) {
        return;
    }
    favStatus = "Add to";
    
    for (const fav of acc.favoriet) {
       
        
        if (skinName == fav.naam) {
            favStatus = "Delete from";
        }
        
    }
    
  
    
    
    res.render("skin", {favChanged:favChanged,favText:favText ,skinName:skinName,skinBackstory:skinBackstory,skinImage:skinImage, introduction:introduction, account: await getCurrentAccount(), rarity:rarity, favStatus:favStatus})
    favChanged = false;
    favText = "";
});

app.get("/skin/:name/:type", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");
    let getType: string = req.params.type;
    let getName: string = req.params.name;

    try {
       
    if (getType == "pfp") {
           
            let character:Fortnite = await fetchOneApiChracter(getName);
                       await client.connect();
                       await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username}, {$set:{profielfoto:character.images.icon}});
                    
            
            
            
        }
        else if (getType == "fav") {
            favChanged = true;
            let acc : Account = await getCurrentAccount();
            if (acc.favoriet == undefined) {
                return;
            }
            for (const fav of acc.favoriet) {
                 
                    if (skinName == fav.naam) {
                        favText="Character deleted from favorite list";
                        await client.connect();
                        let newfavArray:Favoriet[]=[];
                        favGevonden = true;
                        for (let i = 0; i < acc.favoriet.length; i++) {
                            if (acc.favoriet[i].naam != skinName) {
                                newfavArray.push(acc.favoriet[i]);
                            }
                            
                        }
                        acc.favoriet = newfavArray;
                        await client.db("Fortnite").collection("Accounts").replaceOne({username:req.session.user.username}, acc);
                    }
                }
  
            
            if (favGevonden == false) {
                favText="Character added to favorite list";
                await client.connect();
                acc.favoriet.push({naam:skinName, notitie:"",item1:"",item2:"", wins:0,loses:0})
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
    res.redirect(`/skin/${skinName}`)
    }
);

app.post("/skin/:name/:type", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    let acc:Account = await getCurrentAccount();

    if (req.params.type == "blacklist") {

        await blacklistCharacter(skinName,req.body.reasonBlacklist);
    }

    
    
    res.redirect(`/home`)
})



app.get("/favoriet", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }

    res.type("text/html");

    let characters: Fortnite[] = await fetchApiChracters();
    let acc:Account = await getCurrentAccount();
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
    
    res.render("favoriet", {characters: favCharacters, account: await getCurrentAccount()})
});




app.get("/favoriet-overzicht/:name", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/"); 
        return;
    }
    res.type("text/html");
    let rarity = getRarityCharact(await fetchOneApiChracter(req.params.name));
    let huidigeFav = await getCurrentFav(await getCurrentAccount(),req.params.name);
    if (huidigeFav == undefined) {
        return;
    }
    let filteredItems:Fortnite[] = [];

    for (const item of items) {
       if(item.name != huidigeFav.item1 &&item.name != huidigeFav.item2 ){
            filteredItems.push(item)
        }
    }
    
    res.render("favoriet-overzicht", {account: await getCurrentAccount(), character: await fetchOneApiChracter(req.params.name), rarity:rarity, notitie:huidigeFav.notitie, items:filteredItems, item1:getItem(items,huidigeFav.item1),item2:getItem(items,huidigeFav.item2), wins:huidigeFav.wins, loses:huidigeFav.loses})
});



app.get("/favoriet-overzicht/:naam/:type", async (req:any,res:any) => {
    if (!req.session.user) {
        res.redirect("/"); 
        return;
    }
        

         if (req.params.type == "Win") {
            let acc: Account = await getCurrentAccount();
            let currentFav = await getCurrentFav(acc, req.params.naam);
            if (currentFav == undefined || currentFav.wins == undefined) {
                return;
            }
            currentFav.wins += 1;
            try {
                await client.connect();
                await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username, "favoriet.naam": req.params.naam}, {$set:{"favoriet.$.wins":currentFav.wins}});
            } catch (error) {
                console.log(error);
                
            }
            finally {
                await client.close();
            }
        }

        else if (req.params.type == "Loss") {
            let acc: Account = await getCurrentAccount();
            let currentFav = await getCurrentFav(acc, req.params.naam);
            if (currentFav == undefined || currentFav.loses == undefined) {
                return;
            }
            currentFav.loses += 1;
            try {
                await client.connect();
                await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username, "favoriet.naam": req.params.naam}, {$set:{"favoriet.$.loses":currentFav.loses}});
            } catch (error) {
                console.log(error);
                
            }
            finally {
                await client.close();
            }
        }
           
    res.redirect(`/favoriet-overzicht/${req.params.naam}`)
})



app.post("/favoriet-overzicht/:naam/:type", async (req:any,res:any) => {
    if (!req.session.user) {
        res.redirect("/"); 
        return;
    }
            if (req.params.type == "addNote") {
                if (req.body.notitie.length > 0) {
                    try {
                        await client.connect();
                        await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username, "favoriet.naam": req.params.naam}, {$set:{"favoriet.$.notitie":req.body.notitie}});
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
                    await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username, "favoriet.naam": req.params.naam}, {$set:{"favoriet.$.notitie":""}});
                } catch (error) {
                    console.log(error);
                    
                }
                finally {
                    await client.close();
                }
             
            }
           
    res.redirect(`/favoriet-overzicht/${req.params.naam}`)
})

app.get("/favoriet-overzicht/:name/:type/:item/:itemName", async (req:any,res:any) => {
    if (!req.session.user) {
        res.redirect("/"); 
        return;
    }
    let itemNumber:string = "item"

    if (req.params.type == "addItem")
    {    itemNumber+=req.params.item.charAt(req.params.item.length-1);
        try {
            await client.connect();
            let stringFavItem : string = `favoriet.$.${itemNumber}`
            await client.db("Fortnite").collection("Accounts").updateOne({username:req.session.user.username, "favoriet.naam": req.params.name}, {$set:{[stringFavItem]:req.params.itemName}});
        } catch (error) {
            console.log(error);
            
        }
        finally {
            await client.close();
        }
    }
    

    res.redirect(`/favoriet-overzicht/${req.params.name}`)
});

app.get("/favoriet-overzicht/:name/:type/:item", async (req:any,res:any) => {
    if (!req.session.user) {
        res.redirect("/"); 
        return;
    }
    let itemNumber:string = "item";

   if (req.params.type == "deleteItem")
      {  itemNumber+=req.params.item.charAt(req.params.item.length-1);
        try {
            await client.connect();
            let stringFavItem : string = `favoriet.$.${itemNumber}`
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



app.get("/blacklist", async (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");

    res.render("blacklist", {account: await getCurrentAccount()})
}); 



app.get("/data", async (req:any, res:any) => {
    res.type("application/json");

  
    res.json(items);

});





app.get("/logout", (req:any,res:any) => { 
    req.session.user = null;
    res.redirect('/');} ) 

    app.use((req, res) => {
        res.type("text/html");
        res.status(404);
        res.send("404 - Not Found");
        }
    );
   


app.listen(app.get("port"), async () => {
    
    console.log(`Web application started at http://localhost:${app.get("port")}`)
});