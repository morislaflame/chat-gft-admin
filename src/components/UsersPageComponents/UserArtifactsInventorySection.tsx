import { useMemo } from 'react';
import {
    Card,
    CardBody,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react';
import { Gem } from 'lucide-react';
import type { AdminArtifactsGrantCatalogResponse } from '@/http/adminAPI';

type UserArtifactsInventorySectionProps = {
    catalog: AdminArtifactsGrantCatalogResponse | null;
    loading: boolean;
    error: string | null;
};

const UserArtifactsInventorySection: React.FC<UserArtifactsInventorySectionProps> = ({
    catalog,
    loading,
    error,
}) => {
    const ownedGroups = useMemo(() => {
        if (!catalog) return [];
        return catalog.histories
            .map((history) => ({
                ...history,
                levels: history.levels
                    .map((level) => ({
                        ...level,
                        artifacts: level.artifacts.filter((a) => a.ownedQty > 0),
                    }))
                    .filter((level) => level.artifacts.length > 0),
            }))
            .filter((history) => history.levels.length > 0);
    }, [catalog]);

    const stats = useMemo(() => {
        let distinct = 0;
        let totalQty = 0;
        for (const history of ownedGroups) {
            for (const level of history.levels) {
                for (const art of level.artifacts) {
                    distinct += 1;
                    totalQty += art.ownedQty;
                }
            }
        }
        return { distinct, totalQty };
    }, [ownedGroups]);

    return (
        <Card>
            <CardBody className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Gem className="w-4 h-4 text-emerald-400" />
                        Инвентарь артефактов
                    </h3>
                    <div className="flex items-center gap-2">
                        <Chip size="sm" variant="flat" color="success">
                            {stats.distinct} видов
                        </Chip>
                        <Chip size="sm" variant="flat">
                            {stats.totalQty} шт.
                        </Chip>
                    </div>
                </div>

                {error ? <div className="text-sm text-red-500">{error}</div> : null}

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : null}

                {!loading && !error && ownedGroups.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">В инвентаре нет артефактов.</div>
                ) : null}

                {!loading
                    ? ownedGroups.map((history) => (
                          <div
                              key={history.historyName}
                              className="rounded-xl border border-zinc-700/60 p-4 space-y-3"
                          >
                              <div>
                                  <p className="font-medium text-white">
                                      {history.displayName || history.historyName}
                                  </p>
                                  <p className="text-xs text-gray-500">{history.historyName}</p>
                              </div>

                              {history.levels.map((levelGroup) => (
                                  <div key={`${history.historyName}-${levelGroup.level}`} className="space-y-2">
                                      <p className="text-sm font-medium text-zinc-400">
                                          Уровень {levelGroup.level}
                                      </p>
                                      <Table
                                          aria-label={`Артефакты ${history.historyName} уровень ${levelGroup.level}`}
                                          removeWrapper
                                      >
                                          <TableHeader>
                                              <TableColumn>АРТЕФАКТ</TableColumn>
                                              <TableColumn>КОД</TableColumn>
                                              <TableColumn>ТИП</TableColumn>
                                              <TableColumn>КОЛ-ВО</TableColumn>
                                          </TableHeader>
                                          <TableBody>
                                              {levelGroup.artifacts.map((art) => (
                                                  <TableRow key={art.id}>
                                                      <TableCell>
                                                          <span className="font-medium">{art.name}</span>
                                                      </TableCell>
                                                      <TableCell>
                                                          <span className="text-xs text-gray-500">{art.code}</span>
                                                      </TableCell>
                                                      <TableCell>
                                                          <Chip size="sm" variant="flat">
                                                              {art.boostType}
                                                          </Chip>
                                                      </TableCell>
                                                      <TableCell>
                                                          <Chip
                                                              size="sm"
                                                              variant="flat"
                                                              color={art.ownedQty > 1 ? 'warning' : 'success'}
                                                          >
                                                              x{art.ownedQty}
                                                          </Chip>
                                                      </TableCell>
                                                  </TableRow>
                                              ))}
                                          </TableBody>
                                      </Table>
                                  </div>
                              ))}
                          </div>
                      ))
                    : null}
            </CardBody>
        </Card>
    );
};

export default UserArtifactsInventorySection;
