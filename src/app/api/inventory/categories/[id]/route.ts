import { NextRequest } from 'next/server';
import { CategoryService } from '@/modules/inventory/services/categoryService';
import { successResponse, errorResponse } from '@/utils/api';
import { requireManager, AuthenticatedRequest } from '@/lib/auth';

const categoryService = new CategoryService();

// DELETE - Kategori silme
async function handleDelete(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return errorResponse('ID zorunlu', 400);
    await categoryService.deleteCategory(id);
    return successResponse(true, 'Kategori silindi');
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message);
    }
    return errorResponse('Internal server error', 500);
  }
}

// PATCH - Kategori güncelleme
async function handlePatch(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return errorResponse('ID zorunlu', 400);
    const body = await request.json();
    const updated = await categoryService.updateCategory(id, body);
    return successResponse(updated, 'Kategori güncellendi');
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message);
    }
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: AuthenticatedRequest, ctx: { params: Promise<{ id: string }> }) {
  return requireManager((req) => handleDelete(req, ctx))(request);
}
export async function PATCH(request: AuthenticatedRequest, ctx: { params: Promise<{ id: string }> }) {
  return requireManager((req) => handlePatch(req, ctx))(request);
}
