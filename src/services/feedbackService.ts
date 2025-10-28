import { supabase } from '@/lib/supabase';
import type {
  Survey,
  SurveyQuestion,
  SurveyResponse,
  SurveyAnswer,
  NPSMetrics,
  FeedbackInsight,
  FeedbackCampaign,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  SubmitResponseRequest,
  FeedbackAnalyticsRequest,
  FeedbackAnalyticsResponse,
  SentimentScore,
  NPSCategory,
} from '@/types/feedback';
import { env } from '@/lib/env'; // Importar env

export class FeedbackService {
  // Survey Management
  static async createSurvey(tenantId: string, request: CreateSurveyRequest): Promise<Survey> {
    try {
      const surveyData = {
        tenant_id: tenantId,
        title: request.title,
        description: request.description,
        template_id: request.template_id,
        location_id: request.location_id,
        status: 'draft' as const,
        settings: {
          welcome_screen: { enabled: true },
          thank_you_screen: { enabled: true },
          progress_bar: true,
          question_numbering: true,
          randomize_questions: false,
          allow_back_navigation: true,
          auto_save: true,
          branding: {},
          ...request.settings,
        },
        distribution: {
          channels: [],
        },
        analytics: {
          total_responses: 0,
          completion_rate: 0,
          average_time: 0,
          sentiment_breakdown: {
            positive: 0,
            neutral: 0,
            negative: 0,
          },
        },
        created_by: tenantId, // This should be user ID in real implementation
      };

      const { data: survey, error } = await supabase
        .from('surveys')
        .insert(surveyData)
        .select()
        .single();

      if (error) throw error;

      // Create questions if provided
      if (request.questions && request.questions.length > 0) {
        const questionsData = request.questions.map((q, index) => ({
          ...q,
          survey_id: survey.id,
          order: index,
        }));

        const { error: questionsError } = await supabase
          .from('survey_questions')
          .insert(questionsData);

        if (questionsError) throw questionsError;
      }

      return await this.getSurvey(survey.id);
    } catch (error) {
      console.error('Error creating survey:', error);
      throw error;
    }
  }

  static async getSurvey(surveyId: string): Promise<Survey> {
    try {
      const { data: survey, error } = await supabase
        .from('surveys')
        .select(`
          *,
          questions:survey_questions(*)
        `)
        .eq('id', surveyId)
        .single();

      if (error) throw error;
      return survey;
    } catch (error) {
      console.error('Error getting survey:', error);
      throw error;
    }
  }

  static async getSurveys(tenantId: string, locationId?: string): Promise<Survey[]> {
    try {
      let query = supabase
        .from('surveys')
        .select(`
          *,
          questions:survey_questions(*)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data: surveys, error } = await query;

      if (error) throw error;
      return surveys || [];
    } catch (error) {
      console.error('Error getting surveys:', error);
      throw error;
    }
  }

  static async updateSurvey(surveyId: string, request: UpdateSurveyRequest): Promise<Survey> {
    try {
      const { data: survey, error } = await supabase
        .from('surveys')
        .update({
          ...request,
          updated_at: new Date().toISOString(),
        })
        .eq('id', surveyId)
        .select()
        .single();

      if (error) throw error;

      // Update questions if provided
      if (request.questions) {
        // Delete existing questions
        await supabase
          .from('survey_questions')
          .delete()
          .eq('survey_id', surveyId);

        // Insert new questions
        if (request.questions.length > 0) {
          const { error: questionsError } = await supabase
            .from('survey_questions')
            .insert(request.questions.map(q => ({ ...q, survey_id: surveyId })));

          if (questionsError) throw questionsError;
        }
      }

      return await this.getSurvey(surveyId);
    } catch (error) {
      console.error('Error updating survey:', error);
      throw error;
    }
  }

  static async deleteSurvey(surveyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', surveyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting survey:', error);
      throw error;
    }
  }

  static async publishSurvey(surveyId: string): Promise<Survey> {
    try {
      const { data: survey, error } = await supabase
        .from('surveys')
        .update({
          status: 'active',
          published_at: new Date().toISOString(),
        })
        .eq('id', surveyId)
        .select()
        .single();

      if (error) throw error;
      return survey;
    } catch (error) {
      console.error('Error publishing survey:', error);
      throw error;
    }
  }

  // Response Management
  static async submitResponse(request: SubmitResponseRequest): Promise<SurveyResponse> {
    try {
      // Get survey info
      const { data: survey } = await supabase
        .from('surveys')
        .select('tenant_id, location_id')
        .eq('id', request.survey_id)
        .single();

      if (!survey) throw new Error('Survey not found');

      // Create response
      const responseData = {
        survey_id: request.survey_id,
        tenant_id: survey.tenant_id,
        location_id: survey.location_id,
        customer_data: request.customer_data,
        status: 'completed' as const,
        completion_percentage: 100,
        time_spent: 0, // Calculate based on timestamps
      };

      const { data: response, error: responseError } = await supabase
        .from('survey_responses')
        .insert(responseData)
        .select()
        .single();

      if (responseError) throw responseError;

      // Create answers
      const answersData = request.answers.map(answer => ({
        ...answer,
        response_id: response.id,
      }));

      const { error: answersError } = await supabase
        .from('survey_answers')
        .insert(answersData);

      if (answersError) throw answersError;

      // Calculate NPS and sentiment
      const updatedResponse = await this.processResponseAnalytics(response.id);

      // Update survey analytics
      await this.updateSurveyAnalytics(request.survey_id);

      return updatedResponse;
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  }

  static async getResponse(responseId: string): Promise<SurveyResponse> {
    try {
      const { data: response, error } = await supabase
        .from('survey_responses')
        .select(`
          *,
          answers:survey_answers(*)
        `)
        .eq('id', responseId)
        .single();

      if (error) throw error;
      return response;
    } catch (error) {
      console.error('Error getting response:', error);
      throw error;
    }
  }

  static async getResponses(
    surveyId: string,
    limit = 50,
    offset = 0
  ): Promise<{ responses: SurveyResponse[]; total: number }> {
    try {
      const { data: responses, error } = await supabase
        .from('survey_responses')
        .select(`
          *,
          answers:survey_answers(*)
        `)
        .eq('survey_id', surveyId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const { count } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('survey_id', surveyId);

      return {
        responses: responses || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error getting responses:', error);
      throw error;
    }
  }

  // Analytics and Insights
  static async processResponseAnalytics(responseId: string): Promise<SurveyResponse> {
    try {
      const response = await this.getResponse(responseId);
      
      // Calculate NPS score
      const npsAnswer = response.answers.find(a => a.question_type === 'nps');
      let npsScore: number | undefined;
      let npsCategory: NPSCategory | undefined;
      
      if (npsAnswer && typeof npsAnswer.settings.scale_min === 'number' && typeof npsAnswer.settings.scale_max === 'number') {
        // Assuming NPS question has a numeric value in its answer
        const scoreValue = response.answers.find(a => a.question_id === npsAnswer.id)?.numeric_value;
        if (typeof scoreValue === 'number') {
          npsScore = scoreValue;
          if (npsScore >= 9) npsCategory = 'promoter';
          else if (npsScore >= 7) npsCategory = 'passive';
          else npsCategory = 'detractor';
        }
      }

      // Analyze sentiment (simplified - in real implementation, use AI service)
      const textAnswers = response.answers
        .filter(a => a.text_value)
        .map(a => a.text_value)
        .join(' ');
      
      const sentimentScore = await this.analyzeSentiment(textAnswers);

      // Update response with analytics
      const { data: updatedResponse, error } = await supabase
        .from('survey_responses')
        .update({
          nps_score: npsScore,
          nps_category: npsCategory,
          sentiment_score: sentimentScore.sentiment,
          sentiment_confidence: sentimentScore.confidence,
        })
        .eq('id', responseId)
        .select()
        .single();

      if (error) throw error;
      return updatedResponse;
    } catch (error) {
      console.error('Error processing response analytics:', error);
      throw error;
    }
  }

  static async analyzeSentiment(text: string): Promise<{ sentiment: SentimentScore; confidence: number }> {
    // Simplified sentiment analysis - in real implementation, integrate with AI service
    if (!text || text.trim().length === 0) {
      return { sentiment: 'neutral', confidence: 0 };
    }

    const positiveWords = ['bom', 'ótimo', 'excelente', 'maravilhoso', 'perfeito', 'adorei', 'recomendo'];
    const negativeWords = ['ruim', 'péssimo', 'horrível', 'terrível', 'odiei', 'não recomendo', 'problema'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });
    
    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', confidence: Math.min(positiveCount / words.length * 10, 1) };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', confidence: Math.min(negativeCount / words.length * 10, 1) };
    } else {
      return { sentiment: 'neutral', confidence: 0.5 };
    }
  }

  static async updateSurveyAnalytics(surveyId: string): Promise<void> {
    try {
      // Get all responses for the survey
      const { data: responses } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', surveyId);

      if (!responses || responses.length === 0) return;

      const totalResponses = responses.length;
      const completedResponses = responses.filter(r => r.status === 'completed').length;
      const completionRate = completedResponses / totalResponses;
      
      const averageTime = responses.reduce((sum, r) => sum + (r.time_spent || 0), 0) / totalResponses;
      
      const npsScores = responses.filter(r => r.nps_score !== null).map(r => r.nps_score!);
      const npsScore = npsScores.length > 0 
        ? npsScores.reduce((sum, score) => sum + score, 0) / npsScores.length 
        : undefined;
      
      const sentimentBreakdown = responses.reduce(
        (acc, r) => {
          if (r.sentiment_score) {
            acc[r.sentiment_score]++;
          }
          return acc;
        },
        { positive: 0, neutral: 0, negative: 0 }
      );

      // Update survey analytics
      await supabase
        .from('surveys')
        .update({
          analytics: {
            total_responses: totalResponses,
            completion_rate: completionRate,
            average_time: averageTime,
            nps_score: npsScore,
            sentiment_breakdown: sentimentBreakdown,
          },
        })
        .eq('id', surveyId);
    } catch (error) {
      console.error('Error updating survey analytics:', error);
      throw error;
    }
  }

  static async getNPSMetrics(
    tenantId: string,
    locationId?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<NPSMetrics> {
    // Mock data fallback for development
    if (env.VITE_USE_MOCK_DATA) {
      return {
        id: `mock-nps_${Date.now()}`,
        tenant_id: tenantId,
        location_id: locationId,
        period_start: dateFrom || new Date().toISOString(),
        period_end: dateTo || new Date().toISOString(),
        total_responses: 150,
        promoters: 90,
        passives: 30,
        detractors: 30,
        nps_score: 40, // (90-30)/150 * 100 = 40
        previous_nps_score: 35,
        trend: 'up',
        segments: [
          { segment_name: 'Comida', segment_value: 'Excelente', nps_score: 60, response_count: 50 },
          { segment_name: 'Atendimento', segment_value: 'Bom', nps_score: 30, response_count: 70 },
          { segment_name: 'Ambiente', segment_value: 'Regular', nps_score: 10, response_count: 30 },
        ],
        benchmark_score: 60,
        industry_average: 45,
        created_at: new Date().toISOString(),
      };
    }

    try {
      let query = supabase
        .from('survey_responses')
        .select('nps_score, nps_category, created_at')
        .eq('tenant_id', tenantId)
        .not('nps_score', 'is', null);

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data: responses, error } = await query;

      if (error) throw error;

      if (!responses || responses.length === 0) {
        // Return a default NPSMetrics object if no real data is found
        return {
          id: `nps_${Date.now()}`,
          tenant_id: tenantId,
          location_id: locationId,
          period_start: dateFrom || new Date().toISOString(),
          period_end: dateTo || new Date().toISOString(),
          total_responses: 0,
          promoters: 0,
          passives: 0,
          detractors: 0,
          nps_score: 0,
          trend: 'stable',
          segments: [],
          created_at: new Date().toISOString(),
        };
      }

      const totalResponses = responses.length;
      const promoters = responses.filter(r => r.nps_category === 'promoter').length;
      const passives = responses.filter(r => r.nps_category === 'passive').length;
      const detractors = responses.filter(r => r.nps_category === 'detractor').length;
      
      const npsScore = Math.round(((promoters - detractors) / totalResponses) * 100);

      return {
        id: `nps_${Date.now()}`,
        tenant_id: tenantId,
        location_id: locationId,
        period_start: dateFrom || new Date().toISOString(),
        period_end: dateTo || new Date().toISOString(),
        total_responses: totalResponses,
        promoters,
        passives,
        detractors,
        nps_score: npsScore,
        previous_nps_score: Math.floor(Math.random() * 101) - 50, // Mock previous score for trend
        trend: 'stable', // Calculate based on historical data
        segments: [], // Calculate segments if needed
        benchmark_score: 60, // Mock benchmark
        industry_average: 45, // Mock industry average
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting NPS metrics:', error);
      throw error;
    }
  }

  static async getFeedbackAnalytics(
    request: FeedbackAnalyticsRequest
  ): Promise<FeedbackAnalyticsResponse> {
    // Mock data fallback for development
    if (env.VITE_USE_MOCK_DATA) {
      return {
        summary: {
          total_responses: 200,
          average_nps: 45,
          sentiment_breakdown: {
            positive: 60,
            neutral: 25,
            negative: 15,
          },
          completion_rate: 85,
          response_trend: [
            { date: '2024-01-01', count: 10 },
            { date: '2024-01-02', count: 15 },
            { date: '2024-01-03', count: 20 },
            { date: '2024-01-04', count: 12 },
            { date: '2024-01-05', count: 18 },
          ],
        },
        segments: [
          { segment_name: 'Comida', segment_value: 'Excelente', metrics: { nps: 60 } },
          { segment_name: 'Atendimento', segment_value: 'Bom', metrics: { nps: 30 } },
        ],
        insights: [
          {
            id: 'insight-1',
            tenant_id: request.tenant_id,
            type: 'trend',
            title: 'Aumento de feedbacks positivos sobre comida',
            description: 'Observamos um aumento de 15% nos feedbacks positivos relacionados à qualidade da comida na última semana.',
            severity: 'low',
            confidence: 0.9,
            data_points: [],
            action_items: ['Manter a qualidade dos ingredientes', 'Destacar pratos bem avaliados no menu'],
            is_read: false,
            created_at: new Date().toISOString(),
          },
          {
            id: 'insight-2',
            tenant_id: request.tenant_id,
            type: 'risk',
            title: 'Queda na satisfação do atendimento noturno',
            description: 'Houve uma queda de 10 pontos no NPS para o período noturno, com menções a tempo de espera.',
            severity: 'high',
            confidence: 0.85,
            data_points: [],
            action_items: ['Revisar escala de funcionários no período noturno', 'Treinar equipe em gestão de filas'],
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ],
        benchmarks: {
          industry_nps: 50,
          industry_sentiment: { positive: 60, neutral: 25, negative: 15 },
          peer_comparison: {},
        },
      };
    }

    try {
      // This is a simplified implementation
      // In a real application, this would involve complex aggregations
      
      const npsMetrics = await this.getNPSMetrics(
        request.tenant_id,
        request.location_ids?.[0],
        request.date_from,
        request.date_to
      );

      return {
        summary: {
          total_responses: npsMetrics.total_responses,
          average_nps: npsMetrics.nps_score,
          sentiment_breakdown: {
            positive: Math.round(npsMetrics.promoters / npsMetrics.total_responses * 100),
            neutral: Math.round(npsMetrics.passives / npsMetrics.total_responses * 100),
            negative: Math.round(npsMetrics.detractors / npsMetrics.total_responses * 100),
          },
          completion_rate: 85, // Mock data
          response_trend: [], // Mock data
        },
        segments: [],
        insights: [],
        benchmarks: {
          industry_nps: 50,
          industry_sentiment: { positive: 60, neutral: 25, negative: 15 },
          peer_comparison: {},
        },
      };
    } catch (error) {
      console.error('Error getting feedback analytics:', error);
      throw error;
    }
  }

  // QR Code Generation
  static async generateQRCode(surveyId: string): Promise<string> {
    try {
      const surveyUrl = `${window.location.origin}/survey/${surveyId}`;
      
      // In a real implementation, you would use a QR code library
      // For now, return a placeholder URL
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(surveyUrl)}`;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  // Record usage for billing
  static async recordFeedbackUsage(tenantId: string): Promise<void> {
    try {
      // This would integrate with the billing service
      // For now, just log the usage
      console.log(`Recording feedback usage for tenant: ${tenantId}`);
    } catch (error) {
      console.error('Error recording feedback usage:', error);
    }
  }
}