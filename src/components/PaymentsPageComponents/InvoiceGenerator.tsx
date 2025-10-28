import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button,
  Select,
  SelectItem
} from '@heroui/react';
import { ExternalLink } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  starsPrice: number;
  energy: number;
}

interface InvoiceGeneratorProps {
  products: Product[];
  selectedProduct: string;
  onProductChange: (productId: string) => void;
  onGenerateInvoice: () => void;
  invoiceLink: string;
  loading: boolean;
}

export const InvoiceGenerator = ({
  products,
  selectedProduct,
  onProductChange,
  onGenerateInvoice,
  invoiceLink,
  loading
}: InvoiceGeneratorProps) => {
  return (
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
              onSelectionChange={(keys) => onProductChange(Array.from(keys)[0] as string)}
            >
              {products.map((prod) => (
                <SelectItem key={prod.id.toString()}>
                  {prod.name} - {prod.starsPrice} stars ({prod.energy} energy)
                </SelectItem>
              ))}
            </Select>
          </div>
          <Button
            color="primary"
            onClick={onGenerateInvoice}
            disabled={!selectedProduct || loading}
            isLoading={loading}
          >
            Generate Invoice
          </Button>
        </div>
        
        {invoiceLink && (
          <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
            <p className="text-sm font-medium text-green-500 mb-2">Invoice Generated Successfully!</p>
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
  );
};
