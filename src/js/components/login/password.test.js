import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Password, { Password as PasswordComponent } from './password';

const mockStore = configureStore([thunk]);

describe('Password Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Password />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const submitCheck = jest.fn().mockResolvedValue();
    const ui = <PasswordComponent passwordResetStart={submitCheck} />;
    const { rerender } = render(ui);

    userEvent.type(screen.queryByLabelText(/your email/i), 'something@example.com');
    act(() => userEvent.click(screen.getByRole('button', { name: /Send/i })));
    await waitFor(() => rerender(ui));
    expect(screen.queryByText(/Thanks - we're sending you an email now!/i)).toBeInTheDocument();
  });
});