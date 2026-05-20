import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {DotsHorizontalIcon} from "@radix-ui/react-icons";
import {Row} from "@tanstack/react-table";
import {Doc} from "@/lib/types/firestore";
import {deleteExpenseFromTrip} from "@/lib/firebase/firestore-db";
import {Trash2Icon} from "lucide-react";

const DropDownActions = ({row}: {row: Row<Doc<"expenses"> & {whoSpent: string}>}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <DotsHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => deleteExpenseFromTrip(row.original.planId, row.original._id)}
        >
          <Trash2Icon className="w-4 h-4 text-red-500 mr-2" />
          <span>Delete Expense</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropDownActions;
