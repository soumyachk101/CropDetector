import axios from 'axios';
import { env } from '../config/env';
import { PredictionResult } from '@crop-detector/types';

export class AIService {
  static async predict(fileBuffer: Buffer, filename: string): Promise<PredictionResult> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'application/octet-stream' });
    formData.append('file', blob, filename);

    try {
      const response = await axios.post(`${env.AI_ENGINE_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      return {
        cropName: data.crop_name,
        diseaseName: data.disease_name,
        diseaseId: data.disease_id,
        confidence: data.confidence,
        severity: data.severity.toUpperCase() as any,
        isHealthy: data.is_healthy,
        heatmapImageUrl: data.heatmap_base64 || null,
        inferenceTimeMs: data.inference_time_ms,
        predictionsJson: [
          { class: data.disease_id, confidence: data.confidence }
        ],
      };
    } catch (error: any) {
      console.error('AI Engine Error:', error.message);
      if (error.response) {
        throw new Error(error.response.data?.detail || 'AI Service Error');
      }
      throw new Error('AI Service is currently unreachable.');
    }
  }
}
