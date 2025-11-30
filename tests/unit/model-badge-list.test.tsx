import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ModelBadgeList } from '@/shared/ui/molecules/ModelBadgeList';

describe('ModelBadgeList', () => {
  const llmModels = [
    { id: '1', name: 'Claude', slug: 'claude', category: 'LLM' as const },
    { id: '2', name: 'GPT-5', slug: 'gpt-5', category: 'LLM' as const },
  ];

  const imageModels = [
    { id: '3', name: 'Midjourney', slug: 'midjourney', category: 'IMAGE' as const },
    { id: '4', name: 'DALL-E', slug: 'dall-e', category: 'IMAGE' as const },
  ];

  const mixedModels = [...llmModels, ...imageModels];

  it('should render model badges', () => {
    render(<ModelBadgeList models={llmModels} />);
    
    expect(screen.getByText('Claude')).toBeInTheDocument();
    expect(screen.getByText('GPT-5')).toBeInTheDocument();
  });

  it('should return null when no models provided', () => {
    const { container } = render(<ModelBadgeList models={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should return null when models is undefined', () => {
    const { container } = render(<ModelBadgeList models={undefined as never} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should limit displayed models to maxDisplay', () => {
    const manyModels = [
      { id: '1', name: 'Model 1', category: 'LLM' as const },
      { id: '2', name: 'Model 2', category: 'LLM' as const },
      { id: '3', name: 'Model 3', category: 'LLM' as const },
      { id: '4', name: 'Model 4', category: 'LLM' as const },
      { id: '5', name: 'Model 5', category: 'LLM' as const },
    ];

    render(<ModelBadgeList models={manyModels} maxDisplay={3} />);
    
    expect(screen.getByText('Model 1')).toBeInTheDocument();
    expect(screen.getByText('Model 2')).toBeInTheDocument();
    expect(screen.getByText('Model 3')).toBeInTheDocument();
    expect(screen.queryByText('Model 4')).not.toBeInTheDocument();
    expect(screen.queryByText('Model 5')).not.toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should show "+N" badge when models exceed maxDisplay', () => {
    const manyModels = [
      { id: '1', name: 'Model 1', category: 'LLM' as const },
      { id: '2', name: 'Model 2', category: 'LLM' as const },
      { id: '3', name: 'Model 3', category: 'LLM' as const },
      { id: '4', name: 'Model 4', category: 'LLM' as const },
    ];

    render(<ModelBadgeList models={manyModels} maxDisplay={2} />);
    
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should not show "+N" badge when models equal maxDisplay', () => {
    render(<ModelBadgeList models={llmModels} maxDisplay={2} />);
    
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('should default maxDisplay to 3', () => {
    const fourModels = [
      { id: '1', name: 'Model 1', category: 'LLM' as const },
      { id: '2', name: 'Model 2', category: 'LLM' as const },
      { id: '3', name: 'Model 3', category: 'LLM' as const },
      { id: '4', name: 'Model 4', category: 'LLM' as const },
    ];

    render(<ModelBadgeList models={fourModels} />);
    
    expect(screen.getByText('Model 1')).toBeInTheDocument();
    expect(screen.getByText('Model 2')).toBeInTheDocument();
    expect(screen.getByText('Model 3')).toBeInTheDocument();
    expect(screen.queryByText('Model 4')).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('should render LLM models with blue styling', () => {
    render(<ModelBadgeList models={llmModels} />);
    
    const claudeBadge = screen.getByTestId('model-badge-claude');
    expect(claudeBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('should render IMAGE models with purple styling', () => {
    render(<ModelBadgeList models={imageModels} />);
    
    const midjourneyBadge = screen.getByTestId('model-badge-midjourney');
    expect(midjourneyBadge).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('should render mixed models with correct category styling', () => {
    render(<ModelBadgeList models={mixedModels} />);
    
    const claudeBadge = screen.getByTestId('model-badge-claude');
    const midjourneyBadge = screen.getByTestId('model-badge-midjourney');
    
    expect(claudeBadge).toHaveClass('bg-blue-100');
    expect(midjourneyBadge).toHaveClass('bg-purple-100');
  });

  it('should use id as fallback for test id when slug is missing', () => {
    const modelWithoutSlug = [
      { id: 'model-id-1', name: 'Model Without Slug', category: 'LLM' as const },
    ];

    render(<ModelBadgeList models={modelWithoutSlug} />);
    
    expect(screen.getByTestId('model-badge-model-id-1')).toBeInTheDocument();
  });
});

