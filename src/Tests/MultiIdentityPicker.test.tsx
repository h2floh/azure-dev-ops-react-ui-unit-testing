import '@testing-library/jest-dom/extend-expect'
import {
    fireEvent,
    render,
    screen,
    waitFor
} from '@testing-library/react';
import React from 'react';
import MultiIdentityPicker from '../MultiIdentityPicker/MultiIdentityPicker'
import { mockGetFieldValue } from '../__mocks__/azure-devops-extension-sdk'

// AzDO related Mocks (implementations /src/__mocks__)
// Extension related Mocks
jest.mock('../Common');

test('MultiIdentityPicker - use current Identity if no one can loaded', async () => {

  // Start with no Identities provided in the work item field assigned
  mockGetFieldValue.mockReturnValue("");

  // This will start rendering the control for the test and
  // therefore invoke componentDidMount() of MultiIdentityPicker
  render(<MultiIdentityPicker />);

  // Check if the current user was assigned
  await waitFor(() => screen.getByText('Jest Wagner'));

  expect(screen.getByText('Jest Wagner')).toBeDefined();

});

test('MultiIdentityPicker - load and display Identity', async () => {

    // Identities Field Value is set to git@h2floh.net
    mockGetFieldValue.mockReturnValue("[\"git@h2floh.net\"]");

    // Render the MultiIdentityPicker control
    render(<MultiIdentityPicker />);

    // Check if the user associated to git@h2floh.net is displayed
    await waitFor(() => screen.getByText('Florian Wagner'));

    expect(screen.getByText('Florian Wagner')).toBeDefined();
  });

test('MultiIdentityPicker - invalid Identity input', async () => {

    // Identities Field Value is set to invalid
    mockGetFieldValue.mockReturnValue("asdfasdf");

    render(<MultiIdentityPicker />);

    expect(screen.getByLabelText('Add people')).toBeDefined();
  });

test('MultiIdentityPicker - On Identity Removed', async () => {

    // Identities Field Value is set to git@h2floh.net, gdhong@h2floh.net
    mockGetFieldValue.mockReturnValue("[\"git@h2floh.net\",\"gdhong@h2floh.net\"]");

    render(<MultiIdentityPicker />);

    await waitFor(() => screen.getByText('GilDong Hong'));

    expect(screen.getByText('GilDong Hong')).toBeDefined();

    const buttons = screen.getAllByLabelText('Remove GilDong Hong');
    // Button 'GilDong Hong' Delete
    fireEvent.click(buttons[0]);

    await waitFor(() => screen.getByText('Florian Wagner'));

    expect((screen.queryAllByText('GilDong Hong')).length).toBe(0);
  });
