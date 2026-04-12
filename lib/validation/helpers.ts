import { NextResponse } from 'next/server';
import { ZodError, ZodIssue, ZodSchema } from 'zod';

function formatErrors(err: ZodError): string[] {
  return err.issues.map((e: ZodIssue) => e.message);
}

/**
 * Parse and validate a request body against a Zod schema.
 * Returns `{ data }` on success or `{ error: NextResponse }` on failure.
 */
export async function validateBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        error: NextResponse.json(
          { error: 'Validation failed', details: formatErrors(err) },
          { status: 400 }
        ),
      };
    }
    return {
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate a URL param against a Zod schema.
 * Returns `{ data }` on success or `{ error: NextResponse }` on failure.
 */
export function validateParam<T>(
  value: string,
  schema: ZodSchema<T>
): { data: T; error?: never } | { data?: never; error: NextResponse } {
  try {
    const data = schema.parse(value);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        error: NextResponse.json(
          { error: 'Invalid parameter', details: formatErrors(err) },
          { status: 400 }
        ),
      };
    }
    return {
      error: NextResponse.json({ error: 'Invalid parameter' }, { status: 400 }),
    };
  }
}
