createAuth0Client({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    useRefreshTokens: true,
    cacheLocation: 'localstorage',
    authorizationParams: {
        audience: process.env.API_AUDIENCE,
        redirect_uri: window.location.origin,
        scope: 'openid profile email offline_access token:read'
    }
}).then(async (auth0Client) => {
    // Assumes a button with id "login" in the DOM
    const loginButton = document.getElementById("login");
    
    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        auth0Client.loginWithRedirect();
    });
    
    if (location.search.includes("state=") && 
        (location.search.includes("code=") || 
        location.search.includes("error="))) {
            await auth0Client.handleRedirectCallback();
            window.history.replaceState({}, document.title, "/");
    }

    // Assumes a button with id "logout" in the DOM
    const logoutButton = document.getElementById("logout");
    
    logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        auth0Client.logout();
    });
    
    const isAuthenticated = await auth0Client.isAuthenticated();
    const userProfile = await auth0Client.getUser();
    const claims = await auth0Client.getIdTokenClaims(); 
    const apiMessage = isAuthenticated ? retrieveJumpstartAPIMessage(auth0Client) : null;

    toggleIsAuthenticated(isAuthenticated, userProfile, claims, apiMessage);
});
