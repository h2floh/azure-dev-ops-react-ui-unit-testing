/**
 * Accessors to mocked getConfiguration values
 */
export const mockTrackEvent = jest.fn();
export const mockTrackTrace = jest.fn();
export const mockTrackException = jest.fn();

/**
 * Mocked Application Insights
 */
export class ApplicationInsights {

    /**
     * Mocked loadAppInsights
     */
    // tslint:disable-next-line: no-empty
    public loadAppInsights(): void {}

    /**
     * Mocked trackEvent
     */
    public trackEvent(event: any, customProperties?: any): void {
        mockTrackEvent(event, customProperties);
    }

    /**
     * Mocked trackEvent
     */
    public trackTrace(trace: any, customProperties?: any): void {
        mockTrackTrace(trace, customProperties);
    }

    /**
     * Mocked trackDependencyData
     */
    // tslint:disable-next-line: no-empty
    public trackDependencyData(dependency: any): void {}

    /**
     * Mocked trackPageView
     */
    // tslint:disable-next-line: no-empty
    public trackPageView(pageView?: any): void {}


    /**
     * Mocked trackException
     */
    public trackException(exception: any): void {
        mockTrackException(exception);
    }

    /**
     * Mocked trackException
     */
    // tslint:disable-next-line: no-empty
    public startTrackEvent(name?: string): void {}

    /**
     * Mocked trackException
     */
    public stopTrackEvent(name: string, properties?: {
        [key: string]: string;
    }, measurements?: {
        [key: string]: number;
    // tslint:disable-next-line: no-empty
    }): void {}

}

/**
 * Defines the level of severity for the event.
 */
export enum SeverityLevel {
    Verbose = 0,
    Information = 1,
    Warning = 2,
    Error = 3,
    Critical = 4,
}

/**
 * Declare Interface IDependencyTelemetry to not break build
 */
export interface IDependencyTelemetry {
    /** mocked */
    id: string;
    /** mocked */
    name?: string;
    /** mocked */
    duration?: number;
    /** mocked */
    success?: boolean;
    /** mocked */
    responseCode: number;
    /** mocked */
    correlationContext?: string;
    /** mocked */
    type?: string;
    /** mocked */
    data?: string;
    /** mocked */
    target?: string;
}