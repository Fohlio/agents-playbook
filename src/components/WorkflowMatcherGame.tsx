'use client';

import { useState } from "react";

interface GameScenario {
  scenario: string;
  correctWorkflow: string;
  options: string[];
}

const GAME_SCENARIOS: GameScenario[] = [
  {
    scenario: "Production bug causing crashes, need immediate fix",
    correctWorkflow: "quick-fix",
    options: ["quick-fix", "feature-development", "code-refactoring", "unit-test-coverage"]
  },
  {
    scenario: "Need to implement user authentication for new app",
    correctWorkflow: "feature-development", 
    options: ["feature-development", "quick-fix", "trd-creation", "fix-tests"]
  },
  {
    scenario: "Legacy codebase needs restructuring and improvements",
    correctWorkflow: "code-refactoring",
    options: ["code-refactoring", "quick-fix", "feature-development", "fix-circular-dependencies"]
  },
  {
    scenario: "Tests are failing after dependency updates",
    correctWorkflow: "fix-tests",
    options: ["fix-tests", "unit-test-coverage", "quick-fix", "feature-development"]
  },
  {
    scenario: "Starting a new project from scratch",
    correctWorkflow: "product-development",
    options: ["product-development", "feature-development", "trd-creation", "code-refactoring"]
  }
] as const;

export default function WorkflowMatcherGame() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const scenario = GAME_SCENARIOS[currentScenario];

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (answer === scenario.correctWorkflow) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentScenario < GAME_SCENARIOS.length - 1) {
        setCurrentScenario(currentScenario + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Game finished
        alert(`Game finished! Score: ${score + (answer === scenario.correctWorkflow ? 1 : 0)}/${GAME_SCENARIOS.length}`);
        setCurrentScenario(0);
        setScore(0);
        setGameStarted(false);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 2000);
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentScenario(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <section className="py-16 bg-white" aria-labelledby="game-title">
      <div className="max-w-4xl mx-auto px-4">
        <h2 id="game-title" className="text-3xl font-bold text-gray-900 text-center mb-8">
          Workflow Matcher Game
        </h2>
        
        {!gameStarted ? (
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-6">
              Test your workflow knowledge! Match scenarios with the right workflows.
            </p>
            <button 
              onClick={startGame}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-600">
                Question {currentScenario + 1} of {GAME_SCENARIOS.length}
              </span>
              <span className="text-sm text-gray-600">Score: {score}</span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Scenario:</h3>
              <p className="text-gray-700">{scenario.scenario}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {scenario.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && handleAnswer(option)}
                  disabled={showResult}
                  className={`p-4 rounded-lg border text-left transition-colors font-medium ${
                    showResult
                      ? option === scenario.correctWorkflow
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : option === selectedAnswer
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                      : 'bg-white border-gray-300 text-gray-800 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}