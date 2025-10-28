import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type {
  Survey,
  SurveyResponse,
  NPSMetrics,
  FeedbackInsight,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  SubmitResponseRequest,
  FeedbackAnalyticsRequest,
  FeedbackAnalyticsResponse,
} from '@/types/feedback';

export const useFeedback = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = user?.tenant_id;

  // Get surveys
  const {
    data: surveys,
    isLoading: isSurveysLoading,
    error: surveysError,
  } = useQuery({
    queryKey: ['surveys', tenantId],
    queryFn: () => FeedbackService.getSurveys(tenantId!),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create survey mutation
  const createSurveyMutation = useMutation({
    mutationFn: (request: CreateSurveyRequest) =>
      FeedbackService.createSurvey(tenantId!, request),
    onSuccess: (newSurvey) => {
      queryClient.invalidateQueries({ queryKey: ['surveys', tenantId] });
      toast.success('Pesquisa criada com sucesso!');
      return newSurvey;
    },
    onError: (error) => {
      console.error('Error creating survey:', error);
      toast.error('Erro ao criar pesquisa');
    },
  });

  // Update survey mutation
  const updateSurveyMutation = useMutation({
    mutationFn: ({ surveyId, request }: { surveyId: string; request: UpdateSurveyRequest }) =>
      FeedbackService.updateSurvey(surveyId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', tenantId] });
      toast.success('Pesquisa atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating survey:', error);
      toast.error('Erro ao atualizar pesquisa');
    },
  });

  // Delete survey mutation
  const deleteSurveyMutation = useMutation({
    mutationFn: (surveyId: string) => FeedbackService.deleteSurvey(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', tenantId] });
      toast.success('Pesquisa excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting survey:', error);
      toast.error('Erro ao excluir pesquisa');
    },
  });

  // Publish survey mutation
  const publishSurveyMutation = useMutation({
    mutationFn: (surveyId: string) => FeedbackService.publishSurvey(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', tenantId] });
      toast.success('Pesquisa publicada com sucesso!');
    },
    onError: (error) => {
      console.error('Error publishing survey:', error);
      toast.error('Erro ao publicar pesquisa');
    },
  });

  return {
    // Data
    surveys,
    
    // Loading states
    isSurveysLoading,
    
    // Error states
    surveysError,
    
    // Mutations
    createSurvey: createSurveyMutation.mutate,
    updateSurvey: updateSurveyMutation.mutate,
    deleteSurvey: deleteSurveyMutation.mutate,
    publishSurvey: publishSurveyMutation.mutate,
    
    // Mutation states
    isCreatingSurvey: createSurveyMutation.isPending,
    isUpdatingSurvey: updateSurveyMutation.isPending,
    isDeletingSurvey: deleteSurveyMutation.isPending,
    isPublishingSurvey: publishSurveyMutation.isPending,
  };
};

export const useSurvey = (surveyId: string) => {
  const queryClient = useQueryClient();

  // Get single survey
  const {
    data: survey,
    isLoading: isSurveyLoading,
    error: surveyError,
  } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => FeedbackService.getSurvey(surveyId),
    enabled: !!surveyId,
  });

  // Get survey responses
  const {
    data: responsesData,
    isLoading: isResponsesLoading,
  } = useQuery({
    queryKey: ['survey-responses', surveyId],
    queryFn: () => FeedbackService.getResponses(surveyId),
    enabled: !!surveyId,
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: (request: SubmitResponseRequest) =>
      FeedbackService.submitResponse(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey-responses', surveyId] });
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      toast.success('Resposta enviada com sucesso!');
    },
    onError: (error) => {
      console.error('Error submitting response:', error);
      toast.error('Erro ao enviar resposta');
    },
  });

  return {
    // Data
    survey,
    responses: responsesData?.responses || [],
    totalResponses: responsesData?.total || 0,
    
    // Loading states
    isSurveyLoading,
    isResponsesLoading,
    
    // Error states
    surveyError,
    
    // Mutations
    submitResponse: submitResponseMutation.mutate,
    
    // Mutation states
    isSubmittingResponse: submitResponseMutation.isPending,
  };
};

export const useNPSMetrics = (locationId?: string, dateFrom?: string, dateTo?: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenant_id;

  const {
    data: npsMetrics,
    isLoading: isNPSLoading,
    error: npsError,
  } = useQuery({
    queryKey: ['nps-metrics', tenantId, locationId, dateFrom, dateTo],
    queryFn: () => FeedbackService.getNPSMetrics(tenantId!, locationId, dateFrom, dateTo),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    npsMetrics,
    isNPSLoading,
    npsError,
  };
};

export const useFeedbackAnalytics = (request: Partial<FeedbackAnalyticsRequest>) => {
  const { user } = useAuth();
  const tenantId = user?.tenant_id;

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ['feedback-analytics', tenantId, request],
    queryFn: () => FeedbackService.getFeedbackAnalytics({
      tenant_id: tenantId!,
      ...request,
    }),
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    analytics,
    isAnalyticsLoading,
    analyticsError,
  };
};

export const useSurveyBuilder = (initialSurvey?: Partial<Survey>) => {
  const [survey, setSurvey] = useState<Partial<Survey>>(initialSurvey || {
    title: '',
    description: '',
    questions: [],
    settings: {
      welcome_screen: { enabled: true },
      thank_you_screen: { enabled: true },
      progress_bar: true,
      question_numbering: true,
      randomize_questions: false,
      allow_back_navigation: true,
      auto_save: true,
      branding: {},
    },
  });
  
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const updateSurvey = (updates: Partial<Survey>) => {
    setSurvey(prev => ({ ...prev, ...updates }));
    setUnsavedChanges(true);
  };

  const addQuestion = (question: Partial<Survey['questions'][0]>) => {
    const newQuestion = {
      id: `question_${Date.now()}`,
      survey_id: survey.id || '',
      order: survey.questions?.length || 0,
      is_required: false,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...question,
    };
    
    updateSurvey({
      questions: [...(survey.questions || []), newQuestion],
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<Survey['questions'][0]>) => {
    const updatedQuestions = survey.questions?.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ) || [];
    
    updateSurvey({ questions: updatedQuestions });
  };

  const deleteQuestion = (questionId: string) => {
    const filteredQuestions = survey.questions?.filter(q => q.id !== questionId) || [];
    updateSurvey({ questions: filteredQuestions });
  };

  const reorderQuestions = (startIndex: number, endIndex: number) => {
    if (!survey.questions) return;
    
    const result = Array.from(survey.questions);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update order property
    const reorderedQuestions = result.map((q, index) => ({ ...q, order: index }));
    updateSurvey({ questions: reorderedQuestions });
  };

  const validateSurvey = (): boolean => {
    const errors: Record<string, string[]> = {};
    
    if (!survey.title?.trim()) {
      errors.title = ['Título é obrigatório'];
    }
    
    if (!survey.questions || survey.questions.length === 0) {
      errors.questions = ['Pelo menos uma pergunta é obrigatória'];
    }
    
    survey.questions?.forEach((question, index) => {
      const questionErrors: string[] = [];
      
      if (!question.title?.trim()) {
        questionErrors.push('Título da pergunta é obrigatório');
      }
      
      if (['multiple_choice', 'checkbox', 'dropdown'].includes(question.type) && 
          (!question.options || question.options.length === 0)) {
        questionErrors.push('Opções são obrigatórias para este tipo de pergunta');
      }
      
      if (questionErrors.length > 0) {
        errors[`question_${index}`] = questionErrors;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetChanges = () => {
    setSurvey(initialSurvey || {});
    setUnsavedChanges(false);
    setValidationErrors({});
  };

  const markAsSaved = () => {
    setUnsavedChanges(false);
  };

  return {
    // State
    survey,
    unsavedChanges,
    validationErrors,
    
    // Actions
    updateSurvey,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    validateSurvey,
    resetChanges,
    markAsSaved,
    
    // Computed
    isValid: Object.keys(validationErrors).length === 0,
    questionCount: survey.questions?.length || 0,
  };
};

export const useQRCode = (surveyId: string) => {
  const [qrCodeUrl, setQRCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async () => {
    if (!surveyId) return;
    
    setIsGenerating(true);
    try {
      const url = await FeedbackService.generateQRCode(surveyId);
      setQRCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Erro ao gerar QR Code');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (surveyId && !qrCodeUrl) {
      generateQRCode();
    }
  }, [surveyId]);

  return {
    qrCodeUrl,
    isGenerating,
    regenerateQRCode: generateQRCode,
  };
};

export const useSentimentAnalysis = () => {
  const analyzeSentiment = async (text: string) => {
    try {
      return await FeedbackService.analyzeSentiment(text);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { sentiment: 'neutral' as const, confidence: 0 };
    }
  };

  return {
    analyzeSentiment,
  };
};