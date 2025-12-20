import { Button, Chip } from "@heroui/react";
import { Edit, Trash2, Star } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { formatDate } from "@/utils/formatters";
import { type Case } from "@/http/caseAPI";

interface CasesTableProps {
  cases: Case[];
  loading: boolean;
  onEdit: (item: Case) => void;
  onDelete: (id: number) => void;
}

export const CasesTable = ({ cases, loading, onEdit, onDelete }: CasesTableProps) => {
  const columns = [
    { key: "case", label: "CASE" },
    { key: "price", label: "PRICE" },
    { key: "status", label: "STATUS" },
    { key: "items", label: "ITEMS" },
    { key: "created", label: "CREATED" },
    { key: "actions", label: "ACTIONS" },
  ];

  const renderCell = (item: Case, columnKey: string) => {
    switch (columnKey) {
      case "case":
        return (
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        );
      case "price":
        return (
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">{item.price}</span>
          </div>
        );
      case "status":
        return (
          <Chip color={item.isActive ? "success" : "danger"} variant="flat">
            {item.isActive ? "Active" : "Inactive"}
          </Chip>
        );
      case "items":
        return (
          <div className="flex flex-wrap gap-2">
            {(item.items || []).map((it) => (
              <Chip key={it.id} size="sm" variant="flat">
                {it.type === "reward"
                  ? `Reward #${it.rewardId} (${it.weight}%)`
                  : `${it.type === "gems" ? "Gems" : "Energy"} ${it.amount} (${it.weight}%)`}
              </Chip>
            ))}
          </div>
        );
      case "created":
        return (
          <span className="text-sm text-gray-600">
            {formatDate(item.createdAt)}
          </span>
        );
      case "actions":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Edit size={14} />}
              onClick={() => onEdit(item)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<Trash2 size={14} />}
              onClick={() => onDelete(item.id)}
            >
              Delete
            </Button>
          </div>
        );
      default:
        return "-";
    }
  };

  return (
    <DataTable
      title={`Все кейсы (${cases.length})`}
      columns={columns}
      data={cases}
      loading={loading}
      renderCell={renderCell}
      emptyMessage="Кейсы не найдены"
    />
  );
};
