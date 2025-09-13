import { useState, useCallback, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Trash2,
  Copy,
  Settings,
  Eye,
  Save,
  GripVertical,
  Type,
  Hash,
  Star,
  CheckSquare,
  List,
  Calendar,
  Mail,
  Phone,
  Upload,
  Grid3X3,
  Sliders,
  MessageSquare,
  Target,
} from 'lucide-react';
import type {
  Survey,
  SurveyQuestion,
  QuestionType,
  QuestionOption,
  SurveyBuilderState,
  DragDropQuestion,
} from '@/types/feedback';
import { cn } from '@/lib/utils';

const QUESTION_TYPES: { type: QuestionType; label: string; icon: any; description: string }[] = [
  { type: 'text', label: 'Texto Curto', icon: Type, description: 'Resposta de uma linha' },
  { type: 'textarea', label: 'Texto Longo', icon: MessageSquare, description: 'Resposta de múltiplas linhas' },
  { type: 'number', label: 'Número', icon: Hash, description: 'Entrada numérica' },
  { type: 'rating', label: 'Avaliação', icon: Star, description: 'Escala de estrelas' },
  { type: 'nps', label: 'NPS', icon: Target, description: 'Net Promoter Score (0-10)' },
  { type: 'multiple_choice', label: 'Múltipla Escolha', icon: CheckSquare, description: 'Uma opção' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Múltiplas opções' },
  { type: 'dropdown', label: 'Dropdown', icon: List, description: 'Lista suspensa' },
  { type: 'date', label: 'Data', icon: Calendar, description: 'Seletor de data' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Endereço de email' },
  { type: 'phone', label: 'Telefone', icon: Phone, description: 'Número de telefone' },
  { type: 'file_upload', label: 'Upload', icon: Upload, description: 'Upload de arquivo' },
  { type: 'matrix', label: 'Matrix', icon: Grid3X3, description: 'Grade de opções' },
  { type: 'slider', label: 'Slider', icon: Sliders, description: 'Controle deslizante' },
];

interface SurveyBuilderProps {
  survey?: Partial<Survey>;
  onSave?: (survey: Partial<Survey>) => void;
  onPreview?: (survey: Partial<Survey>) => void;
}

interface SortableQuestionProps {
  question: SurveyQuestion;
  index: number;
  onEdit: (question: SurveyQuestion) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (question: SurveyQuestion) => void;
}

const SortableQuestion = ({ question, index, onEdit, onDelete, onDuplicate }: SortableQuestionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const questionTypeInfo = QUESTION_TYPES.find(qt => qt.type === question.type);
  const Icon = questionTypeInfo?.icon || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        isDragging && 'opacity-50'
      )}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Icon className="h-3 w-3" />
                <span className="text-xs">{questionTypeInfo?.label}</span>
              </Badge>
              <span className="text-sm text-muted-foreground">#{index + 1}</span>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(question)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(question)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(question.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="font-medium">{question.title || 'Pergunta sem título'}</h4>
            {question.description && (
              <p className="text-sm text-muted-foreground">{question.description}</p>
            )}
            {question.options && question.options.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {question.options.slice(0, 3).map((option) => (
                  <Badge key={option.id} variant="secondary" className="text-xs">
                    {option.label}
                  </Badge>
                ))}
                {question.options.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{question.options.length - 3} mais
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QuestionTypeSelector = ({ onSelect }: { onSelect: (type: QuestionType) => void }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {QUESTION_TYPES.map((questionType) => {
        const Icon = questionType.icon;
        return (
          <Card
            key={questionType.type}
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary"
            onClick={() => onSelect(questionType.type)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{questionType.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {questionType.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export const SurveyBuilder = ({ survey: initialSurvey, onSave, onPreview }: SurveyBuilderProps) => {
  const [builderState, setBuilderState] = useState<SurveyBuilderState>({
    survey: initialSurvey || {
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
    },
    current_question_index: -1,
    is_preview_mode: false,
    unsaved_changes: false,
    validation_errors: {},
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);

  const questions = builderState.survey.questions || [];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over?.id);

      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      updateSurvey({ questions: newQuestions });
    }

    setActiveId(null);
  };

  const updateSurvey = useCallback((updates: Partial<Survey>) => {
    setBuilderState(prev => ({
      ...prev,
      survey: { ...prev.survey, ...updates },
      unsaved_changes: true,
    }));
  }, []);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: SurveyQuestion = {
      id: `question_${Date.now()}`,
      survey_id: builderState.survey.id || '',
      type,
      title: '',
      order: questions.length,
      is_required: false,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    updateSurvey({ questions: [...questions, newQuestion] });
    setEditingQuestion(newQuestion);
    setShowQuestionTypes(false);
  };

  const updateQuestion = (updatedQuestion: SurveyQuestion) => {
    const newQuestions = questions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    updateSurvey({ questions: newQuestions });
  };

  const deleteQuestion = (questionId: string) => {
    const newQuestions = questions.filter(q => q.id !== questionId);
    updateSurvey({ questions: newQuestions });
  };

  const duplicateQuestion = (question: SurveyQuestion) => {
    const newQuestion: SurveyQuestion = {
      ...question,
      id: `question_${Date.now()}`,
      title: `${question.title} (Cópia)`,
      order: questions.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updateSurvey({ questions: [...questions, newQuestion] });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(builderState.survey);
      setBuilderState(prev => ({ ...prev, unsaved_changes: false }));
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(builderState.survey);
    }
  };

  return (
    <div className="h-full flex">
      {/* Main Builder Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Título da pesquisa"
                value={builderState.survey.title || ''}
                onChange={(e) => updateSurvey({ title: e.target.value })}
                className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
              />
            </div>
            <div className="flex items-center space-x-2">
              {builderState.unsaved_changes && (
                <Badge variant="secondary">Não salvo</Badge>
              )}
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </div>
          </div>
          {builderState.survey.description !== undefined && (
            <Textarea
              placeholder="Descrição da pesquisa (opcional)"
              value={builderState.survey.description}
              onChange={(e) => updateSurvey({ description: e.target.value })}
              className="mt-2 border-none p-0 resize-none focus-visible:ring-0"
              rows={2}
            />
          )}
        </div>

        {/* Questions Area */}
        <div className="flex-1 p-6 overflow-auto">
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4 max-w-3xl mx-auto">
                {questions.map((question, index) => (
                  <SortableQuestion
                    key={question.id}
                    question={question}
                    index={index}
                    onEdit={setEditingQuestion}
                    onDelete={deleteQuestion}
                    onDuplicate={duplicateQuestion}
                  />
                ))}
                
                {/* Add Question Button */}
                <Card className="border-dashed border-2 hover:border-primary transition-colors">
                  <CardContent className="p-8 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setShowQuestionTypes(true)}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                    >
                      <Plus className="h-8 w-8 text-muted-foreground" />
                      <span className="text-muted-foreground">Adicionar Pergunta</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SortableContext>

            <DragOverlay>
              {activeId ? (
                <div className="opacity-90">
                  {/* Render dragging question */}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Question Types Sidebar */}
      {showQuestionTypes && (
        <div className="w-80 border-l bg-muted/30">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tipos de Pergunta</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuestionTypes(false)}
              >
                ×
              </Button>
            </div>
          </div>
          <ScrollArea className="h-full p-4">
            <QuestionTypeSelector onSelect={addQuestion} />
          </ScrollArea>
        </div>
      )}

      {/* Question Editor Sidebar */}
      {editingQuestion && (
        <div className="w-80 border-l bg-background">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Editar Pergunta</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingQuestion(null)}
              >
                ×
              </Button>
            </div>
          </div>
          <ScrollArea className="h-full p-4">
            {/* Question editor form would go here */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="question-title">Título da Pergunta</Label>
                <Input
                  id="question-title"
                  value={editingQuestion.title}
                  onChange={(e) => {
                    const updated = { ...editingQuestion, title: e.target.value };
                    setEditingQuestion(updated);
                    updateQuestion(updated);
                  }}
                  placeholder="Digite sua pergunta"
                />
              </div>
              
              <div>
                <Label htmlFor="question-description">Descrição (opcional)</Label>
                <Textarea
                  id="question-description"
                  value={editingQuestion.description || ''}
                  onChange={(e) => {
                    const updated = { ...editingQuestion, description: e.target.value };
                    setEditingQuestion(updated);
                    updateQuestion(updated);
                  }}
                  placeholder="Adicione uma descrição"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={editingQuestion.is_required}
                  onCheckedChange={(checked) => {
                    const updated = { ...editingQuestion, is_required: checked };
                    setEditingQuestion(updated);
                    updateQuestion(updated);
                  }}
                />
                <Label htmlFor="required">Pergunta obrigatória</Label>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};