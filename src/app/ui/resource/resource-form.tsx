import styles from '@/app/forms/forms.module.css';
import { resourceTypes } from '@/app/lib/dataGeneral';
import { useResources } from '@/app/lib/swrLoaders';
import {
  Autocomplete,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { useState } from 'react';

interface ResourceFormProps {
  resource: Resource;
  setResource: React.Dispatch<React.SetStateAction<Resource>>;
}

export default function ResourceForm({
  resource,
  setResource,
}: ResourceFormProps) {
  const { resources, isLoading: resourcesLoading } = useResources(
    resource.resource_type
  );

  const [isNewResource, setIsNewResource] = useState(true);

  return (
    <div className={`${styles.flexColumn} ${styles.mt1}`}>
      <Autocomplete
        size='small'
        options={resourceTypes}
        sx={{
          width: '200px',
        }}
        value={resource.resource_type ?? ''}
        onChange={(_, newValue) =>
          setResource((prev) => ({ ...prev, resource_type: newValue }))
        }
        renderInput={(params) => (
          <TextField {...params} label='Resource Type&nbsp;&nbsp;&nbsp;' />
        )}
      />
      <RadioGroup
        name='is-new-resource'
        value={isNewResource ? 'new' : 'existing'}
        onChange={(e) => setIsNewResource(e.target.value === 'new')}
      >
        <FormControlLabel
          label='New resource'
          value='new'
          control={<Radio />}
        />
        <FormControlLabel
          label='Existing resource'
          value='existing'
          control={<Radio />}
        />
      </RadioGroup>
      {!isNewResource && (
        <Autocomplete
          size='small'
          options={resources}
          loading={resourcesLoading}
          sx={{
            width: '300px',
          }}
          onChange={(_, newValue) => setResource(newValue)}
          getOptionLabel={(option) => option.label}
          getOptionKey={(option) => option.resource_id}
          renderInput={(params) => (
            <TextField {...params} label='Resource&nbsp;&nbsp;&nbsp;' />
          )}
        />
      )}
      <TextField
        size='small'
        label='Label'
        value={resource.label ?? ''}
        onChange={(e) =>
          setResource((prev) => ({ ...prev, label: e.target.value }))
        }
      />
      <TextField
        size='small'
        label='Link'
        value={resource.link ?? ''}
        onChange={(e) =>
          setResource((prev) => ({ ...prev, link: e.target.value }))
        }
      />
      <TextField
        multiline
        size='small'
        label='Notes'
        value={resource.notes ?? ''}
        onChange={(e) =>
          setResource((prev) => ({ ...prev, notes: e.target.value }))
        }
      />
    </div>
  );
}
