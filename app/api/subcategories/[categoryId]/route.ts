import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { z } from 'zod';
import { Category } from '@/app/lib/definitions';

export async function GET(
    request: Request,
    paramsObj: { params: Promise<{ categoryId: string }> }
) {
    const { categoryId } = await paramsObj.params;


    try {
        const result = await pool.query<Category>(
            `SELECT id, name, status FROM subcategories WHERE category_id = $1`, [categoryId]);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
    }
}
