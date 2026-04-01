import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Edit, Trash2, Gem, Gift } from "lucide-react";
import { type Case } from "@/http/caseAPI";
import Lottie from "lottie-react";
import { useEffect, useRef, useState } from "react";

interface CasesTableProps {
  cases: Case[];
  loading: boolean;
  onEdit: (item: Case) => void;
  onDelete: (id: number) => void;
}

export const CasesTable = ({ cases, loading, onEdit, onDelete }: CasesTableProps) => {
  const [animations, setAnimations] = useState<{ [url: string]: Record<string, unknown> }>({});
  const loadedUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadAnimations = async () => {
      const newAnimations: { [url: string]: Record<string, unknown> } = {};
      for (const caseItem of cases) {
        const media = caseItem.mediaFile;
        if (media?.mimeType === "application/json" && !loadedUrls.current.has(media.url)) {
          try {
            const resp = await fetch(media.url);
            const json = await resp.json();
            newAnimations[media.url] = json;
            loadedUrls.current.add(media.url);
          } catch (e) {
            console.error("Failed to load case lottie:", e);
          }
        }
      }
      if (Object.keys(newAnimations).length) {
        setAnimations((prev) => ({ ...prev, ...newAnimations }));
      }
    };
    void loadAnimations();
  }, [cases]);

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

  if (cases.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">Кейсы не найдены</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {cases.map((item) => {
        const media = item.mediaFile;
        const hasLottie = media?.mimeType === "application/json" && !!media.url;
        const hasImage = media?.mimeType?.startsWith("image/") && !!media.url;

        return (
          <Card key={item.id} className="border border-zinc-700/70 bg-zinc-900/70">
            <CardBody className="space-y-4">
              <div className="w-full h-40 rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center p-4">
                {hasLottie && animations[media!.url] ? (
                  <Lottie
                    animationData={animations[media!.url]}
                    loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : hasImage ? (
                  <img src={media!.url} alt={item.name} className="w-full h-full object-cover block" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br rounded-xl from-purple-400/30 to-pink-400/30 flex items-center justify-center">
                    <Gift className="w-10 h-10 text-white/80" />
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-white">{item.name}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{item.description || "Без описания"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Chip color={item.isActive ? "success" : "danger"} variant="flat" size="sm">
                    {item.isActive ? "Активен" : "Неактивен"}
                  </Chip>
                </div>
              </div>

              <div className="flex items-center gap-2 text-zinc-200">
                <Gem className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-white text-xl">{item.price}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(item.items || []).map((it, idx) => {
                  const key = `${it.id ?? "new"}-${idx}`;

                  if (it.type === "reward") {
                    return (
                      <span key={key} className="rounded-md px-2 py-1 text-xs font-medium border border-sky-400/25 bg-sky-500/10 text-sky-200">
                        Награда #{it.rewardId} • {it.weight}%
                      </span>
                    );
                  }

                  if (it.type === "gems") {
                    return (
                      <span key={key} className="rounded-md px-2 py-1 text-xs font-medium border border-orange-400/25 bg-orange-500/10 text-orange-200">
                        Гемы +{it.amount} • {it.weight}%
                      </span>
                    );
                  }

                  return (
                    <span key={key} className="rounded-md px-2 py-1 text-xs font-medium border border-violet-400/25 bg-violet-500/10 text-violet-200">
                      Энергия +{it.amount} • {it.weight}%
                    </span>
                  );
                })}
                {(item.items || []).length === 0 && (
                  <span className="text-sm text-gray-400">Нет содержимого</span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Edit size={14} />}
                  onClick={() => onEdit(item)}
                >
                  Изменить
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 size={14} />}
                  onClick={() => onDelete(item.id)}
                >
                  Удалить
                </Button>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};
