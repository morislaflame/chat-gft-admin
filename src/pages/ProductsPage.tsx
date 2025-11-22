import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { Plus } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { ProductStats, ProductsTable, ProductFormModal } from '@/components/ProductsPageComponents';
import { type Product } from '@/types/product';

const ProductsPage = observer(() => {
  const { product } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
  }, [product]);

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
      console.error('Failed to save product:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await product.deleteProduct(id);
        product.fetchAllProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };


  const totalProducts = product.products.length;
  const totalEnergy = product.products.reduce((sum, prod) => sum + prod.energy, 0);
  const totalStars = product.products.reduce((sum, prod) => sum + prod.starsPrice, 0);
  const avgPrice = totalProducts > 0 ? Math.round(totalStars / totalProducts) : 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Products"
        description="Manage energy packages and pricing"
        actionButton={{
          label: "Create Product",
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
    </div>
  );
});

export default ProductsPage;
