
import { Money, Currency } from '../types';
import { FX_RATES } from '../constants';

export const convertToINR = (money: Money): number => {
  return money.amount * (FX_RATES[money.currency] || 1);
};

export const formatCurrency = (amount: number, currency: Currency = 'INR'): string => {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    };
    if (currency === 'INR') {
        options.currencyDisplay = 'narrowSymbol';
    }

    return new Intl.NumberFormat('en-IN', options).format(amount);
};

export const formatMoney = (money: Money | undefined): string => {
  if (!money) return formatCurrency(0);

  const inrValue = convertToINR(money);
  let primaryDisplay = formatCurrency(inrValue);

  if (money.currency !== 'INR') {
    const secondaryDisplay = formatCurrency(money.amount, money.currency);
    primaryDisplay = `${primaryDisplay} (${secondaryDisplay})`;
  }
  return primaryDisplay;
};
