import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PaymentStats, InvoiceGenerator, OrdersTable, OrderDetailsModal } from '@/components/PaymentsPageComponents';
import { PageHeader } from '@/components/ui';
import { type Order } from '@/types/order';

const PaymentsPage = observer(() => {
  const { payment, product } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [invoiceLink, setInvoiceLink] = useState('');

  useEffect(() => {
    payment.fetchAllOrders();
    product.fetchAllProducts();
  }, [payment, product]);

  const handleGenerateInvoice = async () => {
    if (!selectedProduct) return;
    
    try {
      const result = await payment.generateInvoice(parseInt(selectedProduct));
      setInvoiceLink(result.invoiceLink);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    onOpen();
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
        <PageHeader
          title="Payments"
          description="Manage orders and generate invoices"
        />
      </div>

      <PaymentStats
        totalOrders={totalOrders}
        completedOrders={completedOrders}
        totalRevenue={totalRevenue}
        successRate={totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}
      />

      <InvoiceGenerator
        products={product.products}
        selectedProduct={selectedProduct}
        onProductChange={setSelectedProduct}
        onGenerateInvoice={handleGenerateInvoice}
        invoiceLink={invoiceLink}
        loading={payment.loading}
      />

      <OrdersTable
        orders={payment.orders}
        loading={payment.loading}
        onViewOrder={handleViewOrder}
      />

      <OrderDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        order={selectedOrder}
      />
    </div>
  );
});

export default PaymentsPage;
