import express from "express";
import ejs from "ejs";
import session from "express-session";
import fetch from "node-fetch";
import {ObjectId} from "mongodb";
import { User, Account, Favoriet, Blacklist, Fortnite, Images } from "./interfaces";
import { log } from "console";
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
let itemTypes:string[] = [];
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
    let account : Account = {username:"",favoriet:[],blacklist:[]};
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
    let fav:Favoriet={naam:""};
        for (const favo of account.favoriet) {
            if (favo.naam == characterName) {
                fav=favo;
            }
        }
        return fav;
}

const loadItemTypes =async () => {
   
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

const getItem = (list:Fortnite[],itemname:string) : string => {
    for (const index of list) {
        if (index.name == itemname) {
            return index.images.icon;
        }
    }
    return "";
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

app.get("/skin/:type/:name", async (req:any, res:any) => {
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
                acc.favoriet.push({naam:skinName})
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
    let item1:string;
    let item2:string;
    if (huidigeFav == undefined) {
        return;
    }
   
    if (huidigeFav.item1 == undefined || huidigeFav.item1 == "") {
        item1 = "/fotos/item_questionmark.jpg";
    }
    else {
        item1 = getItem(items,huidigeFav.item1);
    }

    
    if (huidigeFav.item2 == undefined || huidigeFav.item2 == "") {
        item2 = "/fotos/item_questionmark.jpg";
    }
    else {
        item2 = getItem(items,huidigeFav.item2);
    }
    let filteredItems:Fortnite[] = [];

    for (const item of items) {
       if(item.name != huidigeFav.item1 &&item.name != huidigeFav.item2 ){
            filteredItems.push(item)
        }
    }
    
    res.render("favoriet-overzicht", {account: await getCurrentAccount(), character: await fetchOneApiChracter(req.params.name), rarity:rarity, notitie:huidigeFav.notitie, items:filteredItems, item1:item1,item2:item2})
});

app.post("/favoriet-overzicht/:type/:naam", async (req:any,res:any) => {
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

    if (req.params.type == "addItem") {
        itemNumber+=req.params.item.charAt(req.params.item.length-1);
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

app.get("/favoriet-overzicht/:name/:type/:item/", async (req:any,res:any) => {
    if (!req.session.user) {
        res.redirect("/"); 
        return;
    }
    let itemNumber:string = "item";

   
        itemNumber+=req.params.item.charAt(req.params.item.length-1);
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
        
    

    res.redirect(`/favoriet-overzicht/${req.params.name}`)
})



app.get("/blacklist", (req:any, res:any) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.type("text/html");
    res.render("blacklist")
});

app.get("/data", async (req:any, res:any) => {
    res.type("application/json");

  
    res.json(items);

});

app.get("/logout", (req:any,res:any) => { 
    req.session.user = null;
    res.redirect('/');} ) 
   


app.listen(app.get("port"), async () => {
    
    console.log(`Web application started at http://localhost:${app.get("port")}`)
});