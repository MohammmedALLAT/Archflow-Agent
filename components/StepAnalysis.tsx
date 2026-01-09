import React, { useEffect, useState } from 'react';
import { AnalysisResult } from '../types';
import { analyzeImage } from '../services/geminiService';
import { BrainCircuit, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface StepAnalysisProps {
  image: string;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export const StepAnalysis: React.FC<StepAnalysisProps> = ({ image, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const result = await analyzeImage(image);
        setAnalysis(result);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to analyze image structure. Please try again.");
        setLoading(false);
      }
    };
    runAnalysis();
  }, [image]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center animate-pulse">
        <BrainCircuit className="w-16 h-16 text-blue-500 mb-6" />
        <h2 className="text-2xl font-light mb-2">Analyzing Geometry</h2>
        <p className="text-arch-muted">Gemini is deconstructing structural logic...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
        <p className="text-red-400 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-light mb-8 flex items-center gap-3">
        <CheckCircle className="text-green-500 w-6 h-6" /> Analysis Complete
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-arch-800 p-6 rounded-lg border border-arch-700">
          <h3 className="text-sm font-mono text-arch-muted mb-2 uppercase">Typology</h3>
          <p className="text-xl">{analysis?.typology}</p>
        </div>
        
        <div className="bg-arch-800 p-6 rounded-lg border border-arch-700">
          <h3 className="text-sm font-mono text-arch-muted mb-2 uppercase">Structural Logic</h3>
          <p className="text-lg text-gray-300">{analysis?.structural_logic}</p>
        </div>

        <div className="bg-arch-800 p-6 rounded-lg border border-arch-700 md:col-span-2">
          <h3 className="text-sm font-mono text-arch-muted mb-2 uppercase">Geometry & Proportions</h3>
          <p className="text-lg text-gray-300">{analysis?.geometry}</p>
        </div>

        <div className="bg-arch-800 p-6 rounded-lg border border-arch-700 md:col-span-2">
          <h3 className="text-sm font-mono text-arch-muted mb-4 uppercase">Missing Realism Elements</h3>
          <div className="flex flex-wrap gap-2">
            {analysis?.missing_elements.map((el, i) => (
              <span key={i} className="px-3 py-1 bg-red-900/30 text-red-200 border border-red-900 rounded-full text-sm">
                {el}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={() => analysis && onAnalysisComplete(analysis)}>
          Proceed to Style Proposal
        </Button>
      </div>
    </div>
  );
};