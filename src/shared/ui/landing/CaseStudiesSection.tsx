"use client";

import { useState } from "react";
import { CASE_STUDIES, type CaseStudy } from "@/shared/data/case-studies";
import { Card } from "@/shared/ui/atoms";
import { Badge } from "@/shared/ui/atoms";
import { useScrollAnimation } from "@/shared/hooks/use-scroll-animation";

/**
 * Case Studies Section
 *
 * Showcases real-world examples of workflow effectiveness
 * and AI hallucination prevention
 */
export default function CaseStudiesSection() {
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy>(CASE_STUDIES[0]);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 ${
            headerVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Real Results, Real Teams
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how engineering teams eliminated AI hallucinations and 10x&apos;d their productivity with structured workflows
          </p>
        </div>

        {/* Case Study Tabs */}
        <div
          className={`flex flex-wrap justify-center gap-4 mb-12 ${
            headerVisible ? "animate-fade-in animation-delay-200" : "opacity-0"
          }`}
        >
          {CASE_STUDIES.map((study) => (
            <button
              key={study.id}
              onClick={() => setSelectedStudy(study)}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${
                  selectedStudy.id === study.id
                    ? 'bg-primary-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:shadow-md'
                }
              `}
            >
              {study.company}
            </button>
          ))}
        </div>

        {/* Selected Case Study */}
        <div
          ref={contentRef}
          className={`grid lg:grid-cols-2 gap-12 items-start ${
            contentVisible ? "animate-fade-in-up animation-delay-300" : "opacity-0"
          }`}
        >
          {/* Left: Problem & Solution */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{selectedStudy.results[0].icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedStudy.company}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedStudy.companySize}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedStudy.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Card className="bg-red-50 border-red-200">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <span>⚠️</span> The Problem
              </h4>
              <p className="text-red-800">{selectedStudy.problem}</p>
            </Card>

            <Card className="bg-emerald-50 border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                <span>✅</span> The Solution
              </h4>
              <p className="text-emerald-800 mb-3">{selectedStudy.solution}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full text-sm font-medium text-emerald-900">
                <span>🔗</span> Workflow: {selectedStudy.workflow}
              </div>
            </Card>

            {/* Quote */}
            <Card className="bg-gradient-to-br from-primary-50 to-purple-50 border-primary-200">
              <div className="flex gap-4">
                <span className="text-4xl text-primary-400">&quot;</span>
                <div>
                  <p className="text-gray-800 italic mb-4">{selectedStudy.quote}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                      {selectedStudy.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedStudy.author}</p>
                      <p className="text-sm text-gray-600">{selectedStudy.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Results */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-6">
              📊 Impact Metrics
            </h4>
            <div className="space-y-4">
              {selectedStudy.results.map((result, index) => (
                <Card
                  key={index}
                  className="bg-gradient-to-r from-white to-gray-50 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0">{result.icon}</div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">
                        {result.metric}
                      </h5>
                      <p className="text-2xl font-bold text-primary-600 mb-1">
                        {result.improvement}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Key Takeaways */}
            <Card className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>💡</span> Key Takeaways
              </h5>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  <span className="text-gray-200">
                    Workflows eliminate AI hallucinations through structured context
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  <span className="text-gray-200">
                    10x productivity gains with validated, reusable patterns
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  <span className="text-gray-200">
                    Reduced production incidents by catching edge cases early
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
