/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { format, parseISO } from 'date-fns';

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateStr: string) {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}
