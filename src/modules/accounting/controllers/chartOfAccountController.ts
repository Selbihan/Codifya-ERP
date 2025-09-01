import { NextRequest, NextResponse } from "next/server";
import { ChartOfAccountService } from "../services/chartOfAccountService";
import { ChartOfAccountRepository } from "../../../repositories/implementations/chartOfAccountRepository";

const service = new ChartOfAccountService(new ChartOfAccountRepository());

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await service.update(id, body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await service.delete(id);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const data = await service.list();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await service.create(body);
  return NextResponse.json(created);
}
