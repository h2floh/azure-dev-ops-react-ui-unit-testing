import {
    IStatusProps,
    Statuses
} from "azure-devops-ui/Status";
import { LinkStatus } from "./VersionedItemsTableTypes";



/**
 * Status Indication Interface
 */
export interface IStatusIndicatorData {
    /** Status Property from AzDO UI */
    statusProps: IStatusProps;
    /** Custom Label for status */
    label: string;
}

/**
 * Converts a string based link status into a IStatusIndicatorData complient object
 *
 * @param {string} status Link Status as String (broken | valid)
 * @returns {IStatusIndicatorData} StatusIndicator Instance based on status
 */
export function getLinkStatusIndicatorData(status: LinkStatus): IStatusIndicatorData {
    status = status || "";
    const indicatorData: IStatusIndicatorData = {
        label: "OK",
        statusProps: { ...Statuses.Success, ariaLabel: "OK" }
    };
    switch (status) {
        case LinkStatus.broken:
            indicatorData.statusProps = { ...Statuses.Failed, ariaLabel: "Broken" };
            indicatorData.label = "Broken";
            break;
        case LinkStatus.ok:
            indicatorData.statusProps = { ...Statuses.Success, ariaLabel: "OK" };
            indicatorData.label = "OK";
            break;
    }

    return indicatorData;
}
