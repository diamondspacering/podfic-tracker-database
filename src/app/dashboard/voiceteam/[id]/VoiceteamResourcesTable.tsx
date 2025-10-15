import { useEventResources } from '@/app/lib/swrLoaders';
import AddMenu from '@/app/ui/AddMenu';
import HotTable, { HotTableClass } from '@handsontable/react';
import { useRef } from 'react';
import { mutate } from 'swr';
import styles from '@/app/dashboard/dashboard.module.css';

export default function VoiceteamResourcesTable({ eventId }) {
  const { resources } = useEventResources(eventId);

  const resourceHotRef = useRef<HotTableClass>(null);

  return (
    <div className={styles.flexColumn}>
      <HotTable
        data={resources}
        ref={resourceHotRef}
        licenseKey='non-commercial-and-evaluation'
        title='Resources'
        colHeaders={['Label', 'Link', 'Notes']}
        columns={[
          { type: 'text', data: 'label' },
          {
            data: 'link',
            width: 50,
            autoWrapCol: false,
            allowHtml: true,
            renderer: (instance, td, row, col, prop, value) => {
              // TODO: can you use custom ExternalLink component here?
              td.innerHTML = `<span class="truncated-text"><a href="${value}" target="_blank">${value}</a></span>`;
            },
          },
          { type: 'text', data: 'notes' },
        ]}
      />
      <AddMenu
        eventId={eventId}
        options={['resource']}
        submitCallback={() =>
          mutate(
            (key) =>
              Array.isArray(key) &&
              key[0] === '/db/resources' &&
              key[1] === eventId
          )
        }
      />
    </div>
  );
}
