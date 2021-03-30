// here the mock is imported not the original implementation
import { GitRestClient } from "./Git"

/**
 * Mocking getClient returns different mocked client depending on the request
 * in our sample only GitRestClient is used
 */
export function getClient(clientClass: any) {

    if (typeof clientClass === typeof GitRestClient) {
        return new GitRestClient({});
    }

}
