/** Special Mocking needed:
 *
 * azure-devops-extension-api/Git Package combines multiple files and exports
 * in order to mock it we need to copy all enums and interfaces into this package
 * that they can be imported by the main caller package
 */
import { IVssRestClientOptions } from "azure-devops-extension-api/Common";
// Uncommenting this line will break test run because of 'ReferenceError: define is not defined'
// import * as Git from "azure-devops-extension-api/Git/Git";

/**
 * Accessor mock to be able to overwrite the return value
 * returned by GitRestClient .getItems() method in a unit test
 */
export const mockGetItems = jest.fn().mockReturnValue([]);

/**
 * Mocking the GitRestClient
 */
export class GitRestClient {
    // tslint:disable-next-line: no-empty
    constructor(options: IVssRestClientOptions) {
    }

    /**
     * Get Item Metadata and/or Content for a collection of items. The download parameter is to indicate whether the content should be available as a download
     * or just sent as a stream in the response. Doesn't apply to zipped content which is always returned as a download.
     *
     * @param repositoryId - The name or ID of the repository.
     * @param project - Project ID or project name
     * @param scopePath - The path scope.  The default is null.
     * @param recursionLevel - The recursion level of this request. The default is 'none', no recursion.
     * @param includeContentMetadata - Set to true to include content metadata.  Default is false.
     * @param latestProcessedChange - Set to true to include the latest changes.  Default is false.
     * @param download - Set to true to download the response as a file.  Default is false.
     * @param includeLinks - Set to true to include links to items.  Default is false.
     * @param versionDescriptor - Version descriptor.  Default is the default branch for the repository.
     */
    public getItems(repositoryId: string, project?: string, scopePath?: string, recursionLevel?: VersionControlRecursionType,
        includeContentMetadata?: boolean, latestProcessedChange?: boolean, download?: boolean, includeLinks?: boolean,
        versionDescriptor?: GitVersionDescriptor): Promise<GitItem[]> {

        if (repositoryId === "gitrepo") {
                // return value of mockGetItems if the repositoryId is 'gitrepo'
                return new Promise((resolve) => resolve(mockGetItems()));
            } else {
                // for any other repositoryId throw an Error (for error testing)
                throw new Error(`Repository does not exists: ${repositoryId}`)
            }
    }

}

/**
 * Copy needed interfaces and enums in order to not break build
 */

/** Interace, enum copies */
export interface GitItem extends ItemModel {
    /**
     * SHA1 of commit item was fetched at
     */
    commitId: string;
    /**
     * Type of object (Commit, Tree, Blob, Tag, ...)
     */
    gitObjectType: GitObjectType;
    /**
     * Shallow ref to commit that last changed this item Only populated if latestProcessedChange is requested May not be accurate if latest change is not yet cached
     */
    latestProcessedChange: any;
    /**
     * Git object id
     */
    objectId: string;
    /**
     * Git object id
     */
    originalObjectId: string;
}

/** Interace, enum copies */
export interface ItemModel {
    /** Interace, enum copies */
    _links: any;
    /** Interace, enum copies */
    content: string;
    /** Interace, enum copies */
    contentMetadata: any;
    /** Interace, enum copies */
    isFolder: boolean;
    /** Interace, enum copies */
    isSymLink: boolean;
    /** Interace, enum copies */
    path: string;
    /** Interace, enum copies */
    url: string;
}

/** Interace, enum copies */
export enum GitObjectType {
    Bad = 0,
    Commit = 1,
    Tree = 2,
    Blob = 3,
    Tag = 4,
    Ext2 = 5,
    OfsDelta = 6,
    RefDelta = 7
}

/** Interace, enum copies */
export interface GitVersionDescriptor {
    /**
     * Version string identifier (name of tag/branch, SHA1 of commit)
     */
    version: string;
    /**
     * Version options - Specify additional modifiers to version (e.g Previous)
     */
    versionOptions: GitVersionOptions;
    /**
     * Version type (branch, tag, or commit). Determines how Id is interpreted
     */
    versionType: GitVersionType;
}

/**
 * Accepted types of version options
 */
export enum GitVersionOptions {
    /**
     * Not specified
     */
    None = 0,
    /**
     * Commit that changed item prior to the current version
     */
    PreviousChange = 1,
    /**
     * First parent of commit (HEAD^)
     */
    FirstParent = 2
}

/**
 * Accepted types of version
 */
export enum GitVersionType {
    /**
     * Interpret the version as a branch name
     */
    Branch = 0,
    /**
     * Interpret the version as a tag name
     */
    Tag = 1,
    /**
     * Interpret the version as a commit ID (SHA1)
     */
    Commit = 2
}

/** Interace, enum copies */
export enum VersionControlRecursionType {
    /**
     * Only return the specified item.
     */
    None = 0,
    /**
     * Return the specified item and its direct children.
     */
    OneLevel = 1,
    /**
     * Return the specified item and its direct children, as well as recursive chains of nested child folders that only contain a single folder.
     */
    OneLevelPlusNestedEmptyFolders = 4,
    /**
     * Return specified item and all descendants
     */
    Full = 120
}
