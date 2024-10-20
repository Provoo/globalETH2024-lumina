import { NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function GET(req, { params }) {
  const { cid } = params;
  try {
    // Get the gateway URL for the file
    // const { data: gatewayData } = await pinata.gateways.get(cid);
    // const gatewayUrl = gatewayData.gatewayURL;
    const gatewayUrl = await pinata.gateways.createSignedURL({
      cid,
      expires: 3600, // URL expires in 1 hour
    });

    console.log("gatewayUrlgatewayUrlgatewayUrl", gatewayUrl);
    const response = await fetch(gatewayUrl);
    const data = await response.arrayBuffer();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Error fetching file" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// export async function GET(req, { params }) {
//   const { cid } = params;
//   try {
//     const file = await pinata.gateways.get(cid);
//     console.log("getFilegetFilegetFilegetFilegetFile", file);
//     return NextResponse.json(file);
//   } catch (e) {
//     console.log(e);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
