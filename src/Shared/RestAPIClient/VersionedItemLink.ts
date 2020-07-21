import { LinkStatus } from "../../VersionedItemsTable/VersionedItemsTableTypes";

/**
 * VersiondItemLink Model to store the consistency state of
 * a WorkItem with a Versioned Item (Azure Git)
 */
export class VersionedItemLink
{
    /** ID of the referencing Work Item */
    public workItemId: number = 0;

    /** Path of the File */
    public path: string = "";

    /** User Comment for this Link */
    public comment: string = "";

    /** Created by (email) */
    public createdBy: string = "";

    /** Modified by (email) */
    public modifiedBy: string = "";

    /** Modified on */
    public modifiedOn: string = new Date().toJSON();

    /** Link Status */
    public linkStatus: LinkStatus = LinkStatus.ok;
}
