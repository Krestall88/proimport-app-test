import { getAnalyticsData } from '@/lib/actions/manager';
import AnalyticsDashboard from './AnalyticsDashboard';

export default async function AnalyticsPage() {
  const analyticsData = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Аналитика</h3>
        <p className="text-sm text-muted-foreground">
          Подробная аналитика по всем бизнес-процессам.
        </p>
      </div>
      <AnalyticsDashboard data={analyticsData} />
    </div>
  );
}
