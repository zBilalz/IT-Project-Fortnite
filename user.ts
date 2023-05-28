
import session from 'express-session';
import {User} from "./interfaces";

declare module 'express-session' {
  export interface SessionData {
    user: User;
  }
}