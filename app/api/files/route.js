import { NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export const bodyParser = false;

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");
    const uploadData = await pinata.upload.file(file);
    return NextResponse.json(uploadData, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await pinata.files.list();
    console.log(result);
    return NextResponse.json(result);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
