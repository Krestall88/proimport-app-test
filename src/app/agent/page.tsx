import AgentDashboard from '@/components/dashboards/AgentDashboard';

import { createClient } from '@/lib/supabase/server';

export default async function AgentHome() {

  const supabase = createClient();
  // Передаём supabase клиент в AgentDashboard, если потребуется
  return <AgentDashboard supabase={supabase} />;
}
