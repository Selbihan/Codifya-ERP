import { NextRequest, NextResponse } from "next/server";
import { CurrentAccountService } from "../services/currentAccountService";
import { CurrentAccountRepository } from "../../../repositories/implementations/currentAccountRepository";

const service = new CurrentAccountService(new CurrentAccountRepository());

export async function GET() {
  const data = await service.list();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await service.create(body);
  return NextResponse.json(created);
}
