import React, { useEffect, useState } from 'react';
import { AnalysisResult, ArchJSONConfig, VisualProposal } from '../types';
import { generateProposals } from '../services/geminiService';
import { Palette, Check } from 'lucide-react';
import { Button } from './Button';

interface StepProposalProps {
  analysis: AnalysisResult;
  config: ArchJSONConfig;
  onProposalSelected: (proposal: VisualProposal) => void;
}

export const StepProposal: React.FC<StepProposalProps> = ({ analysis, config, onProposalSelected }) => {
  const [proposals, setProposals] = useState<VisualProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const results = await generateProposals(analysis, config);
        setProposals(results);
        setLoading(false);
      } catch (e) {
        console.error(e);
        // Fallback or retry logic here
      }
    };
    fetchProposals();
  }, [analysis, config]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-full max-w-md bg-arch-800 rounded-full h-1.5 mb-4 overflow-hidden">
          <div className="bg-blue-500 h-full animate-[loading_1.5s_ease-in-out_infinite] w-1/2"></div>
        </div>
        <p className="text-arch-muted">Generating Visual Strategies...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-light mb-6">Select Visual Direction</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {proposals.map((prop) => (
          <div 
            key={prop.id}
            onClick={() => setSelectedId(prop.id)}
            className={`
              relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 flex flex-col
              ${selectedId === prop.id 
                ? 'border-white bg-arch-800 shadow-xl scale-[1.02]' 
                : 'border-arch-700 bg-arch-800/50 hover:border-arch-600'}
            `}
          >
            {selectedId === prop.id && (
              <div className="absolute top-4 right-4 text-green-400">
                <Check className="w-6 h-6" />
              </div>
            )}
            <div className="w-12 h-12 bg-arch-900 rounded-full flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-xl font-medium mb-2">{prop.title}</h3>
            <p className="text-arch-muted text-sm mb-4 flex-1 leading-relaxed">
              {prop.description}
            </p>
            
            <div className="space-y-3 mt-4 pt-4 border-t border-arch-700/50 text-xs font-mono">
              <div>
                <span className="text-arch-600 uppercase block mb-1">Materials</span>
                <span className="text-gray-300">{prop.material_palette}</span>
              </div>
              <div>
                <span className="text-arch-600 uppercase block mb-1">Light</span>
                <span className="text-gray-300">{prop.lighting}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          disabled={!selectedId} 
          onClick={() => {
            const selected = proposals.find(p => p.id === selectedId);
            if (selected) onProposalSelected(selected);
          }}
        >
          Confirm Direction
        </Button>
      </div>
    </div>
  );
};