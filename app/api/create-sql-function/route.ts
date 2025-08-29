import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Create a SQL execution function in Supabase
    const { error } = await supabase.rpc('exec', {
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS json
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result json;
        BEGIN
          EXECUTE sql;
          GET DIAGNOSTICS result = ROW_COUNT;
          RETURN json_build_object('rows_affected', result);
        EXCEPTION
          WHEN OTHERS THEN
            RETURN json_build_object('error', SQLERRM);
        END;
        $$;
      `
    })

    if (error) {
      console.error('Failed to create exec_sql function:', error)
      return NextResponse.json({ error: 'Failed to create SQL function' }, { status: 500 })
    }

    return NextResponse.json({ message: 'SQL execution function created successfully' })
  } catch (error) {
    console.error('Error creating SQL function:', error)
    return NextResponse.json({ error: 'Failed to create SQL function' }, { status: 500 })
  }
}