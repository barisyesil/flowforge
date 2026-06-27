import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProcessesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Süreçler / İşlerim</CardTitle>
        <CardDescription>
          Başlattığınız süreçler ve size atanan işler burada listelenecek.
          Süreç altyapısı sonraki adımlarda eklenecek.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
