import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface ProductSortProps {
  value: string;
  onChange: (value: string) => void;
  total: number;
  page: number;
  perPage: number;
}

const ProductSort = ({ value, onChange, total, page, perPage }: ProductSortProps) => {
  const { t } = useTranslation();
  const from = total > 0 ? (page - 1) * perPage + 1 : 0;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-1">
      <div className="order-2 sm:order-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          {t('products.showing')} <span className="font-semibold text-foreground">{from}-{to}</span> {t('products.of')}{' '}
          <span className="font-semibold text-foreground">{total}</span> {t('products.results')}
        </p>
        <p className="text-sm font-semibold text-emerald-700 whitespace-nowrap">
          All parts tested before shipping
        </p>
      </div>
      <div className="w-full sm:w-auto order-1 sm:order-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full sm:w-[220px] bg-background border-border h-9 text-xs font-bold uppercase tracking-widest">
            <SelectValue placeholder={t('products.sort_by')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest" className="text-xs uppercase font-medium">{t('products.sort_newest')}</SelectItem>
            <SelectItem value="price_asc" className="text-xs uppercase font-medium">{t('products.sort_price_asc')}</SelectItem>
            <SelectItem value="price_desc" className="text-xs uppercase font-medium">{t('products.sort_price_desc')}</SelectItem>
            <SelectItem value="popularity" className="text-xs uppercase font-medium">Most Popular</SelectItem>
            <SelectItem value="oldest" className="text-xs uppercase font-medium">{t('products.sort_oldest')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProductSort;
