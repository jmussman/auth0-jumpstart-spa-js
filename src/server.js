// server.js
// Copyright © 2025 Okta, Inc. All rights reserved.
//
// This software is released under the MIT license: https://opensource.org/licenses/MIT.
//

import cors from 'cors';
import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import { expressjwt } from 'express-jwt';
import jwksClient from 'jwks-rsa'

function initializeJwks() {
    const jwks = jwksClient({ jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json` })
    jwks.keyCache = {}
    jwks.retrieveSigningKey = async (req, jwt) => {
        let key = jwks.keyCache[jwt?.header?.kid]
        if (!key && jwt?.header?.kid) {
            key = (await jwks.getSigningKey(jwt.header.kid))?.getPublicKey();
            jwks.keyCache[jwt.header.kid] = key
        }
        return key;
    }
    return jwks;
}

function initializeExpress() {
    const app = express();
    app.use(cors())
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    return app;
}

function authenticationRequired(jwks) {
    return expressjwt({ secret: jwks.retrieveSigningKey,
        algorithms: ['RS256'],
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        audience: process.env.API_AUDIENCE });
}

function authorizationRequired(scopes) {
    return (req, res, next) => {
        let tokenScopes = req.auth?.scope?.split(' ');
        if (Array.isArray(scopes) && scopes.every(scope => tokenScopes.includes(scope))) {
            return next();
        }
        return res.status(403).send('Insufficient scope');
    }
}

function setRoutes(app, jwks) {
    app.get('/profile', authenticationRequired(jwks), authorizationRequired(['token:read']), (req, res) => {
        if (!req.auth) {
            return res.status(401).json({ message: 'Unauthorized' });
        } else {
            console.log(`/profile request handled for subject ${req.auth.sub}`)
            return res.status(200).json({ 'access-token': JSON.stringify(req.auth, null, 4) });
        }
    });
}

function resolveServiceAddresses() {
    const appPort = process.env.APP_SERVICE_PORT;
    const apiPort = process.env.API_SERVICE_PORT;
    const codespace = process.env.CODESPACE_NAME;
    if (codespace) {
        return [ `https://${codespace}-${apiPort}.app.github.dev`, `https://${codespace}-${appPort}.app.github.dev` ];
    } else {
        return [ `http://localhost:${apiPort}`, `http://localhost:${appPort}` ];
    }
}

function rewriteEnvironmentVariables(apiURL) {
    if (apiURL != process.env.API_URL) {
        const auth0Domain = process.env.AUTH0_DOMAIN;
        const auth0ClientId = process.env.AUTH0_CLIENT_ID;
        const appServicePort = process.env.APP_SERVICE_PORT;
        const apiServicePort = process.env.API_SERVICE_PORT;
        const apiAudience = process.env.API_AUDIENCE;
        fs.writeFile('.env', 
`AUTH0_DOMAIN=${auth0Domain}
AUTH0_CLIENT_ID=${auth0ClientId}
APP_SERVICE_PORT=${appServicePort}
API_SERVICE_PORT=${apiServicePort}
API_AUDIENCE=${apiAudience}
API_URL=${apiURL}`,
        (error) => {
            if (error) {
                console.log('Failed to rewrite environment variables');
            }
        });
    }
}

function listen(app, apiURL, appEndpoint) {
    app.listen(process.env.API_SERVICE_PORT, () => {
        console.log(`Web service is accessible at ${apiURL}`);
        console.log(`Web application is accessible at ${appEndpoint}`);
    });
}

function start() {
    const jwks = initializeJwks();
    const app = initializeExpress();
    setRoutes(app, jwks);
    const [apiURL, appEndpoint] = resolveServiceAddresses();
    rewriteEnvironmentVariables(apiURL);
    listen(app, apiURL, appEndpoint);
}

start();