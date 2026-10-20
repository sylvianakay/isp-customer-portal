import { useState } from 'react';
import { useI18n } from '../i18n.jsx';
import { useData } from '../useData.js';
import { getAccount, getBills } from '../data/mockApi.js';
import { money, monthYear, shortDate } from '../format.js';
import Icon from '../components/Icon.jsx';

export default function Bills() {
  const { t, lang } = useI18n();
  const { data: bills } = useData(getBills);
  const { data: account } = useData(getAccount);
  const [busyId, setBusyId] = useState(null);
  const [note, setNote] = useState('');

  if (!bills) return <p className="loading" role="status">{t('loading')}</p>;

  // kind is 'bill' or 'receipt'; both PDFs come from the same lazily loaded module.
  async function download(kind, bill, month) {
    setBusyId(`${kind}-${bill.id}`);
    setNote(t('bills.downloading'));
    try {
      const pdf = await import('../pdf/billPdf.js');
      if (kind === 'receipt') {
        await pdf.downloadReceiptPdf({ receipt: bill.receipt, bill, account, lang, t });
        setNote(t('bills.receiptDownloaded', { month }));
      } else {
        await pdf.downloadBillPdf({ bill, account, lang, t });
        setNote(t('bills.downloaded', { month }));
      }
    } catch {
      setNote(t('bills.downloadFailed'));
    } finally {
      setBusyId(null);
    }
  }

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
              const busy = (kind) => busyId === `${kind}-${bill.id}`;
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
                    <div className="bills-buttons">
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={t('bills.downloadLabel', { month })}
                        aria-busy={busy('bill')}
                        disabled={!account || busyId !== null}
                        onClick={() => download('bill', bill, month)}
                      >
                        <Icon name="download" size={18} className={busy('bill') ? 'is-working' : undefined} />
                        <span aria-hidden="true">{t('bills.download')}</span>
                      </button>
                      {bill.receipt && (
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={t('bills.receiptLabel', { month })}
                          aria-busy={busy('receipt')}
                          disabled={!account || busyId !== null}
                          onClick={() => download('receipt', bill, month)}
                        >
                          <Icon name="receipt" size={18} className={busy('receipt') ? 'is-working' : undefined} />
                          <span aria-hidden="true">{t('bills.receipt')}</span>
                        </button>
                      )}
                    </div>
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
