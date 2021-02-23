/**
 * Mocking RestClientBase class used in RestAPIClient
 * Needs to be mocked before VersionedItemsTable import
 */
jest.mock('azure-devops-extension-api/Common/RestClientBase');

// Imports
import '@testing-library/jest-dom/extend-expect'
import {
    fireEvent,
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved
} from '@testing-library/react';
import { RestClientRequestParams } from 'azure-devops-extension-api/Common/RestClientBase';
import React from 'react';
import { VersionedItemLink } from '../Shared/RestAPIClient/VersionedItemLink';
import VersionedItemsTable from '../VersionedItemsTable/VersionedItemsTable'
import { LinkStatus } from '../VersionedItemsTable/VersionedItemsTableTypes';
import { mockTrackException } from '../__mocks__/@microsoft/applicationinsights-web';
import { mockGetVersionedItemLink, mockHTTPError, mockPostRequests } from '../__mocks__/azure-devops-extension-api/Common/RestClientBase';
import { mockGetItems } from '../__mocks__/azure-devops-extension-api/Git';
import { mockGetId, mockIsNew, spyWorkItemCallBackAccessor } from '../__mocks__/azure-devops-extension-sdk'

// AzDO related Mocks (implementations /src/__mocks__)
// Extension related Mocks
jest.mock('../Common');

describe('VersionedItemsTable', () => {

    beforeEach(() => {
        // Reset related mocks
        mockPostRequests.mockClear();
        mockHTTPError.mockReturnValue(false);
        mockGetItems.mockResolvedValue([]);
        mockGetVersionedItemLink.mockResolvedValue([]);
        mockTrackException.mockClear();
    });

    test('VersionedItemsTable - renders without content', () => {

        mockGetId.mockResolvedValue(1000);
        mockGetVersionedItemLink.mockResolvedValue([]);

        render(<VersionedItemsTable />);
        const linkElement = screen.getByText(/Comment/i);
        expect(linkElement).toBeDefined();

    });

    test('VersionedItemsTable - renders VersionedItems', async () => {

        mockIsNew.mockReturnValue(false);
        mockGetId.mockResolvedValue(999);
        mockGetItems.mockReturnValue([
            {
                commitId: "commitId",
                gitObjectType: 1,
                objectId: "objectId",
                isFolder: false,
                path: "/python/somescript.py"
            }
        ]);
        mockGetVersionedItemLink.mockReturnValue([
            // Returned by GitRepo
            { "workItemId": 999, "path": "/python/somescript.py", "comment": "test", "linkStatus": "OK", "createdBy": "h2floh@h2floh.net", "modifiedBy": "h2floh@h2floh.net", "modifiedOn": "2020-07-10T08:45:52.167Z" },
            // Dangling/Broken Link
            { "workItemId": 999, "path": "/python/asdfasdf.py", "comment": "test", "linkStatus": "OK", "createdBy": "h2floh@h2floh.net", "modifiedBy": "h2floh@h2floh.net", "modifiedOn": "2020-07-10T08:45:52.167Z" }
        ]);

        render(<VersionedItemsTable />);

        await waitFor(() => screen.getAllByText('/python/somescript.py'));

        // screen.debug(screen.getAllByRole('row'));

        expect(screen.getAllByText('/python/somescript.py').length).toBe(1);
        expect(screen.getAllByText('The referenced file does no longer exist.').length).toBe(1);

        // Test Sort feature
        const tableHeader = screen.getByText('Link');
        fireEvent.click(tableHeader);

        // screen.debug(screen.getAllByRole('link'));
        expect(screen.getAllByRole('link')[0].firstChild?.textContent).toEqual('/python/asdfasdf.py');
    });


    test('VersionedItemsTable - test VersionedItemLink Lifecycle', async () => {

        mockIsNew.mockResolvedValue(false);
        mockGetId.mockResolvedValue(997);
        mockGetItems.mockReturnValue([
            {
                commitId: "commitId",
                gitObjectType: 1,
                objectId: "objectId",
                isFolder: false,
                path: "/python/somescript.py"
            }
        ]);
        mockGetVersionedItemLink.mockReturnValue([]);

        render(<VersionedItemsTable />);

        // Wait for rendered
        await waitFor(() => screen.getAllByText('Link'));

        /**
         * Add new VersionedItem
         */
        // Search add button
        const buttons = screen.getAllByRole('button');
        // Click Add Versioned Item Link button
        fireEvent.click(buttons[0]);
        // Wait for empty row to appear
        await waitFor(() => screen.getAllByText(/Created By/));

        // Click Dropdown
        const dropdown = screen.getAllByRole('button');
        fireEvent.click(dropdown[1]);
        // Select script
        await waitFor(() => screen.getAllByText(/python/));
        const selectableItem = screen.getByText('/python/somescript.py');
        fireEvent.click(selectableItem);
        await waitFor(() => screen.getAllByText(/somescript/));
        // Add comment
        const comment = screen.getByRole('textbox');
        fireEvent.change(comment, { target: { value: 'commenta' } });
        const saveButton = screen.getByLabelText(/Save icon/);
        // Press save
        fireEvent.click(saveButton);
        // Wait for comment textbox to appear
        await waitFor(() => screen.getAllByRole('textbox'));

        // Evaluate save consistency to be defined
        expect(mockPostRequests.mock.calls[0][0]).toEqual('https://localhost:5000/api/versioneditem/997?api-version=2020-07-15');
        const verItemLink1 = ((mockPostRequests.mock.results[0].value as RestClientRequestParams).body) as VersionedItemLink;
        expect(verItemLink1.comment).toEqual("commenta");
        expect(verItemLink1.path).toEqual("/python/somescript.py");
        expect(verItemLink1.workItemId).toBe(997);
        expect(verItemLink1.linkStatus).toBe(LinkStatus.ok);

        /**
         * Change Comment and save
         */
        const comment2 = screen.getByRole('textbox');
        fireEvent.change(comment2, { target: { value: 'commentar' } });
        const saveButton2 = screen.getByLabelText(/Save icon/);
        // Press save
        fireEvent.click(saveButton2);

        // Wait for comment textbox to appear
        await waitFor(() => screen.getAllByRole('textbox'));

        // Evaluate if commentar changed
        expect(mockPostRequests.mock.calls[1][0]).toEqual('https://localhost:5000/api/versioneditem/997?api-version=2020-07-15');
        const verItemLink2 = ((mockPostRequests.mock.results[1].value as RestClientRequestParams).body) as VersionedItemLink;
        expect(verItemLink2.comment).toEqual("commentar");

        /**
         * Delete item
         */
        const deleteButton = screen.getByLabelText(/Delete icon/);
        // Select unique element
        const item = screen.getByDisplayValue('commentar');

        // Press save
        fireEvent.click(deleteButton);

        // Wait for row to disappear
        await waitForElementToBeRemoved(item);

        // Check if delete API was called
        expect(mockPostRequests.mock.calls[2][0]).toEqual('https://localhost:5000/api/versioneditem/997/delete?api-version=2020-07-15');
        const verItemLink3 = ((mockPostRequests.mock.results[2].value as RestClientRequestParams).body) as string;
        expect(verItemLink3).toEqual("/python/somescript.py");
    });

    test('VersionedItemsTable - check disable/enable AddVersionedItem button', async () => {

        mockIsNew.mockReturnValue(true);
        mockGetId.mockResolvedValue(undefined);

        render(<VersionedItemsTable />);

        await waitFor(() => screen.queryAllByText('Add VersionedItem Link'));

        expect(screen.getByRole('button').getAttribute('aria-disabled')).toEqual("true");

        // Save Work Item
        mockIsNew.mockReturnValue(false);
        spyWorkItemCallBackAccessor().onSaved({id: 800});

        await waitFor(() => screen.queryAllByText('Add VersionedItem Link'));

        expect(screen.getByRole('button').getAttribute('aria-disabled')).toEqual("false");

    });


    test('VersionedItemsTable - Rest API access error on Add VersionedLinkItem', async () => {

        mockHTTPError.mockReturnValue(true);

        mockIsNew.mockResolvedValue(false);
        mockGetId.mockResolvedValue(700);
        mockGetItems.mockReturnValue([
            {
                commitId: "commitId",
                gitObjectType: 1,
                objectId: "objectId",
                isFolder: false,
                path: "/python/somescript.py"
            }
        ]);

        render(<VersionedItemsTable />);

        // Wait for rendered
        await waitFor(() => screen.queryAllByText('Link'));

        /**
         * Add new VersionedItem
         */
        // Search add button
        const buttons = screen.getAllByRole('button');
        // Click Add Versioned Item Link button
        fireEvent.click(buttons[0]);
        // Wait for empty row to appear
        await waitFor(() => screen.getAllByText(/Created By/));
        // Click Dropdown
        const dropdown = screen.getAllByRole('button');
        fireEvent.click(dropdown[1]);
        // Select script
        await waitFor(() => screen.getAllByText(/python/));
        const selectableItem = screen.getByText('/python/somescript.py');
        fireEvent.click(selectableItem);
        await waitFor(() => screen.getAllByText(/somescript/));
        // Add comment
        const comment = screen.getByRole('textbox');
        fireEvent.change(comment, { target: { value: 'commenta' } });
        const saveButton = screen.getByLabelText(/Save icon/);
        // Press save
        fireEvent.click(saveButton);

        // Wait for Error message to appear
        await waitFor(() => screen.getByText('Error while trying to save.'));

        // Evaluate save consistency to be defined
        expect(screen.getByText('Error while trying to save.')).toBeDefined();
    });


    test('VersionedItemsTable - Rest API access error on Delete VersionedLinkItem', async () => {

        mockIsNew.mockResolvedValue(false);
        mockGetId.mockResolvedValue(701);
        mockGetItems.mockReturnValue([
            {
                commitId: "commitId",
                gitObjectType: 1,
                objectId: "objectId",
                isFolder: false,
                path: "/python/somescript2.py"
            }
        ]);
        mockGetVersionedItemLink.mockReturnValue([
            // Returned by GitRepo
            { "workItemId": 701, "path": "/python/somescript2.py", "comment": "test", "linkStatus": "OK", "createdBy": "h2floh@h2floh.net", "modifiedBy": "h2floh@h2floh.net", "modifiedOn": "2020-07-10T08:45:52.167Z" },
        ]);

        render(<VersionedItemsTable />);

        // Wait for rendered
        await waitFor(() => screen.getAllByText(/somescript2/));

        // Swith to error mode
        mockHTTPError.mockReturnValue(true);

        /**
         * Delete item
         */
        const deleteButton = screen.getByLabelText(/Delete icon/);
        // Select unique attribute
        const item = screen.getByText("/python/somescript2.py");
        // Press save
        fireEvent.click(deleteButton);

        // Wait for Error message to appear
        await waitFor(() => screen.getByText('Error while trying to delete.'));

        // Evaluate save consistency to be defined
        expect(screen.getByText('Error while trying to delete.')).toBeDefined();
    });

    test('VersionedItemsTable - Add/Delete VersionedItemLink without save', async () => {

        mockIsNew.mockResolvedValue(false);
        mockGetId.mockResolvedValue(777);
        mockGetItems.mockReturnValue([
            {
                commitId: "commitId",
                gitObjectType: 1,
                objectId: "objectId",
                isFolder: false,
                path: "/python/somescript.py"
            }
        ]);

        render(<VersionedItemsTable />);

        // Wait for rendered
        await waitFor(() => screen.queryAllByText('Link'));

        /**
         * Add and directly delete new VersionedItem
         */
        // Search add button
        const buttons = screen.getAllByRole('button');
        // Click Add Versioned Item Link button
        fireEvent.click(buttons[0]);
        // Wait for empty row to appear
        await waitFor(() => screen.getByText(/Created By/));

        // delete Button
        const deleteButton = screen.getByLabelText(/Delete icon/);
        // Press save
        fireEvent.click(deleteButton);

        // Validate constraints
        expect(screen.getAllByRole('button').length).toBe(1);
    });

    test('VersionedItemsTable - Git Client Error', async () => {

        const getItemsError = new Error('network unavailable');
        mockIsNew.mockResolvedValue(false);
        mockGetId.mockResolvedValue(997);
        mockGetItems.mockRejectedValue(getItemsError);
        mockGetVersionedItemLink.mockReturnValue([]);

        render(<VersionedItemsTable />);

        // Wait for rendering
        await waitFor(() => screen.getAllByText('Link'));

        expect(mockTrackException.mock.calls[0][0]).toEqual({"exception": getItemsError});
    });

});


