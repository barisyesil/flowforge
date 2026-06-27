import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProcessesPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          render={
            <Link href="/processes/new">
              <Plus className="h-4 w-4" />
              Yeni Süreç Başlat
            </Link>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Süreçler / İşlerim</CardTitle>
          <CardDescription>
            Başlattığınız süreçler ve size atanan işler burada listelenecek.
            Süreç altyapısı sonraki adımlarda eklenecek.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
