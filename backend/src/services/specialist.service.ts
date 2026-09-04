import { specialistRepository } from '../repositories/specialist.repository';
import { AppError } from '../middleware/error.middleware';

export const specialistService = {
  async getAll() {
    return specialistRepository.findAll();
  },

  async getSymptoms() {
    return specialistRepository.getSymptoms();
  },

  async recommend(symptomIds: string[]) {
    if (!symptomIds || symptomIds.length === 0) {
      throw new AppError('At least one symptom must be selected');
    }

    const recommendations = await specialistRepository.getRecommendation(symptomIds);

    if (recommendations.length === 0) {
      throw new AppError('No specialist recommendation found for the selected symptoms');
    }

    return recommendations.map((rec) => ({
      id: rec.id,
      name: rec.name,
      description: rec.description,
      score: parseInt(rec.total_score, 10),
    }));
  },

  async getDoctors(specialistId?: string) {
    if (specialistId) {
      return specialistRepository.getDoctorsBySpecialistId(specialistId);
    }
    return specialistRepository.getAllDoctors();
  },
};
