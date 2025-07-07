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

interface CampaignType {
  id: string;
  name: string;
  description: string;
  personaType: string;
  paymentModel: string;
  paymentAmount: number;
}

interface EnhancedCampaign {
  id: string;
  name: string;
  type: CampaignType;
  status: string;
  performance: {
    metrics: {
      totalLeads: number;
      qualifiedLeads: number;
      engagedLeads: number;
      firstContacts: number;
      meetingsBooked: number;
      conversions: number;
      revenue: number;
      cost: number;
      roi: number;
      averageSentiment: number;
      webScrapingSuccess: number;
    };
  };
  billing: {
    totalBilled: number;
    totalPaid: number;
    outstandingAmount: number;
    serviceStatus: string;
  };
}

interface Persona {
  id: string;
  name: string;
  type: string;
  description: string;
  voice: string;
  specialization: string;
}

export default function EnhancedCampaignManagement() {
  const [campaigns, setCampaigns] = useState<EnhancedCampaign[]>([]);
  const [campaignTypes, setCampaignTypes] = useState<CampaignType[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<EnhancedCampaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Form state for new campaign
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    typeId: '',
    clientId: '',
    budget: 0,
    pricingModel: {
      type: 'standard', // 'standard', 'per_message', 'custom'
      conversationCost: 1,
      meetingCost: 25,
      customRate: 0,
      customDescription: ''
    },
    targetAudience: {
      industries: [],
      companySizes: [],
      regions: []
    },
    dataIntegration: {
      webScrapingEnabled: true,
      sentimentAnalysisEnabled: true,
      crmIntegrationEnabled: false,
      emailIntegrationEnabled: false,
      serviceDeskIntegrationEnabled: false
    },
    billing: {
      autoInvoice: true,
      billingCycle: 'monthly'
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignsRes, typesRes, personasRes] = await Promise.all([
        api.get('/enhanced-campaigns/campaigns'),
        api.get('/enhanced-campaigns/campaign-types'),
        api.get('/enhanced-campaigns/personas')
      ]);

      setCampaigns(campaignsRes.data.data || []);
      setCampaignTypes(typesRes.data.data || []);
      setPersonas(personasRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      setIsCreating(true);
      const response = await api.post('/enhanced-campaigns/campaigns', newCampaign);
      setCampaigns([...campaigns, response.data.data]);
      setNewCampaign({
        name: '',
        typeId: '',
        clientId: '',
        budget: 0,
        pricingModel: {
          type: 'standard',
          conversationCost: 1,
          meetingCost: 25,
          customRate: 0,
          customDescription: ''
        },
        targetAudience: {
          industries: [],
          companySizes: [],
          regions: []
        },
        dataIntegration: {
          webScrapingEnabled: true,
          sentimentAnalysisEnabled: true,
          crmIntegrationEnabled: false,
          emailIntegrationEnabled: false,
          serviceDeskIntegrationEnabled: false
        },
        billing: {
          autoInvoice: true,
          billingCycle: 'monthly'
        }
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading enhanced campaigns...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Enhanced Campaign Management</h1>
        <Button onClick={() => setActiveTab('create')}>Create New Campaign</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{campaigns.length}</div>
                <div className="text-sm text-gray-500">
                  {campaigns.filter(c => c.status === 'active').length} active
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  £{campaigns.reduce((sum, c) => sum + c.performance.metrics.revenue, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Average ROI: {campaigns.length > 0 ? 
                    (campaigns.reduce((sum, c) => sum + c.performance.metrics.roi, 0) / campaigns.length).toFixed(1) : 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Web Scraping Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {campaigns.length > 0 ? 
                    (campaigns.reduce((sum, c) => sum + c.performance.metrics.webScrapingSuccess, 0) / campaigns.length).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-500">
                  Average success rate
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-gray-500">{campaign.type.name}</p>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Badge className={getServiceStatusColor(campaign.billing.serviceStatus)}>
                        {campaign.billing.serviceStatus}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">£{campaign.performance.metrics.revenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        {campaign.performance.metrics.totalLeads} leads
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{campaign.name}</h3>
                        <p className="text-gray-600">{campaign.type.description}</p>
                        <p className="text-sm text-gray-500">
                          Pricing: {campaign.type.paymentModel === 'standard' ? 'Standard (£1/conversation + £25/meeting)' :
                                   campaign.type.paymentModel === 'per_message' ? 'Per Message Only' :
                                   'Custom Pricing'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge className={getServiceStatusColor(campaign.billing.serviceStatus)}>
                          {campaign.billing.serviceStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{campaign.performance.metrics.totalLeads}</div>
                        <div className="text-sm text-gray-500">Total Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{campaign.performance.metrics.qualifiedLeads}</div>
                        <div className="text-sm text-gray-500">Qualified</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{campaign.performance.metrics.meetingsBooked}</div>
                        <div className="text-sm text-gray-500">Meetings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">£{campaign.performance.metrics.revenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Revenue</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label>ROI</Label>
                        <div className="text-lg font-semibold">{campaign.performance.metrics.roi.toFixed(1)}%</div>
                      </div>
                      <div>
                        <Label>Average Sentiment</Label>
                        <div className="text-lg font-semibold">{campaign.performance.metrics.averageSentiment.toFixed(2)}</div>
                      </div>
                      <div>
                        <Label>Web Scraping Success</Label>
                        <div className="text-lg font-semibold">{campaign.performance.metrics.webScrapingSuccess.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-500">Billing Status</div>
                          <div className="font-semibold">
                            £{campaign.billing.outstandingAmount.toLocaleString()} outstanding
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            Generate Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Persona Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personas.map((persona) => (
                  <Card key={persona.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{persona.name}</CardTitle>
                      <Badge variant="secondary">{persona.type}</Badge>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Enhanced Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      placeholder="Enter campaign name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Campaign Type</Label>
                    <Select value={newCampaign.typeId} onValueChange={(value) => setNewCampaign({...newCampaign, typeId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select campaign type" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaignTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={newCampaign.clientId}
                      onChange={(e) => setNewCampaign({...newCampaign, clientId: e.target.value})}
                      placeholder="Enter client ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget (£)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newCampaign.budget}
                      onChange={(e) => setNewCampaign({...newCampaign, budget: Number(e.target.value)})}
                      placeholder="Enter budget"
                    />
                  </div>
                </div>

                <div>
                  <Label>Pricing Model</Label>
                  <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="standard"
                          name="pricingModel"
                          value="standard"
                          checked={newCampaign.pricingModel.type === 'standard'}
                          onChange={(e) => setNewCampaign({
                            ...newCampaign,
                            pricingModel: {
                              ...newCampaign.pricingModel,
                              type: e.target.value as 'standard' | 'per_message' | 'custom'
                            }
                          })}
                          className="text-green-600"
                        />
                        <Label htmlFor="standard">Standard (£1/conversation + £25/meeting)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="per_message"
                          name="pricingModel"
                          value="per_message"
                          checked={newCampaign.pricingModel.type === 'per_message'}
                          onChange={(e) => setNewCampaign({
                            ...newCampaign,
                            pricingModel: {
                              ...newCampaign.pricingModel,
                              type: e.target.value as 'standard' | 'per_message' | 'custom'
                            }
                          })}
                          className="text-green-600"
                        />
                        <Label htmlFor="per_message">Per Message Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="custom"
                          name="pricingModel"
                          value="custom"
                          checked={newCampaign.pricingModel.type === 'custom'}
                          onChange={(e) => setNewCampaign({
                            ...newCampaign,
                            pricingModel: {
                              ...newCampaign.pricingModel,
                              type: e.target.value as 'standard' | 'per_message' | 'custom'
                            }
                          })}
                          className="text-green-600"
                        />
                        <Label htmlFor="custom">Custom Pricing</Label>
                      </div>
                    </div>

                    {newCampaign.pricingModel.type === 'per_message' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customRate">Per Message Rate (£)</Label>
                          <Input
                            id="customRate"
                            type="number"
                            value={newCampaign.pricingModel.customRate}
                            onChange={(e) => setNewCampaign({
                              ...newCampaign,
                              pricingModel: {
                                ...newCampaign.pricingModel,
                                customRate: Number(e.target.value)
                              }
                            })}
                            placeholder="Enter rate per message"
                          />
                        </div>
                      </div>
                    )}

                    {newCampaign.pricingModel.type === 'custom' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="conversationCost">Conversation Cost (£)</Label>
                            <Input
                              id="conversationCost"
                              type="number"
                              value={newCampaign.pricingModel.conversationCost}
                              onChange={(e) => setNewCampaign({
                                ...newCampaign,
                                pricingModel: {
                                  ...newCampaign.pricingModel,
                                  conversationCost: Number(e.target.value)
                                }
                              })}
                              placeholder="Cost per conversation"
                            />
                          </div>
                          <div>
                            <Label htmlFor="meetingCost">Meeting Cost (£)</Label>
                            <Input
                              id="meetingCost"
                              type="number"
                              value={newCampaign.pricingModel.meetingCost}
                              onChange={(e) => setNewCampaign({
                                ...newCampaign,
                                pricingModel: {
                                  ...newCampaign.pricingModel,
                                  meetingCost: Number(e.target.value)
                                }
                              })}
                              placeholder="Cost per meeting"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="customDescription">Custom Pricing Description</Label>
                          <Textarea
                            value={newCampaign.pricingModel.customDescription}
                            onChange={(e) => setNewCampaign({
                              ...newCampaign,
                              pricingModel: {
                                ...newCampaign.pricingModel,
                                customDescription: e.target.value
                              }
                            })}
                            placeholder="Describe your custom pricing model"
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Data Integration</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newCampaign.dataIntegration.webScrapingEnabled}
                        onCheckedChange={(checked) => setNewCampaign({
                          ...newCampaign,
                          dataIntegration: {...newCampaign.dataIntegration, webScrapingEnabled: checked}
                        })}
                      />
                      <Label>Web Scraping</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newCampaign.dataIntegration.sentimentAnalysisEnabled}
                        onCheckedChange={(checked) => setNewCampaign({
                          ...newCampaign,
                          dataIntegration: {...newCampaign.dataIntegration, sentimentAnalysisEnabled: checked}
                        })}
                      />
                      <Label>Sentiment Analysis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newCampaign.dataIntegration.crmIntegrationEnabled}
                        onCheckedChange={(checked) => setNewCampaign({
                          ...newCampaign,
                          dataIntegration: {...newCampaign.dataIntegration, crmIntegrationEnabled: checked}
                        })}
                      />
                      <Label>CRM Integration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newCampaign.dataIntegration.emailIntegrationEnabled}
                        onCheckedChange={(checked) => setNewCampaign({
                          ...newCampaign,
                          dataIntegration: {...newCampaign.dataIntegration, emailIntegrationEnabled: checked}
                        })}
                      />
                      <Label>Email Integration</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Billing Settings</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newCampaign.billing.autoInvoice}
                        onCheckedChange={(checked) => setNewCampaign({
                          ...newCampaign,
                          billing: {...newCampaign.billing, autoInvoice: checked}
                        })}
                      />
                      <Label>Auto Invoice</Label>
                    </div>
                    <div>
                      <Select value={newCampaign.billing.billingCycle} onValueChange={(value) => setNewCampaign({
                        ...newCampaign,
                        billing: {...newCampaign.billing, billingCycle: value}
                      })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button onClick={createCampaign} disabled={isCreating || !newCampaign.name || !newCampaign.typeId}>
                  {isCreating ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 