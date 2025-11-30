import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { AutoPromptCard } from '@/views/workflow-constructor/components/AutoPromptCard';
import type { AutoPromptMetadata } from '@/shared/lib/types/workflow-constructor-types';

// Helper function to wrap component with TooltipProvider
function renderWithTooltip(ui: React.ReactElement) {
  return render(
    <RadixTooltip.Provider delayDuration={0}>
      {ui}
    </RadixTooltip.Provider>
  );
}

describe('AutoPromptCard', () => {
  it('should render Memory Board with correct icon and badge', () => {
    const prompt: AutoPromptMetadata = {
      id: 'memory-board-1',
      name: 'Handoff Memory Board',
      type: 'memory-board',
      isAutoAttached: true,
      position: 'stage-end'
    };

    renderWithTooltip(<AutoPromptCard autoPrompt={prompt} />);

    expect(screen.getByText('Handoff Memory Board')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('🔒')).toBeInTheDocument();
    expect(screen.getByText('Handoff memory board for stage review')).toBeInTheDocument();
  });

  it('should render Internal Agents Chat with correct icon and badge', () => {
    const prompt: AutoPromptMetadata = {
      id: 'multi-agent-chat-1',
      name: 'Internal Agents Chat',
      type: 'multi-agent-chat',
      isAutoAttached: true,
      position: 'after-mini-prompt'
    };

    renderWithTooltip(<AutoPromptCard autoPrompt={prompt} />);

    expect(screen.getByText('Internal Agents Chat')).toBeInTheDocument();
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
    expect(screen.getByText('🔒')).toBeInTheDocument();
    expect(screen.getByText('Internal agents coordination chat')).toBeInTheDocument();
  });

  it('should have dashed border styling', () => {
    const prompt: AutoPromptMetadata = {
      id: 'memory-board-1',
      name: 'Handoff Memory Board',
      type: 'memory-board',
      isAutoAttached: true,
      position: 'stage-end'
    };

    const { container } = renderWithTooltip(<AutoPromptCard autoPrompt={prompt} />);

    const card = container.querySelector('[data-testid="auto-prompt-memory-board-1"]');
    expect(card).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    const prompt: AutoPromptMetadata = {
      id: 'memory-board-1',
      name: 'Handoff Memory Board',
      type: 'memory-board',
      isAutoAttached: true,
      position: 'stage-end'
    };

    const { container } = renderWithTooltip(<AutoPromptCard autoPrompt={prompt} className="mt-4" />);

    const card = container.querySelector('[data-testid="auto-prompt-memory-board-1"]');
    expect(card).toHaveClass('mt-4');
  });

  it('should have correct data-testid for component identification', () => {
    const prompt: AutoPromptMetadata = {
      id: 'memory-board-1',
      name: 'Handoff Memory Board',
      type: 'memory-board',
      isAutoAttached: true,
      position: 'stage-end'
    };

    const { container } = renderWithTooltip(<AutoPromptCard autoPrompt={prompt} />);

    // Check that component can be identified by testId
    const card = container.querySelector('[data-testid="auto-prompt-memory-board-1"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('border-dashed');
  });
});
