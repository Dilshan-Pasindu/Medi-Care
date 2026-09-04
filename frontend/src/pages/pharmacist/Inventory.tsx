import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { StockStatusBadge } from '../../components/shared/StatusBadge';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';
import { medicineService } from '../../services/medicine.service';
import { Medicine } from '../../types';
import { formatDate, formatCurrency } from '../../lib/utils';
import { Search } from 'lucide-react';

export default function Inventory() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMedicines();
  }, [page, searchQuery]);

  async function loadMedicines() {
    try {
      const res = searchQuery
        ? await medicineService.search(searchQuery, page, 10)
        : await medicineService.getAll(page, 10);
      setMedicines(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Medicine Inventory"
        description="Manage and track medicine stock levels"
      />

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Search medicines..."
          />
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Medicine</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Expiry</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {medicines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8">
                      <EmptyState title="No medicines found" description="Add medicines to the inventory" />
                    </td>
                  </tr>
                ) : (
                  medicines.map((med) => (
                    <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium">{med.name}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{med.category}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-sm font-medium ${
                          med.stock_quantity === 0 ? 'text-danger' :
                          med.stock_quantity <= med.minimum_stock ? 'text-yellow-700' :
                          'text-foreground'
                        }`}>
                          {med.stock_quantity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm">{formatCurrency(med.price)}</td>
                      <td className="px-5 py-3.5 text-center text-sm text-muted-foreground">
                        {med.expiry_date ? formatDate(med.expiry_date) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <StockStatusBadge stockQuantity={med.stock_quantity} minimumStock={med.minimum_stock} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-200 px-5">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
