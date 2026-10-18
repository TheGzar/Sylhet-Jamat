'use client';
import {createContext,useContext,type ReactNode} from 'react';
type Copy=Record<string,{bn?:string;en?:string}>;
const Context=createContext<Copy>({});
export function SiteTextProvider({overrides,children}:{overrides:Copy;children:ReactNode}){return <Context.Provider value={overrides}>{children}</Context.Provider>}
export function useSiteText(bn:boolean,overrides?:Copy){const inherited=useContext(Context);return (bangla:string,english:string)=>{const custom=(overrides||inherited)[english];return custom?.[bn?'bn':'en']??(bn?bangla:english)}}
