import { Clock, Loader, CheckCircle2 } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

const stats = [
  { label: "Bekleyen İşler", value: 0, icon: Clock },
  { label: "Devam Eden İşler", value: 0, icon: Loader },
  { label: "Tamamlanan İşler", value: 0, icon: CheckCircle2 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Süreçlerinizin genel durumu. (Veriler süreç altyapısı bağlandığında dolacak.)
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Süreçler</CardTitle>
          <CardDescription>Henüz süreç başlatılmadı.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
