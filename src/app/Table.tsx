"use client";
import React, { useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
  Spinner,
} from "@nextui-org/react";
import { columns, users, statusOptions } from "./data";
import useSWR from "swr";
import { useKey } from "react-use";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function moneyFormat(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
}
const INITIAL_VISIBLE_COLUMNS = ["date", "doc_no", "credit", "detail"];

export default function DataTable() {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const [queryUrl, setQueryUrl] = React.useState("");

  const { data, isLoading } = useSWR(
    `/api/sao-ke?${queryUrl}&page=${page}&pageSize=${rowsPerPage}`,
    async (url) => {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((b) => b.json());
      return res;
    },
    { keepPreviousData: true }
  );

  const updateQueryUrl = React.useCallback(() => {
    setQueryUrl(`&s=${filterValue}`);
  }, [filterValue]);

  useEffect(() => {
    updateQueryUrl();
  }, [page, rowsPerPage]);

  const items = data?.data || [];
  const totalCount = data?.count || 0;

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) => user.detail.toLowerCase().includes(filterValue.toLowerCase()));
    }

    return filteredUsers;
  }, [users, filterValue, statusFilter]);

  const pages = Math.ceil(totalCount / rowsPerPage);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback(
    (user: any, columnKey: any) => {
      const cellValue = user[columnKey];

      switch (columnKey) {
        case "date":
          return <>{user.date}</>;
        case "doc_no":
          return <>{user.doc_no}</>;
        case "credit":
          return <span className="text-nowrap">{moneyFormat(user.credit)}</span>;
        case "detail":
          if (!filterValue) return user.detail;
          const regex = new RegExp(filterValue, "gi");
          const highlightedText = user.detail.replaceAll(
            regex,
            (substring: string) => `<span class="text-yellow-500 font-semibold">${substring}</span>`
          );
          return <div dangerouslySetInnerHTML={{ __html: highlightedText }}></div>;
        default:
          return cellValue;
      }
    },
    [filterValue]
  );

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e: any) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value: any) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Tìm kiếm"
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateQueryUrl();
              }
              if (e.key === "Escape") {
                setFilterValue("");
                updateQueryUrl();
              }
            }}
          />
          <div className="flex gap-3">
            {/* . */}
            <Button color="primary" onClick={updateQueryUrl}>
              Tìm
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          {totalCount ? <span className="text-default-400 text-small">Có {totalCount} kết quả</span> : <span></span>}
          <label className="flex items-center text-default-400 text-small">
            Số lượng hiển thị:
            <select className="bg-transparent outline-none text-default-400 text-small" onChange={onRowsPerPageChange}>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    users.length,
    onSearchChange,
    hasSearchFilter,
    totalCount,
    rowsPerPage,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {/* {selectedKeys === "all" ? "All items selected" : `${selectedKeys.size} of ${filteredItems.length} selected`} */}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={Math.ceil((totalCount || 1) / rowsPerPage)}
          onChange={setPage}
          classNames={{
            item: "!w-fit !px-2",
          }}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Trước
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            Sau
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <>
      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "w-[1200px] max-w-full min-h-[400px]",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        // sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        // onSelectionChange={setSelectedKeys}
        // onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => <TableColumn key={column.uid}>{column.name}</TableColumn>}
        </TableHeader>
        <TableBody
          emptyContent={"Không có dữ liệu"}
          items={items}
          loadingState={isLoading ? "loading" : "idle"}
          loadingContent={<Spinner size="lg" />}
        >
          {(item: any) => (
            <TableRow key={item.doc_no}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
