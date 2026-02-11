import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if integrations table exists by trying to select
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('service', 'instagram')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
       console.error("Error fetching instagram integration:", error);
       // If table doesn't exist or other error, return empty
       return NextResponse.json({ connected: false });
    }

    if (!data || !data.access_token) {
        return NextResponse.json({ connected: false });
    }

    return NextResponse.json({ 
        connected: true, 
        username: data.username,
        last_updated: data.updated_at 
    });

  } catch (error) {
    console.error("Internal error:", error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { access_token } = await req.json();
    
    if (!access_token) {
        return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    // Optional: Verify token with Instagram Basic Display API before saving
    // https://graph.instagram.com/me?fields=id,username&access_token={access-token}
    let username = '';
    let userId = '';

    try {
        const verifyRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`);
        const verifyData = await verifyRes.json();
        
        if (verifyData.error) {
            return NextResponse.json({ error: "Token inválido ou expirado do Instagram" }, { status: 400 });
        }
        
        username = verifyData.username;
        userId = verifyData.id;

    } catch (e) {
        console.warn("Could not verify token, saving anyway but marking unverified", e);
    }

    const supabase = await createClient();

    // Upsert the integration
    const { error } = await supabase
      .from('integrations')
      .upsert({ 
        service: 'instagram', 
        access_token, 
        username,
        user_id: userId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'service' });

    if (error) {
        console.error("Error saving integration:", error);
        return NextResponse.json({ error: "Failed to save to database. Ensure 'integrations' table exists." }, { status: 500 });
    }

    return NextResponse.json({ success: true, username });

  } catch (error) {
    console.error("Internal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
