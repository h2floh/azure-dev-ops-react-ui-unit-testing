import { RestClientRequestParams } from "azure-devops-extension-api/Common/RestClientBase";

/**
 * Implementation of Rest Client Request Parameters for Interface RestClientRequestParams
 * Defines mainly API Version and Content-Type
 */
export class RestAPIClientRequestParams implements RestClientRequestParams {
    /**
     * Route template that is used to form the request path. If routeTemplate is NOT specified, then locationId
     * is used to lookup the template via an OPTIONS request.
     */
    public routeTemplate: string;
    /**
     * The api version string to send in the request (e.g. "1.0" or "2.0-preview.2")
     */
    public apiVersion: string;
    /**
     * Dictionary of route template replacement values
     */
    public routeValues?: { [key: string]: any; };
    /**
     * Data to post. In this case of a GET, this indicates query parameters.
     * For other requests, this is the request body object (which will be serialized
     * into a JSON string unless isRawData is set to true).
     */
    public body?: any;
    /**
     * Query parameters to add to the url. In the case of a GET, query parameters can
     * be supplied via 'data' or 'queryParams'. For other verbs such as POST, the
     * data object specifies the POST body, so queryParams is needed to indicate
     * parameters to add to the query string of the url (not included in the post body).
     */
    public queryParams?: { [key: string]: any; };
    /**
     * HTTP verb (GET by default if not specified)
     */
    public method?: string;
    /**
     * The http response (Accept) type. This is "json" (corresponds to application/json Accept header)
     * unless otherwise specified. Other possible values are "html", "text", "zip", or "binary" or their accept
     * header equivalents (e.g. application/zip).
     */
    public httpResponseType?: string;
    /**
     * Allows the caller to specify custom request headers.
     */
    public customHeaders?: { [headerName: string]: any; };
    /**
     * If true, indicates that the raw Response should be returned in the request's resulting promise
     * rather than deserializing the response (the default).
     */
    public returnRawResponse?: boolean;
    /**
     * If true, this indicates that no processing should be done on the 'data' object
     * before it is sent in the request. *This is rarely needed*. One case is when posting
     * an HTML5 File object.
     */
    public isRawData?: boolean;
    /**
     * Current command for activity logging. This will override the RestClient's base option.
     */
    public command?: string;

    constructor(apiVersion: string) {
        this.routeTemplate = "";
        this.apiVersion = apiVersion;
        this.routeValues = undefined;
        this.body = undefined;
        this.queryParams = undefined;
        this.method = undefined;
        this.httpResponseType = "application/json";
        this.customHeaders = {
            ["Content-Type"] : "application/json"
        };
        this.returnRawResponse = false;
        this.isRawData = false;
        this.command = undefined;
    }
}
