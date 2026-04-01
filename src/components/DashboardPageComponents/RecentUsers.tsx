import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '@/utils/formatters';
import type { RecentUserSession } from '@/http/adminAPI';

interface RecentUsersProps {
  recentUsers?: RecentUserSession[];
}

export const RecentUsers = ({ recentUsers }: RecentUsersProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Последняя активность (последняя сессия)</h3>
      </CardHeader>
      <CardBody>
        {recentUsers && recentUsers.length > 0 ? (
          <Table aria-label="Таблица последних сессий пользователей">
            <TableHeader>
              <TableColumn>ПОЛЬЗОВАТЕЛЬ</TableColumn>
              <TableColumn>ИСТОРИЯ</TableColumn>
              <TableColumn>СООБЩЕНИЙ ЗА СЕССИЮ</TableColumn>
              <TableColumn>ПОСЛЕДНЯЯ АКТИВНОСТЬ</TableColumn>
            </TableHeader>
            <TableBody>
              {recentUsers.map((u) => {
                const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || (u.username ? `@${u.username}` : `Пользователь #${u.userId}`);
                const initials = getInitials(u.firstName || '', u.lastName || '', u.username || '');
                return (
                  <TableRow
                    key={u.userId}
                    className="cursor-pointer hover:bg-zinc-800/50"
                    onClick={() => navigate(`/users/${u.userId}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{fullName}</span>
                          <span className="text-xs text-gray-400">
                            {u.username ? `@${u.username}` : 'Без username'} · {u.telegramId ? `tg:${u.telegramId}` : 'tg:Н/Д'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{u.historyName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">{u.sessionUserMessages}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{new Date(u.lastActiveAt).toLocaleString()}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500">Свежая активность не найдена</p>
        )}
      </CardBody>
    </Card>
  );
};
