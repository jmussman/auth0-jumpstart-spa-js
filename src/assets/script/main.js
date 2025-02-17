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

function toggleNameIsAuthenticated(isAuthenticated, userProfile) {
    document.getElementById("name").innerText = isAuthenticated ? ' ' + userProfile.name : '';
}

function toggleProfileIsAuthenticated(isAuthenticated, userProfile, claims) {
    document.getElementById("id-token").style.display = isAuthenticated ? "block" : "none";
    document.getElementById("id-token-claims").innerText = JSON.stringify(claims, null, 4);
}

function toggleAPIMessageIsAuthenticated(isAuthenticated, apiMessage) {
    document.getElementById("access-token").style.display = isAuthenticated ? "block" : "none";
    document.getElementById("access-token-claims").innerText = apiMessage;
}

function toggleIsAuthenticated(isAuthenticated, userProfile, claims, apiMessage) {
    toggleLoginButton(isAuthenticated);
    toggleLogoutButton(isAuthenticated);
    toggleAvatar(isAuthenticated, userProfile);
    toggleNameIsAuthenticated(isAuthenticated, userProfile);
    toggleProfileIsAuthenticated(isAuthenticated, userProfile, claims);
    toggleAPIMessageIsAuthenticated(isAuthenticated, apiMessage);
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
});