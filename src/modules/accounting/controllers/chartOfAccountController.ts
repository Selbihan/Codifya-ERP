export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await service.update(params.id, body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await service.delete(params.id);
  return NextResponse.json({ success: true });
}
import { NextRequest, NextResponse } from "next/server";
import { ChartOfAccountService } from "../services/chartOfAccountService";
import { ChartOfAccountRepository } from "../../../repositories/implementations/chartOfAccountRepository";

const service = new ChartOfAccountService(new ChartOfAccountRepository());

export async function GET() {
  const data = await service.list();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await service.create(body);
  return NextResponse.json(created);
}
