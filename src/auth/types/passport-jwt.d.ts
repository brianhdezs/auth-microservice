// Redefinir los tipos de passport-jwt para hacerlos más flexibles
declare module 'passport-jwt' {
  import { Request } from 'express';
  import { Strategy as PassportStrategy } from 'passport';

  export interface StrategyOptions {
    jwtFromRequest: (req: Request) => string | null;
    secretOrKey?: string;
    secretOrKeyProvider?: (request: Request, rawJwtToken: any, done: (err: any, secret: string) => void) => void;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
    jsonWebTokenOptions?: any;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: (...args: any[]) => void);
    constructor(options: StrategyOptions, verify: (...args: any[]) => Promise<any>);
  }

  export namespace ExtractJwt {
    export function fromAuthHeaderAsBearerToken(): (req: Request) => string | null;
    export function fromAuthHeaderWithScheme(scheme: string): (req: Request) => string | null;
    export function fromHeader(header_name: string): (req: Request) => string | null;
    export function fromUrlQueryParameter(param_name: string): (req: Request) => string | null;
    export function fromBodyField(field_name: string): (req: Request) => string | null;
    export function fromCookie(cookie_name: string): (req: Request) => string | null;
    export function fromExtractors(extractors: Array<(req: Request) => string | null>): (req: Request) => string | null;
  }
}