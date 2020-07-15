import { IdentityServiceIds } from "azure-devops-extension-api/Identities";
import { IWorkItemChangedArgs, IWorkItemFieldChangedArgs, IWorkItemLoadedArgs, WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking";
import { IHostContext, IUserContext } from "azure-devops-extension-sdk";

/**
 * Mocked getUser()
 */
export function getUser() : IUserContext {
    return {
        descriptor: "aad.base64",
        id: "jestwagner",
        name: "jwagner@h2floh.net",
        displayName: "Jest Wagner",
        imageUrl: "https://someimageurl/jw.png"
    }
}

/**
 * Mocked getHost()
 */
export function getHost(): IHostContext {
    return {
        id: "react-unit-test",
        name: "react-unit-test",
        serviceVersion: "mockedVersion",
        type: 1
    }
}

/**
 * Mocked Init Function to return resolve
 */
export function init() : Promise<void> {
    return new Promise((resolve, reject) => resolve());
}

/**
 * Mocked notifyLoadSucceeded does nothing
 */
// tslint:disable-next-line: no-empty
export function notifyLoadSucceeded() {}

/**
 * Mocked getContributionId returns some Id
 */
export function getContributionId() { return "someContributionId" }


/**
 * Type and Accessor for WorkItem events
 */
// tslint:disable-next-line: class-name
type workItemCallBackType = () => {
    // tslint:disable-next-line: completed-docs
    onFieldChanged: (args: IWorkItemFieldChangedArgs) => Promise<void>;
    // tslint:disable-next-line: completed-docs
    onLoaded: (args: IWorkItemLoadedArgs) => Promise<void>;
    // tslint:disable-next-line: completed-docs
    onUnloaded: (args: IWorkItemChangedArgs) => Promise<void>;
    // tslint:disable-next-line: completed-docs
    onSaved: (args: IWorkItemChangedArgs) => Promise<void>;
    // tslint:disable-next-line: completed-docs
    onReset: (args: IWorkItemChangedArgs) => Promise<void>;
    // tslint:disable-next-line: completed-docs
    onRefreshed: (args: IWorkItemChangedArgs) => Promise<void>;
    };

/** Spy eventHook to test WorkItemForm Events */
export let spyWorkItemCallBackAccessor: workItemCallBackType;
/**
 * Mocked register returns empty data structure
 */
export function register (instanceId: string, instance: workItemCallBackType) {
    spyWorkItemCallBackAccessor = instance;
}

/**
 * Accessors to mocked getConfiguration values
 */
export const mockRepositoryId = jest.fn().mockReturnValue("gitrepo");

/**
 * Mocked getConfiguration returns basic configuration for all controls
 */
export function getConfiguration() {
    return {
        witInputs: {
            AppInsightsInstrumentationKey: "",
            LoggingLevel: "0",
            baseEndpointURL: "https://localhost:5000",
            DevOpsBaseUrl: "https://dev.azure.com/",
            RepositoryId: mockRepositoryId(),
            ProjectName: "react-unit-test",
            BranchName: "master"
        }
    }
}

/**
 * Accessors to Mocked getService methods
 */
export const mockGetFieldValue = jest.fn();
export const mockIsNew = jest.fn().mockResolvedValue(true);
export const mockGetId = jest.fn();
export const mockSetFieldValue = jest.fn();
export const mockClearError = jest.fn();
export const mockSetError = jest.fn();

/**
 * Mocked getService methods mockSearchIdentitiesAsync
 */
export function mockSearchIdentitiesAsync(query: string, identityTypes?: string[], operationScopes?: string[], queryTypeHint?: string, options?: any, filterIdentity?: any) {

    let result: any = [];

    switch(query) {
        case "h2floh@h2floh.net":
            result = [
                {
                    displayName: "Florian Wagner",
                    image: "https://tosomeimage/fl.png",
                    entityId: "h2floh@h2floh.net"
                }
            ];
            break;
        case "gdhong@h2floh.net":
            result = [
                {
                    displayName: "GilDong Hong",
                    image: "https://tosomeimage/gh.png",
                    entityId: "gdhong@h2floh.net"
                }
            ];
            break;
    }

    return new Promise((resolve) => resolve(result));
}

/**
 * Mocked getService returns mocked methods
 */
export function getService(contributionId: string) {

    switch(contributionId) {
        case IdentityServiceIds.IdentityService:
            return new Promise((resolve) => resolve({
                    searchIdentitiesAsync: mockSearchIdentitiesAsync
                    }
                ));
        case WorkItemTrackingServiceIds.WorkItemFormService:
            return {
                // WorkItemFormService
                isNew: mockIsNew,
                getFieldValue: mockGetFieldValue,
                setFieldValue: mockSetFieldValue,
                clearError: mockClearError,
                setError: mockSetError,
                getId: mockGetId
            }
    }
}

/**
 * Mocked getService returns mocked methods
 */
export const getAppToken = jest.fn().mockResolvedValue("MOCKED_APP_TOKEN");
