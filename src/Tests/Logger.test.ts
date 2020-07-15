import {
    ApplicationInsights,
    SeverityLevel
} from '@microsoft/applicationinsights-web'
import {
    anything,
    instance,
    mock,
    spy,
    verify
} from 'ts-mockito';
import {
    Logger
} from '../Shared/Logger/Logger'

test('Logger - TRACE: should only log CRITICAL with logLevel.CRITICAL in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Critical, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logTrace('CRITICAL', SeverityLevel.Critical);
    logger.logTrace('ERROR', SeverityLevel.Error);
    logger.logTrace('WARNING', SeverityLevel.Warning);
    logger.logTrace('INFORMATION', SeverityLevel.Information);
    logger.logTrace('VERBOSE', SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackTrace(anything())).times(1);
});

  test('Logger - TRACE: should log CRITICAL, ERROR with logLevel.CRITICAL in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Error, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logTrace('CRITICAL', SeverityLevel.Critical);
    logger.logTrace('ERROR', SeverityLevel.Error);
    logger.logTrace('WARNING', SeverityLevel.Warning);
    logger.logTrace('INFORMATION', SeverityLevel.Information);
    logger.logTrace('VERBOSE', SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackTrace(anything())).times(2);
  });

  test('Logger - TRACE: should log CRITICAL, ERROR, WARNING with logLevel.WARNING in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Warning, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logTrace('CRITICAL', SeverityLevel.Critical);
    logger.logTrace('ERROR', SeverityLevel.Error);
    logger.logTrace('WARNING', SeverityLevel.Warning);
    logger.logTrace('INFORMATION', SeverityLevel.Information);
    logger.logTrace('VERBOSE', SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackTrace(anything())).times(3);
  });

  test('Logger - TRACE: should log CRITICAL, ERROR, WARNING, INFORMATION with logLevel.INFORMATION in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Information, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logTrace('CRITICAL', SeverityLevel.Critical);
    logger.logTrace('ERROR', SeverityLevel.Error);
    logger.logTrace('WARNING', SeverityLevel.Warning);
    logger.logTrace('INFORMATION', SeverityLevel.Information);
    logger.logTrace('VERBOSE', SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackTrace(anything())).times(4);
  });

  test('Logger - TRACE: should log CRITICAL, ERROR, WARNING, INFORMATION, DEBUG with logLevel.DEBUG in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Verbose, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logTrace('CRITICAL', SeverityLevel.Critical);
    logger.logTrace('ERROR', SeverityLevel.Error);
    logger.logTrace('WARNING', SeverityLevel.Warning);
    logger.logTrace('INFORMATION', SeverityLevel.Information);
    logger.logTrace('VERBOSE', SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackTrace(anything())).times(5);
  });

  test('Logger - EXCEPTION: should only log CRITICAL with SeverityLevel.Critical in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Critical, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logException(new Error('CRITICAL'), SeverityLevel.Critical);
    logger.logException(new Error('ERROR'), SeverityLevel.Error);
    logger.logException(new Error('WARNING'), SeverityLevel.Warning);
    logger.logException(new Error('INFORMATION'), SeverityLevel.Information);
    logger.logException(new Error('VERBOSE'), SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackException(anything())).times(1);
  });

  test('Logger - EXCEPTION: should log CRITICAL, ERROR with SeverityLevel.Error in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Error, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logException(new Error('CRITICAL'), SeverityLevel.Critical);
    logger.logException(new Error('ERROR'), SeverityLevel.Error);
    logger.logException(new Error('WARNING'), SeverityLevel.Warning);
    logger.logException(new Error('INFORMATION'), SeverityLevel.Information);
    logger.logException(new Error('VERBOSE'), SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackException(anything())).times(2);
  });

  test('Logger - EXCEPTION: should log CRITICAL, ERROR, WARNING with logLevel.WARNING in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Warning, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logException(new Error('CRITICAL'), SeverityLevel.Critical);
    logger.logException(new Error('ERROR'), SeverityLevel.Error);
    logger.logException(new Error('WARNING'), SeverityLevel.Warning);
    logger.logException(new Error('INFORMATION'), SeverityLevel.Information);
    logger.logException(new Error('VERBOSE'), SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackException(anything())).times(3);
  });

  test('Logger - EXCEPTION: should log CRITICAL, ERROR, WARNING, INFORMATION with logLevel.INFORMATION in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Information, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logException(new Error('CRITICAL'), SeverityLevel.Critical);
    logger.logException(new Error('ERROR'), SeverityLevel.Error);
    logger.logException(new Error('WARNING'), SeverityLevel.Warning);
    logger.logException(new Error('INFORMATION'), SeverityLevel.Information);
    logger.logException(new Error('VERBOSE'), SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackException(anything())).times(4);
  });

  test('Logger - EXCEPTION: should log CRITICAL, ERROR, WARNING, INFORMATION, DEBUG with SeverityLevel.Verbose in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Verbose, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logException(new Error('CRITICAL'), SeverityLevel.Critical);
    logger.logException(new Error('ERROR'), SeverityLevel.Error);
    logger.logException(new Error('WARNING'), SeverityLevel.Warning);
    logger.logException(new Error('INFORMATION'), SeverityLevel.Information);
    logger.logException(new Error('VERBOSE'), SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackException(anything())).times(5);
  });


  test('Logger - EVENT: should only log CRITICAL with SeverityLevel.Critical in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Critical, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logEvent('CRITICAL', SeverityLevel.Critical);
    logger.logEvent('ERROR', SeverityLevel.Error);
    logger.logEvent('WARNING', SeverityLevel.Warning);
    logger.logEvent('INFORMATION', SeverityLevel.Information);
    logger.logEvent('VERBOSE', SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackEvent(anything())).times(1);
  });

  test('Logger - EVENT: should log CRITICAL, ERROR with SeverityLevel.Error in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Error, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logEvent('CRITICAL', SeverityLevel.Critical);
    logger.logEvent('ERROR', SeverityLevel.Error);
    logger.logEvent('WARNING', SeverityLevel.Warning);
    logger.logEvent('INFORMATION', SeverityLevel.Information);
    logger.logEvent('VERBOSE', SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackEvent(anything())).times(2);
  });

  test('Logger - EVENT: should log CRITICAL, ERROR, WARNING with logLevel.WARNING in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Warning, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logEvent('CRITICAL', SeverityLevel.Critical);
    logger.logEvent('ERROR', SeverityLevel.Error);
    logger.logEvent('WARNING', SeverityLevel.Warning);
    logger.logEvent('INFORMATION', SeverityLevel.Information);
    logger.logEvent('VERBOSE', SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackEvent(anything())).times(3);
  });

  test('Logger - EVENT: should log CRITICAL, ERROR, WARNING, INFORMATION with logLevel.INFORMATION in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Information, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logEvent('CRITICAL', SeverityLevel.Critical);
    logger.logEvent('ERROR', SeverityLevel.Error);
    logger.logEvent('WARNING', SeverityLevel.Warning);
    logger.logEvent('INFORMATION', SeverityLevel.Information);
    logger.logEvent('VERBOSE', SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackEvent(anything())).times(4);
  });

  test('Logger - EVENT: should log CRITICAL, ERROR, WARNING, INFORMATION, DEBUG with SeverityLevel.Verbose in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Verbose, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logEvent('CRITICAL', SeverityLevel.Critical);
    logger.logEvent('ERROR', SeverityLevel.Error);
    logger.logEvent('WARNING', SeverityLevel.Warning);
    logger.logEvent('INFORMATION', SeverityLevel.Information);
    logger.logEvent('VERBOSE', SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackEvent(anything())).times(5);
  });

  test('Logger - DEPENDENCY: should only log CRITICAL with SeverityLevel.Critical in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Critical, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logDependency({id:'CRITICAL', responseCode: 200}, SeverityLevel.Critical);
    logger.logDependency({id:'ERROR', responseCode: 200}, SeverityLevel.Error);
    logger.logDependency({id:'WARNING', responseCode: 200}, SeverityLevel.Warning);
    logger.logDependency({id:'INFORMATION', responseCode: 200}, SeverityLevel.Information);
    logger.logDependency({id:'VERBOSE', responseCode: 200}, SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackDependencyData(anything())).times(1);
  });

  test('Logger - DEPENDENCY: should log CRITICAL, ERROR with SeverityLevel.Error in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Error, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logDependency({id:'CRITICAL', responseCode: 200}, SeverityLevel.Critical);
    logger.logDependency({id:'ERROR', responseCode: 200}, SeverityLevel.Error);
    logger.logDependency({id:'WARNING', responseCode: 200}, SeverityLevel.Warning);
    logger.logDependency({id:'INFORMATION', responseCode: 200}, SeverityLevel.Information);
    logger.logDependency({id:'VERBOSE', responseCode: 200}, SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackDependencyData(anything())).times(2);
  });

  test('Logger - DEPENDENCY: should log CRITICAL, ERROR, WARNING with logLevel.WARNING in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Warning, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logDependency({id:'CRITICAL', responseCode: 200}, SeverityLevel.Critical);
    logger.logDependency({id:'ERROR', responseCode: 200}, SeverityLevel.Error);
    logger.logDependency({id:'WARNING', responseCode: 200}, SeverityLevel.Warning);
    logger.logDependency({id:'INFORMATION', responseCode: 200}, SeverityLevel.Information);
    logger.logDependency({id:'VERBOSE', responseCode: 200}, SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackDependencyData(anything())).times(3);
  });

  test('Logger - DEPENDENCY: should log CRITICAL, ERROR, WARNING, INFORMATION with logLevel.INFORMATION in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Information, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logDependency({id:'CRITICAL', responseCode: 200}, SeverityLevel.Critical);
    logger.logDependency({id:'ERROR', responseCode: 200}, SeverityLevel.Error);
    logger.logDependency({id:'WARNING', responseCode: 200}, SeverityLevel.Warning);
    logger.logDependency({id:'INFORMATION', responseCode: 200}, SeverityLevel.Information);
    logger.logDependency({id:'VERBOSE', responseCode: 200}, SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackDependencyData(anything())).times(4);
  });

  test('Logger - DEPENDENCY: should log CRITICAL, ERROR, WARNING, INFORMATION, DEBUG with SeverityLevel.Verbose in place' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Verbose, mockAppInsights);
    const spyLogger = spy(logger);
    logger.logDependency({id:'CRITICAL', responseCode: 200}, SeverityLevel.Critical);
    logger.logDependency({id:'ERROR', responseCode: 200}, SeverityLevel.Error);
    logger.logDependency({id:'WARNING', responseCode: 200}, SeverityLevel.Warning);
    logger.logDependency({id:'INFORMATION', responseCode: 200}, SeverityLevel.Information);
    logger.logDependency({id:'VERBOSE', responseCode: 200}, SeverityLevel.Verbose);

    verify(mockAppInsightsClass.trackDependencyData(anything())).times(5);
  });


  test('Logger - STARTSTOPTRACKING: should be called' , () => {

    const mockAppInsightsClass = mock(ApplicationInsights);
    const mockAppInsights = instance(mockAppInsightsClass);

    const logger = new Logger('Test', undefined, SeverityLevel.Verbose, mockAppInsights);
    const spyLogger = spy(logger);
    logger.startTracking('id');
    logger.stopTracking('id');

    verify(mockAppInsightsClass.startTrackEvent('id')).times(1);
    verify(mockAppInsightsClass.stopTrackEvent('id')).times(1);
  });
