export interface VideoConfig {
  duration_seconds: number;
  motion_style: string;
  camera_movements: string[];
  transition_style: string;
  frame_rate: string;
}

export interface ArchJSONConfig {
  style: {
    material: string;
    mood: string;
    lighting: string;
    realism_level: string;
    environment: string;
  };
  image_generation: {
    number_of_images: number;
    camera_angles: string[];
    resolution: string;
    post_processing: string;
  };
  video_generation: {
    number_of_videos: number;
    videos: VideoConfig[];
  };
}

export interface AnalysisResult {
  typology: string;
  geometry: string;
  structural_logic: string;
  missing_elements: string[];
}

export interface VisualProposal {
  id: string;
  title: string;
  description: string;
  material_palette: string;
  lighting: string;
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video';
  url: string; // Data URL or Remote URL
  prompt_used?: string;
}

export enum WorkflowStep {
  UPLOAD = 'UPLOAD',
  ANALYSIS = 'ANALYSIS',
  PROPOSAL = 'PROPOSAL',
  IMAGE_GEN = 'IMAGE_GEN',
  VIDEO_GEN = 'VIDEO_GEN',
  COMPLETE = 'COMPLETE'
}
