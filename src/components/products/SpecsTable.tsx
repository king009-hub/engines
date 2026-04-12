import type { Product } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { translateDynamic } from '@/lib/translate';

interface SpecsTableProps {
  product: Product;
}

const SpecsTable = ({ product }: SpecsTableProps) => {
  const { t } = useTranslation();
  const specs = [
    { label: t('products.engine_code'), value: product.engine_code },
    { label: t('products.brand'), value: translateDynamic(product.brand) },
    { label: t('products.fuel_type'), value: translateDynamic(product.fuel_type) },
    { label: t('products.year'), value: product.year?.toString() || 'N/A' },
    { label: t('products.mileage'), value: product.mileage ? `${product.mileage.toLocaleString()} km` : 'N/A' },
    { label: t('products.condition'), value: translateDynamic(product.condition) || 'N/A' },
    { label: t('products.availability'), value: product.availability ? t('products.in_stock') : t('products.out_of_stock') },
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="bg-secondary px-4 py-3">
        <h3 className="font-bold text-sm uppercase tracking-wider text-secondary-foreground">{t('products.characteristics')}</h3>
      </div>
      <div className="divide-y divide-border">
        {specs.map(spec => (
          <div key={spec.label} className="flex">
            <div className="w-[40%] sm:w-1/3 px-4 py-3 bg-muted/50 text-[11px] sm:text-sm font-semibold text-muted-foreground">{spec.label}</div>
            <div className="w-[60%] sm:w-2/3 px-4 py-3 text-[11px] sm:text-sm text-foreground break-all sm:break-normal">{spec.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecsTable;
