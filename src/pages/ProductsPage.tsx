import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { Plus } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { ProductStats, ProductsTable, ProductFormModal } from '@/components/ProductsPageComponents';
import { type Product } from '@/types/product';
import { type Order } from '@/types/order';
import { PaymentStats, InvoiceGenerator, OrdersTable, OrderDetailsModal } from '@/components/PaymentsPageComponents';

const ProductsPage = observer(() => {
  const { product, payment } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOrderOpen, onOpen: onOrderOpen, onClose: onOrderClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceProductId, setInvoiceProductId] = useState<string>('');
  const [invoiceLink, setInvoiceLink] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    energy: '',
    starsPrice: '',
    referralBonusEnergy: '',
    referralBonusBalance: ''
  });

  useEffect(() => {
    product.fetchAllProducts();
    payment.fetchAllOrders();
  }, [product, payment]);

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setFormData({
      name: '',
      energy: '',
      starsPrice: '',
      referralBonusEnergy: '',
      referralBonusBalance: ''
    });
    onOpen();
  };

  const handleEditProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setIsEditing(true);
    setFormData({
      name: prod.name,
      energy: prod.energy.toString(),
      starsPrice: prod.starsPrice.toString(),
      referralBonusEnergy: prod.referralBonus?.energy?.toString() || '',
      referralBonusBalance: prod.referralBonus?.balance?.toString() || ''
    });
    onOpen();
  };

  const handleSaveProduct = async () => {
    try {
      const referralBonus = 
        (formData.referralBonusEnergy || formData.referralBonusBalance) 
          ? {
              energy: formData.referralBonusEnergy ? parseInt(formData.referralBonusEnergy) : undefined,
              balance: formData.referralBonusBalance ? parseInt(formData.referralBonusBalance) : undefined
            }
          : null;

      const productData = {
        name: formData.name,
        energy: parseInt(formData.energy),
        starsPrice: parseInt(formData.starsPrice),
        referralBonus: referralBonus
      };

      if (isEditing && selectedProduct) {
        await product.updateProduct(selectedProduct.id, productData);
      } else {
        await product.createProduct(productData);
      }
      
      onClose();
      product.fetchAllProducts();
    } catch (error) {
      console.error('Не удалось сохранить продукт:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      try {
        await product.deleteProduct(id);
        product.fetchAllProducts();
      } catch (error) {
        console.error('Не удалось удалить продукт:', error);
      }
    }
  };


  const totalProducts = product.products.length;
  const totalEnergy = product.products.reduce((sum, prod) => sum + prod.energy, 0);
  const totalStars = product.products.reduce((sum, prod) => sum + prod.starsPrice, 0);
  const avgPrice = totalProducts > 0 ? Math.round(totalStars / totalProducts) : 0;
  const totalRevenue = payment.orders
    .filter((order) => order.status === 'paid' || order.status === 'completed')
    .reduce((sum, order) => sum + order.price, 0);
  const totalOrders = payment.orders.length;
  const completedOrders = payment.orders.filter((order) => order.status === 'paid' || order.status === 'completed').length;

  const handleGenerateInvoice = async () => {
    if (!invoiceProductId) return;
    try {
      const result = await payment.generateInvoice(parseInt(invoiceProductId, 10));
      setInvoiceLink(result.invoiceLink);
    } catch (error) {
      console.error('Не удалось сгенерировать инвойс:', error);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    onOrderOpen();
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Продукты"
        description="Управление пакетами энергии и ценами"
        actionButton={{
          label: "Создать продукт",
          icon: Plus,
          onClick: handleCreateProduct
        }}
      />

      <ProductStats
        totalProducts={totalProducts}
        totalEnergy={totalEnergy}
        totalStars={totalStars}
        avgPrice={avgPrice}
      />

      <ProductsTable
        products={product.products}
        loading={product.loading}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      <ProductFormModal
        isOpen={isOpen}
        onClose={onClose}
        isEditing={isEditing}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSaveProduct}
      />

      <div className="pt-10 mt-8 border-t border-zinc-800/80 space-y-6">
        <PageHeader
          title="Платежи"
          description="Заказы и инвойсы по продуктам"
        />

        <PaymentStats
          totalOrders={totalOrders}
          completedOrders={completedOrders}
          totalRevenue={totalRevenue}
          successRate={totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}
        />

        <InvoiceGenerator
          products={product.products}
          selectedProduct={invoiceProductId}
          onProductChange={setInvoiceProductId}
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
          isOpen={isOrderOpen}
          onClose={onOrderClose}
          order={selectedOrder}
        />
      </div>
    </div>
  );
});

export default ProductsPage;
