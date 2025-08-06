import { getAnalyticsData } from '@/lib/actions/manager';
import AnalyticsDashboard from './AnalyticsDashboard';

export default async function AnalyticsPage() {
  const analyticsData = await getAnalyticsData();

  return (
    <div className="space-y-6">
      
      <AnalyticsDashboard data={analyticsData} />
    </div>
  );
}
