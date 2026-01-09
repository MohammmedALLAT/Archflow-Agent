import { GoogleGenAI, Type } from "@google/genai";
import { ArchJSONConfig, AnalysisResult, VisualProposal, VideoConfig } from "../types";

// Helper to ensure API key is selected
export const ensureApiKey = async (): Promise<void> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
  }
};

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Step 1: Analyze the massing model
export const analyzeImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const prompt = `Analyze this unfinished 3D architectural massing model. 
  Identify the building typology, geometry/proportions, structural logic, and what is missing to make it realistic.
  Return JSON only.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          typology: { type: Type.STRING },
          geometry: { type: Type.STRING },
          structural_logic: { type: Type.STRING },
          missing_elements: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as AnalysisResult;
  }
  throw new Error("Failed to analyze image");
};

// Step 2: Propose Styles
export const generateProposals = async (analysis: AnalysisResult, jsonConfig: ArchJSONConfig): Promise<VisualProposal[]> => {
  const ai = getAI();
  const context = JSON.stringify(analysis);
  const constraints = JSON.stringify(jsonConfig.style);
  
  const prompt = `Based on this architectural analysis: ${context}
  And these user constraints: ${constraints}
  
  Propose 3 distinct visual directions for the final rendering.
  Return a JSON array of proposals.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            material_palette: { type: Type.STRING },
            lighting: { type: Type.STRING }
          }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as VisualProposal[];
  }
  throw new Error("Failed to generate proposals");
};

// Step 3: Generate Images
export const generateArchitecturalImage = async (
  base64Massing: string, 
  proposal: VisualProposal, 
  config: ArchJSONConfig,
  angle: string
): Promise<string> => {
  const ai = getAI();
  
  const prompt = `Transform this massing model into a ${config.style.realism_level} architectural render.
  Camera Angle: ${angle}.
  Style: ${proposal.title}. ${proposal.description}.
  Materials: ${config.style.material}.
  Lighting: ${config.style.lighting}.
  Environment: ${config.style.environment}.
  Mood: ${config.style.mood}.
  Post-processing: ${config.image_generation.post_processing}.
  Maintain the exact geometry of the input massing.`;

  // Using gemini-3-pro-image-preview for high quality renders as requested
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Massing } },
        { text: prompt }
      ]
    },
    config: {
      // 1K is standard, but prompt requested high quality. 
      // Pro image model supports higher, but let's stick to defaults to ensure speed/reliability in demo.
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// Step 4: Generate Video (Veo)
export const generateArchitecturalVideo = async (
  base64SourceImage: string,
  videoConfig: VideoConfig,
  jsonConfig: ArchJSONConfig
): Promise<string> => {
  const ai = getAI();

  const prompt = `Cinematic architectural video. 
  ${videoConfig.motion_style} motion. 
  Camera: ${videoConfig.camera_movements.join(', ')}. 
  Atmosphere: ${jsonConfig.style.mood}, ${jsonConfig.style.lighting}.
  High quality, photorealistic, 4k.`;

  // Remove data URL prefix for API
  const cleanBase64 = base64SourceImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview', // High quality video generation
    prompt: prompt,
    image: {
      imageBytes: cleanBase64,
      mimeType: 'image/png'
    },
    config: {
      numberOfVideos: 1,
      aspectRatio: '16:9',
      resolution: '720p', // Max for preview usually
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  // Fetch the actual video blob
  const videoRes = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  const videoBlob = await videoRes.blob();
  return URL.createObjectURL(videoBlob);
};