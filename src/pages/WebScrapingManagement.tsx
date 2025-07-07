import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Switch } from '../components/ui/Switch';
import { Progress } from '../components/ui/Progress';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { api } from '../services/api';

interface CompanyData {
  id: string;
  name: string;
  website: string;
  industry: string;
  size: string;
  location: string;
  description: string;
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  technologies: string[];
  recentNews: Array<{
    title: string;
    date: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  sentimentScore: number;
  outreachContext: string;
  lastScraped: string;
  status: 'success' | 'failed' | 'pending';
}

interface ScrapingJob {
  id: string;
  targetUrl: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  error?: string;
  extractedData?: CompanyData;
}

export default function WebScrapingManagement() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [scrapingJobs, setScrapingJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);

  // Form state for new scraping job
  const [newJob, setNewJob] = useState({
    targetUrl: '',
    enableSentimentAnalysis: true,
    enableOutreachContext: true,
    enableContactExtraction: true,
    enableTechnologyDetection: true,
    enableNewsMonitoring: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const sampleCompanies: CompanyData[] = [
        {
          id: 'comp-1',
          name: 'TechCorp Ltd',
          website: 'https://techcorp.com',
          industry: 'Technology',
          size: '201-1000',
          location: 'London, UK',
          description: 'Leading software development company specializing in AI and machine learning solutions.',
          socialMedia: {
            linkedin: 'https://linkedin.com/company/techcorp',
            twitter: 'https://twitter.com/techcorp'
          },
          contactInfo: {
            email: 'contact@techcorp.com',
            phone: '+44 20 1234 5678'
          },
          technologies: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
          recentNews: [
            {
              title: 'TechCorp launches new AI platform',
              date: '2024-01-15',
              sentiment: 'positive'
            },
            {
              title: 'Company expands to European markets',
              date: '2024-01-10',
              sentiment: 'positive'
            }
          ],
          sentimentScore: 0.8,
          outreachContext: 'TechCorp is actively expanding and investing in AI technology. They recently launched a new AI platform and are expanding to European markets, indicating growth and innovation focus.',
          lastScraped: '2024-01-20T10:30:00Z',
          status: 'success'
        },
        {
          id: 'comp-2',
          name: 'StartupXYZ',
          website: 'https://startupxyz.com',
          industry: 'Fintech',
          size: '51-200',
          location: 'Manchester, UK',
          description: 'Innovative fintech startup focused on digital payment solutions.',
          socialMedia: {
            linkedin: 'https://linkedin.com/company/startupxyz'
          },
          contactInfo: {
            email: 'hello@startupxyz.com'
          },
          technologies: ['Vue.js', 'Firebase', 'Stripe', 'TypeScript'],
          recentNews: [
            {
              title: 'StartupXYZ raises Series A funding',
              date: '2024-01-18',
              sentiment: 'positive'
            }
          ],
          sentimentScore: 0.9,
          outreachContext: 'StartupXYZ recently secured Series A funding, indicating strong investor confidence and growth potential in the fintech space.',
          lastScraped: '2024-01-20T14:15:00Z',
          status: 'success'
        }
      ];

      const sampleJobs: ScrapingJob[] = [
        {
          id: 'job-1',
          targetUrl: 'https://techcorp.com',
          status: 'completed',
          progress: 100,
          startTime: '2024-01-20T10:00:00Z',
          endTime: '2024-01-20T10:30:00Z',
          extractedData: sampleCompanies[0]
        },
        {
          id: 'job-2',
          targetUrl: 'https://startupxyz.com',
          status: 'completed',
          progress: 100,
          startTime: '2024-01-20T14:00:00Z',
          endTime: '2024-01-20T14:15:00Z',
          extractedData: sampleCompanies[1]
        },
        {
          id: 'job-3',
          targetUrl: 'https://example.com',
          status: 'running',
          progress: 45,
          startTime: '2024-01-20T15:00:00Z'
        }
      ];

      setCompanies(sampleCompanies);
      setScrapingJobs(sampleJobs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScrapingJob = async () => {
    if (!newJob.targetUrl) return;
    
    try {
      const job: ScrapingJob = {
        id: `job-${Date.now()}`,
        targetUrl: newJob.targetUrl,
        status: 'pending',
        progress: 0,
        startTime: new Date().toISOString()
      };
      
      setScrapingJobs([job, ...scrapingJobs]);
      setNewJob({
        targetUrl: '',
        enableSentimentAnalysis: true,
        enableOutreachContext: true,
        enableContactExtraction: true,
        enableTechnologyDetection: true,
        enableNewsMonitoring: true
      });

      // Simulate job progress
      setTimeout(() => {
        setScrapingJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'running', progress: 25 } : j
        ));
      }, 1000);

      setTimeout(() => {
        setScrapingJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, progress: 75 } : j
        ));
      }, 3000);

      setTimeout(() => {
        setScrapingJobs(prev => prev.map(j => 
          j.id === job.id ? { 
            ...j, 
            status: 'completed', 
            progress: 100, 
            endTime: new Date().toISOString() 
          } : j
        ));
      }, 5000);
      
    } catch (error) {
      console.error('Error starting scraping job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-100 text-green-800';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading web scraping data...</div>
      </div>
    );
  }

  const totalCompanies = companies.length;
  const successfulScrapes = companies.filter(c => c.status === 'success').length;
  const averageSentiment = companies.length > 0 ? 
    companies.reduce((sum, c) => sum + c.sentimentScore, 0) / companies.length : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Web Scraping Management</h1>
        <Button onClick={() => setActiveTab('scraping')}>Start New Scraping Job</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="scraping">Scraping Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalCompanies}</div>
                <div className="text-sm text-gray-500">
                  {successfulScrapes} successful scrapes
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {scrapingJobs.filter(j => j.status === 'running').length}
                </div>
                <div className="text-sm text-gray-500">
                  {scrapingJobs.filter(j => j.status === 'pending').length} pending
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(averageSentiment * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-500">
                  {companies.filter(c => c.sentimentScore >= 0.7).length} positive
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {totalCompanies > 0 ? ((successfulScrapes / totalCompanies) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-500">
                  Scraping success rate
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Scraping Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scrapingJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-semibold">{job.targetUrl}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(job.startTime).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        {job.status === 'running' && (
                          <Progress value={job.progress} className="mt-2 w-20" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Companies by Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companies
                    .sort((a, b) => b.sentimentScore - a.sentimentScore)
                    .slice(0, 5)
                    .map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-semibold">{company.name}</div>
                          <div className="text-sm text-gray-500">{company.industry}</div>
                        </div>
                        <div className="text-right">
                          <Badge className={getSentimentColor(company.sentimentScore)}>
                            {(company.sentimentScore * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {companies.map((company) => (
                  <div key={company.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{company.name}</h3>
                        <p className="text-gray-600">{company.industry} • {company.size} • {company.location}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getStatusColor(company.status)}>
                          {company.status}
                        </Badge>
                        <Badge className={getSentimentColor(company.sentimentScore)}>
                          {(company.sentimentScore * 100).toFixed(0)}% sentiment
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <Label>Description</Label>
                        <p className="text-sm mt-1">{company.description}</p>
                      </div>
                      <div>
                        <Label>Technologies</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {company.technologies.map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <Label>Contact Information</Label>
                        <div className="space-y-1 mt-1">
                          {company.contactInfo.email && (
                            <div className="text-sm">Email: {company.contactInfo.email}</div>
                          )}
                          {company.contactInfo.phone && (
                            <div className="text-sm">Phone: {company.contactInfo.phone}</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Social Media</Label>
                        <div className="space-y-1 mt-1">
                          {company.socialMedia.linkedin && (
                            <div className="text-sm">LinkedIn: {company.socialMedia.linkedin}</div>
                          )}
                          {company.socialMedia.twitter && (
                            <div className="text-sm">Twitter: {company.socialMedia.twitter}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Recent News & Sentiment</Label>
                      <div className="space-y-2 mt-1">
                        {company.recentNews.map((news, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <div className="text-sm font-medium">{news.title}</div>
                              <div className="text-xs text-gray-500">{news.date}</div>
                            </div>
                            <Badge variant={news.sentiment === 'positive' ? 'default' : 'secondary'}>
                              {news.sentiment}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <Label>Outreach Context</Label>
                      <p className="text-sm mt-1">{company.outreachContext}</p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        Last scraped: {new Date(company.lastScraped).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Re-scrape
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scraping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Start New Scraping Job</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="targetUrl">Target URL</Label>
                  <Input
                    id="targetUrl"
                    value={newJob.targetUrl}
                    onChange={(e) => setNewJob({...newJob, targetUrl: e.target.value})}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Scraping Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newJob.enableSentimentAnalysis}
                        onCheckedChange={(checked) => setNewJob({
                          ...newJob,
                          enableSentimentAnalysis: checked
                        })}
                      />
                      <Label>Sentiment Analysis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newJob.enableOutreachContext}
                        onCheckedChange={(checked) => setNewJob({
                          ...newJob,
                          enableOutreachContext: checked
                        })}
                      />
                      <Label>Outreach Context</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newJob.enableContactExtraction}
                        onCheckedChange={(checked) => setNewJob({
                          ...newJob,
                          enableContactExtraction: checked
                        })}
                      />
                      <Label>Contact Extraction</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newJob.enableTechnologyDetection}
                        onCheckedChange={(checked) => setNewJob({
                          ...newJob,
                          enableTechnologyDetection: checked
                        })}
                      />
                      <Label>Technology Detection</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newJob.enableNewsMonitoring}
                        onCheckedChange={(checked) => setNewJob({
                          ...newJob,
                          enableNewsMonitoring: checked
                        })}
                      />
                      <Label>News Monitoring</Label>
                    </div>
                  </div>
                </div>

                <Button onClick={startScrapingJob} disabled={!newJob.targetUrl}>
                  Start Scraping Job
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scraping Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scrapingJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{job.targetUrl}</h3>
                        <div className="text-sm text-gray-500">
                          Started: {new Date(job.startTime).toLocaleString()}
                          {job.endTime && ` • Completed: ${new Date(job.endTime).toLocaleString()}`}
                        </div>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>

                    {job.status === 'running' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} />
                      </div>
                    )}

                    {job.error && (
                      <Alert>
                        <AlertDescription>Error: {job.error}</AlertDescription>
                      </Alert>
                    )}

                    {job.extractedData && (
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <div className="text-sm font-medium mb-2">Extracted Data Preview</div>
                        <div className="text-sm">
                          <div><strong>Company:</strong> {job.extractedData.name}</div>
                          <div><strong>Industry:</strong> {job.extractedData.industry}</div>
                          <div><strong>Sentiment:</strong> {(job.extractedData.sentimentScore * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-4">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {job.status === 'failed' && (
                        <Button size="sm" variant="outline">
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Industry Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(companies.map(c => c.industry))).map((industry) => {
                    const count = companies.filter(c => c.industry === industry).length;
                    return (
                      <div key={industry} className="flex justify-between items-center">
                        <span className="text-sm">{industry}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Size Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(companies.map(c => c.size))).map((size) => {
                    const count = companies.filter(c => c.size === size).length;
                    return (
                      <div key={size} className="flex justify-between items-center">
                        <span className="text-sm">{size}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {companies.filter(c => c.sentimentScore >= 0.7).length}
                    </div>
                    <div className="text-sm text-gray-500">Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {companies.filter(c => c.sentimentScore >= 0.4 && c.sentimentScore < 0.7).length}
                    </div>
                    <div className="text-sm text-gray-500">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {companies.filter(c => c.sentimentScore < 0.4).length}
                    </div>
                    <div className="text-sm text-gray-500">Negative</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 