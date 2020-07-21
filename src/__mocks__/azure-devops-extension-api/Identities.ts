/**
 * Mocked People Picker Provider
 */
export class PeoplePickerProvider {
    /**
     * Mocked getEntityFromUniqueAttribute
     */
    public getEntityFromUniqueAttribute(entityId: string) {

        if (entityId === "jestwagner") {
            return new Promise((resolve) => resolve({
                    displayName: "Jest Wagner",
                    image: "https://someimageurl/jw.png",
                    entityId: "jwagner@h2floh.net"
            }));
        } else {
            return new Promise((reject) => reject(new Error(`Identity ${entityId} not found.`)));
        }

    }
}
