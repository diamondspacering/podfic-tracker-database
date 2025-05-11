import HotTable, { HotTableClass } from '@handsontable/react';
import { useMemo, useRef } from 'react';

export default function BonusValuesTable({ bonusValues }) {
  const bonusHotRef = useRef<HotTableClass>(null);

  const bonusData = useMemo(
    () =>
      Object.entries(bonusValues).map(([key, value]) => ({
        name: key,
        points: value,
      })),
    [bonusValues]
  );

  return (
    <HotTable
      data={bonusData}
      ref={bonusHotRef}
      licenseKey='non-commercial-and-evaluation'
      title='Bonus Values'
      colHeaders={['Name', 'Points']}
    />
  );
}
