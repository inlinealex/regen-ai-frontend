import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Switch } from '../components/ui/Switch';
import { Progress } from '../components/ui/Progress';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { api } from '../services/api';

interface Persona {
  id: string;
  name: string;
  type: string;
  description: string;
  voice: string;
  specialization: string;
  qualification_criteria: {
    budget: string;
    authority: string;
    need: string;
    timeline: string;
    sentiment_threshold?: number;
  };
  outreach_style: string;
  ai_prompts: {
    initial_outreach: string;
    follow_up: string;
    objection_handling: string;
    qualification_questions: string;
  };
  success_metrics: {
    primary: string;
    secondary: string[];
    targets: {
      [key: string]: number;
    };
  };
}

interface TrainingExample {
  id: string;
  personaId: string;
  input: string;
  expectedOutput: string;
  isPositive: boolean;
  context: string;
  industry: string;
  companySize: string;
}

export default function EnhancedPersonaTraining() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [trainingExamples, setTrainingExamples] = useState<TrainingExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);

  // Form state for new training example
  const [newExample, setNewExample] = useState({
    input: '',
    expectedOutput: '',
    isPositive: true,
    context: '',
    industry: '',
    companySize: ''
  });

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/enhanced-campaigns/personas');
      setPersonas(response.data.data || []);
      
      if (response.data.data && response.data.data.length > 0) {
        setSelectedPersona(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error loading personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingExamples = async (personaId: string) => {
    try {
      // Mock training examples for demonstration
      const examples: TrainingExample[] = [
        {
          id: 'ex-1',
          personaId,
          input: 'Tech company looking to hire senior developers',
          expectedOutput: 'I can help you optimize your hiring process for senior developers. What specific challenges are you facing with recruitment?',
          isPositive: true,
          context: 'Job analysis for tech hiring',
          industry: 'Technology',
          companySize: '51-200'
        },
        {
          id: 'ex-2',
          personaId,
          input: 'Customer satisfaction has been declining',
          expectedOutput: 'I can analyze your customer sentiment patterns and identify improvement opportunities. How do you currently collect feedback?',
          isPositive: true,
          context: 'Sentiment analysis for customer experience',
          industry: 'Retail',
          companySize: '201-1000'
        }
      ];
      setTrainingExamples(examples);
    } catch (error) {
      console.error('Error loading training examples:', error);
    }
  };

  useEffect(() => {
    if (selectedPersona) {
      loadTrainingExamples(selectedPersona.id);
    }
  }, [selectedPersona]);

  const startTraining = async () => {
    if (!selectedPersona) return;
    
    try {
      setIsTraining(true);
      setTrainingProgress(0);
      
      // Simulate training progress
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsTraining(false);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
      
    } catch (error) {
      console.error('Error starting training:', error);
      setIsTraining(false);
    }
  };

  const addTrainingExample = async () => {
    if (!selectedPersona || !newExample.input || !newExample.expectedOutput) return;
    
    try {
      const example: TrainingExample = {
        id: `ex-${Date.now()}`,
        personaId: selectedPersona.id,
        input: newExample.input,
        expectedOutput: newExample.expectedOutput,
        isPositive: newExample.isPositive,
        context: newExample.context,
        industry: newExample.industry,
        companySize: newExample.companySize
      };
      
      setTrainingExamples([...trainingExamples, example]);
      setNewExample({
        input: '',
        expectedOutput: '',
        isPositive: true,
        context: '',
        industry: '',
        companySize: ''
      });
    } catch (error) {
      console.error('Error adding training example:', error);
    }
  };

  const getPersonaTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'job-analysis': 'bg-blue-100 text-blue-800',
      'sentiment-analysis': 'bg-green-100 text-green-800',
      're-engagement': 'bg-yellow-100 text-yellow-800',
      'marketing-traction': 'bg-purple-100 text-purple-800',
      'vendor-outreach': 'bg-orange-100 text-orange-800',
      'supplier-outreach': 'bg-red-100 text-red-800',
      'initial-contact': 'bg-gray-100 text-gray-800',
      'crm-service-desk': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading personas...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Enhanced Persona Training</h1>
        <Button onClick={startTraining} disabled={isTraining || !selectedPersona}>
          {isTraining ? 'Training...' : 'Start Training'}
        </Button>
      </div>

      {isTraining && (
        <Alert>
          <AlertDescription>
            Training in progress... {trainingProgress}% complete
            <Progress value={trainingProgress} className="mt-2" />
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Personas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{personas.length}</div>
                <div className="text-sm text-gray-500">
                  {personas.filter(p => p.type === 'job-analysis').length} job analysis
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{trainingExamples.length}</div>
                <div className="text-sm text-gray-500">
                  {trainingExamples.filter(ex => ex.isPositive).length} positive examples
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Training</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isTraining ? '1' : '0'}</div>
                <div className="text-sm text-gray-500">
                  {isTraining ? 'Training in progress' : 'No active training'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Persona Types Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from(new Set(personas.map(p => p.type))).map((type) => {
                  const count = personas.filter(p => p.type === type).length;
                  return (
                    <div key={type} className="text-center p-4 border rounded-lg">
                      <Badge className={getPersonaTypeColor(type)}>
                        {type.replace('-', ' ')}
                      </Badge>
                      <div className="text-2xl font-bold mt-2">{count}</div>
                      <div className="text-sm text-gray-500">personas</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Personas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personas.map((persona) => (
                  <Card key={persona.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedPersona(persona)}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{persona.name}</CardTitle>
                        <Badge className={getPersonaTypeColor(persona.type)}>
                          {persona.type.replace('-', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{persona.description}</p>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Voice</Label>
                          <p className="text-sm">{persona.voice}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Specialization</Label>
                          <p className="text-sm">{persona.specialization}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Primary Metric</Label>
                          <p className="text-sm font-medium">{persona.success_metrics.primary}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          {selectedPersona && (
            <Card>
              <CardHeader>
                <CardTitle>Training: {selectedPersona.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label>Persona Type</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getPersonaTypeColor(selectedPersona.type)}>
                        {selectedPersona.type.replace('-', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-600">{selectedPersona.specialization}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Voice & Style</Label>
                      <p className="text-sm mt-1">{selectedPersona.voice}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedPersona.outreach_style}</p>
                    </div>

                    <div>
                      <Label>Qualification Criteria</Label>
                      <div className="space-y-1 mt-1">
                        <div className="text-sm"><strong>Budget:</strong> {selectedPersona.qualification_criteria.budget}</div>
                        <div className="text-sm"><strong>Authority:</strong> {selectedPersona.qualification_criteria.authority}</div>
                        <div className="text-sm"><strong>Need:</strong> {selectedPersona.qualification_criteria.need}</div>
                        <div className="text-sm"><strong>Timeline:</strong> {selectedPersona.qualification_criteria.timeline}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>AI Prompts</Label>
                    <div className="space-y-3 mt-2">
                      <div>
                        <Label className="text-xs">Initial Outreach</Label>
                        <Textarea 
                          value={selectedPersona.ai_prompts.initial_outreach}
                          readOnly
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Follow-up</Label>
                        <Textarea 
                          value={selectedPersona.ai_prompts.follow_up}
                          readOnly
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Objection Handling</Label>
                        <Textarea 
                          value={selectedPersona.ai_prompts.objection_handling}
                          readOnly
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Qualification Questions</Label>
                        <Textarea 
                          value={selectedPersona.ai_prompts.qualification_questions}
                          readOnly
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Success Metrics</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div>
                        <Label className="text-xs">Primary Metric</Label>
                        <div className="font-medium">{selectedPersona.success_metrics.primary}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Target</Label>
                        <div className="font-medium">
                          {(selectedPersona.success_metrics.targets[selectedPersona.success_metrics.primary] * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Secondary Metrics</Label>
                        <div className="text-sm">
                          {selectedPersona.success_metrics.secondary.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Input Context</Label>
                    <Input
                      value={newExample.input}
                      onChange={(e) => setNewExample({...newExample, input: e.target.value})}
                      placeholder="Enter input context"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Expected Output</Label>
                    <Textarea
                      value={newExample.expectedOutput}
                      onChange={(e) => setNewExample({...newExample, expectedOutput: e.target.value})}
                      placeholder="Enter expected output"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Industry</Label>
                    <Input
                      value={newExample.industry}
                      onChange={(e) => setNewExample({...newExample, industry: e.target.value})}
                      placeholder="Enter industry"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Company Size</Label>
                    <Select value={newExample.companySize} onValueChange={(value) => setNewExample({...newExample, companySize: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-50">1-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-1000">201-1000</SelectItem>
                        <SelectItem value="1000+">1000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Context</Label>
                    <Input
                      value={newExample.context}
                      onChange={(e) => setNewExample({...newExample, context: e.target.value})}
                      placeholder="Enter context"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newExample.isPositive}
                      onCheckedChange={(checked) => setNewExample({...newExample, isPositive: checked})}
                    />
                    <Label>Positive Example</Label>
                  </div>
                </div>

                <Button onClick={addTrainingExample} disabled={!newExample.input || !newExample.expectedOutput}>
                  Add Training Example
                </Button>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Examples</h3>
                  {trainingExamples.map((example) => (
                    <div key={example.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={example.isPositive ? "default" : "secondary"}>
                          {example.isPositive ? "Positive" : "Negative"}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          {example.industry} • {example.companySize}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Input</Label>
                          <p className="text-sm">{example.input}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Expected Output</Label>
                          <p className="text-sm">{example.expectedOutput}</p>
                        </div>
                        {example.context && (
                          <div>
                            <Label className="text-xs">Context</Label>
                            <p className="text-sm">{example.context}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 