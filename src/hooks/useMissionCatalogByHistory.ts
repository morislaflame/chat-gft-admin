import { useCallback, useEffect, useState } from 'react';
import {
  fetchAllMissionCatalogs,
  resolveMissionLabel,
  type MissionCatalogByHistory,
  type MissionLike,
} from '@/utils/missionDisplay';

export function useMissionCatalogByHistory() {
  const [catalog, setCatalog] = useState<MissionCatalogByHistory>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAllMissionCatalogs()
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch((err) => {
        console.error('Не удалось загрузить каталог миссий:', err);
        if (!cancelled) setCatalog(new Map());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getMissionLabel = useCallback(
    (
      historyName: string | null | undefined,
      missionId: number | null | undefined,
      mission?: MissionLike | null,
    ) => resolveMissionLabel(catalog, historyName, missionId, mission),
    [catalog],
  );

  return { catalog, loading, getMissionLabel };
}
