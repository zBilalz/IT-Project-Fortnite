import session from "express-session";
import fetch from "node-fetch";
import {ObjectId} from "mongodb";
import { User, Account, Favoriet, Blacklist, Fortnite, Images } from "./interfaces";
const {MongoClient} = require("mongodb");
const uri:string = "mongodb+srv://s122572:8nH4X9ljX3qnju4D@cluster0.kxgul8a.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri, {useUnifiedTopology: true});

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

