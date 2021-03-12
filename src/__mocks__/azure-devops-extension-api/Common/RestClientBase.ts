import { IVssRestClientOptions } from "azure-devops-extension-api/Common";
import { RestClientRequestParams } from "azure-devops-extension-api/Common/RestClientBase";


/**
 * Accessor mocks to change the behaviour of the mocked HTTP results
 */
export const mockHTTPError = jest.fn().mockReturnValue(false);
export const mockGetVersionedItemLink = jest.fn();
export const mockPostRequests = jest.fn((requestUrl: string, request: RestClientRequestParams) => { return request });
export let spyAuthorizationHeader: string;

/**
 * Mocking RestClientBase
 * as we can not have external dependencies in unit tests
 * all HTTP requests are short cut here, expected results are defined
 * within the unit tests
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
        const result: any = [];
        return new Promise((resolve) => resolve(result));
    }

    /**
     * Issue a request to a VSS REST endpoint at the specified location
     *
     * @param requestUrl Resolved URL of the request
     * @param apiVersion API version
     * @param requestParams Optional request parameters
     */
    protected _issueRequest<T>(requestUrl: string, apiVersion: string, requestParams: RestClientRequestParams): Promise<T> {

        // be able to throw an error to test HTTP request error handling
        if (mockHTTPError()) {
            throw new Error("Mocked HTTP Error");
        }

        let result: any = [];

        // for GET requests depending on the requested service
        // (identified via the URL) return a different mocked result
        if (requestUrl.match(/\/api\/versioneditem\/\d+\?api-version=/) && requestParams.method === "GET") {
            result = mockGetVersionedItemLink();
        }
        // for POST requests call a mock to be able to be able to
        // check the request payload in the unit test
        else if (requestParams.method === "POST") {
            mockPostRequests(requestUrl, requestParams);
        }

        return new Promise((resolve) => resolve(result));
    }
}
