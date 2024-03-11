/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-types */
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { SeverityLevel } from "@microsoft/applicationinsights-web";
import {
    IdentityServiceIds,
    IVssIdentityService,
    PeoplePickerProvider
} from "azure-devops-extension-api/Identities";
import {
    IWorkItemFormService,
    WorkItemTrackingServiceIds
} from "azure-devops-extension-api/WorkItemTracking";
import * as SDK from "azure-devops-extension-sdk";
import {
    ObservableArray
} from "azure-devops-ui/Core/Observable";
import {
    IdentityPicker,
    IIdentity,
    IPeoplePickerProvider
} from "azure-devops-ui/IdentityPicker";
import * as React from "react";
import { showRootComponent } from "../Common";
import {
    Logger,
    reactPlugin
} from '../Shared/Logger/Logger'

interface MultiIdentityPickerState {
    /** Picker Provider State Wrapper */
    pickerProvider: IPeoplePickerProvider
}

/**
 * Azure DevOps React UI based MultiIdentity Picker
 * - Can display Identities saved in a work items text field
 * - Can add additional Identies based on Standard Identity picker and save to text field
 */
export class MultiIdentityPicker extends React.Component<{}, MultiIdentityPickerState> {
    /** Identity Service for Picker */
    private identityService: Promise<IVssIdentityService>;
    /** Current selected Identities as React Observable */
    private selectedIdentities: ObservableArray<IIdentity> = new ObservableArray<IIdentity>([]);
    /** Work Item Field name for saving Identites as JSON array of emails */
    private referenceNameIdentities: string = "";
    /** Placeholder Text to be displayed if no identity is selected */
    private placeholderText: string = "";
    /** Azure DevOps Base URL */
    private devOpsBaseUrl: string = "https://dev.azure.com"; // TODO Can SDK return this value for project?
    /** Logger instance */
    private logger: Logger;

    /**
     * MultiIdentityPicker Constructor
     *
     * @param {} props React properties
     * @returns {MultiIdentityPicker} MultiIdentityPicker Object
     */
    constructor(props: {}) {
        super(props);
        this.state = {
            pickerProvider: new PeoplePickerProvider()
        };
        this.identityService = SDK.getService<IVssIdentityService>(IdentityServiceIds.IdentityService);
        // Dummy because we have to initialize now
        this.logger = new Logger(this.constructor.name, undefined,undefined);
    }

    /**
     * Will be called if this react element was mounted.
     * Waits for the Azure DevOps Extension SDK to be initialized and then
     * init all sub components
     * and reports successful load back to the SDK
     */
    public componentDidMount() {
        // Azure DevOps Extension SDK will be initialized
        SDK.init().then(() => {

          // After the SDK is initialized we retrieve configuration values from it (here FieldName)
        const witInputs = SDK.getConfiguration().witInputs as {
            DevOpsBaseUrl?: string;
            AppInsightsInstrumentationKey?: string;
            LoggingLevel?: SeverityLevel;
            PlaceholderText: string;
            FieldName: string;
        };

        this.referenceNameIdentities = witInputs.FieldName;

        if (witInputs.DevOpsBaseUrl != null) {
                this.devOpsBaseUrl = witInputs.DevOpsBaseUrl;
        }

        // Init Logger
        const instrumentationKey = witInputs.AppInsightsInstrumentationKey;
        const maxLogLevel = witInputs.LoggingLevel;
        // this.constructor.name will output useless information after minified
        this.logger = new Logger('MultiIdentityPicker', instrumentationKey, maxLogLevel);
        this.logger.startTracking('Initialization');
        this.logger.logTrace(`Logger Initialized with logLevel ${maxLogLevel}`, SeverityLevel.Verbose);

        this.placeholderText = witInputs.PlaceholderText;
            this.readOwnerSetField().catch(() => {});
            this.logger.stopTracking('Initialization');
        }).catch(() => {});
    }

    /**
     * Part of the React Render Loop, will render the current React Element
     *
     * @returns {JSX.Element} JSX Element
     */
    public render() {
        return (
            <div style={{ width: "500px" }}>
                <IdentityPicker
                    onIdentitiesRemoved={this.onIdentitiesRemoved}
                    onIdentityAdded={this.onIdentityAdded}
                    onIdentityRemoved={this.onIdentityRemoved}
                    pickerProvider={this.state.pickerProvider}
                    selectedIdentities={this.selectedIdentities}
                    placeholderText={this.placeholderText}
                />
            </div>
        );
    }

    /**
     * Will be called when Identities getting removed
     *
     * not sure how to call it but needed for used react component
     * -> excluded from code coverage
     * @param {IIdentity[]} identities List of removed Identities
     */
    /* istanbul ignore next */
    private onIdentitiesRemoved = (identities: IIdentity[]) => {
        this.logger.logTrace(`Identities Removed: ${identities.map((identity) => identity.displayName).join(", ")}`, SeverityLevel.Information);

        this.selectedIdentities.value = this.selectedIdentities.value.filter(
            (entity: IIdentity) =>
                identities.filter((item) => item.entityId === entity.entityId).length === 0
        );
        this.updateOwnerSetField().catch(() => {});
    };

    /**
     * Will be called when an Identity gets added
     *
     * @param {IIdentity} identity Identity to add
     */
    private onIdentityAdded = (identity: IIdentity) => {
        this.logger.logTrace(`Identity Added: ${identity.displayName}`, SeverityLevel.Information);

        // Fix to display image - returns relative URL but Extension runs in iframe on different server
        identity.image = `${this.devOpsBaseUrl}/${identity.image}`;
        this.selectedIdentities.push(identity);
        this.updateOwnerSetField().catch(() => {});
    };

    /**
     * Will be called when an Identity gets removed
     *
     * @param {IIdentity} identity Identity to remove
     */
    private onIdentityRemoved = (identity: IIdentity) => {
        this.logger.logTrace(`Identity Removed: ${identity.displayName}`, SeverityLevel.Information);

        this.selectedIdentities.value = this.selectedIdentities.value.filter(
            (entity: IIdentity) => entity.entityId !== identity.entityId
        );
        this.updateOwnerSetField().catch(() => {});
    };

    /**
     * Saves the current list of Identies to Work Item Field designated for Identities as JSON array of emails
     *
     */
    private async updateOwnerSetField() {
        this.logger.logTrace(`Saving current selected Identities.`, SeverityLevel.Verbose);

        const workItemFormService = await SDK.getService<IWorkItemFormService>(
            WorkItemTrackingServiceIds.WorkItemFormService
        );
        workItemFormService.setFieldValue(
            this.referenceNameIdentities,
            JSON.stringify(this.selectedIdentities.value.map((identity) => { return identity.signInAddress }))
        ).catch(() => {});
    };

    /**
     * Reads the current list of Identies from the Work Item Field designated
     * for Identities as JSON array of emails and adds them to the control state
     */
    private async readOwnerSetField() {
        this.logger.logTrace(`Loading current selected Identities from field
            ${this.referenceNameIdentities}.`, SeverityLevel.Verbose);

        // retrieve the WorkItemFormService client from the SDK
        const workItemFormService = await SDK.getService<IWorkItemFormService>(
            WorkItemTrackingServiceIds.WorkItemFormService
        );

        // retrieve the value of the 'referenceNameIdentities' work item field
        const jsonValue = await workItemFormService.getFieldValue(
            this.referenceNameIdentities,
            true
        ) as string;

        this.logger.logTrace(`FieldValue: ${jsonValue}`, SeverityLevel.Verbose);

        if (jsonValue.length === 0) {
            const state = await workItemFormService.getFieldValue("System.State", true) as string;

            this.logger.logTrace(`System.State: ${state}`, SeverityLevel.Verbose);

            if (state.length === 0) {
                // This is a new work item, add current user to Picker Control
                this.onIdentityAdded(
                    await this.state.pickerProvider.getEntityFromUniqueAttribute(
                        SDK.getUser().id
                        )
                );

                this.logger.logTrace(`New Work Item, added current user picker control.`, SeverityLevel.Verbose);
            }
        } else {
            this.logger.logTrace(`FieldValue: ${jsonValue}`, SeverityLevel.Verbose);

            try {

                const loadedlogInMails = JSON.parse(jsonValue) as string[];
                await Promise.all(loadedlogInMails.map(async (mail) => {
                    this.onIdentityAdded(
                        await this.identityService.then(
                            identityService => {
                                return identityService
                                      .searchIdentitiesAsync(mail, ["user"], ["ims", "source"], "signInAddress")
                                      .then(x => x[0]);})
                    );
                }));

                this.logger.logTrace(`Identities loaded.`, SeverityLevel.Verbose);
            } catch (e) {
                this.logger.logException(new Error(`No Identities set or invalid JSON input., message: ${JSON.stringify(e)}`), SeverityLevel.Error);
            }
        }

    }
}

/**
 * Required for AppInsight React tracking
 */
export default withAITracking(reactPlugin, MultiIdentityPicker);

showRootComponent(<MultiIdentityPicker />);
