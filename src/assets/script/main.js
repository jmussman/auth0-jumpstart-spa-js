// main.js
// Copyright © 2024 Okta, Inc. All rights reserved.
//
// This software is released under the MIT license: https://opensource.org/licenses/MIT.
//

import { createAuth0Client } from '@auth0/auth0-spa-js';
import 'dotenv/config';

function toggleLoginButton(isAuthenticated) {
    document.getElementById("login").style.display = isAuthenticated ? "none" : "inline";
}

function toggleLogoutButton(isAuthenticated) {
    document.getElementById("logout").style.display = isAuthenticated ? "inline" : "none";
}

function toggleAvatar(isAuthenticated, userProfile) {
    document.getElementById("avatar").style.display = isAuthenticated ? "inline" : "none";
    document.getElementById("avatar").src = userProfile?.picture;
}

function toggleName(isAuthenticated, userProfile) {
    document.getElementById("name").innerText = isAuthenticated ? ' ' + userProfile.name : '';
}

function toggleProfile(isAuthenticated, userProfile, claims) {
    document.getElementById("id-token").style.display = isAuthenticated ? "block" : "none";
    document.getElementById("id-token-claims").innerText = JSON.stringify(claims, null, 4);
}

function toggleAPIMessage(isAuthenticated, apiMessage) {
    document.getElementById("access-token").style.display = isAuthenticated ? "block" : "none";
    document.getElementById("access-token-claims").innerText = apiMessage ?? '';
}

function toggleIsAuthenticated(isAuthenticated, userProfile, claims, apiMessage) {
    toggleLoginButton(isAuthenticated);
    toggleLogoutButton(isAuthenticated);
    toggleAvatar(isAuthenticated, userProfile);
    toggleName(isAuthenticated, userProfile);
    toggleProfile(isAuthenticated, userProfile, claims);
    toggleAPIMessage(isAuthenticated, apiMessage);
}

async function initiateAPIRequest(jumpstartAPIAccessToken) {
    let apiResponse = await window.fetch(`${process.env.API_URL}/profile`, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${jumpstartAPIAccessToken}` }
    });
    return (await apiResponse.json())['access-token'];
}

async function retrieveJumpstartAPIMessage(auth0Client) {
    const jumpstartAPIAccessToken = await auth0Client.getTokenSilently();
    return await initiateAPIRequest(jumpstartAPIAccessToken);
}

// Wait for the page load, then set everything up.

window.addEventListener('load', async () => {
    auth0Client = await createAuth0Client({
        domain: process.env.AUTH0_DOMAIN,
        clientId: process.env.AUTH0_CLIENT_ID,
        useRefreshTokens: true,
        cacheLocation: 'localstorage',
        authorizationParams: {
            audience: process.env.API_AUDIENCE,
            redirect_uri: window.location.origin,
            scope: 'openid profile email offline_access token:read'
        }
    });
    
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
    const apiMessage = isAuthenticated ? await retrieveJumpstartAPIMessage(auth0Client) : null;

    toggleIsAuthenticated(isAuthenticated, userProfile, claims, apiMessage);
});