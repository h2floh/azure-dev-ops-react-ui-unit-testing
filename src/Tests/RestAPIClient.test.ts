import { SeverityLevel } from '@microsoft/applicationinsights-web';
import { Logger } from '../Shared/Logger/Logger';
import RestAPIClient from '../Shared/RestAPIClient/RestAPIClient'
import { mockGetVersionedItemLink } from '../__mocks__/azure-devops-extension-api/Common/RestClientBase';


describe('RestAPIClient', () => {

    test('RestAPIClient - parse baseUrl regardless of user input' , () => {
        const myRestAPI = new RestAPIClient('https://localhost/', new Logger('test',undefined, undefined, undefined));

        myRestAPI.getVersionedItemLinks(555);

        const myRestAPI2 = new RestAPIClient('https://localhost', new Logger('test',undefined, undefined, undefined));

        myRestAPI2.getVersionedItemLinks(555);

        expect(mockGetVersionedItemLink.mock.calls[0][0]).toEqual(mockGetVersionedItemLink.mock.calls[1][0]);
    });

    // Other call test are all made in VersionedItemsTable.test.tsx
})
