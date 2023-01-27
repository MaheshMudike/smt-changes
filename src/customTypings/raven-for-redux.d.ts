declare module 'raven-for-redux' {
    import { Middleware } from 'redux';

    export default function createRavenMiddleware(raven: any): Middleware;
}
