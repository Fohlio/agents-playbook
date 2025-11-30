/**
 * Discovery Section Consistency Tests
 *
 * Verifies that Discovery cards and widgets maintain consistent structure
 * 
 * Architecture:
 * - Pure UI cards in shared/ui/molecules (WorkflowDiscoveryCard, MiniPromptDiscoveryCard)
 * - Business logic widgets in widgets/ (WorkflowDiscoveryCardWidget, MiniPromptDiscoveryCardWidget)
 * - Discovery sections use widgets for full functionality
 */

import fs from 'fs';
import path from 'path';

describe('Discovery Section Consistency', () => {
  describe('WorkflowDiscoveryCard (Pure UI) structure', () => {
    let cardCode: string;

    beforeAll(() => {
      const cardPath = path.join(__dirname, '../../../..', 'shared/ui/molecules/WorkflowDiscoveryCard.tsx');
      cardCode = fs.readFileSync(cardPath, 'utf8');
    });

    it('should use Card component with flexbox for equal heights', () => {
      expect(cardCode).toContain('h-full');
      expect(cardCode).toContain('flex flex-col');
    });

    it('should use line-clamp-3 for description truncation', () => {
      expect(cardCode).toContain('line-clamp-3');
    });

    it('should use ComplexityBadge for complexity display', () => {
      expect(cardCode).toContain('ComplexityBadge');
      expect(cardCode).toContain('workflow.complexity');
    });

    it('should use TagBadgeList for tag display', () => {
      expect(cardCode).toContain('TagBadgeList');
    });

    it('should have rating display (simplified view model)', () => {
      expect(cardCode).toContain('workflow.rating');
      expect(cardCode).toContain('workflow.rating.average');
      expect(cardCode).toContain('workflow.rating.count');
    });

    it('should display metadata (simplified view model)', () => {
      expect(cardCode).toContain('workflow.user.username');
      expect(cardCode).toContain('workflow.stagesCount');
      expect(cardCode).toContain('workflow.usageCount');
    });

    it('should accept handlers for import/remove actions', () => {
      expect(cardCode).toContain('onImport');
      expect(cardCode).toContain('onRemove');
    });
  });

  describe('WorkflowDiscoveryCardWidget (Business Logic) structure', () => {
    let widgetCode: string;

    beforeAll(() => {
      const widgetPath = path.join(__dirname, '../../../..', 'widgets/workflow-discovery-card/WorkflowDiscoveryCardWidget.tsx');
      widgetCode = fs.readFileSync(widgetPath, 'utf8');
    });

    it('should handle isInUserLibrary logic', () => {
      expect(widgetCode).toContain('isInUserLibrary');
    });

    it('should transform workflow data for pure UI card', () => {
      expect(widgetCode).toContain('workflowCardData');
      expect(widgetCode).toContain('stagesCount: workflow._count.stages');
    });

    it('should handle modals (preview, rating, share)', () => {
      expect(widgetCode).toContain('WorkflowPreviewModal');
      expect(widgetCode).toContain('RatingDialog');
      expect(widgetCode).toContain('ShareModal');
    });
  });

  describe('MiniPromptDiscoveryCard (Pure UI) structure', () => {
    let cardCode: string;

    beforeAll(() => {
      const cardPath = path.join(__dirname, '../../../..', 'shared/ui/molecules/MiniPromptDiscoveryCard.tsx');
      cardCode = fs.readFileSync(cardPath, 'utf8');
    });

    it('should use Card component with flexbox for equal heights', () => {
      expect(cardCode).toContain('h-full');
      expect(cardCode).toContain('flex flex-col');
    });

    it('should use line-clamp-3 for description truncation', () => {
      expect(cardCode).toContain('line-clamp-3');
    });

    it('should use TagBadgeList for tag display', () => {
      expect(cardCode).toContain('TagBadgeList');
    });

    it('should have rating display (simplified view model)', () => {
      expect(cardCode).toContain('miniPrompt.rating');
      expect(cardCode).toContain('miniPrompt.rating.average');
      expect(cardCode).toContain('miniPrompt.rating.count');
    });

    it('should display metadata (simplified view model)', () => {
      expect(cardCode).toContain('miniPrompt.user.username');
      expect(cardCode).toContain('miniPrompt.referencesCount');
      expect(cardCode).toContain('miniPrompt.workflowsCount');
    });

    it('should accept handlers for import/remove actions', () => {
      expect(cardCode).toContain('onImport');
      expect(cardCode).toContain('onRemove');
    });
  });

  describe('MiniPromptDiscoveryCardWidget (Business Logic) structure', () => {
    let widgetCode: string;

    beforeAll(() => {
      const widgetPath = path.join(__dirname, '../../../..', 'widgets/mini-prompt-discovery-card/MiniPromptDiscoveryCardWidget.tsx');
      widgetCode = fs.readFileSync(widgetPath, 'utf8');
    });

    it('should handle isInUserLibrary logic', () => {
      expect(widgetCode).toContain('isInUserLibrary');
    });

    it('should transform mini-prompt data for pure UI card', () => {
      expect(widgetCode).toContain('miniPromptCardData');
      expect(widgetCode).toContain('workflowsCount: miniPrompt._count.stageMiniPrompts');
    });

    it('should handle modals (editor, rating, share)', () => {
      expect(widgetCode).toContain('MiniPromptEditorModal');
      expect(widgetCode).toContain('RatingDialog');
      expect(widgetCode).toContain('ShareModal');
    });
  });

  describe('Discover sections integration', () => {
    it('WorkflowsDiscoverySection should use widget with DiscoveryGrid', () => {
      const sectionPath = path.join(__dirname, '../WorkflowsDiscoverySection.tsx');
      const sectionCode = fs.readFileSync(sectionPath, 'utf8');

      expect(sectionCode).toContain('DiscoveryGrid');
      expect(sectionCode).toContain('WorkflowDiscoveryCardWidget');
    });

    it('MiniPromptsDiscoverySection should use widget with DiscoveryGrid', () => {
      const sectionPath = path.join(__dirname, '../MiniPromptsDiscoverySection.tsx');
      const sectionCode = fs.readFileSync(sectionPath, 'utf8');

      expect(sectionCode).toContain('DiscoveryGrid');
      expect(sectionCode).toContain('MiniPromptDiscoveryCardWidget');
    });
  });

  describe('Tag overflow consistency', () => {
    it('WorkflowDiscoveryCard should use TagBadgeList for overflow handling', () => {
      const cardPath = path.join(__dirname, '../../../..', 'shared/ui/molecules/WorkflowDiscoveryCard.tsx');
      const cardCode = fs.readFileSync(cardPath, 'utf8');

      // TagBadgeList handles overflow internally with max 3 tags + overflow indicator
      expect(cardCode).toContain('<TagBadgeList');
      expect(cardCode).toContain('workflow.tags');
    });

    it('MiniPromptDiscoveryCard should use TagBadgeList for overflow handling', () => {
      const cardPath = path.join(__dirname, '../../../..', 'shared/ui/molecules/MiniPromptDiscoveryCard.tsx');
      const cardCode = fs.readFileSync(cardPath, 'utf8');

      // TagBadgeList handles overflow internally with max 3 tags + overflow indicator
      expect(cardCode).toContain('<TagBadgeList');
      expect(cardCode).toContain('miniPrompt.tags');
    });
  });
});
