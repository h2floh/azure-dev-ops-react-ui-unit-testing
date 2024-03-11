import { withAITracking } from "@microsoft/applicationinsights-react-js";
import { SeverityLevel } from "@microsoft/applicationinsights-web";
import { getClient } from "azure-devops-extension-api/Common";
import {
    GitItem,
    GitRestClient,
    GitVersionOptions,
    GitVersionType,
    VersionControlRecursionType,
} from "azure-devops-extension-api/Git";
import {
    IWorkItemChangedArgs,
    IWorkItemFormService,
    WorkItemTrackingServiceIds
} from "azure-devops-extension-api/WorkItemTracking";
import * as SDK from "azure-devops-extension-sdk";
import { Button } from "azure-devops-ui/Button";
import { Card } from "azure-devops-ui/Card";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { Icon } from "azure-devops-ui/Icon";
import { Link } from "azure-devops-ui/Link";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { Observer } from "azure-devops-ui/Observer";
import {
    Status,
    StatusSize
} from "azure-devops-ui/Status";
import {
    ColumnSorting,
    ITableColumn,
    SimpleTableCell,
    sortItems,
    SortOrder,
    Table,
    TwoLineTableCell
} from "azure-devops-ui/Table";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import * as React from "react";
import { showRootComponent } from "../Common";
import {
    Logger,
    reactPlugin
} from '../Shared/Logger/Logger'
import RestAPIClient from "../Shared/RestAPIClient/RestAPIClient"
import { VersionedItemLink } from "../Shared/RestAPIClient/VersionedItemLink";
import { getLinkStatusIndicatorData } from "./VersionedItemsTableFunctions";
import { ILinkItem, LinkStatus } from "./VersionedItemsTableTypes";


/**
 * VersionedItemsTable can create a link to a specific Azure Git Repo file called
 * VersionedItemLink.
 */
export class VersionedItemsTable extends React.Component<{}> {

    /** Instance of Work Item Form Service to access data of current Work Item */
    private workItemFormService : IWorkItemFormService | undefined;
    /** Instance of Git Rest Service to access detailed data of VersionedItems */
    private gitRestService: GitRestClient | undefined;
    /** Rest API Client to retrieve and store state of VersionedItems */
    private restAPIClient: RestAPIClient | undefined;
    /** Rendering State for Table */
    private tableItems: ILinkItem[] = [];
    /** React Observable for State */
    private itemProvider = new ObservableValue<ArrayItemProvider<ILinkItem>>(
        new ArrayItemProvider(this.tableItems)
    );
    /** Logging instance */
    private logger: Logger;
    /** File List of Repository/Branch for Dropdown box */
    private gitDropdownBoxItems: IListBoxItem<{}>[] = [];
    /** Full Git Item List */
    private gitItems: GitItem[] = [];
    /** Observable for New Versioned Item Link Disable Property */
    private addVersionedItemLinkDisabledChanged = new ObservableValue<boolean>(
        true
    );

    /**
     * VersionedItemsTable Constructor
     *
     * @param {} props React properties
     * @returns {VersionedItemsTable} VersionedItemsTable Object
     */
    constructor(props: {}) {
        super(props);
        // Dummy because we have to initialize now
        this.logger = new Logger(this.constructor.name, undefined,undefined);
    }


    /**
     * Will be called if this react element was mounted.
     * Waits for the Azure DevOps Extension SDK to be initialized and then
     * init all sub components like WorkItemFormService, RestAPIClient
     * and reports a successful loading back to the SDK
     */
    public componentDidMount() {
        SDK.init(
            {loaded: false}
        ).then(async() => {

            this.registerEvents();
            // Init Logger
            const instrumentationKey = (SDK.getConfiguration().witInputs.AppInsightsInstrumentationKey as string);
            const maxLogLevel = (SDK.getConfiguration().witInputs.LoggingLevel as SeverityLevel);
            // this.constructor.name will output useless information after minified
            this.logger = new Logger('VersionedItemsTable', instrumentationKey, maxLogLevel);
            this.logger.startTracking('Initialization');
            this.logger.logTrace(`Logger Initialized with logLevel ${maxLogLevel}`, SeverityLevel.Verbose);

            // Create Rest API Client
            this.restAPIClient = new RestAPIClient(
                (SDK.getConfiguration().witInputs.baseEndpointURL as string),
                this.logger
            );

            // Load Work Item Form Service
            this.workItemFormService = await SDK.getService<IWorkItemFormService>(
                WorkItemTrackingServiceIds.WorkItemFormService
            );

            if (this.workItemFormService !== undefined) {
                // Check if this item is new
                const value = await this.workItemFormService.isNew();
                this.addVersionedItemLinkDisabledChanged.value = value;
            }

            // Load Git Rest Client
            this.gitRestService = getClient(GitRestClient);

            // Preload master branch of
            await this.preloadGitRepoItems(
                (SDK.getConfiguration().witInputs.RepositoryId as string),
                (SDK.getConfiguration().witInputs.ProjectName as string),
                (SDK.getConfiguration().witInputs.BranchName as string)
            );

            await this.loadLinks();
            SDK.notifyLoadSucceeded();
            this.logger.stopTracking('Initialization');

        });
    }

    /**
     * Prefills internal variable with item list for given Repo/Project/Branch
     *
     * @param {string} repositoryId Repository Id or Name of Azure Git Repo
     * @param {string} projectId Project Id or Name of Azure Git Repo
     * @param {string} branchName Branch Name of Azure Git Repo
     */
    private async preloadGitRepoItems(repositoryId: string, projectId: string, branchName: string) {

        try {
            // retrieve all items from given Git Repository and branch
            this.gitItems = await this.gitRestService!.getItems(
                repositoryId,
                projectId,
                undefined,
                VersionControlRecursionType.Full,
                undefined,
                undefined,
                false,
                false,
                {
                    version: branchName,
                    versionOptions: GitVersionOptions.None,
                    versionType: GitVersionType.Branch
                }
                );

            this.logger.logTrace(`GitItems: ${JSON.stringify(this.gitItems)}`, SeverityLevel.Verbose);

            this.gitItems.map((item) => {
                    if(!item.isFolder) {
                        this.gitDropdownBoxItems.push({
                            id: item.objectId,
                            text: item.path
                        })
                    }
            });

            this.logger.logTrace(`Dropdown Box Items: ${JSON.stringify(this.gitDropdownBoxItems)}`, SeverityLevel.Verbose);

        } catch (e) {
            this.logger.logException(e as Error, SeverityLevel.Critical);
        }

    }

    /**
     * This method will retrieve all Work Item relations/links from AzDO and
     * merges the information with the status of the link-consistency from Rest API
     */
    private async loadLinks() {

        if (this.workItemFormService !== undefined) {
            this.logger.logTrace(`Rest API ${JSON.stringify(this.restAPIClient)}`, SeverityLevel.Verbose);

            this.tableItems = [];

            // Add VersionedItem Links (retrieve from Rest API first)
            let versionedItemLinks: VersionedItemLink[] = [];
            if (this.restAPIClient !== undefined) {
                try {
                    versionedItemLinks = await this.restAPIClient.getVersionedItemLinks(
                        await this.workItemFormService.getId()
                    );
                } catch (e) {
                    this.logger.logException(e as Error, SeverityLevel.Error);
                }
            }

            versionedItemLinks.map((vilink) => {
                const item = this.prefillVersionedItemLink(SDK.getUser().name, vilink);

                // WebURL and Comment
                item.webUIUrl = this.getGitWebUIUrl(item.path);
                item.comment = new ObservableValue<string>(vilink.comment);

                // Check if item still exists in the repo
                const gitItem = this.gitItems.find((gitem) => (gitem.path === vilink.path));
                if (gitItem === undefined) {
                    // File no longer in Git Repo
                    item.error = "The referenced file does no longer exist.";
                    item.status = LinkStatus.broken;
                }

                this.tableItems.push(item);
            });

            // Refresh UI
            this.itemProvider.value = new ArrayItemProvider(
                this.tableItems
            );
        }

    }

    /**
     * Part of the Azure DevOps Extension SDK, we can subscribe to events and react on them
     */
    private registerEvents() {
        SDK.register(SDK.getContributionId(), () => {
          return {
            // see options here https://github.com/microsoft/azure-devops-extension-sample/blob/master/src/Samples/WorkItemFormGroup/WorkItemFormGroup.tsx

            // Called after the work item has been saved
            onSaved: async (args: IWorkItemChangedArgs) => {
                this.logger.logEvent(`onSaved - ${JSON.stringify(args)}`, SeverityLevel.Verbose);

                // recheck if item is new and trigger rendering
                if (this.workItemFormService !== undefined) {
                    const value = await this.workItemFormService.isNew();
                    this.addVersionedItemLinkDisabledChanged.value = value;
                }

            },
          }
        });
    }

    /**
     * Part of the React Render Loop, will render the current React Element
     *
     * @returns {JSX.Element} JSX Element
     */
    public render(): JSX.Element {

        return (
            <Card
                className="flex-grow bolt-table-card"
                contentProps={{ contentPadding: false }}
            >
                <div className="flex-column">
                    <div>
                    <Observer disabledValue={this.addVersionedItemLinkDisabledChanged}>
                        {(observableProps: {
                            /** disabledValue type declaration */
                            disabledValue: boolean
                        }) => (
                            <Button
                                text="Add VersionedItem Link"
                                iconProps={{ iconName: "Add" }}
                                onClick={this.addVersionedItem}
                                disabled={this.addVersionedItemLinkDisabledChanged.value}
                        />
                        )}
                    </Observer>
                    </div>
                <div>
                <Observer itemProvider={this.itemProvider}>
                    {(observableProps: {
                        /** itemProvider type declaration */
                        itemProvider: ArrayItemProvider<ILinkItem>
                    }) => (
                        <Table<ILinkItem>
                            behaviors={[this.sortingBehavior]}
                            columns={this.columns}
                            itemProvider={observableProps.itemProvider}
                            showLines={true}
                            singleClickActivation={false}
                        />
                    )}
                </Observer>
                </div>
                </div>
            </Card>
        );
    }

    /**
     * AzureDevOps Table Colum Definition
     */
    private columns: ITableColumn<ILinkItem>[] = [
        {
            className: "pipelines-two-line-cell",
            id: "name",
            name: "Link",
            renderCell: this.renderLinkDetails.bind(this),
            readonly: false,
            sortProps: {
                ariaLabelAscending: "Sorted A to Z",
                ariaLabelDescending: "Sorted Z to A"
            },
            width: -50
        },
        {
            id: "data",
            name: "Comment",
            readonly: false,
            renderCell: this.renderLinkData.bind(this),
            width: -40
        },
        {
            className: "pipelines-two-line-cell",
            id: "action",
            name: "",
            readonly: false,
            renderCell: this.renderAction.bind(this),
            width: -10,
        }
    ];

    /**
     * AzureDevOps Table Sorting Behavior
     */
    private sortingBehavior = new ColumnSorting<ILinkItem>(
        (columnIndex: number, proposedSortOrder: SortOrder) => {
            this.itemProvider.value = new ArrayItemProvider(
                sortItems(
                    columnIndex,
                    proposedSortOrder,
                    this.sortFunctions,
                    this.columns,
                    this.tableItems
                )
            );
        }
    );

    /**
     * AzureDevOps Table Sort Function for ILinkItem
     */
    private sortFunctions = [
        // Sort on Name column
        (item1: ILinkItem, item2: ILinkItem) => {
            return item1.path.localeCompare(item2.path!);
        }
    ];

    /**
     * Sub Rendering for Consistency Status Toggle Button
     *
     * @param {number} rowIndex Index of current row
     * @param {number} columnIndex Index of current column
     * @param {ITableColumn<ILinkItem>} tableColumn Table Column Definition
     * @param {ILinkItem} tableItem Table Item to process
     * @returns {JSX.Element} JSX.Element
     */
    private renderLinkData(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<ILinkItem>,
        tableItem: ILinkItem
    ): JSX.Element {

        if (tableItem.status === LinkStatus.broken) {
            return (
                <SimpleTableCell
                    columnIndex={columnIndex}
                    tableColumn={tableColumn}
                    key={"col-" + columnIndex}
                    contentClassName="fontWeightSemiBold font-weight-semibold fontSizeS font-size-s scroll-hidden flex-wrap word-break error-text"
                >
                    <div>
                    {tableItem.error}
                    </div>
                </SimpleTableCell>
            );
        } else {
            return (
                <SimpleTableCell
                    columnIndex={columnIndex}
                    tableColumn={tableColumn}
                    key={"col-" + columnIndex}
                    contentClassName="fontWeightSemiBold font-weight-semibold fontSizeS font-size-s scroll-hidden"
                >
                    <TextField
                    value={tableItem.comment.value}
                    onChange={(e, newValue) => (tableItem.comment.value = newValue)}
                    placeholder="Comment"
                    width={TextFieldWidth.standard}
                    />
                </SimpleTableCell>
            );
        }

    }

    /**
     * Sub Rendering for Link Details
     *
     * @param {number} rowIndex Index of current row
     * @param {number} columnIndex Index of current column
     * @param {ITableColumn<ILinkItem>} tableColumn Table Column Definition
     * @param {ILinkItem} tableItem Table Item to process
     * @returns {JSX.Element} JSX.Element
     */
    private renderLinkDetails(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<ILinkItem>,
        tableItem: ILinkItem
    ): JSX.Element {

        const tooltip = tableItem.path;

        if (tableItem.status === LinkStatus.new) {

            return (
                <TwoLineTableCell
                    className="bolt-table-cell-content-with-inline-link no-v-padding"
                    key={"col-" + columnIndex}
                    columnIndex={columnIndex}
                    tableColumn={tableColumn}
                    line1={
                        <span className="flex-row scroll-hidden">
                            <Status
                                {...getLinkStatusIndicatorData(tableItem.status).statusProps}
                                className="icon-large-margin"
                                size={StatusSize.l}
                            />
                            <div className="flex-row scroll-hidden flex-grow">
                                <Tooltip overflowOnly={true}>
                                    <Dropdown
                                        className="dropdown"
                                        placeholder="Select a file"
                                        items={this.gitDropdownBoxItems}
                                        onSelect={this.onSelect.bind(this, tableItem)}
                                    />
                                </Tooltip>
                            </div>
                        </span>
                    }
                    line2={
                            <span className="fontSize font-size secondary-text flex-row flex-center text-ellipsis">
                                <span className="text-ellipsis" key="release-type-text">
                                    Created By: {tableItem.createdBy}
                                    <br/>
                                </span>
                            </span>
                    }
                />
            );
        }
        else {

            return (
                <TwoLineTableCell
                    className="bolt-table-cell-content-with-inline-link no-v-padding"
                    key={"col-" + columnIndex}
                    columnIndex={columnIndex}
                    tableColumn={tableColumn}
                    line1={
                        <span className="flex-row scroll-hidden">
                            <Status
                                {...getLinkStatusIndicatorData(tableItem.status).statusProps}
                                className="icon-large-margin"
                                size={StatusSize.l}
                            />
                            <div className="flex-row scroll-hidden">
                                <Tooltip overflowOnly={true}>
                                    <Link
                                        className="fontSizeMS font-size-ms secondary-text bolt-table-link bolt-table-inline-link"
                                        excludeTabStop
                                        href={tableItem.webUIUrl}
                                        target="_blank"
                                    >
                                        <span className="text-ellipsis">{tableItem.path}</span>
                                    </Link>
                                </Tooltip>
                            </div>
                        </span>
                    }
                    line2={
                        <span className="fontSize font-size secondary-text flex-row flex-center text-ellipsis">
                                <span className="text-ellipsis" key="release-type-text">
                                    Created By: {tableItem.createdBy}
                                    <br/>
                                </span>
                            </span>
                    }
                />
            );
        }

    }

    /**
     * Sub Rendering for Action Column
     *
     * @param {number} rowIndex Index of current row
     * @param {number} columnIndex Index of current column
     * @param {ITableColumn<ILinkItem>} tableColumn Table Column Definition
     * @param {ILinkItem} tableItem Table Item to process
     * @returns {JSX.Element} JSX.Element
     */
    private renderAction(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<ILinkItem>,
        tableItem: ILinkItem
    ): JSX.Element {

        if (tableItem.status === LinkStatus.new) {
            return (
                <TwoLineTableCell
                    className="bolt-table-cell-content-with-inline-link no-v-padding"
                    key={"col-" + columnIndex}
                    columnIndex={columnIndex}
                    tableColumn={tableColumn}
                    line1={<Icon ariaLabel="Save icon" iconName="Save" onClick={() => this.saveNewVersionedItem(tableItem)}/>
                    }
                    line2={<Icon ariaLabel="Delete icon" iconName="Delete" onClick={() => this.deleteVersionedItem(tableItem)}/>}
                />
            );
        }
        else {
            return (
                <TwoLineTableCell
                    className="bolt-table-cell-content-with-inline-link no-v-padding"
                    key={"col-" + columnIndex}
                    columnIndex={columnIndex}
                    tableColumn={tableColumn}
                    line1={<Icon ariaLabel="Save icon" iconName="Save" onClick={() => this.saveVersionedItem(tableItem)}/>
                    }
                    line2={<Icon ariaLabel="Delete icon" iconName="Delete" onClick={() => this.deleteVersionedItem(tableItem)}/>}
                />
            );
        }
    }

    /**
     * EventHook for add a new VersionedItem
     */
    addVersionedItem = () => {

        const newVersionedItem = this.prefillVersionedItemLink(SDK.getUser().name);

        newVersionedItem.comment = new ObservableValue<string>("");
        this.tableItems.push(newVersionedItem);

        this.itemProvider.value = new ArrayItemProvider(
            this.tableItems
        );
    };

    /**
     * EventHook for saving a new VersionedItem Link
     *
     * @param {ILinkItem} versionedItem current table row / Link Element
     */
    saveNewVersionedItem = (newVersionedItem: ILinkItem) => {
        this.logger.logTrace(`New Versioned Item: ${JSON.stringify(newVersionedItem)}`, SeverityLevel.Verbose);
        // Save to REST API
        newVersionedItem.status = LinkStatus.ok;
        this.persistVersionedItem(newVersionedItem);
    };

    /**
     * EventHook for saving a VersionedItem Link
     *
     * @param {ILinkItem} versionedItem current table row / Link Element
     */
    saveVersionedItem = (versionedItem: ILinkItem) => {
        this.logger.logTrace(`Versioned Item: ${JSON.stringify(versionedItem)}`, SeverityLevel.Verbose);
        // Save to REST API
        this.persistVersionedItem(versionedItem);
    };

    /**
     * Prepare for State Store persistance
     *
     * @param {ILinkItem} versionedItem current table row / Link Element
     */
    private async persistVersionedItem(versionedItem: ILinkItem) {

        // Get current Work Item data
        const versionedItemLink = await this.getVersionedItemLink(versionedItem);

        try {
            this.logger.logTrace(`Link State before save: ${JSON.stringify(versionedItem)}`, SeverityLevel.Verbose);
            await this.saveVersionedItemLink(versionedItemLink);
        } catch {
            // Display Error message
            versionedItem.status = LinkStatus.broken;
            versionedItem.error = "Error while trying to save."
        }

        // Update Table View
        this.itemProvider.value = new ArrayItemProvider(
            this.tableItems
        );
    }

    /**
     * Delete VersionedItem Link
     *
     * @param {ILinkItem} versionedItem current table row / Link Element
     */
    deleteVersionedItem = async (versionedItem: ILinkItem) => {

        // Delete via to REST API
        this.logger.logTrace(`Versioned Item to delete: ${JSON.stringify(versionedItem)}`, SeverityLevel.Verbose);

        if (versionedItem.status === LinkStatus.new) {
            // if not yet persisted, just remove from table state
            this.tableItems = this.tableItems.filter((item) => item !== versionedItem);

        } else {
            // Persisted data needs to be deleted via API
            const versionedItemLink = await this.getVersionedItemLink(versionedItem);

            try {
                this.logger.logTrace(`Link State before deletion: ${JSON.stringify(versionedItem)}`, SeverityLevel.Verbose);

                if (this.restAPIClient !== undefined) {

                    await this.restAPIClient.deleteVersionedItemLinks(versionedItemLink);

                    this.tableItems = this.tableItems.filter((item) => item !== versionedItem);;

                }
            } catch {
                // Display error message
                versionedItem.status = LinkStatus.broken;
                versionedItem.error = "Error while trying to delete."
            }
        }

        // Update Table View
        this.itemProvider.value = new ArrayItemProvider(
            this.tableItems
        );
    };

    /**
     * EventHook for selection of the Git Repo
     *
     * @param {ILinkItem} row current table row / Link Element
     * @param {React.SyntheticEvent<HTMLElement, Event>} event actual event
     * @param {IListBoxItem<{}>} item selected File
     */
    onSelect (row: ILinkItem, event: React.SyntheticEvent<HTMLElement, Event>, item: IListBoxItem<{}>) : void {
        this.logger.logTrace(`Dropdown selected ${JSON.stringify(item)} ${JSON.stringify(row)}`, SeverityLevel.Verbose);

        row.path = item.text!;
        row.webUIUrl = this.getGitWebUIUrl(item.text!);
    }

    /**
     * Returns a URL to Azure DevOps UI to display the item in git repo
     *
     * @param {string} path path to file in repo
     * @returns {string} Az DO Web UI Link to Azure Git Repo File
     */
    private getGitWebUIUrl(path: string): string {
        return `https://dev.azure.com/${SDK.getHost().name}/${(SDK.getConfiguration().witInputs.ProjectName as string)}/_git/${(SDK.getConfiguration().witInputs.RepositoryId as string)}?path=${encodeURIComponent(path)}&version=GB${(SDK.getConfiguration().witInputs.BranchName as string)}`;
    }

    /**
     * Creates a VersionedItemLink Object from source WorkItem and target VersionedItem information
     *
     * @param {VersionedItemLink} targetVersionedItem Target VersionedItem Information
     * @returns {VersionedItemLink} VersionedItemLink Object
     */
    private async getVersionedItemLink(targetVersionedItem: ILinkItem) : Promise<VersionedItemLink> {
        const result: VersionedItemLink = new VersionedItemLink();

        if (this.workItemFormService !== undefined) {
            const sourceWorkItemId = await this.workItemFormService.getId();
            result.workItemId = sourceWorkItemId;
        }

        result.path = targetVersionedItem.path;
        result.comment = targetVersionedItem.comment.value;
        result.createdBy = targetVersionedItem.createdBy;
        result.modifiedBy = SDK.getUser().name;
        result.modifiedOn = new Date().toJSON();

        return result;
    }

    /**
     * Saves the state of a VersionedItemLink Object via Rest API
     *
     * @param {VersionedItemLink} item VersionedItemLink Object to persist
     */
    private async saveVersionedItemLink(item: VersionedItemLink) {
        if (this.restAPIClient !== undefined) {

            this.logger.logTrace(`versionedItemLinkToUpdate ${JSON.stringify(item)}`, SeverityLevel.Verbose);

            await this.restAPIClient.updateVersionedItemLink(item);
        }
    }

    /**
     * Prefills the Table Row Model for a VersiondItem which will be displayed in the table
     *
     * @param {string} user Current user's email
     * @param {Logger} logger Logger instance for event/message logging
     * @returns {ILinkItem} Link Item to display in table
     */
    private prefillVersionedItemLink(user: string, vilink?: VersionedItemLink) : ILinkItem {

        if (vilink === undefined) {
            return {
                path: "undefined",
                status: LinkStatus.new,
                webUIUrl: "",
                comment: new ObservableValue<string>(""),
                createdBy: user,
                error: ""
            }
        } else {
            return {
                path: vilink.path,
                status: vilink.linkStatus,
                webUIUrl: "",
                comment: new ObservableValue<string>(""),
                createdBy: vilink.createdBy,
                error: ""
            }
        }
    }

}

/**
 * Required for AppInsight React tracking
 */
export default withAITracking(reactPlugin, VersionedItemsTable);

showRootComponent(<VersionedItemsTable />);
