import { client } from "@/lib/mongodb";

export async function GET(request: Request) {
  await client.connect();
  const { searchParams } = new URL(request.url);
  const searchValue = searchParams.get("s") || "";
  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("pageSize") || 10;
  const db = client.db("saoke");
  const collection = db.collection("saoke");
  const cursor = collection.find({ detail: { $regex: searchValue, $options: "i" } }).sort({ credit: 1 });

  const [count, data] = await Promise.all([
    cursor.count(),
    cursor
      .skip((+page - 1) * +pageSize)
      .limit(+pageSize)
      .toArray(),
  ]);

  return new Response(JSON.stringify({ data: data, count: count }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
// export async function POST(request: Request) {
//   const requestBody = await request.json();
//   try {
//     const db = client.db("saoke");
//     const collection = db.collection("saoke");
//   } catch (error) {
//     return Response.json({ message: "Error saving data to MongoDB:" + error });
//   }
//   return Response.json({ message: "Data saved to MongoDB" });
// }
