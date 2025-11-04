/**
 * Discovery Section Consistency Tests
 *
 * Verifies that Discovery cards match Library cards structure for consistency
 */

import fs from 'fs';
import path from 'path';

describe('Discovery Section Consistency', () => {
  describe('WorkflowDiscoveryCard structure', () => {
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
      expect(cardCode).toContain('complexity={workflow.complexity}');
    });

    it('should use TagBadgeList for tag display', () => {
      expect(cardCode).toContain('TagBadgeList');
    });

    it('should have rating display', () => {
      expect(cardCode).toContain('RatingDisplay');
      expect(cardCode).toContain('averageRating');
      expect(cardCode).toContain('totalRatings');
    });

    it('should display metadata (author, stages, usage count)', () => {
      expect(cardCode).toContain('workflow.user.username');
      expect(cardCode).toContain('workflow._count.stages');
      expect(cardCode).toContain('workflow.usageCount');
    });

    it('should have import/remove buttons', () => {
      expect(cardCode).toContain('onImport');
      expect(cardCode).toContain('isInUserLibrary');
    });
  });

  describe('MiniPromptDiscoveryCard structure', () => {
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

    it('should have rating display', () => {
      expect(cardCode).toContain('RatingDisplay');
      expect(cardCode).toContain('averageRating');
      expect(cardCode).toContain('totalRatings');
    });

    it('should display metadata (author, usage stats)', () => {
      expect(cardCode).toContain('miniPrompt.user.username');
      expect(cardCode).toContain('miniPrompt._count.references');
      expect(cardCode).toContain('miniPrompt._count.stageMiniPrompts');
    });

    it('should have import/remove buttons', () => {
      expect(cardCode).toContain('onImport');
      expect(cardCode).toContain('isInUserLibrary');
    });
  });

  describe('Discover sections integration', () => {
    it('WorkflowsDiscoverySection should use DiscoveryGrid', () => {
      const sectionPath = path.join(__dirname, '../WorkflowsDiscoverySection.tsx');
      const sectionCode = fs.readFileSync(sectionPath, 'utf8');

      expect(sectionCode).toContain('DiscoveryGrid');
      expect(sectionCode).toContain('WorkflowDiscoveryCard');
    });

    it('MiniPromptsDiscoverySection should use DiscoveryGrid', () => {
      const sectionPath = path.join(__dirname, '../MiniPromptsDiscoverySection.tsx');
      const sectionCode = fs.readFileSync(sectionPath, 'utf8');

      expect(sectionCode).toContain('DiscoveryGrid');
      expect(sectionCode).toContain('MiniPromptDiscoveryCard');
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
