import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const UsersTable = ({
  users,
  currentUser,
  onEditClick,
  onDeleteClick,
  onAddClick,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="p-6 border-b border-zinc-200">
        <h2 className="text-xl font-semibold text-zinc-900">
          Zarządzanie użytkownikami
        </h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nickname</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rola</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id} >
              <TableCell className="font-medium">{u.nickname}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.role === "ADMIN"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {u.role}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={u.id === currentUser?.userId}
                    title={
                      u.id === currentUser?.userId
                        ? "Nie możesz edytować własnego konta z tego poziomu"
                        : undefined
                    }
                    onClick={() => onEditClick(u)}
                  >
                    Edytuj
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={u.id === currentUser?.userId}
                    title={
                      u.id === currentUser?.userId
                        ? "Nie możesz usunąć własnego konta"
                        : undefined
                    }
                    onClick={() => onDeleteClick(u.id)}
                  >
                    Usuń
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="m-4">
        <Button variant="outline" onClick={onAddClick}>
          Dodaj użytkownika
        </Button>
      </div>
    </div>
  );
};

export default UsersTable;
