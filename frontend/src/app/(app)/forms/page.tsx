import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FormsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Tasarımı</CardTitle>
        <CardDescription>
          Doldurulacak formun alanlarını (input, select, checkbox) burada
          tasarlayacaksınız. Form tasarlayıcı bir sonraki adımda eklenecek.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
