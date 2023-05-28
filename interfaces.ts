import { ObjectId } from "mongodb";


export interface User {
    _id?:ObjectId,
    username: string,
    password: string
}


export interface Account {
    _id?:ObjectId,
    username:string,
    profielfoto?:string,
    favoriet?:Favoriet[],
    blacklist?:Blacklist[]
}

export interface Blacklist {
    naam:string,
    reden:string
}

export interface Favoriet {
    naam:string,
    notitie:string,
    item1?:string,
    item2?:string,
    wins:number,
    loses:number
}