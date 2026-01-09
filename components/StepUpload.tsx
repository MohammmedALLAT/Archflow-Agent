import React, { useState } from 'react';
import { ArchJSONConfig } from '../types';
import { Upload, FileJson, ArrowRight, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';

interface StepUploadProps {
  onNext: (image: string, config: ArchJSONConfig) => void;
  defaultConfig: ArchJSONConfig;
}

export const StepUpload: React.FC<StepUploadProps> = ({ onNext, defaultConfig }) => {
  const [jsonConfig, setJsonConfig] = useState<string>(JSON.stringify(defaultConfig, null, 2));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (imagePreview && jsonConfig) {
      try {
        const parsed = JSON.parse(jsonConfig);
        // Clean base64 for passing up
        const cleanImage = imagePreview.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        onNext(cleanImage, parsed);
      } catch (e) {
        alert("Invalid JSON configuration");
      }
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto justify-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light tracking-tight mb-2">Upload Massing Model</h2>
        <p className="text-arch-muted">Upload your unfinished 3D block model to begin the visualization workflow.</p>
      </div>

      <div className="bg-arch-800 p-8 rounded-xl border border-arch-700 flex flex-col items-center justify-center min-h-[400px] shadow-2xl transition-all duration-300 hover:border-arch-600 relative overflow-hidden group">
        {imagePreview ? (
          <div className="relative w-full h-full flex flex-col items-center">
             <img src={imagePreview} alt="Preview" className="max-h-[500px] w-auto object-contain rounded-lg shadow-lg" />
             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <Button variant="outline" onClick={() => setImagePreview(null)}>
                  Change Image
                </Button>
             </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full absolute inset-0">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="w-20 h-20 rounded-full bg-arch-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-arch-700">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <p className="mb-2 text-lg text-gray-300">
                <span className="font-semibold text-white">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-arch-muted">PNG, JPG up to 10MB</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
         <button 
           onClick={() => setShowConfig(!showConfig)}
           className="text-arch-muted hover:text-white text-sm flex items-center gap-2 transition-colors px-4 py-2 rounded-md hover:bg-arch-800"
         >
           <Settings className="w-4 h-4" />
           {showConfig ? 'Hide Config' : 'Configuration'}
           {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
         </button>

         <Button 
            disabled={!imagePreview} 
            onClick={handleSubmit}
            className="px-8 py-4 text-lg"
          >
            Start Analysis <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
      </div>

      {showConfig && (
        <div className="mt-6 bg-arch-800 rounded-lg border border-arch-700 flex flex-col overflow-hidden h-96 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-arch-700 flex items-center gap-2 bg-arch-900/50">
            <FileJson className="w-5 h-5 text-blue-400" />
            <h3 className="font-mono text-sm font-semibold">configuration.json</h3>
          </div>
          <textarea
            className="flex-1 bg-arch-900 p-4 font-mono text-xs text-gray-300 focus:outline-none resize-none"
            value={jsonConfig}
            onChange={(e) => setJsonConfig(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
};