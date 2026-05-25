import { useEffect, useState } from 'react';
import {
    Button,
    Checkbox,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
} from '@heroui/react';
import { grantUserArtifacts, type AdminArtifactsGrantCatalogResponse } from '@/http/adminAPI';

type GrantUserArtifactsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    catalog: AdminArtifactsGrantCatalogResponse | null;
    catalogLoading: boolean;
    onGranted?: () => void;
};

const GrantUserArtifactsModal: React.FC<GrantUserArtifactsModalProps> = ({
    isOpen,
    onClose,
    userId,
    catalog,
    catalogLoading,
    onGranted,
}) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!isOpen) return;
        setSelectedIds(new Set());
        setError(null);
    }, [isOpen]);

    const toggleArtifact = (id: number, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const toggleLevel = (ids: number[], checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            for (const id of ids) {
                if (checked) next.add(id);
                else next.delete(id);
            }
            return next;
        });
    };

    const handleGrant = async () => {
        if (!userId || selectedIds.size === 0) return;
        setSubmitting(true);
        setError(null);
        try {
            const result = await grantUserArtifacts(userId, [...selectedIds]);
            alert(result.message || `Начислено артефактов: ${result.granted.length}`);
            onGranted?.();
            onClose();
        } catch (err: unknown) {
            console.error(err);
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Не удалось начислить артефакты';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>Начислить артефакты</ModalHeader>
                <ModalBody className="gap-4">
                    {error ? <div className="text-sm text-red-500">{error}</div> : null}

                    {catalogLoading ? (
                        <div className="flex justify-center py-10">
                            <Spinner />
                        </div>
                    ) : null}

                    {!catalogLoading && catalog?.histories.length === 0 ? (
                        <p className="text-sm text-gray-400">Артефакты в каталоге не найдены.</p>
                    ) : null}

                    {!catalogLoading && catalog
                        ? catalog.histories.map((history) => (
                              <div
                                  key={history.historyName}
                                  className="rounded-xl border border-zinc-700/70 p-4 space-y-3"
                              >
                                  <div className="flex items-center justify-between gap-2">
                                      <div>
                                          <p className="font-semibold text-white">
                                              {history.displayName || history.historyName}
                                          </p>
                                          <p className="text-xs text-gray-500">{history.historyName}</p>
                                      </div>
                                      <Button
                                          size="sm"
                                          variant="flat"
                                          onPress={() => {
                                              const ids = history.levels.flatMap((l) =>
                                                  l.artifacts.map((a) => a.id),
                                              );
                                              const allSelected = ids.every((id) => selectedIds.has(id));
                                              toggleLevel(ids, !allSelected);
                                          }}
                                      >
                                          {history.levels
                                              .flatMap((l) => l.artifacts.map((a) => a.id))
                                              .every((id) => selectedIds.has(id))
                                              ? 'Снять историю'
                                              : 'Вся история'}
                                      </Button>
                                  </div>

                                  {history.levels.map((levelGroup) => {
                                      const levelIds = levelGroup.artifacts.map((a) => a.id);
                                      const levelAllSelected =
                                          levelIds.length > 0 &&
                                          levelIds.every((id) => selectedIds.has(id));

                                      return (
                                          <div key={`${history.historyName}-${levelGroup.level}`} className="space-y-2">
                                              <div className="flex items-center justify-between gap-2">
                                                  <p className="text-sm font-medium text-zinc-300">
                                                      Уровень {levelGroup.level}
                                                  </p>
                                                  <Button
                                                      size="sm"
                                                      variant="light"
                                                      className="h-7 min-w-0 px-2 text-xs"
                                                      onPress={() =>
                                                          toggleLevel(levelIds, !levelAllSelected)
                                                      }
                                                  >
                                                      {levelAllSelected ? 'Снять уровень' : 'Весь уровень'}
                                                  </Button>
                                              </div>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                  {levelGroup.artifacts.map((art) => (
                                                      <Checkbox
                                                          key={art.id}
                                                          isSelected={selectedIds.has(art.id)}
                                                          onValueChange={(checked) =>
                                                              toggleArtifact(art.id, checked)
                                                          }
                                                          classNames={{
                                                              base: 'w-full max-w-full items-start rounded-lg border border-zinc-800/80 px-3 py-2',
                                                              label: 'w-full',
                                                          }}
                                                      >
                                                          <div className="flex flex-col gap-0.5 min-w-0">
                                                              <span className="text-sm font-medium truncate">
                                                                  {art.name}
                                                              </span>
                                                              <span className="text-xs text-gray-500 truncate">
                                                                  {art.code} · {art.boostType}
                                                              </span>
                                                              <Chip
                                                                  size="sm"
                                                                  variant="flat"
                                                                  color={art.ownedQty > 0 ? 'success' : 'default'}
                                                                  className="mt-1 w-fit"
                                                              >
                                                                  В инвентаре: {art.ownedQty}
                                                              </Chip>
                                                          </div>
                                                      </Checkbox>
                                                  ))}
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          ))
                        : null}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose} isDisabled={submitting}>
                        Отмена
                    </Button>
                    <Button
                        color="success"
                        onPress={() => void handleGrant()}
                        isLoading={submitting}
                        isDisabled={catalogLoading || selectedIds.size === 0}
                    >
                        Начислить ({selectedIds.size})
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default GrantUserArtifactsModal;
