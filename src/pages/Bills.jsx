import { useState } from 'react';
import { useI18n } from '../i18n.jsx';
import { useData } from '../useData.js';
import { getBills } from '../data/mockApi.js';
import { money, monthYear, shortDate } from '../format.js';
import Icon from '../components/Icon.jsx';

export default function Bills() {
  const { t, lang } = useI18n();
  const { data: bills } = useData(getBills);
  const [note, setNote] = useState('');

  if (!bills) return <p className="loading" role="status">{t('loading')}</p>;

  return (
    <div className="page">
      <h1 className="page-title">{t('bills.title')}</h1>
      <p className="lede">{t('bills.intro')}</p>

      <div className="panel panel-flush">
        <table className="bills-table">
          <thead>
            <tr>
              <th scope="col">{t('bills.month')}</th>
              <th scope="col">{t('bills.status')}</th>
              <th scope="col" className="num">{t('bills.amount')}</th>
              <th scope="col"><span className="visually-hidden">PDF</span></th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => {
              const month = monthYear(bill.period, lang);
              const paid = bill.status === 'paid';
              return (
                <tr key={bill.id}>
                  <th scope="row" className="bills-month">{month}</th>
                  <td>
                    <span className={paid ? 'status status-paid' : 'status status-open'}>
                      {paid
                        ? t('bills.paid', { date: shortDate(bill.paidOn, lang) })
                        : t('bills.open', { date: shortDate(bill.due, lang) })}
                    </span>
                  </td>
                  <td className="num bills-amount">{money(bill.amount, lang)}</td>
                  <td className="bills-action">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={t('bills.downloadLabel', { month })}
                      onClick={() => setNote(t('bills.downloadNote'))}
                    >
                      <Icon name="download" size={18} />
                      <span aria-hidden="true">{t('bills.download')}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="hint" role="status">{note}</p>
    </div>
  );
}
