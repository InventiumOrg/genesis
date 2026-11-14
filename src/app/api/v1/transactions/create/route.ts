import { badRequest, data, handle, num, one, readBody, requireUser, unauthorized } from '@/server/http';
import { createTransaction } from '@/server/transactions';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const body = await readBody(request);
    const inventoryId = num(one(body, 'inventoryId', 'InventoryId', 'inventory_id'));
    const quantity = num(one(body, 'quantity', 'Quantity'));
    const type = (one(body, 'type', 'Type') ?? 'IMPORT').toUpperCase();

    if (!inventoryId) return badRequest('A transaction needs an inventory item');
    if (!quantity || quantity <= 0) return badRequest('Quantity must be greater than zero');
    if (type !== 'IMPORT' && type !== 'EXPORT') return badRequest('Type must be IMPORT or EXPORT');

    return data(
      await createTransaction({
        type,
        inventoryId,
        quantity,
        source: one(body, 'source', 'Source'),
        destination: one(body, 'destination', 'Destination'),
        status: one(body, 'status', 'Status'),
      }),
      201,
    );
  });
}
