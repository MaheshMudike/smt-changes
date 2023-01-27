
import { ThunkAction as ReduxThunkAction, ThunkDispatch } from "redux-thunk";
import { IGlobalState, GetGlobalState } from "../models/globalState";
import { Action } from "redux";

export type ThunkAction<R> = ReduxThunkAction<R, IGlobalState, undefined, Action>;

export type ThunkDispatch = ThunkDispatch<IGlobalState, undefined, Action>;

//this is the standard implementation of ReturnType as a reference
//type ReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : any;

export type ThunkActionReturnType1<T extends (p1: any) => ThunkAction<any>> = 
    T extends (p1: infer P1) => ThunkAction<infer R> ? (p1: P1) => R : any;

export type ThunkActionReturnType2<T extends (p1: any, p2: any) => ThunkAction<any>> = 
    T extends (p1: infer P1, p2: infer P2) => ThunkAction<infer R> ? (p1: P1, p2: P2) => R : any;