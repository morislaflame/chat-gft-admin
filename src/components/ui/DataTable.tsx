import { 
  Card, 
  CardBody, 
  CardHeader, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell 
} from '@heroui/react';

interface Column {
  key: string;
  label: string;
  width?: string;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  loading?: boolean;
  renderCell?: (item: any, columnKey: string) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export const DataTable = ({ 
  title, 
  columns, 
  data, 
  loading = false, 
  renderCell,
  emptyMessage = "No data available",
  className = ""
}: DataTableProps) => {
  const defaultRenderCell = (item: any, columnKey: string) => {
    return item[columnKey] || '-';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold">{title} ({data.length})</h3>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <Table aria-label={`${title} table`}>
            <TableHeader>
              {columns.map((column) => (
                <TableColumn key={column.key} width={column.width}>
                  {column.label}
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id || index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCell ? renderCell(item, column.key) : defaultRenderCell(item, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};
