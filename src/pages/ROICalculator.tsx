import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Slider } from '../components/ui/Slider';

interface ROICalculatorProps {
  className?: string;
}

interface CalculatorState {
  deadLeads: number;
  customerConversionRate: number;
  meetingRevenue: number;
  currentResponseRate: number;
  currentMeetingRate: number;
}

export default function ROICalculator({ className }: ROICalculatorProps) {
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    deadLeads: 1000,
    customerConversionRate: 20,
    meetingRevenue: 5000,
    currentResponseRate: 5,
    currentMeetingRate: 2
  });

  const [results, setResults] = useState({
    potentialMeetings: 0,
    potentialRevenue: 0,
    totalInvestment: 0,
    netProfit: 0,
    roi: 0,
    paybackPeriod: 0,
    costSavings: 0
  });

  const calculateROI = () => {
    const {
      deadLeads,
      customerConversionRate,
      meetingRevenue,
      currentResponseRate,
      currentMeetingRate
    } = calculatorState;

    // ReGenAI performance (fixed rates)
    const regenResponseRate = 35; // 35% response rate
    const regenMeetingRate = 15; // 15% meeting rate

    // Calculate potential meetings with ReGenAI
    const potentialMeetings = Math.round(deadLeads * (regenResponseRate / 100) * (regenMeetingRate / 100));
    
    // Calculate potential revenue (if customer closes deals)
    const potentialRevenue = potentialMeetings * meetingRevenue * (customerConversionRate / 100);
    
    // Calculate costs
    const conversationsCost = deadLeads * 1; // £1 per conversation
    const meetingsCost = potentialMeetings * 25; // £25 per meeting booked
    const totalInvestment = conversationsCost + meetingsCost;
    
    // Calculate profit and ROI
    const netProfit = potentialRevenue - totalInvestment;
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
    const paybackPeriod = netProfit > 0 ? totalInvestment / (netProfit / 12) : 0; // months
    
    // Calculate cost savings vs current performance
    const currentMeetings = Math.round(deadLeads * (currentResponseRate / 100) * (currentMeetingRate / 100));
    const currentRevenue = currentMeetings * meetingRevenue * (customerConversionRate / 100);
    const costSavings = potentialRevenue - currentRevenue;

    setResults({
      potentialMeetings,
      potentialRevenue,
      totalInvestment,
      netProfit,
      roi,
      paybackPeriod,
      costSavings
    });
  };

  useEffect(() => {
    calculateROI();
  }, [calculatorState, calculateROI]);

  const handleSliderChange = (field: keyof CalculatorState, value: number[]) => {
    setCalculatorState(prev => ({
      ...prev,
      [field]: value[0]
    }));
  };

  const handleInputChange = (field: keyof CalculatorState, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCalculatorState(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  return (
    <div className={`container mx-auto p-6 space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">ReGenAI ROI Calculator</h1>
        <p className="text-xl text-gray-600">
          Calculate the potential return on investment for re-engaging your dead leads
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Current Situation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="deadLeads">Number of Dead Leads</Label>
              <div className="mt-2">
                <Slider
                  value={[calculatorState.deadLeads]}
                  onValueChange={(value: number[]) => handleSliderChange('deadLeads', value)}
                  max={10000}
                  min={100}
                  step={100}
                  className="w-full"
                />
                <div className="text-center mt-2">
                  <Input
                    id="deadLeads"
                    type="number"
                    value={calculatorState.deadLeads}
                    onChange={(e) => handleInputChange('deadLeads', e.target.value)}
                    className="text-center text-lg font-semibold text-green-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="customerConversionRate">Your Customer Conversion Rate (%)</Label>
              <div className="mt-2">
                <Slider
                  value={[calculatorState.customerConversionRate]}
                  onValueChange={(value: number[]) => handleSliderChange('customerConversionRate', value)}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-center mt-2">
                  <Input
                    id="customerConversionRate"
                    type="number"
                    value={calculatorState.customerConversionRate}
                    onChange={(e) => handleInputChange('customerConversionRate', e.target.value)}
                    className="text-center text-lg font-semibold text-green-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="meetingRevenue">Average Meeting Value (£)</Label>
              <div className="mt-2">
                <Slider
                  value={[calculatorState.meetingRevenue]}
                  onValueChange={(value: number[]) => handleSliderChange('meetingRevenue', value)}
                  max={20000}
                  min={1000}
                  step={500}
                  className="w-full"
                />
                <div className="text-center mt-2">
                  <Input
                    id="meetingRevenue"
                    type="number"
                    value={calculatorState.meetingRevenue}
                    onChange={(e) => handleInputChange('meetingRevenue', e.target.value)}
                    className="text-center text-lg font-semibold text-green-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentResponseRate">Current Response Rate (%)</Label>
                <div className="mt-2">
                  <Slider
                    value={[calculatorState.currentResponseRate]}
                    onValueChange={(value: number[]) => handleSliderChange('currentResponseRate', value)}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center mt-2">
                    <Input
                      id="currentResponseRate"
                      type="number"
                      value={calculatorState.currentResponseRate}
                      onChange={(e) => handleInputChange('currentResponseRate', e.target.value)}
                      className="text-center text-sm font-semibold text-green-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="currentMeetingRate">Current Meeting Rate (%)</Label>
                <div className="mt-2">
                  <Slider
                    value={[calculatorState.currentMeetingRate]}
                    onValueChange={(value: number[]) => handleSliderChange('currentMeetingRate', value)}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center mt-2">
                    <Input
                      id="currentMeetingRate"
                      type="number"
                      value={calculatorState.currentMeetingRate}
                      onChange={(e) => handleInputChange('currentMeetingRate', e.target.value)}
                      className="text-center text-sm font-semibold text-green-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Investment & Costs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Conversations Cost</span>
                <span className="font-bold text-lg">£{calculatorState.deadLeads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Meetings Cost</span>
                <span className="font-bold text-lg">£{(results.potentialMeetings * 25).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <span className="font-bold text-lg">Total Investment</span>
                <span className="font-bold text-xl text-green-600">£{results.totalInvestment.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Potential Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Meetings Generated</span>
                <span className="font-bold text-lg text-blue-600">{results.potentialMeetings}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Potential Revenue (if closed)</span>
                <span className="font-bold text-lg text-blue-600">£{results.potentialRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <span className="font-bold text-lg">Net Profit (if closed)</span>
                <span className={`font-bold text-xl ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{results.netProfit.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">ROI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">ROI</span>
                <span className={`font-bold text-lg ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {results.roi.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Payback Period</span>
                <span className="font-bold text-lg text-purple-600">
                  {results.paybackPeriod > 0 ? `${results.paybackPeriod.toFixed(1)} months` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Cost Savings vs Current</span>
                <span className={`font-bold text-lg ${results.costSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{results.costSavings.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">ReGenAI Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Standard Pricing</h3>
              <ul className="space-y-2 text-sm">
                <li>• £1 per conversation sent</li>
                <li>• £25 per meeting booked</li>
                <li>• No setup fees</li>
                <li>• No monthly commitments</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Performance Guarantee</h3>
              <ul className="space-y-2 text-sm">
                <li>• 35% average response rate</li>
                <li>• 15% average meeting rate</li>
                <li>• AI-powered personalization</li>
                <li>• GDPR compliant</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 