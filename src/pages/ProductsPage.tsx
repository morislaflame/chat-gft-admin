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
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Chip
} from '@heroui/react';
import { Plus, Edit, Trash2, Package, Zap, Star } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';

const ProductsPage = observer(() => {
  const { product } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    energy: '',
    starsPrice: ''
  });

  useEffect(() => {
    product.fetchAllProducts();
  }, []);

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setFormData({
      name: '',
      energy: '',
      starsPrice: ''
    });
    onOpen();
  };

  const handleEditProduct = (prod: any) => {
    setSelectedProduct(prod);
    setIsEditing(true);
    setFormData({
      name: prod.name,
      energy: prod.energy.toString(),
      starsPrice: prod.starsPrice.toString()
    });
    onOpen();
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        name: formData.name,
        energy: parseInt(formData.energy),
        starsPrice: parseInt(formData.starsPrice)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalProducts = product.products.length;
  const totalEnergy = product.products.reduce((sum, prod) => sum + prod.energy, 0);
  const totalStars = product.products.reduce((sum, prod) => sum + prod.starsPrice, 0);
  const avgPrice = totalProducts > 0 ? Math.round(totalStars / totalProducts) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Manage energy packages and pricing</p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onClick={handleCreateProduct}
        >
          Create Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Energy</p>
                <p className="text-2xl font-bold text-gray-900">{totalEnergy}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stars</p>
                <p className="text-2xl font-bold text-gray-900">{totalStars}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">{avgPrice}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">All Products ({product.products.length})</h3>
        </CardHeader>
        <CardBody>
          {product.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table aria-label="Products table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>ENERGY</TableColumn>
                <TableColumn>PRICE</TableColumn>
                <TableColumn>VALUE RATIO</TableColumn>
                <TableColumn>CREATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {product.products.map((prod) => (
                  <TableRow key={prod.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{prod.name}</p>
                          <p className="text-sm text-gray-500">ID: {prod.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{prod.energy}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-purple-500" />
                        <span className="font-semibold">{prod.starsPrice}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        color={prod.energy / prod.starsPrice > 1 ? 'success' : 'warning'} 
                        variant="flat"
                      >
                        {(prod.energy / prod.starsPrice).toFixed(2)} energy/star
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(prod.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<Edit size={14} />}
                          onClick={() => handleEditProduct(prod)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<Trash2 size={14} />}
                          onClick={() => handleDeleteProduct(prod.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Product Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold">
              {isEditing ? 'Edit Product' : 'Create New Product'}
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter product name"
                isRequired
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Energy Amount"
                  type="number"
                  value={formData.energy}
                  onChange={(e) => setFormData({...formData, energy: e.target.value})}
                  placeholder="Enter energy amount"
                  isRequired
                  startContent={<Zap className="w-4 h-4 text-gray-400" />}
                />

                <Input
                  label="Stars Price"
                  type="number"
                  value={formData.starsPrice}
                  onChange={(e) => setFormData({...formData, starsPrice: e.target.value})}
                  placeholder="Enter stars price"
                  isRequired
                  startContent={<Star className="w-4 h-4 text-gray-400" />}
                />
              </div>

              {formData.energy && formData.starsPrice && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Value Ratio:</p>
                  <p className="text-lg font-semibold">
                    {(parseInt(formData.energy) / parseInt(formData.starsPrice)).toFixed(2)} energy per star
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleSaveProduct}
              disabled={!formData.name || !formData.energy || !formData.starsPrice}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default ProductsPage;
