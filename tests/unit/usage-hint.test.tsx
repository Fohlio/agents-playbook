import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UsageHint } from '@/shared/ui/atoms/UsageHint';
import { getUsageHint, USAGE_HINT_TEMPLATE } from '@/shared/lib/constants/usage-hint';

// Mock clipboard API
const mockWriteText = jest.fn(() => Promise.resolve());
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('Usage Hint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsageHint helper', () => {
    it('should replace [workflow-name] with actual workflow name', () => {
      const result = getUsageHint('My Test Workflow');
      expect(result).toBe('use agents-playbook and select My Test Workflow, validate every step with me');
    });

    it('should handle workflow names with special characters', () => {
      const result = getUsageHint('Workflow (v2.0) - Beta');
      expect(result).toContain('Workflow (v2.0) - Beta');
    });

    it('should use the correct template', () => {
      expect(USAGE_HINT_TEMPLATE).toBe('use agents-playbook and select [workflow-name], validate every step with me');
    });
  });

  describe('UsageHint component', () => {
    it('should render the hint with workflow name', () => {
      render(<UsageHint workflowName="Test Workflow" />);
      
      expect(screen.getByText(/use agents-playbook and select Test Workflow/)).toBeInTheDocument();
    });

    it('should display "Quick Start" label', () => {
      render(<UsageHint workflowName="Test Workflow" />);
      
      expect(screen.getByText('Quick Start')).toBeInTheDocument();
    });

    it('should have a copy button', () => {
      render(<UsageHint workflowName="Test Workflow" />);
      
      const copyButton = screen.getByRole('button');
      expect(copyButton).toBeInTheDocument();
    });

    it('should copy hint to clipboard when copy button is clicked', async () => {
      render(<UsageHint workflowName="Test Workflow" />);
      
      const copyButton = screen.getByRole('button');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          'use agents-playbook and select Test Workflow, validate every step with me'
        );
      });
    });

    it('should apply custom className', () => {
      const { container } = render(
        <UsageHint workflowName="Test Workflow" className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render the hint in a code element', () => {
      render(<UsageHint workflowName="Test Workflow" />);
      
      const codeElement = screen.getByText(/use agents-playbook and select/);
      expect(codeElement.tagName).toBe('CODE');
    });

    it('should handle empty workflow name', () => {
      render(<UsageHint workflowName="" />);
      
      expect(screen.getByText(/use agents-playbook and select , validate/)).toBeInTheDocument();
    });

    it('should handle long workflow names', () => {
      const longName = 'This Is A Very Long Workflow Name That Should Still Work Properly';
      render(<UsageHint workflowName={longName} />);
      
      expect(screen.getByText(new RegExp(longName))).toBeInTheDocument();
    });
  });
});

