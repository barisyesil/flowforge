import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ayarlar</CardTitle>
        <CardDescription>
          Kullanıcı bilgileri ve basit tercihler (tema, dil) burada yer alacak.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
