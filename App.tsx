import React, { useState, useEffect } from 'react';
import { ArchJSONConfig, AnalysisResult, VisualProposal, GeneratedAsset, WorkflowStep } from './types';
import { StepUpload } from './components/StepUpload';
import { StepAnalysis } from './components/StepAnalysis';
import { StepProposal } from './components/StepProposal';
import { StepImageGen } from './components/StepImageGen';
import { StepVideoGen } from './components/StepVideoGen';
import { ensureApiKey } from './services/geminiService';
import { Layout, ChevronRight, Layers, Film, Image as ImageIcon } from 'lucide-react';
import { Button } from './components/Button';

// Default config matching the prompt
const DEFAULT_CONFIG: ArchJSONConfig = {
  style: {
    material: "exposed concrete and glass",
    mood: "cinematic",
    lighting: "golden hour",
    realism_level: "photorealistic",
    environment: "urban coastal"
  },
  image_generation: {
    number_of_images: 4,
    camera_angles: ["wide", "medium", "close", "aerial"],
    resolution: "high",
    post_processing: "architectural render quality"
  },
  video_generation: {
    number_of_videos: 2,
    videos: [
      {
        duration_seconds: 12,
        motion_style: "slow cinematic",
        camera_movements: ["dolly forward", "pan"],
        transition_style: "smooth",
        frame_rate: "cinematic"
      },
      {
        duration_seconds: 12,
        motion_style: "dynamic cinematic",
        camera_movements: ["orbit", "crane up"],
        transition_style: "smooth",
        frame_rate: "cinematic"
      }
    ]
  }
};

const App = () => {
  const [step, setStep] = useState<WorkflowStep>(WorkflowStep.UPLOAD);
  const [config, setConfig] = useState<ArchJSONConfig>(DEFAULT_CONFIG);
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<VisualProposal | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedAsset[]>([]);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    // Initial check for API key capability
    ensureApiKey().then(() => setHasKey(true));
  }, []);

  const handleUploadNext = (image: string, newConfig: ArchJSONConfig) => {
    setBaseImage(image);
    setConfig(newConfig);
    setStep(WorkflowStep.ANALYSIS);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysis(result);
    setStep(WorkflowStep.PROPOSAL);
  };

  const handleProposalSelected = (proposal: VisualProposal) => {
    setSelectedProposal(proposal);
    setStep(WorkflowStep.IMAGE_GEN);
  };

  const handleImagesComplete = (assets: GeneratedAsset[]) => {
    setGeneratedImages(assets);
    setStep(WorkflowStep.VIDEO_GEN);
  };

  // Render Logic
  const renderStep = () => {
    switch (step) {
      case WorkflowStep.UPLOAD:
        return <StepUpload onNext={handleUploadNext} defaultConfig={DEFAULT_CONFIG} />;
      case WorkflowStep.ANALYSIS:
        return baseImage ? <StepAnalysis image={baseImage} onAnalysisComplete={handleAnalysisComplete} /> : null;
      case WorkflowStep.PROPOSAL:
        return analysis ? <StepProposal analysis={analysis} config={config} onProposalSelected={handleProposalSelected} /> : null;
      case WorkflowStep.IMAGE_GEN:
        return (baseImage && selectedProposal) ? (
          <StepImageGen 
            baseImage={baseImage} 
            config={config} 
            proposal={selectedProposal} 
            onComplete={handleImagesComplete} 
          />
        ) : null;
      case WorkflowStep.VIDEO_GEN:
        return generatedImages.length > 0 ? (
          <StepVideoGen sourceImages={generatedImages} config={config} />
        ) : null;
      default:
        return null;
    }
  };

  // Steps Navigation Indicator
  const steps = [
    { id: WorkflowStep.UPLOAD, label: 'Source', icon: Layers },
    { id: WorkflowStep.ANALYSIS, label: 'Analyze', icon: Layout },
    { id: WorkflowStep.PROPOSAL, label: 'Direction', icon: ChevronRight },
    { id: WorkflowStep.IMAGE_GEN, label: 'Render', icon: ImageIcon },
    { id: WorkflowStep.VIDEO_GEN, label: 'Cinematic', icon: Film },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-arch-900 text-white font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="h-16 border-b border-arch-700 flex items-center px-8 justify-between bg-arch-900 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold rounded text-lg">A</div>
          <h1 className="font-medium tracking-tight">ArchFlow <span className="text-arch-muted font-light">Agent</span></h1>
        </div>
        
        {!hasKey && (
          <Button onClick={() => ensureApiKey().then(() => setHasKey(true))} variant="secondary" className="text-sm px-4 py-2">
            Connect Account
          </Button>
        )}
      </header>

      {/* Progress Bar */}
      <div className="border-b border-arch-700 bg-arch-800/50 px-8 py-4 overflow-x-auto">
        <div className="flex items-center justify-between max-w-5xl mx-auto min-w-[600px]">
          {steps.map((s, idx) => {
            const isActive = s.id === step;
            const isPast = steps.findIndex(x => x.id === step) > idx;
            const Icon = s.icon;
            
            return (
              <div key={s.id} className={`flex items-center gap-2 ${isActive ? 'text-white' : isPast ? 'text-gray-400' : 'text-arch-600'}`}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border
                  ${isActive ? 'bg-white text-black border-white' : isPast ? 'bg-arch-700 border-arch-600 text-white' : 'border-arch-700 bg-transparent'}
                `}>
                  {isPast ? <div className="w-2 h-2 bg-white rounded-full" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'block' : 'hidden md:block'}`}>{s.label}</span>
                {idx < steps.length - 1 && (
                  <div className={`h-[1px] w-12 mx-2 ${isPast ? 'bg-arch-600' : 'bg-arch-800'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full">
          {renderStep()}
        </div>
      </main>
    </div>
  );
};

export default App;