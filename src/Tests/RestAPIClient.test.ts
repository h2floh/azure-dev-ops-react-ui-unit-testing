/* eslint-disable @typescript-eslint/no-empty-function */
import { mockGetVersionedItemLink } from '../__mocks__/azure-devops-extension-api/Common/RestClientBase';
import { Logger } from '../Shared/Logger/Logger';
import RestAPIClient from '../Shared/RestAPIClient/RestAPIClient'


describe('RestAPIClient', () => {

    test('RestAPIClient - parse baseUrl regardless of user input' , () => {
        const myRestAPI = new RestAPIClient('https://localhost/', new Logger('test',undefined, undefined, undefined));

        myRestAPI.getVersionedItemLinks(555).catch(() => {});

        const myRestAPI2 = new RestAPIClient('https://localhost', new Logger('test',undefined, undefined, undefined));

        myRestAPI2.getVersionedItemLinks(555).catch(() => {});

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(mockGetVersionedItemLink.mock.calls[0][0]).toEqual(mockGetVersionedItemLink.mock.calls[1][0]);
    });

    // Other call test are all made in VersionedItemsTable.test.tsx
})
