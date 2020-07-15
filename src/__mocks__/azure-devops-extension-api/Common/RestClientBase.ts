import { IVssRestClientOptions } from "azure-devops-extension-api/Common";
import { RestClientRequestParams } from "azure-devops-extension-api/Common/RestClientBase";


/**
 * Accessors to Mocked Rest Client Base methods
 */
export const mockHTTPError = jest.fn().mockReturnValue(false);
export const mockGetVersionedItemLink = jest.fn();
export const mockPostRequests = jest.fn((requestUrl: string, request: RestClientRequestParams) => { return request });
export let spyAuthorizationHeader: string;
/**
 * Mocked Rest Client Base
 */
export class RestClientBase {

    constructor(options: IVssRestClientOptions) {
        // call getAuthorizationHeader
        options.authTokenProvider?.getAuthorizationHeader().then(
            (value) => spyAuthorizationHeader = value
        );
    }

    /**
     * Gets the root path of the Service
     *
     * @returns Promise for the resolving the root path of the service.
     */
    protected getRootPath(): Promise<string> {
        return new Promise((resolve) => resolve("root"));
    }

    /**
     * Issue a request to a VSS REST endpoint.
     *
     * @param requestParams request options
     * @returns Promise for the response
     */
    protected beginRequest<T>(requestParams: RestClientRequestParams): Promise<T> {
        return new Promise((resolve) => resolve(undefined));
    }

    /**
     * Issue a request to a VSS REST endpoint at the specified location
     *
     * @param requestUrl Resolved URL of the request
     * @param apiVersion API version
     * @param requestParams Optional request parameters
     */
    protected _issueRequest<T>(requestUrl: string, apiVersion: string, requestParams: RestClientRequestParams): Promise<T> {

        if (mockHTTPError()) {
            throw new Error("Mocked HTTP Error");
        }

        let result: any = [];

        if (requestUrl.match(/\/api\/versioneditem\/\d+\?api-version=/) && requestParams.method === "GET") {
            result = mockGetVersionedItemLink();
        }
        else if (requestParams.method === "POST") {
            mockPostRequests(requestUrl, requestParams);
        }

        return new Promise((resolve) => resolve(result));
    }
}
