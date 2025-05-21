/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { act } from 'react';
import React from 'react';
import { mockGetFieldValue } from '../__mocks__/azure-devops-extension-sdk'
import MultiIdentityPicker from '../MultiIdentityPicker/MultiIdentityPicker'

// AzDO related Mocks (implementations /src/__mocks__)
// Extension related Mocks
jest.mock('../Common');

test('MultiIdentityPicker - use current Identity if no one can loaded', async () => {

  // Start with no Identities provided in the work item field assigned
  mockGetFieldValue.mockReturnValue("");

  // This will start rendering the control for the test and
  // therefore invoke componentDidMount() of MultiIdentityPicker
  await act(async () => {
    render(<MultiIdentityPicker />);
    // Small delay to ensure state updates are processed
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  // Check if the current user was assigned
  await waitFor(() => screen.getByText('Jest Wagner'), { timeout: 3000 });

  expect(screen.getByText('Jest Wagner')).toBeDefined();

});

test('MultiIdentityPicker - load and display Identity', async () => {

    // Identities Field Value is set to git@h2floh.net
    mockGetFieldValue.mockReturnValue("[\"git@h2floh.net\"]");

    // Render the MultiIdentityPicker control
    await act(async () => {
      render(<MultiIdentityPicker />);
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check if the user associated to git@h2floh.net is displayed
    await waitFor(() => screen.getByText('Florian Wagner'), { timeout: 3000 });

    expect(screen.getByText('Florian Wagner')).toBeDefined();
  });

test('MultiIdentityPicker - invalid Identity input', async () => {

  // Identities Field Value is set to invalid
  mockGetFieldValue.mockReturnValue("asdfasdf");

  await act(async () => {
    render(<MultiIdentityPicker />);
    // Small delay to ensure state updates are processed
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  await waitFor(() => {
    expect(screen.getByLabelText('Add people')).toBeDefined();
  }, { timeout: 3000 });
});

test('MultiIdentityPicker - On Identity Removed', async () => {

    // Identities Field Value is set to git@h2floh.net, gdhong@h2floh.net
    mockGetFieldValue.mockReturnValue("[\"git@h2floh.net\",\"gdhong@h2floh.net\"]");

    await act(async () => {
      render(<MultiIdentityPicker />);
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => screen.getByText('GilDong Hong'), { timeout: 3000 });

    expect(screen.getByText('GilDong Hong')).toBeDefined();

    const buttons = screen.getAllByLabelText('Remove GilDong Hong');
    // Button 'GilDong Hong' Delete
    await act(async () => {
      fireEvent.click(buttons[0]);
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => screen.getByText('Florian Wagner'), { timeout: 3000 });

    expect((screen.queryAllByText('GilDong Hong')).length).toBe(0);
  });
