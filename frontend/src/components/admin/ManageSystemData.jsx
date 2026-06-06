import { Button } from "@/components/ui/button";

const ManageSystemData = ({ onImportClick, handleDelete }) => {
  return (
    <div className="mt-12 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-zinc-200">
      <h2 className="text-xl font-semibold text-zinc-900 mb-2">
        Zarządzanie danymi systemowymi
      </h2>
      <p className="text-sm text-zinc-500 mb-6">
        Zaimportuj nowe raporty NBP z plików XML lub całkowicie wyczyść bazę
        danych.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          onClick={onImportClick}
        >
          Importuj dane XML
        </Button>
        <Button 
          variant="destructive" 
          className="w-full sm:w-auto"
          onClick={handleDelete}
        >
          Wyczyść całą bazę danych
        </Button>
      </div>
    </div>
  );
};

export default ManageSystemData;