/**
 * @store agentStore
 * @description Store for AI-powered tajweed advice and study planning.
 * Replaces Supabase Functions with REST API calls to our Node.js backend.
 */
import { create } from 'zustand';
import apiClient  from '../lib/apiClient.js';

export const useAgentStore = create((set, get) => ({
  insights: null,
  isAnalyzing: false,

  /**
   * AI Agent: Analyze Recitation (Pre-Teacher Review)
   * Calls the Node.js backend which coordinates the AI logic.
   */
  analyzeRecitation: async (recordingId, surahName, ayahRange) => {
    set({ isAnalyzing: true });
    try {
      const { data } = await apiClient.post(`/recordings/${recordingId}/analyze`, {
        surahName,
        ayahRange,
      });

      set({ insights: data.data.feedback });
      return data.data;
    } catch (err) {
      console.error('AI Analysis failed:', err.message);
      return null;
    } finally {
      set({ isAnalyzing: false });
    }
  },

  /**
   * AI Agent: Get Personalized Study Plan
   */
  getStudyAdvice: async (studentId) => {
    try {
      const { data } = await apiClient.get(`/stats/student/${studentId}/advice`);
      return data.data.advice;
    } catch (err) {
      return 'واصل الحفظ والمراجعة يومياً لتحقيق أهدافك.';
    }
  },
}));
