import { ObservableValue } from "azure-devops-ui/Core/Observable";

/**
 * Link Status
 */
export enum LinkStatus {
    /** NEW - not saved */
    new = "NEW",
    /** OK - saved */
    ok = "OK",
    /** Broken - saved but no longer in git repo */
    broken = "BROKEN"
}

/**
 * DataModel for LinkItem (Row Items of VersionedItemsTable)
 * contains all information for rendering
 */
export interface ILinkItem {
    /** Path to be displayed for item */
    path: string;
    /** Consistency Status of Link */
    status: LinkStatus;
    /** AzDO WebUI URL to VersionedItem */
    webUIUrl: string;
    /** Observable for Comment */
    comment: ObservableValue<string>;
    /** Creator of Item */
    createdBy: string;
    /** Error Message */
    error: string;
}
