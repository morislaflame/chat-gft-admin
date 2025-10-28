import { 
  Chip,
  Button
} from '@heroui/react';
import { Edit, Trash2, Package, Zap, Star } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate } from '@/utils/formatters';
import { type Product } from '@/types/product';

interface ProductsTableProps {
  products: Product[];
  loading: boolean;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
}

export const ProductsTable = ({ 
  products, 
  loading, 
  onEditProduct, 
  onDeleteProduct 
}: ProductsTableProps) => {
  const columns = [
    { key: 'name', label: 'NAME' },
    { key: 'energy', label: 'ENERGY' },
    { key: 'price', label: 'PRICE' },
    { key: 'valueRatio', label: 'VALUE RATIO' },
    { key: 'created', label: 'CREATED' },
    { key: 'actions', label: 'ACTIONS' },
  ];

  const renderCell = (product: Product, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-gray-500">ID: {product.id}</p>
            </div>
          </div>
        );
      case 'energy':
        return (
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">{product.energy}</span>
          </div>
        );
      case 'price':
        return (
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-purple-500" />
            <span className="font-semibold">{product.starsPrice}</span>
          </div>
        );
      case 'valueRatio':
        return (
          <Chip 
            color={product.energy / product.starsPrice > 1 ? 'success' : 'warning'} 
            variant="flat"
          >
            {(product.energy / product.starsPrice).toFixed(2)} energy/star
          </Chip>
        );
      case 'created':
        return (
          <span className="text-sm text-gray-600">
            {formatDate(product.createdAt)}
          </span>
        );
      case 'actions':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Edit size={14} />}
              onClick={() => onEditProduct(product)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<Trash2 size={14} />}
              onClick={() => onDeleteProduct(product.id)}
            >
              Delete
            </Button>
          </div>
        );
      default:
        return '-';
    }
  };

  return (
    <DataTable
      title={`All Products (${products.length})`}
      columns={columns}
      data={products}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="No products found"
    />
  );
};
