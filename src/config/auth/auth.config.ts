import { IBearerStrategyOptionWithRequest } from 'passport-azure-ad';

const config = {
    credentials: {
        tenantName: process.env.TENANT_NAME,
        clientID: process.env.APP_CLIENT_ID,
        issuer: process.env.CREDENTIALS_ISSUER
    },
    policies: {
        policyName: process.env.ADMIN_SIGN_IN_POLICY,
    },
    resource: {
        scope: ["submissions.read"]
    },
    metadata: {
        discovery: ".well-known/openid-configuration",
        version: "v2.0"
    },
    settings: {
        isB2C: true,
        validateIssuer: true,
        passReqToCallback: true,
        loggingLevel: 'info' as 'info',
    }
}

export const authOptions: IBearerStrategyOptionWithRequest = {
    identityMetadata: `https://${config.credentials.tenantName}.b2clogin.com/${config.credentials.tenantName}.onmicrosoft.com/${config.policies.policyName}/${config.metadata.version}/${config.metadata.discovery}`,
    clientID: config.credentials.clientID,
    audience: config.credentials.clientID,
    issuer: config.credentials.issuer,
    policyName: config.policies.policyName,
    isB2C: config.settings.isB2C,
    scope: config.resource.scope,
    validateIssuer: config.settings.validateIssuer,
    loggingLevel: config.settings.loggingLevel,
    passReqToCallback: config.settings.passReqToCallback
};
