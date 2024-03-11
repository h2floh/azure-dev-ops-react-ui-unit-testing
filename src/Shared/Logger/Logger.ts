import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import {
    ApplicationInsights,
    IDependencyTelemetry,
    SeverityLevel
} from '@microsoft/applicationinsights-web';
import { createBrowserHistory } from "history";

export let appInsights: ApplicationInsights;
export let reactPlugin: ReactPlugin;

/**
 * Application Insights Logger Wrapper
 */
export class Logger {
    /** Severity Level for current instance of Logger. Only same and higher Severity will be logged */
    private logLevel: SeverityLevel;
    /** Control Name which is logging to be include in custom dimensions */
    private controlName: string;

    /**
     * Constructor for Logger
     *
     * @param {string} controlname Name of current session (will be mainly used from within UI Controls -> name of control)
     * @param {string} instrumentationKey (Optional) AppInsights Instrumentation Key. Default is undefined.
     * @param {SeverityLevel} logLevel (Optional) Severity Level for current instance of Logger. Only same and higher Severity will be logged. Default is undefined.
     * @param {ApplicationInsights} appInsightsObject (Optional) AppInsightsObject, not needed if Instrumentation Key is provided. Default is undefined.
     * @returns {Logger} Logger instance
     */
    constructor(controlname: string, instrumentationKey?: string, logLevel?: SeverityLevel, appInsightsObject?: ApplicationInsights) {
        this.controlName = controlname;
        if (instrumentationKey !== undefined && logLevel !== undefined)
        {
            const browserHistory = createBrowserHistory();
            reactPlugin = new ReactPlugin();
            appInsights = new ApplicationInsights({ config: {
                instrumentationKey,
                extensions: [reactPlugin],
                extensionConfig: {
                [reactPlugin.identifier]: { history: browserHistory }
                }
              }});
            appInsights.loadAppInsights();
            appInsights.trackPageView({});
            this.logLevel = logLevel;
        } else if (appInsightsObject !== undefined && logLevel !== undefined) {
            reactPlugin = new ReactPlugin();
            appInsights = appInsightsObject;
            appInsights.loadAppInsights();
            this.logLevel = logLevel;
        } else
        {
            reactPlugin = new ReactPlugin();
            appInsights = new ApplicationInsights({ config: { }});
            this.logLevel = SeverityLevel.Critical;
        }
    }

    /**
     * Wrapper around trackEvent, will only log events equal or more severe
     * than initialized SeverityLevel
     *
     * @param {string} name EventName
     * @param {SeverityLevel} logLevel SeverityLevel of Event
     */
    public logEvent(name: string, logLevel: SeverityLevel) {
        if (this.logLevel <= logLevel)
        {
            appInsights.trackEvent({name}, {"controlName" : this.controlName});
        }
    }

    /**
     * Wrapper around logTrace, will only log traces equal or more severe
     * than initialized SeverityLevel
     *
     * @param {string} message Message to trace
     * @param {SeverityLevel} logLevel SeverityLevel of Message
     */
    public logTrace(message: string, logLevel: SeverityLevel) {
        if (this.logLevel <= logLevel)
        {
            appInsights.trackTrace({message, severityLevel: logLevel}, {"controlName" : this.controlName});
        }
    }

    /**
     * Wrapper around logException, will only log execptions equal or more severe
     * than initialized SeverityLevel
     *
     * @param {Error} exception Exception to log
     * @param {SeverityLevel} logLevel SeverityLevel of Exception
     */
    public logException(exception: Error, logLevel: SeverityLevel) {
        if (this.logLevel <= logLevel)
        {
            appInsights.trackException({exception});
        }
    }

    /**
     * Wrapper around logDependency, will only log dependencies equal or more severe
     * than initialized SeverityLevel
     *
     * @param {IDependencyTelemetry} dependency AppInsight dependency Object
     * @param {SeverityLevel} logLevel SeverityLevel of Dependency
     */
    public logDependency(dependency: IDependencyTelemetry, logLevel: SeverityLevel) {
        if (this.logLevel <= logLevel)
        {
            appInsights.trackDependencyData(dependency);
        }
    }

    /**
     * Wrapper around startTrackEvent
     *
     * @param {string} name Name of Event
     */
    public startTracking(name: string) {
        appInsights.startTrackEvent(name);
    }

    /**
     * Wrapper around stopTrackEvent
     *
     * @param {string} name Name of Event
     */
    public stopTracking(name: string) {
        appInsights.stopTrackEvent(name);
    }
}
