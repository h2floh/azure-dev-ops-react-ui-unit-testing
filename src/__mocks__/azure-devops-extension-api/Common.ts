import { GitRestClient } from "./Git"

/**
 * Mocked getClient returns different client depending on request
 */
export function getClient(clientClass: any) {

    if (typeof clientClass === typeof GitRestClient) {
        return new GitRestClient({});
    }

}
