import Header from "@/components/Header";

const Calculator = () => {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Kalkulator</h2>
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <p className="text-sm text-zinc-600">
            Miejsce na narzędzia kalkulacyjne. (Placeholder UI)
          </p>
        </div>
      </main>
    </div>
  );
};

export default Calculator;
