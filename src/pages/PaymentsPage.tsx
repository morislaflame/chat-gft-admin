import { useEffect, useState, useContext } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem
} from '@heroui/react';
import { CreditCard, DollarSign, Eye, ExternalLink } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';

const PaymentsPage = observer(() => {
  const { payment, product } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [invoiceLink, setInvoiceLink] = useState('');

  useEffect(() => {
    payment.fetchAllOrders();
    product.fetchAllProducts();
  }, []);

  const handleGenerateInvoice = async () => {
    if (!selectedProduct) return;
    
    try {
      const result = await payment.generateInvoice(parseInt(selectedProduct));
      setInvoiceLink(result.invoiceLink);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
    }
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    onOpen();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'success';
      case 'refunded':
        return 'danger';
      case 'initial':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalRevenue = payment.orders
    .filter(order => order.status === 'paid' || order.status === 'completed')
    .reduce((sum, order) => sum + order.price, 0);

  const totalOrders = payment.orders.length;
  const completedOrders = payment.orders.filter(order => 
    order.status === 'paid' || order.status === 'completed'
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments</h1>
        <p className="text-gray-600">Manage orders and generate invoices</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedOrders}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{totalRevenue}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Generate Invoice */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Generate Invoice</h3>
        </CardHeader>
        <CardBody>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select
                label="Select Product"
                placeholder="Choose a product"
                selectedKeys={selectedProduct ? [selectedProduct] : []}
                onSelectionChange={(keys) => setSelectedProduct(Array.from(keys)[0] as string)}
              >
                {product.products.map((prod) => (
                  <SelectItem key={prod.id.toString()}>
                    {prod.name} - {prod.starsPrice} stars ({prod.energy} energy)
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Button
              color="primary"
              onClick={handleGenerateInvoice}
              disabled={!selectedProduct || payment.loading}
              isLoading={payment.loading}
            >
              Generate Invoice
            </Button>
          </div>
          
          {invoiceLink && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">Invoice Generated Successfully!</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={invoiceLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<ExternalLink size={14} />}
                  onClick={() => window.open(invoiceLink, '_blank')}
                >
                  Open
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">All Orders ({payment.orders.length})</h3>
        </CardHeader>
        <CardBody>
          {payment.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table aria-label="Orders table">
              <TableHeader>
                <TableColumn>ORDER ID</TableColumn>
                <TableColumn>PRODUCT</TableColumn>
                <TableColumn>PRICE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>USER</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {payment.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        #{order.id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.productName}</p>
                        <p className="text-sm text-gray-500">
                          {order.attemptsPurchased} energy
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{order.price} stars</span>
                    </TableCell>
                    <TableCell>
                      <Chip color={getStatusColor(order.status)} variant="flat">
                        {order.status.toUpperCase()}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.user?.username || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {order.userId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Eye size={14} />}
                        onClick={() => handleViewOrder(order)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Order Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold">Order Details</h3>
          </ModalHeader>
          <ModalBody>
            {selectedOrder ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Order ID</label>
                    <p className="text-lg font-mono">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <Chip color={getStatusColor(selectedOrder.status)} variant="flat">
                        {selectedOrder.status.toUpperCase()}
                      </Chip>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Product</label>
                    <p className="text-lg">{selectedOrder.productName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Price</label>
                    <p className="text-lg font-semibold">{selectedOrder.price} stars</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Energy Purchased</label>
                    <p className="text-lg">{selectedOrder.attemptsPurchased}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">User ID</label>
                    <p className="text-lg">{selectedOrder.userId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created At</label>
                    <p className="text-lg">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Updated At</label>
                    <p className="text-lg">{formatDate(selectedOrder.updatedAt)}</p>
                  </div>
                </div>

                {selectedOrder.telegramPaymentChargeId && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-600">Payment Charge ID</label>
                    <p className="text-lg font-mono break-all">{selectedOrder.telegramPaymentChargeId}</p>
                  </div>
                )}

                {selectedOrder.metadata && Object.keys(selectedOrder.metadata).length > 0 && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-600">Metadata</label>
                    <pre className="text-sm bg-gray-100 p-3 rounded mt-1 overflow-auto">
                      {JSON.stringify(selectedOrder.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default PaymentsPage;
