import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Progress } from '../components/ui/Progress';
import { api } from '../services/api';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  paymentLink?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  paymentDate: string;
  transactionId?: string;
}

interface ClientBillingSummary {
  clientId: string;
  companyName: string;
  currentBalance: number;
  totalPaid: number;
  totalInvoices: number;
  activeInvoices: number;
  overdueInvoices: number;
  serviceStatus: string;
  suspensionDate?: string;
  suspensionReason?: string;
}

export default function BillingManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clientSummaries, setClientSummaries] = useState<ClientBillingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClient, setSelectedClient] = useState<string>('');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      // Load sample data for demonstration
      const sampleInvoices: Invoice[] = [
        {
          id: 'inv-1',
          invoiceNumber: 'INV-2024-001',
          amount: 1250.00,
          currency: 'GBP',
          status: 'paid',
          dueDate: '2024-01-15',
          issuedDate: '2024-01-01',
          paidDate: '2024-01-10',
          items: [
            {
              id: 'item-1',
              description: 'Lead engagement activities',
              quantity: 50,
              unitPrice: 5.00,
              total: 250.00,
              type: 'per_engagement'
            },
            {
              id: 'item-2',
              description: 'Meeting booking services',
              quantity: 10,
              unitPrice: 25.00,
              total: 250.00,
              type: 'per_meeting'
            },
            {
              id: 'item-3',
              description: 'Lead conversion services',
              quantity: 5,
              unitPrice: 100.00,
              total: 500.00,
              type: 'per_conversion'
            },
            {
              id: 'item-4',
              description: 'Setup and configuration',
              quantity: 1,
              unitPrice: 250.00,
              total: 250.00,
              type: 'setup_fee'
            }
          ]
        },
        {
          id: 'inv-2',
          invoiceNumber: 'INV-2024-002',
          amount: 850.00,
          currency: 'GBP',
          status: 'sent',
          dueDate: '2024-02-15',
          issuedDate: '2024-02-01',
          items: [
            {
              id: 'item-5',
              description: 'Lead engagement activities',
              quantity: 30,
              unitPrice: 5.00,
              total: 150.00,
              type: 'per_engagement'
            },
            {
              id: 'item-6',
              description: 'Meeting booking services',
              quantity: 8,
              unitPrice: 25.00,
              total: 200.00,
              type: 'per_meeting'
            },
            {
              id: 'item-7',
              description: 'Lead conversion services',
              quantity: 5,
              unitPrice: 100.00,
              total: 500.00,
              type: 'per_conversion'
            }
          ]
        }
      ];

      const samplePayments: Payment[] = [
        {
          id: 'pay-1',
          amount: 1250.00,
          currency: 'GBP',
          method: 'stripe',
          status: 'completed',
          paymentDate: '2024-01-10',
          transactionId: 'txn_123456789'
        }
      ];

      const sampleClientSummaries: ClientBillingSummary[] = [
        {
          clientId: 'client-1',
          companyName: 'TechCorp Ltd',
          currentBalance: 850.00,
          totalPaid: 1250.00,
          totalInvoices: 2,
          activeInvoices: 1,
          overdueInvoices: 0,
          serviceStatus: 'active'
        },
        {
          clientId: 'client-2',
          companyName: 'StartupXYZ',
          currentBalance: 1500.00,
          totalPaid: 500.00,
          totalInvoices: 3,
          activeInvoices: 2,
          overdueInvoices: 1,
          serviceStatus: 'suspended',
          suspensionDate: '2024-02-01',
          suspensionReason: 'Payment overdue'
        }
      ];

      setInvoices(sampleInvoices);
      setPayments(samplePayments);
      setClientSummaries(sampleClientSummaries);
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const suspendClient = async (clientId: string) => {
    try {
      await api.post(`/enhanced-campaigns/billing/suspend-client/${clientId}`, {
        reason: 'Payment overdue'
      });
      // Update local state
      setClientSummaries(prev => prev.map(client => 
        client.clientId === clientId 
          ? { ...client, serviceStatus: 'suspended', suspensionDate: new Date().toISOString() }
          : client
      ));
    } catch (error) {
      console.error('Error suspending client:', error);
    }
  };

  const reactivateClient = async (clientId: string) => {
    try {
      await api.post(`/enhanced-campaigns/billing/reactivate-client/${clientId}`);
      // Update local state
      setClientSummaries(prev => prev.map(client => 
        client.clientId === clientId 
          ? { ...client, serviceStatus: 'active', suspensionDate: undefined, suspensionReason: undefined }
          : client
      ));
    } catch (error) {
      console.error('Error reactivating client:', error);
    }
  };

  const checkOverdueInvoices = async () => {
    try {
      await api.post('/enhanced-campaigns/billing/check-overdue');
      alert('Overdue invoice check completed');
    } catch (error) {
      console.error('Error checking overdue invoices:', error);
    }
  };

  const addLateFees = async () => {
    try {
      await api.post('/enhanced-campaigns/billing/add-late-fees');
      alert('Late fees added successfully');
    } catch (error) {
      console.error('Error adding late fees:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading billing data...</div>
      </div>
    );
  }

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const totalOutstanding = totalRevenue - totalPaid;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billing Management</h1>
        <div className="flex space-x-2">
          <Button onClick={checkOverdueInvoices} variant="outline">
            Check Overdue
          </Button>
          <Button onClick={addLateFees} variant="outline">
            Add Late Fees
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">£{totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  {invoices.length} invoices
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">£{totalPaid.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  {payments.length} payments
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">£{totalOutstanding.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  {overdueInvoices} overdue
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {clientSummaries.filter(c => c.serviceStatus === 'active').length}
                </div>
                <div className="text-sm text-gray-500">
                  {clientSummaries.filter(c => c.serviceStatus === 'suspended').length} suspended
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-semibold">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">£{invoice.amount.toLocaleString()}</div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientSummaries.map((client) => (
                    <div key={client.clientId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-semibold">{client.companyName}</div>
                        <div className="text-sm text-gray-500">
                          £{client.currentBalance.toLocaleString()} outstanding
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getServiceStatusColor(client.serviceStatus)}>
                          {client.serviceStatus}
                        </Badge>
                        {client.serviceStatus === 'suspended' && (
                          <div className="text-xs text-red-600 mt-1">
                            Suspended {client.suspensionDate ? new Date(client.suspensionDate).toLocaleDateString() : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{invoice.invoiceNumber}</h3>
                        <p className="text-gray-600">
                          Issued: {new Date(invoice.issuedDate).toLocaleDateString()} | 
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">£{invoice.amount.toLocaleString()}</div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {invoice.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <div className="font-medium">{item.description}</div>
                            <div className="text-sm text-gray-500">
                              {item.quantity} x £{item.unitPrice} ({item.type})
                            </div>
                          </div>
                          <div className="font-semibold">£{item.total.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View PDF
                        </Button>
                        <Button size="sm" variant="outline">
                          Send Reminder
                        </Button>
                      </div>
                      {invoice.paymentLink && (
                        <Button size="sm">
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold">£{payment.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString()} via {payment.method}
                      </div>
                      {payment.transactionId && (
                        <div className="text-xs text-gray-400">
                          TXN: {payment.transactionId}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={getPaymentStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Billing Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientSummaries.map((client) => (
                  <div key={client.clientId} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{client.companyName}</h3>
                        <p className="text-gray-600">Client ID: {client.clientId}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getServiceStatusColor(client.serviceStatus)}>
                          {client.serviceStatus}
                        </Badge>
                        {client.serviceStatus === 'suspended' && (
                          <div className="text-xs text-red-600 mt-1">
                            {client.suspensionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">£{client.currentBalance.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Outstanding</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">£{client.totalPaid.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Total Paid</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{client.totalInvoices}</div>
                        <div className="text-sm text-gray-500">Total Invoices</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{client.overdueInvoices}</div>
                        <div className="text-sm text-gray-500">Overdue</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Invoices
                        </Button>
                        <Button size="sm" variant="outline">
                          Payment History
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        {client.serviceStatus === 'active' ? (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => suspendClient(client.clientId)}
                          >
                            Suspend Services
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => reactivateClient(client.clientId)}
                          >
                            Reactivate Services
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 