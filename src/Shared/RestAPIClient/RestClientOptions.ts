
import { IVssRestClientOptions } from "azure-devops-extension-api/Common";
import { getAppToken } from "azure-devops-extension-sdk";

/**
 * Implementation of Rest Client Options Interface IVssRestClientOptions
 * Includes the Extensions Bearer Token (AppToken) in the Auth Header
 */
export class RestClientOptions implements IVssRestClientOptions {
    /** Value for Authorization Header */
    public authTokenProvider = {
        getAuthorizationHeader: (): Promise<string> => {
            // return getAccessToken().then(token => token ? ("Bearer " + token) : "");
            return getAppToken().then(token => token ? ("Bearer " + token) : "");
        }
    };
    /** Root Path (AzDO Specific) not needed */
    public rootPath = undefined;
    /** SessionID (AzDO Specific) not needed */
    public sessionId = undefined;
    /** Command (AzDO Specific) not needed */
    public command = undefined;
}
