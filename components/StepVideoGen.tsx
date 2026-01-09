import React, { useEffect, useState, useRef } from 'react';
import { ArchJSONConfig, GeneratedAsset } from '../types';
import { generateArchitecturalVideo } from '../services/geminiService';
import { Video, Loader2, Play } from 'lucide-react';
import { Button } from './Button';

interface StepVideoGenProps {
  sourceImages: GeneratedAsset[];
  config: ArchJSONConfig;
}

export const StepVideoGen: React.FC<StepVideoGenProps> = ({ sourceImages, config }) => {
  const [videos, setVideos] = useState<GeneratedAsset[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    startVideoGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startVideoGeneration = async () => {
    // We generate 2 videos as per JSON
    const videoConfigs = config.video_generation.videos;
    
    // Use the first image as base for consistency, or logic could be added to pick best
    // For automation, we usually pick the wide or medium shot (index 0 or 1 usually)
    const baseImage = sourceImages[0]?.url;

    if (!baseImage) return;

    videoConfigs.forEach(async (vConfig, idx) => {
      setStatus(prev => {
        const n = [...prev];
        n[idx] = 'Generating...';
        return n;
      });

      try {
        const videoUrl = await generateArchitecturalVideo(baseImage, vConfig, config);
        
        const asset: GeneratedAsset = {
          id: `vid-${Date.now()}-${idx}`,
          type: 'video',
          url: videoUrl,
          prompt_used: vConfig.motion_style
        };

        setVideos(prev => {
           // Insert in order
           const n = [...prev];
           n[idx] = asset;
           return n;
        });
        
        setStatus(prev => {
          const n = [...prev];
          n[idx] = 'Complete';
          return n;
        });

      } catch (e) {
        console.error(e);
        setStatus(prev => {
          const n = [...prev];
          n[idx] = 'Failed';
          return n;
        });
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-light mb-6">Cinematic Production</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        {config.video_generation.videos.map((vConfig, idx) => {
          const videoAsset = videos[idx];
          const currentStatus = status[idx] || 'Initializing...';
          const isComplete = currentStatus === 'Complete';

          return (
            <div key={idx} className="bg-arch-800 rounded-xl border border-arch-700 overflow-hidden flex flex-col">
              <div className="relative flex-1 bg-black min-h-[300px]">
                {isComplete && videoAsset ? (
                  <video 
                    src={videoAsset.url} 
                    controls 
                    className="w-full h-full object-cover"
                    poster={sourceImages[0]?.url}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                     {currentStatus === 'Failed' ? (
                       <span className="text-red-500">Generation Failed</span>
                     ) : (
                       <>
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                        <span className="text-sm font-mono text-arch-muted animate-pulse">{currentStatus}</span>
                       </>
                     )}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-arch-700 bg-arch-800">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold text-white">Sequence 0{idx + 1}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-arch-muted">
                  <div>
                    <span className="block text-arch-600">Motion</span>
                    {vConfig.motion_style}
                  </div>
                  <div>
                    <span className="block text-arch-600">Camera</span>
                    {vConfig.camera_movements.join(' + ')}
                  </div>
                   <div>
                    <span className="block text-arch-600">Duration</span>
                    {vConfig.duration_seconds}s
                  </div>
                </div>
                {isComplete && (
                   <a 
                    href={videoAsset.url} 
                    download={`sequence_0${idx+1}.mp4`}
                    className="mt-4 block w-full text-center py-2 bg-white/5 hover:bg-white/10 text-white rounded text-sm transition-colors"
                   >
                     Download MP4
                   </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};