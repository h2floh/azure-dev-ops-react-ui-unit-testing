import { IdentityServiceIds } from "azure-devops-extension-api/Identities";
import { IWorkItemChangedArgs, IWorkItemFieldChangedArgs, IWorkItemLoadedArgs, WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking";
import { IHostContext, IUserContext } from "azure-devops-extension-sdk";

/**
 * Mocking SDK.getUser() and provide fixed values
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
 * Mocking SDK.getHost() and provide fixed values
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
 * Mocking SDK's init function to return
 * resolve(successful execution/init) to activate the .then block
 */
export function init() : Promise<void> {
    return new Promise((resolve, reject) => resolve());
}

/**
 * Mocking SDK.notifyLoadSucceeded does nothing
 */
// tslint:disable-next-line: no-empty
export function notifyLoadSucceeded() {}

/**
 * Mocking SDK.getContributionId returns some Id
 */
export function getContributionId() { return "someContributionId" }


/**
 * Create type for WorkItemForm callback functions
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

/** Creating a Spy to be able to call the callbacks from within a unit test */
export let spyWorkItemCallBackAccessor: workItemCallBackType;

/**
 * Mocking SDK.register()
 * Assign the callback methods (parameter instance) passed from the controls to the spy
 */
export function register (instanceId: string, instance: workItemCallBackType) {
    spyWorkItemCallBackAccessor = instance;
}

/**
 * Indirect accessor to mocked getConfiguration values
 * here for "RepositoryId" with defaultValue "gitrepo".
 * The value can be overwritten in the test file by importing mockRepositoryId
 * and calling mockRepositoryId.mockReturnValue("other_value")
 */
export const mockRepositoryId = jest.fn().mockReturnValue("gitrepo");

/**
 * Mocking SDK.getConfiguration(), will return fix witInput parameters for all controls
 * except for 'RepositoryId' which can be overwritten within the unit test.
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
            BranchName: "master",
            FieldName: "myField"
        }
    }
}

/**
 * Accessor mock to be able to overwrite the value
 * returned by WorkItemFormService methods in a unit test
 */
export const mockGetFieldValue = jest.fn(); // .getFieldValue()
export const mockIsNew = jest.fn().mockResolvedValue(true); // .isNew()
export const mockGetId = jest.fn(); // .getId()
export const mockSetFieldValue = jest.fn(); // .setFieldValue()
export const mockClearError = jest.fn(); // .clearError()
export const mockSetError = jest.fn(); // .setError()

/**
 * Mocking IdentityService.SearchIdentitiesAsync()
 */
export function mockSearchIdentitiesAsync(query: string, identityTypes?: string[], operationScopes?: string[], queryTypeHint?: string, options?: any, filterIdentity?: any) {

    let result: any = [];

    switch(query) {
        case "git@h2floh.net":
            result = [
                {
                    displayName: "Florian Wagner",
                    image: "https://tosomeimage/fl.png",
                    entityId: "git@h2floh.net"
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
 * Mocking SDK.getService() depending on which service is requested
 * it will return mocks for these services
 * here IdentityService or WorkItemFormService
 */
export function getService(contributionId: string) {

    switch(contributionId) {
        case IdentityServiceIds.IdentityService:
            return new Promise((resolve) => resolve({
                    // only need to return mocks for the
                    // used IdentityService methods
                    searchIdentitiesAsync: mockSearchIdentitiesAsync
                    }
                ));
        case WorkItemTrackingServiceIds.WorkItemFormService:
            return {
                // only need to return mocks for the
                // used WorkItemFormService methods
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
