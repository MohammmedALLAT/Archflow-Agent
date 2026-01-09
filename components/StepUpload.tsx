import React, { useState } from 'react';
import { ArchJSONConfig } from '../types';
import { Upload, FileJson, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface StepUploadProps {
  onNext: (image: string, config: ArchJSONConfig) => void;
  defaultConfig: ArchJSONConfig;
}

export const StepUpload: React.FC<StepUploadProps> = ({ onNext, defaultConfig }) => {
  const [jsonConfig, setJsonConfig] = useState<string>(JSON.stringify(defaultConfig, null, 2));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Left: Image Upload */}
      <div className="bg-arch-800 p-8 rounded-lg border border-arch-700 flex flex-col items-center justify-center min-h-[400px]">
        {imagePreview ? (
          <div className="relative w-full h-full flex flex-col items-center">
             <img src={imagePreview} alt="Preview" className="max-h-[400px] object-contain rounded-md shadow-2xl" />
             <Button variant="outline" onClick={() => setImagePreview(null)} className="mt-4">
               Change Image
             </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full border-2 border-dashed border-arch-600 rounded-lg hover:border-arch-muted transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 text-arch-muted mb-4" />
              <p className="mb-2 text-sm text-arch-muted">
                <span className="font-semibold text-white">Click to upload</span> massing model
              </p>
              <p className="text-xs text-arch-600">PNG, JPG (MAX. 5MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        )}
      </div>

      {/* Right: JSON Editor */}
      <div className="flex flex-col h-full">
        <div className="bg-arch-800 rounded-lg border border-arch-700 flex-1 flex flex-col overflow-hidden">
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
        
        <div className="mt-6 flex justify-end">
          <Button 
            disabled={!imagePreview} 
            onClick={handleSubmit}
            className="w-full lg:w-auto"
          >
            Start Analysis <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};