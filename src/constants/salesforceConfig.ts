export const browserOauthRedirectURI = `${ location.origin }${ location.pathname }#/oauth/callback`;

export const grantTypes = {
    authorizationCode: 'authorization_code',
    refreshToken: 'refresh_token',
};
