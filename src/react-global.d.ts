// Add JSX namespace for React 19
import React from 'react';

// Instead of an empty interface, explicitly define the interface with properties from React.ReactElement
declare global {
  namespace JSX {
    // Using type alias instead of empty interface to avoid linting errors
    type Element = React.ReactElement;
  }
}