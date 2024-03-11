import { SeverityLevel } from "@microsoft/applicationinsights-web";
import { RestClientBase } from "azure-devops-extension-api/Common/RestClientBase";
import { Logger } from "../Logger/Logger";
import { RestAPIClientRequestParams } from "./RestAPIClientRequestParams";
import { RestClientOptions } from "./RestClientOptions";
import { VersionedItemLink } from "./VersionedItemLink";

/**
 * Rest Client for RestAPI based on Azure DevOps Extension RestClientBase
 * Encapsulates all calls to the API
 */
class RestAPIClient extends RestClientBase {
    /** Base Endpoint to API */
    private baseEndpointUrl: string;
    /** Used API Version */
    private apiVersion: string = "2020-07-15";
    /** Logger Instance */
    private logger: Logger;

    /**
     * Constructor for RestAPIClient
     *
     * @param {string} baseEndpointUrl The Base URL for API without ending /
     * @param {Logger} logger The current logger object for logging events.
     */
    constructor(baseEndpointUrl: string, logger: Logger) {
        super(new RestClientOptions());
        this.baseEndpointUrl = baseEndpointUrl.trim();
        this.logger = logger;
        if (this.baseEndpointUrl.endsWith('/')) {
            this.baseEndpointUrl.substr(0, this.baseEndpointUrl.length-2);
        }
    }

    /**
     * Returns VersionedItemLinks for a given Work Item ID
     *
     * @throws rethrows all errors encountered by RestClientBase
     *
     * @param {number} workItemId The ID of the workitem to retrieve the relations
     * @returns {Promise<VersionedItemLink[]>} Array of VersionedItemLink. Can be length 0
     */
    public async getVersionedItemLinks(workItemId: number) : Promise<VersionedItemLink[]> {
        // GET api/versioneditem/{workItemId}
        const request = new RestAPIClientRequestParams(this.apiVersion);
        request.method = "GET";
        const endpointUrl = `${this.baseEndpointUrl}/api/versioneditem/${workItemId}\?api-version=${this.apiVersion}`;
        this.logger.logTrace(`Calling GET on ${endpointUrl}`, SeverityLevel.Information);

        const callDuration = timer();
        try {
            const result = await this._issueRequest<VersionedItemLink[]>(endpointUrl,
                this.apiVersion, request);

            this.logger.logDependency({id: 'getVersionedItemLinks',
                                       target: endpointUrl,
                                       type: 'RestAPI',
                                       responseCode: 200,
                                       duration: callDuration.ms,
                                       success: true}, SeverityLevel.Information);
            return result;
        } catch (e) {
            this.logger.logException(e as Error, SeverityLevel.Error);
            this.logger.logDependency({id: 'getVersionedItemLinks',
                                       target: endpointUrl,
                                       type: 'RestAPI',
                                       responseCode: 500,
                                       duration: callDuration.ms,
                                       success: false}, SeverityLevel.Error);
            throw e;
        }
    }

    /**
     * Delete VersionedItemLink for a given Work Item ID and VersionedItemLink
     *
     * @throws rethrows all errors encountered by RestClientBase
     *
     * @param {VersionedItemLink} linkToDelete the VersionedItemLink to delete
     * @returns {Promise<void>} Nothing
     */
    public async deleteVersionedItemLinks(linkToDelete: VersionedItemLink) : Promise<void> {
        // DELETE api/versioneditem/{id}/delete
        const request = new RestAPIClientRequestParams(this.apiVersion);
        request.method = "POST";
        request.body = linkToDelete.path;
        const endpointUrl = `${this.baseEndpointUrl}/api/versioneditem/${linkToDelete.workItemId}/delete\?api-version=${this.apiVersion}`;
        this.logger.logTrace(`Calling POST on ${endpointUrl}`, SeverityLevel.Information);

        const callDuration = timer();
        try {
            await this._issueRequest<string>(endpointUrl,
                this.apiVersion, request);

            this.logger.logDependency({id: 'deleteVersionedItemLinks',
                                       target: endpointUrl,
                                       type: 'RestAPI',
                                       responseCode: 200,
                                       duration: callDuration.ms,
                                       success: true}, SeverityLevel.Information);
        } catch (e) {
            this.logger.logException(e as Error, SeverityLevel.Error);
            this.logger.logDependency({id: 'deleteVersionedItemLinks',
                                       target: endpointUrl,
                                       type: 'RestAPI',
                                       responseCode: 500,
                                       duration: callDuration.ms,
                                       success: false}, SeverityLevel.Error);
            throw e;
        }
    }

    /**
     * Persists the state of a VersionedItemLink
     *
     * @throws rethrows all errors encountered by RestClientBase
     *
     * @param {VersionedItemLink} linkToUpdate The VersionedItemLink object to persist
     * @returns {Promise<void>} Nothing
     */
    public async updateVersionedItemLink(linkToUpdate: VersionedItemLink) : Promise<void> {
        // POST api/versioneditem/{id}
        const request = new RestAPIClientRequestParams(this.apiVersion);
        request.method = "POST";
        request.body = linkToUpdate;
        const endpointUrl = `${this.baseEndpointUrl}/api/versioneditem/${linkToUpdate.workItemId}\?api-version=${this.apiVersion}`;
        this.logger.logTrace(`Calling POST on ${endpointUrl}`, SeverityLevel.Information);

        const callDuration = timer();
        try {
            await this._issueRequest<string>(endpointUrl,
                this.apiVersion, request);
                this.logger.logDependency({id: 'updateVersionedItemLink',
                                           target: endpointUrl,
                                           type: 'RestAPI',
                                           responseCode: 200,
                                           duration: callDuration.ms,
                                           success: true}, SeverityLevel.Information);
        } catch (e) {
            this.logger.logException(e as Error, SeverityLevel.Error);
            this.logger.logDependency({id: 'updateVersionedItemLink',
                                       target: endpointUrl,
                                       type: 'RestAPI',
                                       responseCode: 500,
                                       duration: callDuration.ms,
                                       success: false}, SeverityLevel.Error);
            throw e;
        }
    }

}

/**
 * Simple StopWatch implementation
 * borrowed from https://github.com/alm-tools/alm/blob/dec887d29d60aed6cfec1deee8bfe5c7d2bceb95/src/common/utils.ts#L458-L475
 */
function timer() {
    const timeStart = new Date().getTime();
    return {
        /** Milliseconds e.g. 2000ms etc. */
        get ms() {
            const ms = (new Date().getTime() - timeStart);
            return ms;
        }
    }
}

export default RestAPIClient;
