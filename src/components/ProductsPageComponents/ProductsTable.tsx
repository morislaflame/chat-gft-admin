import {
  Button,
  Card,
  CardBody
} from '@heroui/react';
import { Edit, Trash2, Zap, Star } from 'lucide-react';
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
  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">Продукты не найдены</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">Всего продуктов: {products.length}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {products.map((product) => {
          return (
            <Card key={product.id} className="border border-zinc-700/70 bg-zinc-900/70">
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-white text-2xl truncate">{product.name}</p>
                        {/* <p className="text-xs text-zinc-500">ID: {product.id}</p> */}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                        <Star className="w-4 h-4  text-yellow-500" />
                        <span className="font-semibold text-white">{product.starsPrice}</span>
                      </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold text-white text-xl ">{product.energy}</span>
                  </div>
                  
                </div>


                <div className="flex justify-end gap-2 pt-1">
                  <Button size="sm" color="primary" variant="flat" startContent={<Edit size={14} />} onClick={() => onEditProduct(product)}>
                    Изменить
                  </Button>
                  <Button size="sm" color="danger" variant="flat" startContent={<Trash2 size={14} />} onClick={() => onDeleteProduct(product.id)}>
                    Удалить
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
