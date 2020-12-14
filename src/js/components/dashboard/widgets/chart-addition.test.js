import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChartAdditionWidget from './chart-addition';
import { defaultState, undefineds } from '../../../../../tests/mockData';
import { selectMaterialUiSelectOption } from '../../../../../tests/setupTests';

describe('ChartAdditionWidget Component', () => {
  it('renders correctly', () => {
    const { baseElement } = render(<ChartAdditionWidget />);
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const submitCheck = jest.fn();
    render(<ChartAdditionWidget groups={defaultState.devices.groups.byId} onAdditionClick={submitCheck} />);
    expect(screen.queryByText(/Device group/i)).not.toBeInTheDocument();
    userEvent.click(screen.getByText(/Add a chart/i));
    expect(screen.queryByText(/Device group/i)).toBeInTheDocument();
    await selectMaterialUiSelectOption(screen.getByText(/Device group/i), 'testGroup');
    userEvent.click(screen.getByRole('button', { name: /Save/i }));
    expect(submitCheck).toHaveBeenCalled();
    expect(screen.queryByText(/Device group/i)).not.toBeInTheDocument();
  });
});
