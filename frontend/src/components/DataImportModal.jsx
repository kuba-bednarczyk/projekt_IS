import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const DataImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [pricesFile, setPricesFile] = useState(null);
  const [ratesFile, setRatesFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleImport = async (e) => {
    e.preventDefault();

    if (!pricesFile || !ratesFile) {
      setStatus({ type: "error", message: "Wybierz oba pliki XML!" });
      return;
    }

    // Okienko potwierdzające usunięcie danych
    const isConfirmed = window.confirm(
      "UWAGA: Ta operacja usunie wszystkie obecne dane o cenach i stopach procentowych, a następnie zastąpi je nowymi. Operacji nie można cofnąć. Czy na pewno chcesz kontynuować?"
    );

    if (!isConfirmed) return;

    setIsProcessing(true);
    setStatus({ type: "info", message: "Czyszczenie starych danych..." });

    try {
      const fetchDeleteOptions = {
        method: "DELETE",
        credentials: "include",
      };

      await fetch(`${API_URL}/import/rates`, fetchDeleteOptions);
      await fetch(`${API_URL}/import/cities`, fetchDeleteOptions);

      setStatus({ type: "info", message: "Wgrywanie i przetwarzanie nowych plików XML..." });

      const formData = new FormData();
      formData.append("prices", pricesFile);
      formData.append("rates", ratesFile);

      const importRes = await fetch(`${API_URL}/import`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!importRes.ok) {
        const errData = await importRes.json().catch(() => null);
        throw new Error(errData?.error || "Błąd podczas przetwarzania plików XML.");
      }

      setStatus({ type: "success", message: "Baza danych została pomyślnie zaktualizowana!" });
      
      setPricesFile(null);
      setRatesFile(null);
      
      if (onImportSuccess) {
        setTimeout(onImportSuccess, 2000);
      }
      
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Danych z XML</DialogTitle>
          <DialogDescription>
            Wgraj najnowsze raporty. Operacja ta automatycznie zastąpi obecne dane w systemie.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleImport} className="space-y-6">
          {status.message && (
            <div
              className={`p-3 rounded-md text-sm font-medium ${
                status.type === "error" ? "bg-red-50 text-red-700 border border-red-200"
                : status.type === "success" ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prices-file" className="font-semibold text-zinc-800">
                Plik: Ceny mieszkań (XML)
              </Label>
              <Input
                id="prices-file"
                type="file"
                accept=".xml"
                onChange={(e) => setPricesFile(e.target.files[0])}
                disabled={isProcessing}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rates-file" className="font-semibold text-zinc-800">
                Plik: Stopy procentowe NBP (XML)
              </Label>
              <Input
                id="rates-file"
                type="file"
                accept=".xml"
                onChange={(e) => setRatesFile(e.target.files[0])}
                disabled={isProcessing}
                className="cursor-pointer"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isProcessing || !pricesFile || !ratesFile} className="bg-blue-600 hover:bg-blue-700">
              {isProcessing ? "Przetwarzanie..." : "Rozpocznij import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DataImportModal;