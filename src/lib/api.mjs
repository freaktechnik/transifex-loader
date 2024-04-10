import fetch from 'node-fetch';
import { setTimeout } from 'node:timers/promises';

const ONE_MINUTE = 1000,
    TEN_MINUTES = 10000,
    STATUS_CODE = {
        Ok: 200,
        Accepted: 202,
        SeeOther: 303,
    };

async function getDownload({
    username,
    password,
    downloadId,
    status,
    timeout = TEN_MINUTES,
}) {
    if(username !== 'api') {
        throw new Error('Must use token authentication. See https://docs.transifex.com/client/client-configuration#section-~-transifexrc on how to configure client to authenticate with a token.');
    }
    const Authorization = `Bearer ${password}`,
        url = `https://rest.api.transifex.com/resource_translations_async_downloads/${downloadId}`,
        startTime = Date.now();
    while((status === 'pending' || status === 'processing') && Date.now() - startTime <= timeout) {
        const response = await fetch(url, {
            headers: {
                Authorization,
                Accept: 'application/vnd.api+json',
            },
            redirect: 'manual',
        });
        if(response.status === STATUS_CODE.Ok) {
            const body = await response.json();
            ({ status } = body.attributes);
            await setTimeout(ONE_MINUTE);
        }
        else if(response.status === STATUS_CODE.SeeOther) {
            const fileLocation = response.headers.get('Location');
            return fetch(fileLocation);
        }
    }
    if(status === 'failed') {
        throw new Error(`Transifex could not provide a download for ${downloadId}`);
    }
    if(Date.now() - startTime > timeout) {
        throw new Error(`Giving up trying to download ${downloadId} because it's taking too long`);
    }
    throw new Error(`Unexpected status ${status} while downloading ${downloadId}`);
}

export async function getResource({
    username,
    password,
    project,
    resource,
    language,
    organization,
}) {
    if(username !== 'api') {
        throw new Error('Must use token authentication. See https://docs.transifex.com/client/client-configuration#section-~-transifexrc on how to configure client to authenticate with a token.');
    }
    const Authorization = `Bearer ${password}`,
        response = await fetch(`https://rest.api.transifex.com/resource_translations_async_downloads`, {
            headers: {
                Authorization,
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        'content_encoding': 'text',
                        'file_type': 'default',
                        mode: 'default',
                    },
                    relationships: {
                        language: {
                            data: {
                                id: `l:${language}`,
                                type: 'languages',
                            },
                        },
                        resource: {
                            data: {
                                id: `o:${organization}:p:${project}:r:${resource}`,
                                type: 'resources',
                            },
                        },
                    },
                    type: 'resource_translations_async_downloads',
                },
            }),
            redirect: 'manual',
            method: 'POST',
        });
    if(response.ok && response.status === STATUS_CODE.Accepted) {
        const fileLocation = response.headers.get('Content-Location');
        if(fileLocation) {
            const fileRequest = await fetch(fileLocation);
            return fileRequest.text();
        }
        const body = await response.json();
        if(body.attributes.status === 'failed') {
            throw new Error(`Transifex could not provide a download for ${resource}`);
        }
        return getDownload({
            username,
            password,
            downloadId: body.id,
            status: body.attributes.status,
        });
    }
}
