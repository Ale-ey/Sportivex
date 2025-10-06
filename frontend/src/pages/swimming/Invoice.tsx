import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Download, 
  Mail, 
  CreditCard, 
  Calendar,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  amount: number;
  items: InvoiceItem[];
  memberName: string;
  memberEmail: string;
  paymentMethod?: string;
  paymentDate?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const Invoice: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      date: '2024-06-01',
      dueDate: '2024-06-15',
      status: 'paid',
      amount: 120,
      memberName: 'John Smith',
      memberEmail: 'john.smith@email.com',
      paymentMethod: 'Credit Card',
      paymentDate: '2024-06-10',
      items: [
        {
          description: 'Premium Swimming Membership (3 months)',
          quantity: 1,
          unitPrice: 120,
          total: 120
        }
      ]
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      date: '2024-07-01',
      dueDate: '2024-07-15',
      status: 'pending',
      amount: 120,
      memberName: 'John Smith',
      memberEmail: 'john.smith@email.com',
      items: [
        {
          description: 'Premium Swimming Membership (3 months)',
          quantity: 1,
          unitPrice: 120,
          total: 120
        }
      ]
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      date: '2024-05-01',
      dueDate: '2024-05-15',
      status: 'overdue',
      amount: 50,
      memberName: 'Alice Johnson',
      memberEmail: 'alice.johnson@email.com',
      items: [
        {
          description: 'Basic Swimming Membership (1 month)',
          quantity: 1,
          unitPrice: 50,
          total: 50
        }
      ]
    }
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handlePayInvoice = (invoiceId: string) => {
    // Simulate payment process
    setInvoices(prev => 
      prev.map(inv => 
        inv.id === invoiceId 
          ? { 
              ...inv, 
              status: 'paid' as const, 
              paymentMethod: 'Credit Card',
              paymentDate: new Date().toISOString().split('T')[0]
            }
          : inv
      )
    );
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simulate download
    console.log('Downloading invoice:', invoice.invoiceNumber);
    // In a real app, this would generate and download a PDF
  };

  const handleSendInvoice = (invoice: Invoice) => {
    // Simulate sending invoice via email
    console.log('Sending invoice to:', invoice.memberEmail);
  };

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = invoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueAmount = invoices
    .filter(invoice => invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Receipt className="w-8 h-8 mr-3 text-blue-600" />
                Monthly Fees Invoice
              </h1>
              <p className="text-gray-600 mt-2">
                Manage swimming pool membership invoices and payments
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Receipt className="w-4 h-4 mr-2" />
              Generate New Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(paidAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(overdueAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              View and manage all swimming pool membership invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.map(invoice => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-gray-600">{invoice.memberName}</p>
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1 capitalize">{invoice.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</p>
                      <p className="text-sm text-gray-600">Due: {formatDate(invoice.dueDate)}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        View
                      </Button>
                      
                      {invoice.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handlePayInvoice(invoice.id)}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pay
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendInvoice(invoice)}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Modal */}
        {showInvoiceModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice {selectedInvoice.invoiceNumber}</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setShowInvoiceModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Invoice Header */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Bill To:</h3>
                      <p className="text-gray-600">{selectedInvoice.memberName}</p>
                      <p className="text-gray-600">{selectedInvoice.memberEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">Invoice Date: {formatDate(selectedInvoice.date)}</p>
                      <p className="text-gray-600">Due Date: {formatDate(selectedInvoice.dueDate)}</p>
                      <Badge className={getStatusColor(selectedInvoice.status)}>
                        {getStatusIcon(selectedInvoice.status)}
                        <span className="ml-1 capitalize">{selectedInvoice.status}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 grid grid-cols-4 gap-4 font-semibold text-sm">
                        <div>Description</div>
                        <div>Qty</div>
                        <div className="text-right">Unit Price</div>
                        <div className="text-right">Total</div>
                      </div>
                      {selectedInvoice.items.map((item, index) => (
                        <div key={index} className="px-4 py-3 grid grid-cols-4 gap-4 border-t border-gray-200">
                          <div>{item.description}</div>
                          <div>{item.quantity}</div>
                          <div className="text-right">{formatCurrency(item.unitPrice)}</div>
                          <div className="text-right font-semibold">{formatCurrency(item.total)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between py-2 border-t border-gray-200">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg">{formatCurrency(selectedInvoice.amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  {selectedInvoice.status === 'paid' && selectedInvoice.paymentMethod && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Payment Information</h4>
                      <p className="text-green-700">Payment Method: {selectedInvoice.paymentMethod}</p>
                      <p className="text-green-700">Payment Date: {formatDate(selectedInvoice.paymentDate!)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoice;
