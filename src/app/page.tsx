import Image from "next/image";
import Table from "./Table";

export default function Home() {
  return (
    <div className="m-auto max-w-[1200px] pt-10">
      <main className="p-3 md:p-0 flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="text-3xl font-bold">Sao Kê Online</div>
        <Table />
      </main>
    </div>
  );
}
