import React, { useEffect, useState, useRef } from 'react';
import { ArchJSONConfig, VisualProposal, GeneratedAsset } from '../types';
import { generateArchitecturalImage } from '../services/geminiService';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface StepImageGenProps {
  baseImage: string;
  config: ArchJSONConfig;
  proposal: VisualProposal;
  onComplete: (assets: GeneratedAsset[]) => void;
}

export const StepImageGen: React.FC<StepImageGenProps> = ({ baseImage, config, proposal, onComplete }) => {
  const [images, setImages] = useState<GeneratedAsset[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    startGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startGeneration = async () => {
    setIsGenerating(true);
    const total = config.image_generation.number_of_images; // Should be 4
    const angles = config.image_generation.camera_angles; // Should match 4

    const promises = Array.from({ length: total }).map(async (_, idx) => {
      try {
        const angle = angles[idx] || 'dynamic perspective';
        const url = await generateArchitecturalImage(baseImage, proposal, config, angle);
        
        const asset: GeneratedAsset = {
          id: `img-${Date.now()}-${idx}`,
          type: 'image',
          url,
          prompt_used: `Angle: ${angle}`
        };

        setImages(prev => [...prev, asset]);
        setCompletedCount(prev => prev + 1);
      } catch (e) {
        console.error(`Failed to generate image ${idx}`, e);
        setCompletedCount(prev => prev + 1); // Still increment to unblock flow
      }
    });

    await Promise.all(promises);
    setIsGenerating(false);
  };

  const allDone = completedCount === config.image_generation.number_of_images;

  return (
    <div className="h-full flex flex-col">
       <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-light">Generating Visuals</h2>
        <div className="text-sm font-mono text-arch-muted">
          {completedCount} / {config.image_generation.number_of_images} Processed
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-[500px]">
        {Array.from({ length: config.image_generation.number_of_images }).map((_, idx) => {
          const img = images[idx];
          return (
            <div key={idx} className="bg-arch-800 rounded-lg border border-arch-700 overflow-hidden relative group">
              {img ? (
                <img src={img.url} alt={`Render ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center flex-col">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                  <span className="text-xs text-arch-muted font-mono uppercase">Rendering {config.image_generation.camera_angles[idx]}</span>
                </div>
              )}
              {img && (
                <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm p-2 text-xs font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.prompt_used}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          disabled={!allDone || images.length === 0} 
          onClick={() => onComplete(images)}
        >
          Approve & Generate Video
        </Button>
      </div>
    </div>
  );
};